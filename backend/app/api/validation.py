"""
Validation & Historical Calibration API Router
"""
from fastapi import APIRouter, Query
from app.hydrodynamics.validation import evaluate_model_validation
from app.models.schemas import ValidationAssessment

router = APIRouter(prefix="/validation", tags=["Model Validation"])

@router.get("", response_model=ValidationAssessment)
def get_validation_assessment(
    dam_id: str = Query("dam-idukki", description="Dam Identifier")
):
    """
    Retrieve model validation metrics against Sentinel-1 SAR satellite ground truth and high water marks.
    """
    return evaluate_model_validation(dam_id)
