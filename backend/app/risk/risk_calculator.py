"""
Risk Calculator Service
Processes downstream villages, calculates risk breakdown, ranks vulnerable areas,
and identifies infrastructure at risk.
"""
from typing import Dict, Any, List
from app.gis.datasets import load_villages, load_infrastructure, load_shelters, load_dam_by_id
from app.gis.spatial_engine import calculate_point_flood_hydraulics
from app.risk.formulas import calculate_composite_risk_score
from app.models.schemas import VillageRiskItem, InfrastructureRiskItem, RiskBreakdown, Coordinates

def compute_all_villages_risk(
    dam_id: str,
    peak_breach_discharge: float,
    front_speed_km_min: float,
    inundation_polygon_geojson: Dict[str, Any]
) -> List[VillageRiskItem]:
    dam_data = load_dam_by_id(dam_id) or {}
    dam_loc = dam_data.get("location", {"lat": 9.85, "lng": 76.97})
    reach_length_km = float(dam_data.get("downstream_reach_length_km", 45.0))
    
    villages_raw = load_villages(dam_id)
    shelters_raw = load_shelters(dam_id)
    
    results: List[VillageRiskItem] = []
    
    for v in villages_raw:
        v_coords = v["coordinates"]
        
        # Spatial hydraulics calculation
        hydraulics = calculate_point_flood_hydraulics(
            pt_lat=v_coords["lat"],
            pt_lng=v_coords["lng"],
            dam_lat=dam_loc["lat"],
            dam_lng=dam_loc["lng"],
            total_river_reach_km=reach_length_km,
            front_speed_km_min=front_speed_km_min,
            peak_breach_discharge=peak_breach_discharge,
            inundation_polygon_geojson=inundation_polygon_geojson
        )
        
        pop = int(v.get("population", 5000))
        vuln_pop = int(v.get("vulnerable_population_count", pop // 3))
        v_elev = float(v.get("elevation_m", 500.0))
        
        # Risk score calculation
        h_score, v_score, e_score, total_score, level, priority = calculate_composite_risk_score(
            depth_m=hydraulics["max_flood_depth_m"],
            velocity_ms=hydraulics["max_flow_velocity_ms"],
            arrival_time_min=hydraulics["flood_arrival_time_min"],
            population=pop,
            vulnerable_pop=vuln_pop,
            elevation_margin_m=v_elev - 500.0
        )
        
        # Assign nearest safe shelter
        nearest_shelter = None
        if shelters_raw:
            nearest_shelter = shelters_raw[0]["id"]
            
        results.append(VillageRiskItem(
            id=v["id"],
            name=v["name"],
            population=pop,
            vulnerable_population_count=vuln_pop,
            distance_from_dam_km=hydraulics["distance_from_dam_km"],
            coordinates=Coordinates(lat=v_coords["lat"], lng=v_coords["lng"]),
            flood_arrival_time_min=hydraulics["flood_arrival_time_min"],
            peak_arrival_time_min=hydraulics["peak_arrival_time_min"],
            max_flood_depth_m=hydraulics["max_flood_depth_m"],
            max_flow_velocity_ms=hydraulics["max_flow_velocity_ms"],
            risk_breakdown=RiskBreakdown(
                hazard_score=h_score,
                vulnerability_score=v_score,
                exposure_score=e_score,
                total_risk_score=total_score,
                risk_level=level
            ),
            risk_level=level,
            evacuation_priority=priority,
            recommended_shelter_id=nearest_shelter,
            inundated=hydraulics["is_inundated"]
        ))
        
    # Sort descending by total risk score
    results.sort(key=lambda x: x.risk_breakdown.total_risk_score, reverse=True)
    return results

def compute_all_infrastructure_risk(
    dam_id: str,
    peak_breach_discharge: float,
    front_speed_km_min: float,
    inundation_polygon_geojson: Dict[str, Any]
) -> List[InfrastructureRiskItem]:
    dam_data = load_dam_by_id(dam_id) or {}
    dam_loc = dam_data.get("location", {"lat": 9.85, "lng": 76.97})
    reach_length_km = float(dam_data.get("downstream_reach_length_km", 45.0))
    
    infras_raw = load_infrastructure(dam_id)
    results: List[InfrastructureRiskItem] = []
    
    for item in infras_raw:
        coords = item["coordinates"]
        lat = coords["lat"] if isinstance(coords, dict) else coords[0]["lat"]
        lng = coords["lng"] if isinstance(coords, dict) else coords[0]["lng"]
        
        hydraulics = calculate_point_flood_hydraulics(
            pt_lat=lat,
            pt_lng=lng,
            dam_lat=dam_loc["lat"],
            dam_lng=dam_loc["lng"],
            total_river_reach_km=reach_length_km,
            front_speed_km_min=front_speed_km_min,
            peak_breach_discharge=peak_breach_discharge,
            inundation_polygon_geojson=inundation_polygon_geojson
        )
        
        depth = hydraulics["max_flood_depth_m"]
        is_inundated = hydraulics["is_inundated"]
        
        if not is_inundated or depth < 0.1:
            status = "OPERATIONAL"
            level = "LOW"
        elif depth < 0.5:
            status = "AT_RISK"
            level = "MODERATE"
        elif depth < 1.5:
            status = "SUBMERGED_CUTOFF"
            level = "HIGH"
        else:
            status = "EVACUATE"
            level = "CRITICAL"
            
        results.append(InfrastructureRiskItem(
            id=item["id"],
            name=item["name"],
            category=item["category"],
            coordinates=Coordinates(lat=lat, lng=lng),
            distance_from_dam_km=hydraulics["distance_from_dam_km"],
            flood_arrival_time_min=hydraulics["flood_arrival_time_min"],
            max_flood_depth_m=depth,
            is_inundated=is_inundated,
            status=status,
            risk_level=level
        ))
        
    return results
