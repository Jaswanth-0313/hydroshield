"""
Hydrodynamic Demo Simulation Engine
Implements 1D/2D shallow water wave shock propagation with spatial buffering,
time-step raster/vector generation, and downstream flood routing.
Clearly marked as DEMO/SYNTHETIC SIMULATION.
"""
import math
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from shapely.geometry import LineString, Polygon, Point, MultiPolygon, mapping

from app.hydrodynamics.base import HydrodynamicModelAdapter
from app.hydrodynamics.breach_equations import (
    calculate_froehlich_breach_parameters,
    calculate_ritter_wave_velocity,
    generate_breach_hydrograph
)
from app.models.schemas import (
    SimulationSummary,
    SimulationTimeStepData,
    CrossSectionTelemetry,
    HydrographPoint
)

# In-memory and file store cache for simulated runs
SIMULATION_STORE: Dict[str, Dict[str, Any]] = {}

class DemoSimulationAdapter(HydrodynamicModelAdapter):
    """
    Physically-based 2D shallow water wave propagation demo engine.
    Computes time-varying flood extent, depth grids, velocity fields, and hydrographs.
    """
    def __init__(self):
        super().__init__(model_name="Demo Shallow Water Solver", is_synthetic=True)

    def run_simulation(
        self,
        dam_data: Dict[str, Any],
        scenario_params: Dict[str, Any],
        duration_min: int = 180,
        time_step_min: int = 5
    ) -> SimulationSummary:
        sim_id = f"sim-{uuid.uuid4().hex[:8]}"
        
        # 1. Extract physical dam & scenario parameters
        res_info = dam_data.get("reservoir_info", {})
        capacity_mcm = float(res_info.get("capacity_mcm", 1500.0))
        dam_height_m = float(res_info.get("dam_height_m", 100.0))
        
        # Breach parameters
        water_level = float(scenario_params.get("reservoir_water_level_m", dam_height_m * 0.95))
        breach_width_input = scenario_params.get("breach_width_m")
        breach_time_input = scenario_params.get("breach_formation_time_hr")
        failure_mode = scenario_params.get("failure_mode", "overtopping")
        initial_discharge = float(scenario_params.get("initial_river_discharge_cumecs", 250.0))
        scenario_type = scenario_params.get("type", scenario_params.get("scenario_type", "medium"))
        
        # Calculate theoretical Froehlich parameters
        froehlich = calculate_froehlich_breach_parameters(
            capacity_mcm, water_level, failure_mode
        )
        
        breach_width = float(breach_width_input) if breach_width_input else froehlich["calculated_breach_width_m"]
        breach_time_hr = float(breach_time_input) if breach_time_input else froehlich["calculated_formation_time_hr"]
        
        # Scale peak discharge with user breach width
        width_ratio = breach_width / max(froehlich["calculated_breach_width_m"], 1.0)
        peak_discharge = froehlich["peak_breach_discharge_cumecs"] * math.sqrt(max(width_ratio, 0.1))
        
        # 2. Wave propagation dynamics
        manning_n = float(dam_data.get("manning_n", 0.038))
        river_slope = float(dam_data.get("river_slope", 0.0035))
        ritter = calculate_ritter_wave_velocity(water_level, manning_n, river_slope)
        front_speed_km_min = (ritter["actual_wave_front_speed_ms"] * 60.0) / 1000.0  # km per minute (~0.3 - 0.7 km/min)
        
        # 3. Retrieve river geometry
        river_line_coords = dam_data.get("river_points", [])
        if not river_line_coords or len(river_line_coords) < 2:
            # Generate default synthetic river line extending west/downstream
            dam_loc = dam_data.get("location", {"lat": 9.85, "lng": 76.97})
            river_line_coords = [
                [dam_loc["lng"], dam_loc["lat"]],
                [dam_loc["lng"] - 0.02, dam_loc["lat"] + 0.01],
                [dam_loc["lng"] - 0.05, dam_loc["lat"] + 0.03],
                [dam_loc["lng"] - 0.09, dam_loc["lat"] + 0.06],
                [dam_loc["lng"] - 0.14, dam_loc["lat"] + 0.09],
                [dam_loc["lng"] - 0.20, dam_loc["lat"] + 0.12]
            ]
        
        river_line = LineString(river_line_coords)
        total_river_length_km = float(dam_data.get("downstream_reach_length_km", 45.0))
        
        # 4. Generate Time-Step Snapshots
        time_steps = list(range(0, duration_min + 1, time_step_min))
        timestep_records = {}
        all_depth_points = []
        max_inundated_sqkm = 0.0
        
        # Conversion approx: 1 deg lat/lng ~ 111 km -> 1 km ~ 0.009 deg
        km_to_deg = 0.009
        
        # Create discrete cross-section spatial monitoring stations
        station_fractions = [0.05, 0.25, 0.55, 0.85]
        station_names = ["Dam Tailrace Section", "Upper Valley Reach", "Middle Gorge Junction", "Lower Floodplain"]
        cross_sections = []
        
        for frac, s_name in zip(station_fractions, station_names):
            dist_km = frac * total_river_length_km
            arr_time = dist_km / max(front_speed_km_min, 0.05)
            peak_time = arr_time + (breach_time_hr * 60.0 * 0.8)
            
            # Hydrograph attenuation along distance
            attenuation = math.exp(-0.022 * dist_km)
            station_peak_q = max(initial_discharge, peak_discharge * attenuation)
            station_peak_depth = math.pow(station_peak_q / 50.0, 0.6)
            station_peak_vel = min(12.0, station_peak_q / (max(station_peak_depth, 0.5) * 60.0))
            
            # Station hydrograph
            station_hydro = []
            for t in time_steps:
                if t < arr_time:
                    q_t = initial_discharge
                    d_t = 0.8
                    v_t = 0.6
                else:
                    dt_arr = t - arr_time
                    time_to_peak = max(peak_time - arr_time, 5.0)
                    if dt_arr <= time_to_peak:
                        q_t = initial_discharge + (station_peak_q - initial_discharge) * (dt_arr / time_to_peak)
                    else:
                        q_t = initial_discharge + (station_peak_q - initial_discharge) * math.exp(-0.018 * (dt_arr - time_to_peak))
                    d_t = math.pow(max(q_t, 10.0) / 50.0, 0.6)
                    v_t = max(0.4, min(10.0, q_t / (max(d_t, 0.5) * 60.0)))
                
                station_hydro.append(HydrographPoint(
                    time_min=t,
                    discharge_cumecs=round(q_t, 2),
                    water_depth_m=round(d_t, 2),
                    flow_velocity_ms=round(v_t, 2),
                    water_elevation_m=round(610.0 - dist_km * 12.0 + d_t, 2)
                ))
            
            cross_sections.append(CrossSectionTelemetry(
                reach_id=f"xs-{int(dist_km)}km",
                name=s_name,
                distance_from_dam_km=round(dist_km, 1),
                arrival_time_min=round(arr_time, 1),
                peak_time_min=round(peak_time, 1),
                peak_discharge_cumecs=round(station_peak_q, 2),
                peak_depth_m=round(station_peak_depth, 2),
                peak_velocity_ms=round(station_peak_vel, 2),
                hydrograph=station_hydro
            ))

        # 5. Build dynamic vector polygon envelopes for each time step
        for t in time_steps:
            # Front travel distance
            front_km = min(total_river_length_km, t * front_speed_km_min)
            front_fraction = front_km / total_river_length_km
            
            if front_fraction <= 0.001:
                # Time 0: Initial river width only
                buffer_deg = 0.0004
                inundation_geom = river_line.buffer(buffer_deg)
                active_pts = []
            else:
                # Interpolate sub-linestring reached so far
                num_pts = max(2, int(len(river_line_coords) * front_fraction) + 1)
                sub_coords = river_line_coords[:num_pts]
                if len(sub_coords) < 2:
                    sub_coords = river_line_coords[:2]
                
                sub_line = LineString(sub_coords)
                
                # Flood spread width depends on breach size and decay
                max_spread_km = (breach_width / 150.0) * 1.8 + 0.5  # 0.8 to 2.5 km valley floodplain
                buffer_deg = (max_spread_km * km_to_deg) * min(1.0, (t / max(breach_time_hr * 60, 20)))
                buffer_deg = max(0.0015, buffer_deg)
                
                inundation_geom = sub_line.buffer(buffer_deg, cap_style=1, join_style=1)
                
            inundated_sqkm = (inundation_geom.area * 111.0 * 111.0)
            max_inundated_sqkm = max(max_inundated_sqkm, inundated_sqkm)
            
            # Generate spatial depth/velocity grid points along the reach
            pts_features = []
            sample_step = max(1, len(river_line_coords) // 8)
            for i, coord in enumerate(river_line_coords):
                seg_dist_km = (i / max(len(river_line_coords) - 1, 1)) * total_river_length_km
                seg_arrival = seg_dist_km / max(front_speed_km_min, 0.05)
                
                if t >= seg_arrival:
                    # Flooded point
                    dt = t - seg_arrival
                    depth = max(0.5, (12.0 * math.exp(-0.02 * seg_dist_km)) * (1.0 - math.exp(-0.1 * dt)))
                    vel = max(0.4, (8.5 * math.exp(-0.015 * seg_dist_km)) * (1.0 - math.exp(-0.15 * dt)))
                else:
                    depth = 0.0
                    vel = 0.0
                
                pts_features.append({
                    "type": "Feature",
                    "properties": {
                        "point_id": f"pt-{i}",
                        "distance_km": round(seg_dist_km, 1),
                        "depth_m": round(depth, 2),
                        "velocity_ms": round(vel, 2),
                        "arrival_time_min": round(seg_arrival, 1),
                        "is_wet": depth > 0.1
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": coord
                    }
                })

            timestep_records[t] = {
                "time_min": t,
                "inundation_polygon": {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {
                                "time_min": t,
                                "inundated_area_sqkm": round(inundated_sqkm, 2),
                                "front_distance_km": round(front_km, 2)
                            },
                            "geometry": mapping(inundation_geom)
                        }
                    ]
                },
                "depth_points": {
                    "type": "FeatureCollection",
                    "features": pts_features
                },
                "front_position_km": round(front_km, 2),
                "active_villages_inundated": []
            }

        # Maximum composite flood extent (at end of simulation / peak)
        max_extent_geom = river_line.buffer(
            ((breach_width / 150.0) * 1.8 + 0.5) * km_to_deg,
            cap_style=1, join_style=1
        )
        max_extent_geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "name": "Maximum Inundation Envelope",
                        "simulation_id": sim_id,
                        "total_area_sqkm": round(max_inundated_sqkm, 2),
                        "is_synthetic_demo": True
                    },
                    "geometry": mapping(max_extent_geom)
                }
            ]
        }

        # Create summary
        earliest_arrival = min(cs.arrival_time_min for cs in cross_sections if cs.distance_from_dam_km > 0.5)
        
        summary = SimulationSummary(
            simulation_id=sim_id,
            dam_id=dam_data.get("id", "dam-idukki"),
            scenario_name=f"{scenario_type.capitalize()} Breach ({breach_width}m width, {breach_time_hr}h)",
            model_type="demo",
            is_synthetic_demo=True,
            status="completed",
            peak_breach_discharge_cumecs=round(peak_discharge, 2),
            total_inundated_area_sqkm=round(max_inundated_sqkm, 2),
            max_flood_depth_m=round(cross_sections[0].peak_depth_m, 2),
            max_flow_velocity_ms=round(cross_sections[0].peak_velocity_ms, 2),
            earliest_village_arrival_min=round(earliest_arrival, 1),
            total_population_at_risk=0,  # Will be populated by Risk Engine
            critical_infrastructure_affected=0,
            duration_min=duration_min,
            time_steps=time_steps,
            created_at=datetime.now(timezone.utc).isoformat()
        )

        # Store in-memory
        SIMULATION_STORE[sim_id] = {
            "summary": summary,
            "timesteps": timestep_records,
            "max_extent": max_extent_geojson,
            "cross_sections": cross_sections,
            "front_speed_km_min": front_speed_km_min,
            "dam_data": dam_data,
            "scenario_params": scenario_params
        }

        return summary

    def get_timestep_inundation(
        self,
        simulation_id: str,
        time_min: int
    ) -> SimulationTimeStepData:
        sim = SIMULATION_STORE.get(simulation_id)
        if not sim:
            raise KeyError(f"Simulation {simulation_id} not found.")
        
        timesteps = sim["timesteps"]
        # Find closest available timestep
        available_times = sorted(timesteps.keys())
        closest_t = min(available_times, key=lambda t: abs(t - time_min))
        data = timesteps[closest_t]
        
        return SimulationTimeStepData(
            time_min=closest_t,
            inundation_polygon=data["inundation_polygon"],
            depth_points=data["depth_points"],
            front_position_km=data["front_position_km"],
            active_villages_inundated=data["active_villages_inundated"]
        )

    def get_maximum_flood_extent(
        self,
        simulation_id: str
    ) -> Dict[str, Any]:
        sim = SIMULATION_STORE.get(simulation_id)
        if not sim:
            raise KeyError(f"Simulation {simulation_id} not found.")
        return sim["max_extent"]

    def get_cross_section_telemetry(
        self,
        simulation_id: str
    ) -> List[CrossSectionTelemetry]:
        sim = SIMULATION_STORE.get(simulation_id)
        if not sim:
            raise KeyError(f"Simulation {simulation_id} not found.")
        return sim["cross_sections"]
