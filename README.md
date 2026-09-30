# HYDROSHIELD — Hydrodynamic Emergency System
### *Dam Break Inundation Modeling & Emergency Decision Support*
### *Smart India Hackathon (SIH) Prototype*

An end-to-end, scientifically grounded, and interactive disaster-management decision support platform for **Dam Break Inundation Modeling**, dynamic downstream flood shockwave propagation, **DEFRA-standard risk classification**, vulnerable population exposure analysis, **graph-based evacuation route optimization**, and **hydrodynamic solver comparison (SPH vs. Delft3D-FM)**.

---

## 📌 1. Problem Statement
Dam break occurrences represent catastrophic low-probability, high-consequence disasters. A failure can release tens of thousands of cubic meters per second within minutes, causing massive downstream destruction before conventional emergency response mechanisms can react. Current decision support tools frequently suffer from:
1. **Disconnection from Hydrodynamics**: Static flood maps fail to capture time-varying wave arrival times and flow velocities.
2. **Opaque Risk Scoring**: Vulnerability metrics lack transparent mathematical formulations.
3. **Static Evacuation Routes**: Emergency routes fail to dynamically account for road submergence (>0.3m cutoff depth).
4. **Lack of Comparative Verification**: Inability to cross-evaluate Eulerian grid models (e.g. Delft3D) against Lagrangian particle solvers (e.g. SPH).

---

## 🚀 2. Proposed Solution
This platform integrates:
- **Hydrodynamic Modeling Adapters**: Replaceable interface supporting **Delft3D Flexible Mesh**, **Smoothed Particle Hydrodynamics (SPH)**, and a **Physically-Based 2D Shallow Water Demo Engine**.
- **Interactive GIS Map Dashboard**: Powered by Leaflet with time-step flood front propagation, depth/velocity point grids, road networks, villages, critical infrastructure, and safe shelters.
- **Dynamic Hydrodynamic Time Slider**: Scrub or play simulation progression from $T=0\text{ min}$ to $T=180\text{ min}$ with synchronized outflow hydrographs.
- **DEFRA Multi-Criteria Risk Classification**: Real-time evaluation of hazard rating, demographic vulnerability, and arrival urgency.
- **Dynamic Evacuation Routing**: Graph pathfinding via NetworkX that penalizes and avoids flooded road links.
- **AI / ML Risk Explainer**: Random Forest model classifying multi-variate risk with feature attribution.
- **Ground Truth Satellite Validation**: Calibrated against Copernicus Sentinel-1 SAR flood footprints and CWC high-water marks.

---

## 🏗️ 3. System Architecture

```
                                  +-----------------------------------------------------+
                                  |              React + Vite Frontend (UI)             |
                                  |  - Leaflet Map with GeoJSON/Raster Layers           |
                                  |  - Hydro Time-Slider & Dynamic Front Propagation    |
                                  |  - Telemetry Dashboard & Hydrographs (Recharts)     |
                                  |  - Evacuation Router & SPH vs Delft3D Comparison    |
                                  |  - AI Risk Explainer & Accuracy Validation Views    |
                                  +--------------------------+--------------------------+
                                                             | REST (JSON / GeoJSON)
                                  +--------------------------v--------------------------+
                                  |             FastAPI Backend Application             |
                                  |                                                     |
  +-------------------------------+-----------------------+-----------------------------+-------------------------------+
  |                               |                       |                             |                               |
+-v---------------+      +--------v---------+     +-------v----------+        +---------v--------+             +--------v--------+
| Hydrodynamics   |      | GIS & Spatial    |     | Risk Engine      |        | Evacuation Plan  |             | AI Risk Engine  |
| Adapters:       |      | Processing:      |     | - DEFRA Hazard HR|        | - NetworkX Graph |             | - ML Classifier |
| - Delft3D       |      | - GeoPandas      |     | - Vulnerability  |        | - Dynamic Depth  |             | - SHAP / Weights|
| - SPH           |      | - Shapely        |     | - Exposure Score |        |   Penalties      |             | - Train/Predict |
| - DemoEngine 2D |      | - Inundation Cut |     | - Multi-Criteria |        | - Safe Shelters  |             | - Retraining API|
+-----------------+      +------------------+     +------------------+        +------------------+             +-----------------+
```

---

## 🔬 4. Hydrodynamic Concepts & Scientific Formulations

### A. Dam Breach Mechanics (Froehlich, 2008)
Peak breach outflow ($Q_p$) is calculated from reservoir volume ($V_w$) and headwater depth ($h_w$):
$$Q_p = 0.607 \cdot (V_w)^{0.295} \cdot (h_w)^{1.24}$$
Average breach width ($B_{avg}$) and formation time ($t_f$):
$$B_{avg} = 0.27 \cdot K_o \cdot (V_w)^{0.32} \cdot (h_w)^{0.04}$$
$$t_f = 0.00254 \cdot (V_w)^{0.53} \cdot (h_w)^{-0.90}$$

