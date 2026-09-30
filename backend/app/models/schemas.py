"""
Pydantic Models and API Schemas for Dam Break Modeling Platform
"""
from typing import List, Dict, Any, Optional, Union, Literal
from pydantic import BaseModel, Field

# ----------------- Dam & Reservoir Models -----------------

class Coordinates(BaseModel):
    lat: float
    lng: float

class ReservoirInfo(BaseModel):
    capacity_mcm: float = Field(..., description="Gross Storage Capacity in Million Cubic Meters")
    full_reservoir_level_m: float = Field(..., description="Full Reservoir Level (FRL) in meters MSL")
    crest_level_m: float = Field(..., description="Dam Crest Level in meters MSL")
    catchment_area_sqkm: float = Field(..., description="Catchment Area in square kilometers")
    dam_height_m: float = Field(..., description="Structural Height in meters")
    dam_length_m: float = Field(..., description="Crest Length in meters")
    dam_type: str = Field(..., description="Gravity, Arch, Embankment, Masonry, Earthfill")

class DamSummary(BaseModel):
    id: str
    name: str
    river: str
    state: str
    district: str
    location: Coordinates
    current_water_level_m: float
    reservoir_info: ReservoirInfo
    study_area_bounds: List[List[float]] = Field(..., description="[[min_lat, min_lng], [max_lat, max_lng]]")
    description: str

class DamDetail(DamSummary):
    historical_flood_events: List[str] = []
    downstream_reach_length_km: float
    river_slope: float
    manning_n: float

# ----------------- Scenario Configuration Models -----------------

class BreachScenarioPreset(BaseModel):
    id: str
    name: str
    type: Literal["small", "medium", "large", "custom"]
    breach_width_m: float
    breach_formation_time_hr: float
    breach_depth_m: float
    reservoir_water_level_m: float
    initial_river_discharge_cumecs: float
    failure_mode: Literal["piping", "overtopping", "catastrophic_collapse"]
    description: str

class SimulationRequest(BaseModel):
    dam_id: str
    scenario_type: Literal["small", "medium", "large", "custom"] = "medium"
    reservoir_water_level_m: Optional[float] = None
    breach_width_m: Optional[float] = None
    breach_formation_time_hr: Optional[float] = None
    breach_depth_m: Optional[float] = None
    initial_river_discharge_cumecs: Optional[float] = 250.0
    simulation_duration_min: int = 180
    time_step_min: int = 5
    model_type: Literal["demo", "delft3d", "sph", "hec_ras"] = "demo"

# ----------------- Hydrodynamic & Simulation Output Models -----------------

class HydrographPoint(BaseModel):
    time_min: float
    discharge_cumecs: float
    water_depth_m: float
    flow_velocity_ms: float
    water_elevation_m: float

class CrossSectionTelemetry(BaseModel):
    reach_id: str
    name: str
    distance_from_dam_km: float
    arrival_time_min: float
    peak_time_min: float
    peak_discharge_cumecs: float
    peak_depth_m: float
    peak_velocity_ms: float
    hydrograph: List[HydrographPoint]

class SimulationSummary(BaseModel):
    simulation_id: str
    dam_id: str
    scenario_name: str
    model_type: str
    is_synthetic_demo: bool
    status: Literal["completed", "running", "failed"]
    peak_breach_discharge_cumecs: float
    total_inundated_area_sqkm: float
    max_flood_depth_m: float
    max_flow_velocity_ms: float
    earliest_village_arrival_min: float
    total_population_at_risk: int
    critical_infrastructure_affected: int
    duration_min: int
    time_steps: List[int]
    created_at: str

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[Dict[str, Any]]

class SimulationTimeStepData(BaseModel):
    time_min: int
    inundation_polygon: Dict[str, Any]  # GeoJSON FeatureCollection
    depth_points: Dict[str, Any]        # GeoJSON FeatureCollection with depth & velocity attributes
    front_position_km: float
    active_villages_inundated: List[str]

# ----------------- Risk Engine Models -----------------

class RiskBreakdown(BaseModel):
    hazard_score: float = Field(..., description="Hazard index HR based on DEFRA (depth*(velocity + 0.5) + DF)")
    vulnerability_score: float = Field(..., description="Demographic & structural vulnerability [0-100]")
    exposure_score: float = Field(..., description="Proximity & arrival time urgency [0-100]")
    total_risk_score: float = Field(..., description="Composite Risk Score [0-100]")
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]

