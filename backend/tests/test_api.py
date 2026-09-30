import pytest
import io
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "OPERATIONAL"

def test_get_dams():
    res = client.get("/api/dams")
    assert res.status_code == 200
    dams = res.json()
    assert len(dams) >= 3
    assert any(d["id"] == "dam-idukki" for d in dams)

def test_get_dam_detail():
    res = client.get("/api/dams/dam-idukki")
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "Idukki Dam & Cheruthoni Reservoir"
    assert data["river"] == "Periyar River"

def test_get_scenarios():
    res = client.get("/api/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) >= 3

def test_run_simulation_and_flow():
    # 1. Run simulation
    payload = {
        "dam_id": "dam-idukki",
        "scenario_type": "medium",
        "simulation_duration_min": 120,
        "time_step_min": 5,
        "model_type": "demo"
    }
    sim_res = client.post("/api/simulations/run", json=payload)
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    sim_id = sim_data["simulation_id"]
    assert sim_id.startswith("sim-")
    assert sim_data["status"] == "completed"

    # 2. Get timestep
    step_res = client.get(f"/api/simulations/{sim_id}/timestep/30")
    assert step_res.status_code == 200
    assert step_res.json()["time_min"] == 30

    # 3. Get cross sections
    xs_res = client.get(f"/api/simulations/{sim_id}/cross-sections")
    assert xs_res.status_code == 200
    assert len(xs_res.json()) > 0

    # 4. Get villages risk
    v_res = client.get(f"/api/risk/villages?dam_id=dam-idukki&simulation_id={sim_id}")
    assert v_res.status_code == 200
    assert len(v_res.json()) > 0

    # 5. Get model comparison
    comp_res = client.get(f"/api/model-comparison?dam_id=dam-idukki&scenario_id=scenario-medium")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    assert len(comp_data["metrics"]) > 0
    assert comp_data["intersection_over_union_iou"] > 0

    # 6. Get validation
    val_res = client.get(f"/api/validation?dam_id=dam-idukki")
    assert val_res.status_code == 200
    val_data = val_res.json()
    assert val_data["intersection_over_union_iou"] > 0.8

def test_get_hydrodynamic_model_catalog():
    res = client.get("/api/hydrodynamic/models")
    assert res.status_code == 200
    models = res.json()
    assert any(m["id"] == "delft3d" for m in models)
    assert any(m["id"] == "demo" for m in models)
    delft = next(m for m in models if m["id"] == "delft3d")
    assert delft["mode"] in {"demo", "available"}


def test_get_delft3d_config_status():
    res = client.get("/api/hydrodynamic/delft3d/config")
    assert res.status_code == 200
    data = res.json()
    assert "delft3d_available" in data
    assert "mode" in data
    assert data["mode"] in {"demo", "available"}


def test_upload_external_model_output():
    # Test uploading a simulated Delft3D / SPH CSV export
    csv_data = (
        "lng,lat,depth,velocity,time_min\n"
        "76.97,9.85,12.5,8.2,30\n"
        "76.92,9.88,8.4,5.6,30\n"
        "76.85,9.92,5.1,3.8,30\n"
    )
    file_bytes = io.BytesIO(csv_data.encode("utf-8"))
    
    res = client.post(
        "/api/simulations/upload-model-output",
        files={"file": ("delft3d_periyar_run.csv", file_bytes, "text/csv")},
        data={"dam_id": "dam-idukki", "model_type": "delft3d"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["is_synthetic_demo"] is False
    assert data["model_type"] == "delft3d"
    assert "real-delft3" in data["simulation_id"]
