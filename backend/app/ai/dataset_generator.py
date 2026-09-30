"""
AI Training Dataset Generator for Hydrodynamic Risk Classification
Synthesizes hydrodynamic parameter samples based on physical shallow water distributions.
"""
import numpy as np
import pandas as pd
from typing import Tuple

def generate_synthetic_training_data(n_samples: int = 1500, random_state: int = 42) -> pd.DataFrame:
    np.random.seed(random_state)
    
    # 1. Physical hydraulic features
    depth_m = np.random.exponential(scale=2.8, size=n_samples)
    depth_m = np.clip(depth_m, 0.0, 18.0)
    
    velocity_ms = np.random.exponential(scale=2.2, size=n_samples)
    velocity_ms = np.clip(velocity_ms, 0.0, 12.0)
    
    arrival_time_min = np.random.uniform(5.0, 180.0, size=n_samples)
    elevation_m = np.random.uniform(50.0, 850.0, size=n_samples)
    distance_to_river_m = np.random.exponential(scale=350.0, size=n_samples)
    distance_to_river_m = np.clip(distance_to_river_m, 10.0, 2500.0)
    
    population_density = np.random.uniform(50.0, 1500.0, size=n_samples)
    infrastructure_density = np.random.uniform(0.1, 8.0, size=n_samples)
    
    # 2. Assign ground-truth labels using DEFRA formula + Vulnerability Index
    labels = []
    for d, v, arr, dist, pop, infr in zip(
        depth_m, velocity_ms, arrival_time_min, distance_to_river_m, population_density, infrastructure_density
    ):
        hr = d * (v + 0.5) + 0.5
        urgency = np.exp(-arr / 45.0)
        dist_factor = np.exp(-dist / 500.0)
        
        composite_score = 0.45 * min(100.0, (hr / 2.5) * 100.0) + \
                          0.30 * min(100.0, (pop / 1500.0) * 50.0 + (infr / 8.0) * 50.0) + \
                          0.25 * (urgency * 60.0 + dist_factor * 40.0)
                          
        # Add slight realistic stochastic noise
        composite_score += np.random.normal(0, 3.0)
        
        if composite_score < 35.0:
            labels.append("LOW")
        elif composite_score < 60.0:
            labels.append("MODERATE")
        elif composite_score < 80.0:
            labels.append("HIGH")
        else:
            labels.append("CRITICAL")
            
    df = pd.DataFrame({
        "flood_depth_m": np.round(depth_m, 2),
        "flow_velocity_ms": np.round(velocity_ms, 2),
        "arrival_time_min": np.round(arrival_time_min, 1),
        "elevation_m": np.round(elevation_m, 1),
        "distance_to_river_m": np.round(distance_to_river_m, 1),
        "population_density": np.round(population_density, 1),
        "infrastructure_density": np.round(infrastructure_density, 2),
        "risk_level": labels
    })
    
    return df
