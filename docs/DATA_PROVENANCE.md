# Data Provenance & Source Documentation Report
**Project:** Dam Break Inundation Modeling Using Hydrodynamic Modeling of a River  
**Target Platform:** Smart India Hackathon (SIH)  
**Audit Date:** August 31, 2026  

---

## 1. Indian Dam Baseline Data Provenance

| Dam Name | Location / State | Coordinates | Reservoir Capacity | Dam Height & Type | Data Source | Classification |
|:---|:---|:---|:---|:---|:---|:---:|
| **Idukki Dam & Cheruthoni Reservoir** | Periyar River, Idukki District, Kerala | $9.8497^\circ\text{ N}, 76.9722^\circ\text{ E}$ | $1996.0\text{ MCM}$ ($732.4\text{m FRL}$) | $168.9\text{m}$, Double Curvature Concrete Arch | Kerala State Electricity Board (KSEB) / Central Water Commission (CWC) National Register of Large Dams (NRLD) | **REAL / VERIFIED** |
| **Hirakud Dam** | Mahanadi River, Sambalpur, Odisha | $21.5700^\circ\text{ N}, 83.8700^\circ\text{ E}$ | $5896.0\text{ MCM}$ ($192.0\text{m FRL}$) | $60.96\text{m}$, Composite Earth and Masonry ($4800\text{m}$ length) | Odisha Water Resources Dept / CWC NRLD | **REAL / VERIFIED** |
| **Tehri Dam** | Bhagirathi River, Tehri Garhwal, Uttarakhand | $30.3780^\circ\text{ N}, 78.4800^\circ\text{ E}$ | $3540.0\text{ MCM}$ ($830.0\text{m FRL}$) | $260.5\text{m}$, Earth and Rock-Fill | THDC India Limited / CWC NRLD | **REAL / VERIFIED** |
| **Mullaperiyar Dam** | Periyar River, Idukki District, Kerala | $9.5280^\circ\text{ N}, 77.1436^\circ\text{ E}$ | $443.0\text{ MCM}$ ($43.3\text{m FRL}$) | $53.6\text{m}$, Limestone-Surkhi Masonry Gravity | Tamil Nadu Water Resources Dept / Supreme Court Empowered Committee Reports | **REAL / VERIFIED** |

---

## 2. Downstream Geospatial Data Provenance

### 2.1 River Centerlines (`backend/data/rivers/*.geojson`)
- **Periyar River (Idukki Reach):** Traced from OpenStreetMap (OSM) hydrology lines downstream from Cheruthoni dam to Neriamangalam ($45\text{ km}$). Coordinates: **REAL / GEODETIC**.
- **Mahanadi River (Hirakud Reach):** Traced from OSM hydrology downstream from Hirakud through Sambalpur/Burla ($50\text{ km}$). Coordinates: **REAL / GEODETIC**.
- **Bhagirathi-Ganga (Tehri Reach):** Traced along Bhagirathi gorge toward Devprayag/Rishikesh ($60\text{ km}$). Coordinates: **REAL / GEODETIC**.
- **Upper Periyar (Mullaperiyar Reach):** Traced from Mullaperiyar dam to Idukki reservoir tailwaters ($35\text{ km}$). Coordinates: **REAL / GEODETIC**.

### 2.2 Communities & Villages (`backend/data/villages/*.json`)
- **Idukki Reach (10 Villages):** Cheruthoni Town, Karimban, Thadiyampadu, Chelachuvadu, Neriamangalam, Vazhathope, Keerithodu, Maniyarankudi, Painavu, Periyar Valley.
  - Names & Coordinates: **REAL / VERIFIED (Census of India / OSM)**.
  - Populations ($1200 - 8500$): **REAL / ESTIMATED (Census 2011 adjusted)**.
  - Vulnerability Ratios ($20\% - 35\%$ elderly/children): **ESTIMATED (State demographic averages)**.
- **Hirakud Reach (10 Villages):** Burla, Sambalpur City, Hirakud Town, Chiplima, Dhankauda, etc. Names/Locations: **REAL**.
- **Tehri Reach (6 Villages):** New Tehri, Koteshwar, Malidewal, Chamba Foothills, Devprayag, Kirtinagar. Names/Locations: **REAL**.
- **Mullaperiyar Reach (4 Villages):** Vallakadavu, Vandiperiyar, Thekkady Junction, Manjumala. Names/Locations: **REAL**.

### 2.3 Road Networks (`backend/data/roads/*.geojson`)
- Extracted and generalized from OpenStreetMap (OSM) highway geometries (NH 85, SH 40, local valley connector roads).
- Road segment distance and topology: **REAL / DERIVED FROM OSM GRAPH**.
- Road elevation margins: **ESTIMATED (SRTM 30m derived)**.

### 2.4 High-Elevation Shelters (`backend/data/shelters/*.json`)
- Designated government schools, college auditoriums, and community halls located above flood lines.
- Shelter locations & elevation: **REAL / PLAUSIBLE (Surveyed from topographic ridges)**.
- Capacities ($800 - 3500$ persons): **ESTIMATED DESIGN CAPACITIES**.

### 2.5 Critical Infrastructure (`backend/data/infrastructure/*.json`)
- Hospitals (District Hospital Painavu, Taluk Hospital), Bridges (Cheruthoni Bridge, Neriamangalam Arch Bridge), Power Stations (Lower Periyar HEP).
- Locations and categories: **REAL / VERIFIED (OSM / State Directory)**.

---

## 3. Validation Ground Truth Benchmark (`backend/data/reference/`)

| Dataset Name | Sensor / Agency | Event Date | Observed Extent | Classification |
|:---|:---|:---|:---|:---:|
| `dam-idukki-validation.json` | Copernicus Sentinel-1 C-SAR IW GRD / CWC Gauge Telemetry | August 16, 2018 (Great Kerala Floods) | $28.6\text{ km}^2$ flooded reach with 5 surveyed bridge high-water marks | **CALIBRATED HISTORICAL BENCHMARK** |

---

## 4. Summary Classification Table

| Data Layer | Primary Source | Geodetic Reference System | Classification Status |
|:---|:---|:---|:---:|
| Dam Physical Specs | CWC NRLD / State Dam Safety Organizations | WGS84 (EPSG:4326) | **REAL / VERIFIED** |
| River Channel Vectors | OpenStreetMap / HydroSHEDS | WGS84 (EPSG:4326) | **REAL / VERIFIED** |
| Settlement Locations | Census of India / OpenStreetMap | WGS84 (EPSG:4326) | **REAL / VERIFIED** |
| Road Geometries | OpenStreetMap Highway Graph | WGS84 (EPSG:4326) | **REAL / VERIFIED** |
| Shelter Points | Field-referenced Public Infrastructure | WGS84 (EPSG:4326) | **REAL / PLAUSIBLE** |
| Dynamic Flood Polygons | 2D Shallow Water Demo Propagation Engine | WGS84 (EPSG:4326) | **DEMO / SYNTHETIC** |
| SAR Calibration Data | Sentinel-1 SAR Historic Envelope & CWC Marks | WGS84 (EPSG:4326) | **CALIBRATED BENCHMARK** |
| AI Training Dataset | Physical Parameter Stochastic Generator | Normalized Space | **SYNTHETIC SURROGATE** |
