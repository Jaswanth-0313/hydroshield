"""
FastAPI Main Application Entry Point
SIH Dam Break Inundation Modeling & Emergency Decision Support Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import APP_TITLE, APP_VERSION, API_PREFIX
from app.api.dams import router as dams_router
from app.api.scenarios import router as scenarios_router
from app.api.simulations import router as simulations_router
from app.api.risk import router as risk_router
from app.api.evacuation import router as evacuation_router
from app.api.model_comparison import router as model_comp_router
from app.api.validation import router as validation_router
from app.api.ai_model import router as ai_router
from app.api.hydrodynamic import router as hydrodynamic_router

from app.gis.datasets import load_dam_by_id, load_scenario_presets
from app.hydrodynamics.demo_engine import DemoSimulationAdapter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Pre-run standard demo simulation for default dam (Idukki) so map is hot-loaded
    print("[STARTUP] Initializing SIH Hydrodynamic Simulation Engine...")
    default_dam = load_dam_by_id("dam-idukki")
    scenarios = load_scenario_presets()
    if default_dam and scenarios:
        med_scenario = scenarios[1] if len(scenarios) > 1 else scenarios[0]
        adapter = DemoSimulationAdapter()
        summary = adapter.run_simulation(
            dam_data=default_dam,
            scenario_params=med_scenario,
            duration_min=180,
            time_step_min=5
        )
        print(f"[READY] Pre-loaded baseline simulation: {summary.simulation_id} ({summary.scenario_name})")
    yield
    print("[SHUTDOWN] Shutting down Hydrodynamic Service.")

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="Comprehensive hydrodynamic modeling, GIS flood inundation, risk classification, and evacuation decision support platform for Dam Break disasters.",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api prefix
app.include_router(dams_router, prefix=API_PREFIX)
app.include_router(scenarios_router, prefix=API_PREFIX)
app.include_router(simulations_router, prefix=API_PREFIX)
app.include_router(risk_router, prefix=API_PREFIX)
app.include_router(evacuation_router, prefix=API_PREFIX)
app.include_router(model_comp_router, prefix=API_PREFIX)
app.include_router(validation_router, prefix=API_PREFIX)
app.include_router(ai_router, prefix=API_PREFIX)
app.include_router(hydrodynamic_router, prefix=API_PREFIX)

@app.get("/")
def root():
    return {
        "system": APP_TITLE,
        "version": APP_VERSION,
        "status": "OPERATIONAL",
        "docs_url": "/docs",
        "api_prefix": API_PREFIX
    }

@app.get("/api/health")
def health_check():
    return {"status": "HEALTHY", "engine": "Hydrodynamic 2D Solver", "ai_model": "Random Forest Loaded"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
