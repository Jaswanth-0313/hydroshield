"""
Simulations and Hydrodynamic Execution Router
"""
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from typing import Dict, Any, List, Optional
from app.gis.datasets import load_dam_by_id, load_scenario_presets
from app.hydrodynamics.demo_engine import DemoSimulationAdapter, SIMULATION_STORE
from app.hydrodynamics.delft3d_adapter import Delft3DAdapter
from app.hydrodynamics.sph_adapter import SPHAdapter
from app.hydrodynamics.file_parser import parse_external_simulation_file
from app.models.schemas import (
    SimulationRequest,
    SimulationSummary,
    SimulationTimeStepData,
    CrossSectionTelemetry
)

router = APIRouter(prefix="/simulations", tags=["Simulations"])

@router.post("/run", response_model=SimulationSummary)
def run_simulation(req: SimulationRequest):
    """
    Launch or load a hydrodynamic dam break simulation.
    Supports Demo Shallow Water Engine, Delft3D-FM, and SPH adapters.
    """
    dam = load_dam_by_id(req.dam_id)
    if not dam:
        raise HTTPException(status_code=404, detail=f"Dam '{req.dam_id}' not found.")
        
    scenario_params = {
        "scenario_type": req.scenario_type,
        "reservoir_water_level_m": req.reservoir_water_level_m or dam["current_water_level_m"],
        "breach_width_m": req.breach_width_m,
        "breach_formation_time_hr": req.breach_formation_time_hr,
        "breach_depth_m": req.breach_depth_m,
        "initial_river_discharge_cumecs": req.initial_river_discharge_cumecs or 250.0
    }
    
    # Choose appropriate adapter
    if req.model_type == "delft3d":
        adapter = Delft3DAdapter()
    elif req.model_type == "sph":
        adapter = SPHAdapter()
    else:
        adapter = DemoSimulationAdapter()
        
    summary = adapter.run_simulation(
        dam_data=dam,
        scenario_params=scenario_params,
        duration_min=req.simulation_duration_min,
        time_step_min=req.time_step_min
    )
    
    return summary

@router.post("/upload-model-output", response_model=SimulationSummary)
async def upload_model_output(
    file: UploadFile = File(...),
    dam_id: str = Form("dam-idukki"),
    model_type: str = Form("delft3d")
):
    """
    Upload real/pre-computed external hydrodynamic simulation files (NetCDF/GeoJSON/CSV).
    Parses and registers as 'REAL MODEL OUTPUT' with verified fidelity.
    """
    content = await file.read()
    content_str = content.decode("utf-8", errors="ignore")
    
    summary = parse_external_simulation_file(
        file_content=content_str,
        filename=file.filename,
        dam_id=dam_id,
        model_type=model_type
    )
    return summary

@router.get("/{simulation_id}", response_model=SimulationSummary)
def get_simulation_summary(simulation_id: str):
    """Retrieve summary telemetry for an existing simulation run."""
    sim = SIMULATION_STORE.get(simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulation '{simulation_id}' not found.")
    return sim["summary"]

@router.get("/{simulation_id}/timestep/{time_min}", response_model=SimulationTimeStepData)
def get_simulation_timestep(simulation_id: str, time_min: int):
    """Retrieve spatial inundation polygon and depth points for a specific simulation minute."""
    sim = SIMULATION_STORE.get(simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulation '{simulation_id}' not found.")
    
    model_type = sim["summary"].model_type
    if model_type == "delft3d":
        adapter = Delft3DAdapter()
    elif model_type == "sph":
        adapter = SPHAdapter()
    else:
        adapter = DemoSimulationAdapter()
        
    return adapter.get_timestep_inundation(simulation_id, time_min)

@router.get("/{simulation_id}/max-extent")
def get_max_extent(simulation_id: str):
    """Retrieve maximum composite flood footprint GeoJSON."""
    sim = SIMULATION_STORE.get(simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulation '{simulation_id}' not found.")
    return sim["max_extent"]

@router.get("/{simulation_id}/cross-sections", response_model=List[CrossSectionTelemetry])
def get_cross_sections(simulation_id: str):
    """Retrieve hydrographs and stage telemetry at monitored river cross-sections."""
    sim = SIMULATION_STORE.get(simulation_id)
    if not sim:
        raise HTTPException(status_code=404, detail=f"Simulation '{simulation_id}' not found.")
    return sim["cross_sections"]
