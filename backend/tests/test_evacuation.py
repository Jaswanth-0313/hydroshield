import pytest
import networkx as nx
from app.evacuation.route_planner import build_evacuation_road_graph, plan_safe_evacuation_route
from app.models.schemas import VillageRiskItem, RiskBreakdown, Coordinates

def test_evacuation_graph_weight_penalties():
    """Verify that submerged roads >0.3m depth receive extreme weight penalties."""
    roads_geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "node_from": "vil-1",
                    "node_to": "sh-1",
                    "distance_km": 5.0,
                    "is_submerged": True,
                    "flood_depth_m": 1.2,
                    "name": "Direct Flooded Highway"
                },
                "geometry": {"type": "LineString", "coordinates": [[76.97, 9.85], [76.99, 9.87]]}
            },
            {
                "type": "Feature",
                "properties": {
                    "node_from": "vil-1",
                    "node_to": "junction-high",
                    "distance_km": 4.0,
                    "is_submerged": False,
                    "flood_depth_m": 0.0,
                    "name": "Highland Bypass"
                },
                "geometry": {"type": "LineString", "coordinates": [[76.97, 9.85], [76.95, 9.86]]}
            },
            {
                "type": "Feature",
                "properties": {
                    "node_from": "junction-high",
                    "node_to": "sh-1",
                    "distance_km": 4.0,
                    "is_submerged": False,
                    "flood_depth_m": 0.0,
                    "name": "Shelter Ridge Approach"
                },
                "geometry": {"type": "LineString", "coordinates": [[76.95, 9.86], [76.99, 9.87]]}
            }
        ]
    }
    
    G = build_evacuation_road_graph(roads_geojson, evac_speed_kmh=25.0)
    
    # Path should choose the Highland Bypass (8 km dry) over Direct Highway (5 km deeply flooded)
    path = nx.shortest_path(G, "vil-1", "sh-1", weight="weight")
    assert path == ["vil-1", "junction-high", "sh-1"], f"Router should avoid flooded road, but chose {path}"
    
    # Check that flooded edge has 1000x penalty
    flooded_edge = G["vil-1"]["sh-1"]
    dry_edge = G["vil-1"]["junction-high"]
    assert flooded_edge["weight"] > 100 * dry_edge["weight"]
    assert flooded_edge["is_passable"] is False
    assert dry_edge["is_passable"] is True

def test_evacuation_route_planning_with_live_dam():
    """Test full routing workflow with real study area datasets."""
    dummy_risk = VillageRiskItem(
        id="vil-idk-01",
        name="Cheruthoni Town",
        population=8500,
        vulnerable_population_count=2100,
        distance_from_dam_km=1.5,
        coordinates=Coordinates(lat=9.852, lng=76.968),
        flood_arrival_time_min=8.0,
        peak_arrival_time_min=35.0,
        max_flood_depth_m=6.5,
        max_flow_velocity_ms=5.2,
        risk_breakdown=RiskBreakdown(
            hazard_score=85.0,
            vulnerability_score=75.0,
            exposure_score=90.0,
            total_risk_score=83.5,
            risk_level="CRITICAL"
        ),
        risk_level="CRITICAL",
        evacuation_priority="P1 - Immediate",
        recommended_shelter_id="sh-idk-01",
        inundated=True
    )
    
    res = plan_safe_evacuation_route(
        dam_id="dam-idukki",
        origin_village_id="vil-idk-01",
        village_risk_profile=dummy_risk,
        inundation_polygon_geojson={"type": "FeatureCollection", "features": []},
        evac_speed_kmh=25.0
    )
    
    assert res.origin_village.id == "vil-idk-01"
    assert res.destination_shelter is not None
    assert len(res.steps) > 0
    assert res.total_travel_time_min > 0
