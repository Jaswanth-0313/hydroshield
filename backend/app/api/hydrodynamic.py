"""Hydrodynamic model API routes for model catalog and Delft3D status."""
from fastapi import APIRouter

from app.hydrodynamics.model_service import HydrodynamicModelService

router = APIRouter(prefix="/hydrodynamic", tags=["Hydrodynamic"])


@router.get("/models")
def get_model_catalog():
    return HydrodynamicModelService.get_model_catalog()


@router.get("/delft3d/config")
def get_delft3d_config():
    cfg = HydrodynamicModelService.get_delft3d_config()
    return {
        **cfg,
        "status": "ready" if cfg["delft3d_available"] else "demo",
        "message": "Delft3D-FM is available for execution when the solver is installed and configured." if cfg["delft3d_available"] else "Delft3D-FM is not installed in this environment; the system is operating in clearly labelled demo mode.",
    }
