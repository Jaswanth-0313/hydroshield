"""
Evacuation Route Planning API Router
"""
from fastapi import APIRouter, HTTPException
from app.gis.datasets import load_villages, load_dam_by_id
from app.hydrodynamics.demo_engine import SIMULATION_STORE
from app.risk.risk_calculator import compute_all_villages_risk
from app.evacuation.route_planner import plan_safe_evacuation_route
from app.models.schemas import EvacuationRouteRequest, EvacuationRouteResponse

router = APIRouter(prefix="/evacuation", tags=["Evacuation Routing"])

@router.post("/route", response_model=EvacuationRouteResponse)
def calculate_evacuation_route(req: EvacuationRouteRequest, simulation_id: str = None):
    """
    Calculate dynamic optimal safe evacuation route from village to high-ground shelter,
    avoiding roads predicted to be submerged (>0.3m depth).
    """
    dam = load_dam_by_id(req.dam_id)
    if not dam:
        raise HTTPException(status_code=404, detail=f"Dam '{req.dam_id}' not found.")
        
    sim = SIMULATION_STORE.get(simulation_id) if simulation_id else None
    max_extent = sim["max_extent"] if sim else {"type": "FeatureCollection", "features": []}
    peak_q = sim["summary"].peak_breach_discharge_cumecs if sim else 12500.0
    front_speed = sim.get("front_speed_km_min", 0.45) if sim else 0.45
    
    # Get village risk profile
    villages = compute_all_villages_risk(req.dam_id, peak_q, front_speed, max_extent)
    v_profile = next((v for v in villages if v.id == req.origin_village_id), None)
    
    if not v_profile:
        # Fallback dummy village profile
        v_profile = villages[0] if villages else None
        
    if not v_profile:
        raise HTTPException(status_code=404, detail=f"Village '{req.origin_village_id}' not found.")
        
    route_res = plan_safe_evacuation_route(
        dam_id=req.dam_id,
        origin_village_id=req.origin_village_id,
        village_risk_profile=v_profile,
        inundation_polygon_geojson=max_extent,
        front_speed_km_min=front_speed,
        time_of_evac_min=req.time_of_evacuation_min,
        evac_speed_kmh=req.evacuation_speed_kmh
    )
    
    return route_res