### B. Ritter Dam-Break Wave Front Celerity (1892)
Wave front celerity $c_0$ and dry-bed propagation velocity $v_{front}$:
$$c_0 = \sqrt{g \cdot h_0}, \quad v_{front} = 2 \cdot c_0 \cdot \eta_{friction}$$

### C. DEFRA Flood Hazard Index ($HR$)
UK Environment Agency / DEFRA criteria (FD2320/TR2):
$$HR = d \times (v + 0.5) + DF$$
where $d$ is depth (m), $v$ is velocity (m/s), and $DF$ is Debris Factor (0.5 for moderate debris).
- $HR < 0.75$: **LOW** (Caution)
- $0.75 \le HR < 1.25$: **MODERATE** (Danger for children/elderly)
- $1.25 \le HR < 2.00$: **HIGH** (Danger for most adults & light vehicles)
- $HR \ge 2.00$: **CRITICAL** (Extreme Danger: Structural failure & threat to life)

### D. SPH vs. Delft3D Hydrodynamic Differences
- **Delft3D-FM (Eulerian 2D Shallow Water)**: Solves depth-averaged Navier-Stokes on flexible unstructured grids. Highly efficient for lateral valley spreading and bed friction dissipation over 40+ km reaches.
- **SPH DualSPHysics (Lagrangian Particles)**: Solves Navier-Stokes equations by tracking discrete fluid particles. Captures violent near-dam splash waves, air entrainment, and 3D hydrodynamic forces on bridge piers.

---

## 💻 5. Installation & Execution Guide

### Prerequisites
- **Python**: 3.10 to 3.14
- **Node.js**: v18+ and **npm** v9+

### Backend Setup (FastAPI)
```bash
# 1. Navigate to repository root
cd /path/to/sih

# 2. Activate Python virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install requirements
pip install -r backend/requirements.txt

# 4. Start the backend API server (runs on port 8000)
uvicorn backend.app.main:app --port 8000 --reload
```
*API Swagger Documentation will be live at: `http://localhost:8000/docs`*

### Frontend Setup (React + Vite)
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install npm dependencies
npm install

# 3. Launch Vite development server
npm run dev
```
*Frontend Application will be live at: `http://localhost:5173`*

---

## 🧪 6. Running Automated Tests
```bash
# Run backend pytest suite
pytest backend/tests -p no:cacheprovider

# Run end-to-end verification script
python backend/tests/verify_e2e.py
```

---

## 🎯 7. SIH Demonstration Flow

1. **Dam Selection**: Select **Idukki Dam & Cheruthoni Reservoir** (or Hirakud / Tehri) from the left sidebar.
2. **Breach Scenario Configuration**: Select **Medium Breach** or switch to **Custom Parameter Mode** to tune breach width and formation time.
3. **Run Simulation**: Click **RUN HYDRO SIMULATION** to execute hydrodynamic propagation.
4. **Flood Front Propagation**: Scrub or click **Play** on the bottom time slider ($0 \to 180\text{ min}$) to observe dynamic flood wave progression.
5. **Inspect Village & Infrastructure Risk**: Click on any village or critical hospital/bridge icon to inspect live water depth, flow velocity, arrival time, and DEFRA risk score.
6. **Trigger Safe Evacuation Plan**: Click **Route** or open the **Evacuation Router** tab to generate the optimal escape path to high-ground shelters avoiding submerged roads.
7. **SPH vs. Delft3D Comparative Analysis**: Open the **SPH vs Delft3D** tab to evaluate spatial IoU, peak discharge differences, and overlaid hydrograph curves.
8. **AI / ML Risk Engine**: Open the **AI Risk Engine** tab to test point risk classification and inspect Random Forest feature importances.
9. **Satellite SAR Validation**: Open the **Satellite Validation** tab to view calibration metrics against Sentinel-1 SAR ground-truth envelopes.

---

## 🔌 8. How to Replace Demo Simulation with Real Delft3D / SPH NetCDF Output
The hydrodynamic module is built on an abstract adapter interface (`backend/app/hydrodynamics/base.py`).
To plug in real model runs:
1. Place Delft3D-FM NetCDF output files (`*_map.nc` / `*_his.nc`) in `backend/data/simulations/delft3d/`.
2. Place SPH particle VTK/CSV dumps in `backend/data/simulations/sph/`.
3. The `Delft3DAdapter` and `SPHAdapter` will automatically read and serve the real mesh nodes and particle velocity fields without requiring frontend changes.

---

## ⚠️ 9. Scientific Integrity & Limitations
- **Synthetic/Demo Mode Labeling**: The UI prominently badges all simulations as either `DEMO / SYNTHETIC HYDRODYNAMICS` or `REAL MODEL OUTPUT (DELFT3D / SPH)`.
- **Decision Support Disclaimer**: Evacuation suggestions are decision-support recommendations and must always be coordinated with National Disaster Management Authority (NDMA) and State Disaster Management Authority (SDMA) incident commands.