class VillageRiskItem(BaseModel):
    id: str
    name: str
    population: int
    vulnerable_population_count: int  # children + elderly
    distance_from_dam_km: float
    coordinates: Coordinates
    flood_arrival_time_min: float
    peak_arrival_time_min: float
    max_flood_depth_m: float
    max_flow_velocity_ms: float
    risk_breakdown: RiskBreakdown
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    evacuation_priority: Literal["P1 - Immediate", "P2 - Urgent", "P3 - Standby", "P4 - Monitor"]
    recommended_shelter_id: Optional[str] = None
    inundated: bool

class InfrastructureRiskItem(BaseModel):
    id: str
    name: str
    category: Literal["hospital", "school", "bridge", "road", "power_station", "emergency_service"]
    coordinates: Union[Coordinates, List[Coordinates]]
    distance_from_dam_km: float
    flood_arrival_time_min: float
    max_flood_depth_m: float
    is_inundated: bool
    status: Literal["OPERATIONAL", "AT_RISK", "SUBMERGED_CUTOFF", "EVACUATE"]
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]

# ----------------- Evacuation Router Models -----------------

class EvacuationRouteRequest(BaseModel):
    dam_id: str
    origin_village_id: str
    time_of_evacuation_min: float = 0.0
    evacuation_speed_kmh: float = 20.0  # vehicle or rapid convoy speed

class RouteStep(BaseModel):
    step_number: int
    instruction: str
    road_name: str
    distance_km: float
    estimated_time_min: float
    flood_risk_level: str
    is_safe: bool

class EvacuationRouteResponse(BaseModel):
    origin_village: VillageRiskItem
    destination_shelter: Dict[str, Any]
    total_distance_km: float
    total_travel_time_min: float
    safety_status: Literal["SAFE_ROUTE", "CAUTION_ROUTE", "IMPASSABLE_FLOODED"]
    time_headway_min: float = Field(..., description="Minutes between evacuation completion and flood arrival")
    route_geojson: Dict[str, Any]
    steps: List[RouteStep]
    disclaimer: str = "Prototype Decision-Support Recommendation only. Always follow official National/State Disaster Management Authority guidelines."

# ----------------- SPH vs Delft3D Comparison Models -----------------

class ModelComparisonMetrics(BaseModel):
    metric_name: str
    delft3d_value: float
    sph_value: float
    demo_value: float
    unit: str
    absolute_difference: float
    percentage_difference: float

class ModelComparisonResponse(BaseModel):
    dam_id: str
    scenario_id: str
    models_compared: List[str]
    metrics: List[ModelComparisonMetrics]
    intersection_over_union_iou: float
    hydrograph_rmse: float
    hydrograph_mae: float
    delft3d_extent_geojson: Dict[str, Any]
    sph_extent_geojson: Dict[str, Any]
    spatial_difference_geojson: Dict[str, Any]
    summary_analysis: str

# ----------------- Validation Models -----------------

class ValidationAssessment(BaseModel):
    reference_dataset_name: str
    reference_source: Literal["historical_satellite_sar", "field_survey_benchmark", "synthetic_reference"]
    intersection_over_union_iou: float
    dice_coefficient_f1: float
    root_mean_square_error_depth_m: float
    mean_absolute_error_depth_m: float
    hit_rate_sensitivity: float
    false_alarm_rate: float
    accuracy_percentage: float
    is_synthetic_benchmark: bool
    notes: str

# ----------------- AI Models -----------------

class AIModelPredictionInput(BaseModel):
    flood_depth_m: float
    flow_velocity_ms: float
    arrival_time_min: float
    elevation_m: float
    distance_to_river_m: float
    population_density: float
    infrastructure_density: float

class AIModelPredictionOutput(BaseModel):
    predicted_risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    risk_probability: Dict[str, float]
    feature_importance: Dict[str, float]
    explanation: str
    model_type: str = "Random Forest Classifier (Synthetic Hydrodynamic Training Set)"

class AITrainResponse(BaseModel):
    status: str
    model_accuracy: float
    train_samples_count: int
    test_samples_count: int
    classification_report: Dict[str, Any]
