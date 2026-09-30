import pytest
from app.hydrodynamics.breach_equations import (
    calculate_froehlich_breach_parameters,
    calculate_ritter_wave_velocity,
    generate_breach_hydrograph
)
from app.hydrodynamics.demo_engine import DemoSimulationAdapter
from app.gis.datasets import load_dam_by_id

def test_froehlich_breach_calculations():
    # Idukki reservoir ~1996 MCM, 168m height
    res = calculate_froehlich_breach_parameters(
        reservoir_volume_mcm=1996.0,
        water_depth_above_invert_m=120.0,
        failure_mode="overtopping"
    )
    assert res["calculated_breach_width_m"] > 30.0
    assert res["calculated_formation_time_hr"] > 0.1
    assert res["peak_breach_discharge_cumecs"] > 1000.0
    assert res["failure_mode"] == "overtopping"

def test_ritter_wave_velocity():
    ritter = calculate_ritter_wave_velocity(dam_water_depth_m=100.0, manning_n=0.035, bed_slope=0.003)
    assert ritter["celerity_ms"] > 20.0
    assert ritter["actual_wave_front_speed_ms"] > 5.0
    assert ritter["wave_front_speed_kmh"] > 20.0

def test_demo_simulation_adapter():
    adapter = DemoSimulationAdapter()
    dam = load_dam_by_id("dam-idukki")
    assert dam is not None
    
    summary = adapter.run_simulation(
        dam_data=dam,
        scenario_params={"scenario_type": "medium", "breach_width_m": 85.0, "breach_formation_time_hr": 0.8},
        duration_min=180,
        time_step_min=5
    )
    
    assert summary.status == "completed"
    assert summary.is_synthetic_demo is True
    assert summary.peak_breach_discharge_cumecs > 0
    assert summary.total_inundated_area_sqkm > 0
    
    # Test timestep retrieval
    step_data = adapter.get_timestep_inundation(summary.simulation_id, time_min=30)
    assert step_data.time_min == 30
    assert len(step_data.inundation_polygon["features"]) > 0
    
    # Test cross sections
    xs = adapter.get_cross_section_telemetry(summary.simulation_id)
    assert len(xs) > 0
    assert len(xs[0].hydrograph) > 0
