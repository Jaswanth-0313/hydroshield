"""
GIS Spatial Engine for Flood Intersections, Hazard Point Extraction, and Road Cutoff Analysis
Uses Shapely geometries for exact polygon containment and buffer overlays.
"""
from typing import Dict, Any, List, Tuple
from shapely.geometry import shape, Point, LineString, Polygon, MultiPolygon
from shapely.ops import unary_union
import math

def calculate_point_flood_hydraulics(
    pt_lat: float,
    pt_lng: float,
    dam_lat: float,
    dam_lng: float,
    total_river_reach_km: float,
    front_speed_km_min: float,
    peak_breach_discharge: float,
    inundation_polygon_geojson: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate if a point (lat, lng) is inundated by checking against the flood polygon,
    and compute arrival time, maximum depth, and maximum flow velocity.
    """
    pt = Point(pt_lng, pt_lat)
    
    # 1. Check polygon containment
    is_inundated = False
    for feat in inundation_polygon_geojson.get("features", []):
        geom = shape(feat["geometry"])
        if geom.contains(pt) or geom.distance(pt) < 0.0008:  # within ~80m
            is_inundated = True
            break
            
    # 2. Approximate geodesic distance from dam
    d_lat = (pt_lat - dam_lat) * 111.0
    d_lng = (pt_lng - dam_lng) * 111.0 * math.cos(math.radians(dam_lat))
    dist_km = math.sqrt(d_lat*d_lat + d_lng*d_lng)
    
    # 3. Wave arrival dynamics
    arrival_time_min = dist_km / max(front_speed_km_min, 0.05)
    peak_time_min = arrival_time_min + 35.0  # Peak occurs ~35 min after leading wave front
    
    if is_inundated:
        # Distance-decaying maximum depth and velocity
        decay = math.exp(-0.024 * dist_km)
        max_depth = max(0.6, (14.0 * decay) * math.pow(peak_breach_discharge / 12000.0, 0.4))
        max_velocity = max(0.5, (8.0 * decay) * math.pow(peak_breach_discharge / 12000.0, 0.3))
    else:
        # Dry high-ground location
        max_depth = 0.0
        max_velocity = 0.0
        
    return {
        "is_inundated": is_inundated,
        "distance_from_dam_km": round(dist_km, 2),
        "flood_arrival_time_min": round(arrival_time_min, 1),
        "peak_arrival_time_min": round(peak_time_min, 1),
        "max_flood_depth_m": round(max_depth, 2),
        "max_flow_velocity_ms": round(max_velocity, 2)
    }

def evaluate_road_network_inundation(
    roads_geojson: Dict[str, Any],
    inundation_polygon_geojson: Dict[str, Any],
    dam_lat: float,
    dam_lng: float,
    front_speed_km_min: float
) -> Dict[str, Any]:
    """
    Evaluate road segment status (Safe, Impassable > 0.3m depth, Submerged Cutoff).
    Returns augmented road FeatureCollection with risk telemetry.
    """
    flood_geoms = [shape(f["geometry"]) for f in inundation_polygon_geojson.get("features", [])]
    flood_union = unary_union(flood_geoms) if flood_geoms else None
    
    augmented_features = []
    cutoff_count = 0
    
    for feat in roads_geojson.get("features", []):
        road_line = shape(feat["geometry"])
        props = dict(feat["properties"])
        
        is_submerged = False
        flood_depth = 0.0
        arrival_time = 999.0
        
        if flood_union and flood_union.intersects(road_line):
            is_submerged = True
            cutoff_count += 1
            
            # Midpoint distance
            mid_pt = road_line.interpolate(0.5, normalized=True)
            d_lat = (mid_pt.y - dam_lat) * 111.0
            d_lng = (mid_pt.x - dam_lng) * 111.0 * math.cos(math.radians(dam_lat))
            dist_km = math.sqrt(d_lat*d_lat + d_lng*d_lng)
            arrival_time = dist_km / max(front_speed_km_min, 0.05)
            
            # Submerged depth based on road elevation
            road_elev = float(props.get("avg_elevation_m", 600.0))
            flood_depth = max(0.4, 4.5 * math.exp(-0.02 * dist_km))
            props["status"] = "SUBMERGED_CUTOFF" if flood_depth > 0.3 else "CAUTION_WATERLOGGED"
            props["risk_level"] = "CRITICAL" if flood_depth > 0.8 else "HIGH"
        else:
            props["status"] = "PASSABLE_SAFE"
            props["risk_level"] = "LOW"
            
        props["is_submerged"] = is_submerged
        props["flood_depth_m"] = round(flood_depth, 2)
        props["flood_arrival_time_min"] = round(arrival_time, 1)
        
        augmented_features.append({
            "type": "Feature",
            "properties": props,
            "geometry": feat["geometry"]
        })
        
    return {
        "type": "FeatureCollection",
        "features": augmented_features,
        "total_roads": len(augmented_features),
        "cutoff_roads_count": cutoff_count
    }

def compute_polygon_iou_and_overlap(
    poly_a_geojson: Dict[str, Any],
    poly_b_geojson: Dict[str, Any]
) -> Dict[str, float]:
    """
    Computes Intersection over Union (IoU / Jaccard Index) and Dice Coefficient (F1)
    between two GeoJSON polygon collections.
    """
    geoms_a = [shape(f["geometry"]) for f in poly_a_geojson.get("features", [])]
    geoms_b = [shape(f["geometry"]) for f in poly_b_geojson.get("features", [])]
    
    union_a = unary_union(geoms_a) if geoms_a else Polygon()
    union_b = unary_union(geoms_b) if geoms_b else Polygon()
    
    area_a = union_a.area
    area_b = union_b.area
    
    if area_a == 0.0 or area_b == 0.0:
        return {"iou": 0.0, "dice_f1": 0.0, "area_a_sqkm": 0.0, "area_b_sqkm": 0.0}
        
    intersection = union_a.intersection(union_b)
    area_int = intersection.area
    union_total = union_a.union(union_b).area
    
    iou = area_int / union_total if union_total > 0 else 0.0
    dice = (2.0 * area_int) / (area_a + area_b) if (area_a + area_b) > 0 else 0.0
    
    sqkm_scale = 111.0 * 111.0
    
    return {
        "iou": round(iou, 4),
        "dice_f1": round(dice, 4),
        "intersection_area_sqkm": round(area_int * sqkm_scale, 2),
        "area_a_sqkm": round(area_a * sqkm_scale, 2),
        "area_b_sqkm": round(area_b * sqkm_scale, 2)
    }
