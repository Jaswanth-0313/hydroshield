import pytest
from app.risk.formulas import calculate_defra_hazard_rating, calculate_composite_risk_score
from app.risk.risk_calculator import compute_all_villages_risk, compute_all_infrastructure_risk

def test_defra_hazard_rating():
    # Dry ground
    dry = calculate_defra_hazard_rating(depth_m=0.0, velocity_ms=0.0)
    assert dry["hazard_class"] == "NONE"
    
    # Low hazard
    low = calculate_defra_hazard_rating(depth_m=0.2, velocity_ms=0.5)
    assert low["hazard_class"] == "LOW"
    
    # Moderate hazard: d=0.4m, v=0.5m/s -> HR = 0.4*(0.5+0.5)+0.5 = 0.90 (0.75 <= HR < 1.25)
    mod = calculate_defra_hazard_rating(depth_m=0.4, velocity_ms=0.5)
    assert mod["hazard_class"] == "MODERATE"
    
    # Critical hazard (deep and fast flow)
    crit = calculate_defra_hazard_rating(depth_m=3.5, velocity_ms=4.0)
    assert crit["hazard_class"] == "CRITICAL"
    assert crit["hazard_rating_hr"] >= 2.0

def test_composite_risk_score():
    h_score, v_score, e_score, total_risk, level, priority = calculate_composite_risk_score(
        depth_m=4.5,
        velocity_ms=3.5,
        arrival_time_min=10.0,
        population=8000,
        vulnerable_pop=2500,
        elevation_margin_m=5.0
    )
    assert total_risk > 70.0
    assert level in ["HIGH", "CRITICAL"]
    assert priority in ["P1 - Immediate", "P2 - Urgent"]

def test_village_risk_calculation():
    villages = compute_all_villages_risk(
        dam_id="dam-idukki",
        peak_breach_discharge=14000.0,
        front_speed_km_min=0.45,
        inundation_polygon_geojson={"type": "FeatureCollection", "features": []}
    )
    assert len(villages) > 0
    # Cheruthoni is close to dam -> higher risk
    cheruthoni = next((v for v in villages if "Cheruthoni" in v.name), None)
    assert cheruthoni is not None
    assert cheruthoni.distance_from_dam_km < 3.0
