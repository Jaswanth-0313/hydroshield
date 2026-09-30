"""
SPH vs Delft3D Model Comparison API Router
"""
from fastapi import APIRouter, Query
from app.hydrodynamics.model_comparison import compare_hydrodynamic_models
from app.models.schemas import ModelComparisonResponse

router = APIRouter(prefix="/model-comparison", tags=["Model Comparison"])

@router.get("", response_model=ModelComparisonResponse)
def get_model_comparison(
    dam_id: str = Query("dam-idukki", description="Dam Identifier"),
    scenario_id: str = Query("scenario-medium", description="Scenario Preset Identifier")
):
    """
    Compare outputs of Delft3D Flexible Mesh vs SPH vs Demo 2D Shallow Water Solver.
    Returns metrics, hydrograph RMSE, and spatial IoU.
    """
    return compare_hydrodynamic_models(dam_id, scenario_id)
