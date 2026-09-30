"""
GIS Dataset Loaders and Storage Interfaces
Provides fast file and memory-based access to geojson and json datasets.
"""
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.config import DATA_DIR

def load_all_dams() -> List[Dict[str, Any]]:
    dams_file = DATA_DIR / "dams" / "dams.json"
    if not dams_file.exists():
        return []
    with open(dams_file, "r", encoding="utf-8") as f:
        return json.load(f)

def load_dam_by_id(dam_id: str) -> Optional[Dict[str, Any]]:
    dams = load_all_dams()
    for d in dams:
        if d["id"] == dam_id:
            # Also attach river line points if available
            river_file = DATA_DIR / "rivers" / f"{dam_id}.geojson"
            if river_file.exists():
                with open(river_file, "r", encoding="utf-8") as rf:
                    river_data = json.load(rf)
                    if river_data.get("features"):
                        d["river_points"] = river_data["features"][0]["geometry"]["coordinates"]
            return d
    return None

def load_scenario_presets() -> List[Dict[str, Any]]:
    scenarios_file = DATA_DIR / "dams" / "scenarios.json"
    if not scenarios_file.exists():
        return []
    with open(scenarios_file, "r", encoding="utf-8") as f:
        return json.load(f)

def load_river_geojson(dam_id: str) -> Dict[str, Any]:
    file_path = DATA_DIR / "rivers" / f"{dam_id}.geojson"
    if not file_path.exists():
        return {"type": "FeatureCollection", "features": []}
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_villages(dam_id: str) -> List[Dict[str, Any]]:
    file_path = DATA_DIR / "villages" / f"{dam_id}.json"
    if not file_path.exists():
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_infrastructure(dam_id: str) -> List[Dict[str, Any]]:
    file_path = DATA_DIR / "infrastructure" / f"{dam_id}.json"
    if not file_path.exists():
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_shelters(dam_id: str) -> List[Dict[str, Any]]:
    file_path = DATA_DIR / "shelters" / f"{dam_id}.json"
    if not file_path.exists():
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_roads_geojson(dam_id: str) -> Dict[str, Any]:
    file_path = DATA_DIR / "roads" / f"{dam_id}.geojson"
    if not file_path.exists():
        return {"type": "FeatureCollection", "features": []}
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_validation_benchmark(dam_id: str) -> Optional[Dict[str, Any]]:
    file_path = DATA_DIR / "reference" / f"{dam_id}-validation.json"
    if not file_path.exists():
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)
