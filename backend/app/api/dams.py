"""
Dams API Router
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.gis.datasets import load_all_dams, load_dam_by_id
from app.models.schemas import DamSummary, DamDetail

router = APIRouter(prefix="/dams", tags=["Dams"])

@router.get("", response_model=List[DamSummary])
def get_all_dams():
    """Retrieve all available dams in the decision support repository."""
    dams = load_all_dams()
    return dams

@router.get("/{dam_id}", response_model=DamDetail)
def get_dam_detail(dam_id: str):
    """Retrieve detailed metadata, reservoir specs, and boundary for a specific dam."""
    dam = load_dam_by_id(dam_id)
    if not dam:
        raise HTTPException(status_code=404, detail=f"Dam with ID '{dam_id}' not found.")
    return dam
