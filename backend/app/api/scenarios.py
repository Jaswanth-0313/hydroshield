"""
Scenario Configuration API Router
"""
from fastapi import APIRouter
from typing import List, Dict, Any
from app.gis.datasets import load_scenario_presets
from app.models.schemas import BreachScenarioPreset

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

@router.get("", response_model=List[BreachScenarioPreset])
def get_scenario_presets():
    """Retrieve predefined breach scenario templates (Small, Medium, Large)."""
    return load_scenario_presets()
