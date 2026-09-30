"""
Abstract Base Class for Hydrodynamic Model Adapters
Defines standard interface for Demo, Delft3D, SPH, and HEC-RAS integrations.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.models.schemas import SimulationSummary, SimulationTimeStepData, CrossSectionTelemetry

class HydrodynamicModelAdapter(ABC):
    """
    Abstract adapter for hydrodynamic modeling tools.
    Enables plug-and-play integration of Delft3D, SPH, HEC-RAS, or Demo Shallow Water Solvers.
    """
    def __init__(self, model_name: str, is_synthetic: bool = True):
        self.model_name = model_name
        self.is_synthetic = is_synthetic

    @abstractmethod
    def run_simulation(
        self,
        dam_data: Dict[str, Any],
        scenario_params: Dict[str, Any],
        duration_min: int = 180,
        time_step_min: int = 5
    ) -> SimulationSummary:
        """
        Execute hydrodynamic model or load pre-computed simulation run.
        """
        pass

    @abstractmethod
    def get_timestep_inundation(
        self,
        simulation_id: str,
        time_min: int
    ) -> SimulationTimeStepData:
        """
        Retrieve spatial inundation polygon and depth/velocity point cloud for a specific time-step.
        """
        pass

    @abstractmethod
    def get_maximum_flood_extent(
        self,
        simulation_id: str
    ) -> Dict[str, Any]:
        """
        Retrieve maximum composite flood envelope (GeoJSON FeatureCollection).
        """
        pass

    @abstractmethod
    def get_cross_section_telemetry(
        self,
        simulation_id: str
    ) -> List[CrossSectionTelemetry]:
        """
        Retrieve hydrographs and stage curves at monitored downstream cross-sections.
        """
        pass
