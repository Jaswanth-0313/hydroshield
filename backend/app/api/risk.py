"""
Risk Analysis API Router
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.gis.datasets import load_dam_by_id, load_shelters, load_roads_geojson
from app.hydrodynamics.demo_engine import SIMULATION_STORE
from app.risk.risk_calculator import compute_all_villages_risk, compute_all_infrastructure_risk
from app.gis.spatial_engine import evaluate_road_network_inundation
from app.models.schemas import VillageRiskItem, InfrastructureRiskItem

router = APIRouter(prefix="/risk", tags=["Risk Analysis"])

@router.get("/villages", response_model=List[VillageRiskItem])
def get_villages_risk(dam_id: str, simulation_id: Optional[str] = None):
    """
    Get ranked vulnerability and flood risk profiles for all downstream villages.
    """
    sim = SIMULATION_STORE.get(simulation_id) if simulation_id else None
    
    if sim:
        summary = sim["summary"]
        peak_q = summary.peak_breach_discharge_cumecs
        front_speed = sim.get("front_speed_km_min", 0.45)
        max_extent = sim["max_extent"]
    else:
        peak_q = 12500.0
        front_speed = 0.45
        max_extent = {"type": "FeatureCollection", "features": []}
        
    villages = compute_all_villages_risk(
        dam_id=dam_id,
        peak_breach_discharge=peak_q,
        front_speed_km_min=front_speed,
        inundation_polygon_geojson=max_extent
    )
    return villages

@router.get("/infrastructure", response_model=List[InfrastructureRiskItem])
def get_infrastructure_risk(dam_id: str, simulation_id: Optional[str] = None):
    """
    Get operational status and inundation risk for critical infrastructure (hospitals, schools, bridges, power stations).
    """
    sim = SIMULATION_STORE.get(simulation_id) if simulation_id else None
    if sim:
        summary = sim["summary"]
        peak_q = summary.peak_breach_discharge_cumecs
        front_speed = sim.get("front_speed_km_min", 0.45)
        max_extent = sim["max_extent"]
    else:
        peak_q = 12500.0
        front_speed = 0.45
        max_extent = {"type": "FeatureCollection", "features": []}
        
    infras = compute_all_infrastructure_risk(
        dam_id=dam_id,
        peak_breach_discharge=peak_q,
        front_speed_km_min=front_speed,
        inundation_polygon_geojson=max_extent
    )
    return infras

@router.get("/roads")
def get_roads_status(dam_id: str, simulation_id: Optional[str] = None):
    """
    Get road network GeoJSON with submerged / passable status for dynamic routing.
    """
    dam = load_dam_by_id(dam_id) or {"location": {"lat": 9.85, "lng": 76.97}}
    roads_raw = load_roads_geojson(dam_id)
    
    sim = SIMULATION_STORE.get(simulation_id) if simulation_id else None
    max_extent = sim["max_extent"] if sim else {"type": "FeatureCollection", "features": []}
    front_speed = sim.get("front_speed_km_min", 0.45) if sim else 0.45
    
    roads_aug = evaluate_road_network_inundation(
        roads_geojson=roads_raw,
        inundation_polygon_geojson=max_extent,
        dam_lat=dam["location"]["lat"],
        dam_lng=dam["location"]["lng"],
        front_speed_km_min=front_speed
    )
    return roads_aug

@router.get("/shelters")
def get_shelters(dam_id: str):
    """Retrieve designated safe high-elevation emergency shelters and capacity."""
    return load_shelters(dam_id)

@router.get("/methodology")
def get_risk_methodology():
    """
    Retrieve scientific methodology and mathematical formulation for risk calculation.
    """
    return {
        "title": "Disaster Risk Assessment Methodology",
        "hazard_model": {
            "formula": "HR = d * (v + 0.5) + DF",
            "reference": "UK DEFRA / Environment Agency Flood Hazard Rating (FD2320/TR2)",
            "variables": {
                "d": "Flood Water Depth in meters (m)",
                "v": "Flow Velocity in meters per second (m/s)",
                "DF": "Debris Factor (0.5 for moderate debris, 1.0 for structural debris)"
            },
            "thresholds": {
                "LOW": "HR < 0.75 (Caution: Shallow flowing water)",
                "MODERATE": "0.75 <= HR < 1.25 (Dangerous for some: Children/Elderly)",
                "HIGH": "1.25 <= HR < 2.00 (Dangerous for most: Adults & Light Vehicles)",
                "CRITICAL": "HR >= 2.00 (Extreme Hazard: Structural Damage & Danger to All)"
            }
        },
        "composite_risk_weights": {
            "hazard_weight": 0.40,
            "vulnerability_weight": 0.30,
            "exposure_weight": 0.30
        },
        "disclaimer": "This risk index is a prototype scientific decision-support metric and should be calibrated with local NDMA emergency action plans."
    }
