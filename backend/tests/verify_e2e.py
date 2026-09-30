"""
End-to-End Verification Test Script
Tests full user simulation workflow from Dam Selection to Evacuation Routing and AI Prediction.
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_verification():
    print("=== SIH Dam Break System Verification ===")
    
    # 1. Health & Dams
    res = client.get("/api/health")
    assert res.status_code == 200
    print("1. Health Endpoint: OK")

    dams_res = client.get("/api/dams")
    assert dams_res.status_code == 200
    dams = dams_res.json()
    assert len(dams) >= 3
    print(f"2. Dams Loaded: {len(dams)} Dams ({[d['name'] for d in dams]})")

    # 2. Scenarios
    sc_res = client.get("/api/scenarios")
    assert sc_res.status_code == 200
    scenarios = sc_res.json()
    assert len(scenarios) >= 3
    print(f"3. Scenario Presets: {len(scenarios)} Presets ({[s['name'] for s in scenarios]})")

    # 3. Hydrodynamic Simulation Run
    sim_payload = {
        "dam_id": "dam-idukki",
        "scenario_type": "medium",
        "breach_width_m": 85.0,
        "breach_formation_time_hr": 0.8,
        "simulation_duration_min": 180,
        "time_step_min": 5,
        "model_type": "demo"
    }
    sim_res = client.post("/api/simulations/run", json=sim_payload)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    sim_id = sim_data["simulation_id"]
    print(f"4. Hydro Simulation Launched: {sim_id} | Peak Q = {sim_data['peak_breach_discharge_cumecs']} m³/s | Area = {sim_data['total_inundated_area_sqkm']} km²")

    # 4. Timestep Retrieval
    ts_res = client.get(f"/api/simulations/{sim_id}/timestep/45")
    assert ts_res.status_code == 200
    ts_data = ts_res.json()
    assert ts_data["time_min"] == 45
    print(f"5. Timestep Snapshot (T+45 min): Front at {ts_data['front_position_km']} km | Polygon features = {len(ts_data['inundation_polygon']['features'])}")

    # 5. Risk Assessment (Villages & Infrastructure)
    v_res = client.get(f"/api/risk/villages?dam_id=dam-idukki&simulation_id={sim_id}")
    assert v_res.status_code == 200
    villages = v_res.json()
    print(f"6. Villages Risk Calculated: {len(villages)} communities. Top critical: {villages[0]['name']} (Score: {villages[0]['risk_breakdown']['total_risk_score']}, Priority: {villages[0]['evacuation_priority']})")

    inf_res = client.get(f"/api/risk/infrastructure?dam_id=dam-idukki&simulation_id={sim_id}")
    assert inf_res.status_code == 200
    infras = inf_res.json()
    submerged_inf = [i for i in infras if i["is_inundated"]]
    print(f"7. Infrastructure Risk: {len(infras)} facilities evaluated ({len(submerged_inf)} submerged/cutoff)")

    # 6. Evacuation Routing
    evac_payload = {
        "dam_id": "dam-idukki",
        "origin_village_id": villages[0]["id"],
        "time_of_evacuation_min": 0,
        "evacuation_speed_kmh": 25.0
    }
    evac_res = client.post(f"/api/evacuation/route?simulation_id={sim_id}", json=evac_payload)
    assert evac_res.status_code == 200
    evac_data = evac_res.json()
    print(f"8. Evacuation Route Planned: From '{evac_data['origin_village']['name']}' to '{evac_data['destination_shelter']['name']}' | Dist = {evac_data['total_distance_km']} km | Time = {evac_data['total_travel_time_min']} min | Headway = {evac_data['time_headway_min']} min | Status = {evac_data['safety_status']}")

    # 7. SPH vs Delft3D Comparison
    comp_res = client.get("/api/model-comparison?dam_id=dam-idukki&scenario_id=scenario-medium")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    print(f"9. Model Comparison (SPH vs Delft3D): IoU = {comp_data['intersection_over_union_iou']} | Hydrograph RMSE = {comp_data['hydrograph_rmse']} m³/s")

    # 8. AI Prediction
    ai_payload = {
        "flood_depth_m": 3.2,
        "flow_velocity_ms": 2.8,
        "arrival_time_min": 18.0,
        "elevation_m": 420.0,
        "distance_to_river_m": 80.0,
        "population_density": 650.0,
        "infrastructure_density": 4.2
    }
    ai_res = client.post("/api/ai/predict", json=ai_payload)
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    print(f"10. AI Risk Prediction: Class = {ai_data['predicted_risk_level']} | Explanation = {ai_data['explanation']}")

    # 9. Satellite SAR Validation
    val_res = client.get("/api/validation?dam_id=dam-idukki")
    assert val_res.status_code == 200
    val_data = val_res.json()
    print(f"11. Satellite SAR Validation: IoU = {val_data['intersection_over_union_iou']} | Depth RMSE = {val_data['root_mean_square_error_depth_m']}m | Accuracy = {val_data['accuracy_percentage']}%")

    print("\n[SUCCESS] ALL 11 END-TO-END SIH WORKFLOW STAGES VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    run_verification()
