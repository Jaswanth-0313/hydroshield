"""
Evacuation Route Planner Module
Uses NetworkX graph pathfinding with dynamic flood depth/arrival time impedance penalties.
Computes optimal escape paths to safe high-ground emergency shelters avoiding inundated roads.
"""
import networkx as nx
from typing import Dict, Any, List, Optional
from shapely.geometry import shape, LineString, Point
import math

from app.gis.datasets import load_roads_geojson, load_shelters, load_villages, load_dam_by_id
from app.gis.spatial_engine import evaluate_road_network_inundation
from app.models.schemas import EvacuationRouteResponse, RouteStep, VillageRiskItem, Coordinates

def build_evacuation_road_graph(
    roads_augmented_geojson: Dict[str, Any],
    time_of_evacuation_min: float = 0.0,
    evac_speed_kmh: float = 25.0
) -> nx.Graph:
    """
    Builds a weighted graph from road network where edge weights represent dynamic travel time + flood penalties.
    """
    G = nx.Graph()
    
    for feat in roads_augmented_geojson.get("features", []):
        props = feat["properties"]
        u = props.get("node_from")
        v = props.get("node_to")
        dist_km = float(props.get("distance_km", 2.0))
        
        # Base travel time in minutes at given convoy speed
        base_time_min = (dist_km / evac_speed_kmh) * 60.0
        
        # Flood penalty
        is_submerged = props.get("is_submerged", False)
        depth_m = float(props.get("flood_depth_m", 0.0))
        arrival_min = float(props.get("flood_arrival_time_min", 999.0))
        
        if is_submerged and depth_m > 0.3:
            # Impassable road for standard vehicles -> Extreme weight penalty
            cost = base_time_min * 1000.0
            is_passable = False
        elif is_submerged and depth_m > 0.1:
            # Waterlogged / caution -> 4x slowdown
            cost = base_time_min * 4.0
            is_passable = True
        else:
            cost = base_time_min
            is_passable = True
            
        G.add_edge(u, v, weight=cost, distance_km=dist_km, time_min=base_time_min,
                   is_passable=is_passable, road_name=props.get("name", "Unnamed Road"),
                   geometry=feat["geometry"], flood_risk=props.get("risk_level", "LOW"))
        
    return G

def plan_safe_evacuation_route(
    dam_id: str,
    origin_village_id: str,
    village_risk_profile: VillageRiskItem,
    inundation_polygon_geojson: Dict[str, Any],
    front_speed_km_min: float = 0.4,
    time_of_evac_min: float = 0.0,
    evac_speed_kmh: float = 25.0
) -> EvacuationRouteResponse:
    dam_data = load_dam_by_id(dam_id) or {}
    dam_loc = dam_data.get("location", {"lat": 9.85, "lng": 76.97})
    
    roads_raw = load_roads_geojson(dam_id)
    shelters_raw = load_shelters(dam_id)
    
    # Augment roads with current flood state
    roads_aug = evaluate_road_network_inundation(
        roads_raw, inundation_polygon_geojson,
        dam_loc["lat"], dam_loc["lng"], front_speed_km_min
    )
    
    G = build_evacuation_road_graph(roads_aug, time_of_evac_min, evac_speed_kmh)
    
    # Find reachable safe shelter with minimum path cost
    best_shelter = None
    best_path = None
    min_cost = float("inf")
    
    for sh in shelters_raw:
        sh_id = sh["id"]
        if G.has_node(origin_village_id) and G.has_node(sh_id):
            try:
                cost = nx.shortest_path_length(G, origin_village_id, sh_id, weight="weight")
                path = nx.shortest_path(G, origin_village_id, sh_id, weight="weight")
                if cost < min_cost:
                    min_cost = cost
                    best_path = path
                    best_shelter = sh
            except nx.NetworkXNoPath:
                continue
                
    # Fallback if graph is disconnected or direct edge
    if not best_shelter and shelters_raw:
        best_shelter = shelters_raw[0]
        best_path = [origin_village_id, best_shelter["id"]]
        
    # Build route steps and GeoJSON linestring
    route_steps: List[RouteStep] = []
    route_coords: List[List[float]] = []
    total_dist_km = 0.0
    total_time_min = 0.0
    has_submerged_step = False
    
    if best_path and len(best_path) >= 2:
        for idx in range(len(best_path) - 1):
            u = best_path[idx]
            v = best_path[idx + 1]
            edge_data = G.get_edge_data(u, v, default={})
            
            dist = float(edge_data.get("distance_km", 2.5))
            t_min = float(edge_data.get("time_min", (dist / evac_speed_kmh) * 60.0))
            r_name = edge_data.get("road_name", "Connecting Arterial Route")
            r_risk = edge_data.get("flood_risk", "LOW")
            is_safe = edge_data.get("is_passable", True)
            
            if not is_safe or r_risk in ["HIGH", "CRITICAL"]:
                has_submerged_step = True
                
            total_dist_km += dist
            total_time_min += t_min
            
            geom = edge_data.get("geometry")
            if geom and "coordinates" in geom:
                for c in geom["coordinates"]:
                    if not route_coords or route_coords[-1] != c:
                        route_coords.append(c)
                        
            route_steps.append(RouteStep(
                step_number=idx + 1,
                instruction=f"Take {r_name} towards {best_shelter.get('name', 'Relief Shelter')}",
                road_name=r_name,
                distance_km=round(dist, 2),
                estimated_time_min=round(t_min, 1),
                flood_risk_level=r_risk,
                is_safe=is_safe
            ))
            
    if not route_coords:
        # Straight line fallback between village and shelter
        v_coords = village_risk_profile.coordinates
        sh_coords = best_shelter.get("coordinates", {"lat": v_coords.lat + 0.02, "lng": v_coords.lng + 0.02})
        route_coords = [[v_coords.lng, v_coords.lat], [sh_coords["lng"], sh_coords["lat"]]]
        total_dist_km = 3.5
        total_time_min = (3.5 / evac_speed_kmh) * 60.0
        
    route_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "origin_village": village_risk_profile.name,
                    "destination_shelter": best_shelter.get("name", "Emergency Shelter"),
                    "total_distance_km": round(total_dist_km, 2),
                    "total_travel_time_min": round(total_time_min, 1)
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": route_coords
                }
            }
        ]
    }
    
    # Calculate headway margin (flood arrival time - evacuation completion time)
    time_headway = village_risk_profile.flood_arrival_time_min - total_time_min
    
    if has_submerged_step or time_headway < 0:
        safety_status = "IMPASSABLE_FLOODED"
    elif time_headway < 15.0:
        safety_status = "CAUTION_ROUTE"
    else:
        safety_status = "SAFE_ROUTE"
        
    return EvacuationRouteResponse(
        origin_village=village_risk_profile,
        destination_shelter=best_shelter,
        total_distance_km=round(total_dist_km, 2),
        total_travel_time_min=round(total_time_min, 1),
        safety_status=safety_status,
        time_headway_min=round(time_headway, 1),
        route_geojson=route_geojson,
        steps=route_steps,
        disclaimer="Prototype Decision-Support Recommendation only. Always adhere to National Disaster Management Authority (NDMA) / Kerala State SDMA official emergency protocols."
    )
