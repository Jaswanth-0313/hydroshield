"""Modular hydrodynamic model service for demo, Delft3D and fallback adapters."""
from __future__ import annotations

import os
import shutil
from typing import Any, Dict, List

from app.gis.datasets import load_dam_by_id
from app.hydrodynamics.demo_engine import DemoSimulationAdapter
from app.hydrodynamics.delft3d_adapter import Delft3DAdapter
from app.hydrodynamics.sph_adapter import SPHAdapter


class HydrodynamicModelService:
    """Central registry and availability detection for hydrodynamic solvers."""

    @staticmethod
    def detect_delft3d() -> Dict[str, Any]:
        executable = (
            os.getenv("DELFT3D_BIN")
            or os.getenv("DFLOWFM_BIN")
            or shutil.which("delft3d")
            or shutil.which("d_hydro")
            or shutil.which("dflowfm")
        )
        available = bool(executable)
        return {
            "delft3d_available": available,
            "bin_path": executable,
            "mode": "available" if available else "demo",
            "requirement": "Install Delft3D-FM or set DELFT3D_BIN/DFLOWFM_BIN to enable high-fidelity execution.",
        }

    @staticmethod
    def get_model_catalog() -> List[Dict[str, Any]]:
        config = HydrodynamicModelService.detect_delft3d()
        return [
            {
                "id": "demo",
                "name": "Project 2D Shallow-Water Engine",
                "model_type": "demo",
                "status": "available",
                "mode": "available",
                "description": "Operational in-app hydrodynamic solver used for the current emergency workflow.",
                "available": True,
            },
            {
                "id": "delft3d",
                "name": "Delft3D-FM Flexible Mesh",
                "model_type": "delft3d",
                "status": "available" if config["delft3d_available"] else "demo",
                "mode": config["mode"],
                "description": "Advanced high-fidelity flood propagation model. Runs with the real solver when configured, otherwise in clearly labelled demonstration mode.",
                "available": config["delft3d_available"],
            },
            {
                "id": "sph",
                "name": "DualSPHysics SPH",
                "model_type": "sph",
                "status": "demo",
                "mode": "demo",
                "description": "Lagrangian particle solver adapter reserved for validated external SPH runs.",
                "available": False,
            },
        ]

    @staticmethod
    def get_delft3d_config() -> Dict[str, Any]:
        cfg = HydrodynamicModelService.detect_delft3d()
        return {
            **cfg,
            "model_name": "Delft3D-FM Flexible Mesh",
            "computational_domain": "2D depth-averaged unstructured mesh",
            "terrain_input": "DEM / bathymetry and river geometry",
            "simulation_output": [
                "Flood depth",
                "Flow velocity",
                "Flood extent",
                "Water level",
                "Time of arrival",
                "Maximum inundation",
            ],
        }

    @staticmethod
    def create_adapter(model_type: str):
        model_type = (model_type or "demo").lower()
        if model_type == "delft3d":
            return Delft3DAdapter()
        if model_type == "sph":
            return SPHAdapter()
        return DemoSimulationAdapter()

    @staticmethod
    def build_demo_delft3d_response(dam_id: str, scenario_type: str = "medium"):
        dam = load_dam_by_id(dam_id)
        if not dam:
            raise ValueError(f"Dam '{dam_id}' not found")
        adapter = Delft3DAdapter()
        return adapter.run_simulation(
            dam_data=dam,
            scenario_params={
                "scenario_type": scenario_type,
                "reservoir_water_level_m": dam.get("current_water_level_m"),
                "breach_width_m": 90.0,
                "breach_formation_time_hr": 0.8,
                "breach_depth_m": 30.0,
                "initial_river_discharge_cumecs": 250.0,
            },
            duration_min=180,
            time_step_min=5,
        )
