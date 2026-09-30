"""
Risk Calculation Formulas and Mathematical Definitions
Implements DEFRA Flood Hazard Index HR, Demographic Vulnerability Index, and Dynamic Exposure Index.
"""
import math
from typing import Dict, Any, Tuple

def calculate_defra_hazard_rating(
    depth_m: float,
    velocity_ms: float,
    debris_factor: float = 0.5
) -> Dict[str, Any]:
    """
    UK DEFRA / Environment Agency Flood Hazard Rating (FD2320/TR2):
    HR = d * (v + 0.5) + DF
    """
    if depth_m <= 0.01:
        return {
            "hazard_rating_hr": 0.0,
            "hazard_class": "NONE",
            "hazard_description": "Dry / Safe ground"
        }
        
    hr = depth_m * (velocity_ms + 0.5) + debris_factor
    hr = round(hr, 2)
    
    if hr < 0.75:
        h_class = "LOW"
        desc = "Caution - Shallow or slow moving water. Safe for most adults."
    elif hr < 1.25:
        h_class = "MODERATE"
        desc = "Dangerous for some - Danger for children, elderly, and infirm."
    elif hr < 2.00:
        h_class = "HIGH"
        desc = "Dangerous for most - Danger for adults and light vehicles."
    else:
        h_class = "CRITICAL"
        desc = "Extreme Danger for all - High threat to life and building collapse."
        
    return {
        "hazard_rating_hr": hr,
        "hazard_class": h_class,
        "hazard_description": desc
    }

def calculate_composite_risk_score(
    depth_m: float,
    velocity_ms: float,
    arrival_time_min: float,
    population: int,
    vulnerable_pop: int,
    elevation_margin_m: float,
    debris_factor: float = 0.5
) -> Tuple[float, float, float, float, str, str]:
    """
    Computes transparent multi-criteria risk breakdown:
    Returns (hazard_score, vulnerability_score, exposure_score, total_risk_score, risk_level, evacuation_priority)
    """
    if depth_m <= 0.01:
        return (0.0, 10.0, 0.0, 5.0, "LOW", "P4 - Monitor")
        
    # 1. Hazard Score (0 - 100 based on DEFRA HR normalized to 3.0)
    hr_dict = calculate_defra_hazard_rating(depth_m, velocity_ms, debris_factor)
    hr = hr_dict["hazard_rating_hr"]
    hazard_score = min(100.0, (hr / 2.5) * 100.0)
    
    # 2. Vulnerability Score (0 - 100)
    vuln_ratio = min(1.0, vulnerable_pop / max(population, 1))
    pop_scale = min(1.0, population / 25000.0)
    vulnerability_score = (0.55 * vuln_ratio + 0.45 * pop_scale) * 100.0
    
    # 3. Exposure Score (0 - 100) - Higher urgency for faster arrival time and low elevation margin
    arrival_urgency = math.exp(-arrival_time_min / 45.0)  # fast arrival -> higher urgency
    elevation_urgency = math.exp(-max(elevation_margin_m, 0.0) / 15.0)
    exposure_score = (0.60 * arrival_urgency + 0.40 * elevation_urgency) * 100.0
    
    # 4. Composite Risk Index
    # Weights: Hazard (40%), Vulnerability (30%), Exposure (30%)
    total_risk = 0.40 * hazard_score + 0.30 * vulnerability_score + 0.30 * exposure_score
    total_risk = round(min(100.0, max(0.0, total_risk)), 1)
    
    # Classification
    if total_risk < 35.0:
        level = "LOW"
        priority = "P4 - Monitor"
    elif total_risk < 60.0:
        level = "MODERATE"
        priority = "P3 - Standby"
    elif total_risk < 80.0:
        level = "HIGH"
        priority = "P2 - Urgent"
    else:
        level = "CRITICAL"
        priority = "P1 - Immediate"
        
    return (
        round(hazard_score, 1),
        round(vulnerability_score, 1),
        round(exposure_score, 1),
        total_risk,
        level,
        priority
    )
