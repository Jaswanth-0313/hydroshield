"""
Application Configuration and Constants for SIH Dam Break Hydrodynamic System
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
SIMULATIONS_DIR = BASE_DIR / "simulations"
MODELS_DIR = BASE_DIR / "models"

# Ensure runtime directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
SIMULATIONS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

APP_TITLE = "Dam Break Hydrodynamic Inundation & Emergency Decision Support"
APP_VERSION = "1.0.0"
API_PREFIX = "/api"
APP_ENV = os.getenv("APP_ENV", "development")
HOST = os.getenv("FASTAPI_HOST", "0.0.0.0")
PORT = int(os.getenv("PORT") or os.getenv("FASTAPI_PORT") or "8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def _parse_csv(value: str | None):
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


DEFAULT_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ORIGINS = _parse_csv(os.getenv("CORS_ORIGINS")) or DEFAULT_ALLOWED_ORIGINS

# Default Physical / Hydrodynamic Constants
GRAVITY = 9.81  # m/s^2
WATER_DENSITY = 1000.0  # kg/m^3
DEFAULT_MANNING_N = 0.035  # Natural river bed roughness
DEFAULT_DEBRIS_FACTOR = 0.5  # DEFRA debris factor for moderate hazard

# Simulation Grid & Propagation Config
DEFAULT_SIMULATION_DURATION_MIN = 180  # 3 hours
TIME_STEP_MIN = 5  # 5-minute spatial snapshots
