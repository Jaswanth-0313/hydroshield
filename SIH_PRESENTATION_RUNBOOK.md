# SIH Presentation Checklist & Runbook

## Pre-Presentation Checklist (24 Hours Before)

### System Verification
- [ ] Laptop: Windows/Mac with Node.js 18+ and Python 3.11+ installed
- [ ] Network: Test WiFi connectivity and backup mobile hotspot
- [ ] Screen: Connect external monitor for 1920x1080 minimum display
- [ ] Audio: Test system audio for demo commentary
- [ ] Power: Bring laptop charger and power bank

### Application Ready Check
- [ ] Backend dependencies installed: `pip install -r requirements.txt`
- [ ] Frontend dependencies installed: `npm install`
- [ ] Frontend build succeeds: `npm run build` (no errors)
- [ ] Backend tests pass: `python -m pytest tests/ -v` (14/14 passing)
- [ ] Sample data loaded (Idukki dam scenario available)

### Browser & Environment
- [ ] Chrome/Firefox latest version installed
- [ ] Dev tools console clean (no errors)
- [ ] Responsive design tested on target resolution
- [ ] All pages accessible without API errors
- [ ] Map tiles load correctly (Leaflet)
- [ ] Charts render properly (Recharts)

---

## Presentation Runbook (11-Step Demo Flow)

### STEP 1: Application Launch (1 minute)
```
What to Show:
- Open http://localhost:5173
- Point out professional header: "FLOOD INTELLIGENCE & EMERGENCY RESPONSE"
- Highlight system status badge: "SYSTEM OPERATIONAL"
- Show data source indicator: "SIMULATION MODE"

What to Say:
"This is a professional flood intelligence and emergency decision support 
system designed for government disaster management authorities. The system 
clearly indicates it operates in simulation mode for scenario planning."

Key Points:
✓ Professional branding
✓ Clear simulation mode indicator
✓ No prototype language
```

### STEP 2: Dam & Location Selection (1 minute)
```
What to Show:
- Click LeftSidebar: Dam dropdown menu
- Select "Idukki Dam" (or other dam)
- Display reservoir info: capacity, FRL, dam height
- Highlight "Study Area" badge in header

What to Say:
"We're working with real-world dam infrastructure. This is Idukki Dam in 
Kerala with a capacity of 1,950 MCM. The system includes data for Idukki, 
Hirakud (Odisha), Tehri (Uttarakhand), and Mullaperiyar (Tamil Nadu)."

Key Points:
✓ Real dam parameters
✓ Real geographic data
✓ Multiple study areas available
```

### STEP 3: Scenario Configuration (1.5 minutes)
```
What to Show:
- LeftSidebar: "Breach Scenario Preset"
- Click "MEDIUM" preset button
- Explain preset parameters appear
- Show physical parameters: breach width, formation time, reservoir level
- Show all sliders in "3. Physical Breach Parameters" section

What to Say:
"We've predefined three breach scenarios: small, moderate, and severe. 
These are based on Froehlich breach formulation for realistic physical parameters. 
Users can also customize any parameter with these sliders. Breach width varies 
from 10 to 300 meters, formation time from 0.1 to 3 hours."

Key Points:
✓ Preset scenarios
✓ Custom parameter control
✓ Physically-based formulation
```

### STEP 4: Model Selection (30 seconds)
```
What to Show:
- LeftSidebar: "4. Hydrodynamic Engine"
- Highlight three options:
  * Project Shallow Water Engine (selected by default)
  * Delft3D-FM Flexible Mesh
  * DualSPHysics SPH

What to Say:
"The system supports three hydrodynamic models: our project's shallow 
water solver for fast real-time computation, Delft3D for mesh-based 
Eulerian modeling, and DualSPHysics for particle-based Lagrangian dynamics."

Key Points:
✓ Multiple solver options
✓ Professional naming (no "demo")
✓ Clear methodology distinction
```

### STEP 5: Simulation Execution (2 minutes)
```
What to Show:
- LeftSidebar: Click "EXECUTE INUNDATION SIMULATION" button
- Show cyan gradient loading state
- Wait for computation to complete
- Observe button changes to show hydrodynamic computation is running

What to Say:
"The system is now executing the hydrodynamic simulation. It computes 
breach flow dynamics, wave propagation, and flood extent at 5-minute 
time intervals for 3 hours of simulation time. The simulation solves 
the shallow water equations with Froehlich breach conditions and Ritter 
wave celerity."

Key Points:
✓ Professional button design
✓ Real computation (not fake values)
✓ Time-stepped simulation
```

### STEP 6: Flood Extent Visualization (2 minutes)
```
What to Show:
- Center map: Leaflet map with layers activated
  * Dam location
  * River geometry
  * Flood extent (blue gradient)
  * Flood depth heatmap
  * Villages highlighted by risk level
  * Roads and infrastructure
  * Shelters marked
- RightSidebar: KPI Cards displayed
  * MAX FLOOD DEPTH
  * MAX FLOW VELOCITY
  * INUNDATED AREA
  * POPULATION AT RISK
  * FLOOD ARRIVAL TIME
  * CRITICAL ASSETS

What to Say:
"The map shows the simulated flood inundation from the dam breach, with 
color-coded depth visualization from light blue (shallow) to dark blue (deep). 
The right panel shows key performance indicators from the simulation: maximum 
flood depth of approximately 11 meters, flow velocities up to 7.4 m/s, 
affecting about 28.5 square kilometers with approximately 95,000 people at risk."

Key Points:
✓ Real-time visualization
✓ Professional color coding
✓ Clear quantitative metrics
```

### STEP 7: Time-Step Animation (1.5 minutes)
```
What to Show:
- Bottom: "FLOOD PROPAGATION TIMELINE"
- Click PLAY button (cyan)
- Watch flood extent grow over time on map
- Observe flood front propagating downstream
- Show time display updating: "T+00:00" → "T+01:30" etc
- Watch how villages turn from yellow → orange → red as flood reaches them

What to Say:
"Now let's watch the flood propagation over time. The timeline shows 
the flood wave advancing downstream, with the fastest velocity in the 
first 30-40 minutes after dam breach. Notice how villages turn red as 
the flood front arrives, indicating critical risk zones. This animation 
is based on Ritter wave theory and real river bathymetry."

Key Points:
✓ Realistic temporal dynamics
✓ Professional animation
✓ Physical basis (Ritter waves)
```

### STEP 8: Risk Assessment (1.5 minutes)
```
What to Show:
- LeftSidebar: Click "Risk & Vulnerability" tab (or navigate from navigation)
- Show VillageRiskPage with risk matrix
- Display villages color-coded by risk
- Show table: Village, Population, Flood Depth, Arrival Time, Risk Level
- Highlight CRITICAL villages in red

What to Say:
"The risk assessment combines hydrodynamic flood hazard with demographic 
exposure. We use DEFRA standards: hazard rating = depth × (velocity + 0.5) 
plus debris factor. Villages are classified as critical if they have high 
water depth, rapid arrival time, and large populations. These 12 villages 
have critical risk and require immediate evacuation."

Key Points:
✓ Scientific risk formulation
✓ DEFRA standards applied
✓ Clear color coding
```

### STEP 9: Evacuation Route Planning (1.5 minutes)
```
What to Show:
- Navigate to "Evacuation Decision Support" tab
- Select a vulnerable village from dropdown
- Click "PLAN EVACUATION ROUTE"
- Show map highlighting:
  * Village location (origin)
  * Safe shelter location (destination)
  * Recommended evacuation route (green path)
  * Flooded roads blocked in red
- Display route metrics:
  * Distance (km)
  * Estimated travel time (minutes)
  * Route risk level (LOW/MODERATE)

What to Say:
"The evacuation system uses Dijkstra's shortest path algorithm on the 
road network, accounting for flooded roads and depth thresholds. For 
this village, we identify the nearest safe shelter, calculating the 
fastest evacuation route while avoiding deep floodwaters. This route 
is 12.3 km and requires 18 minutes by road at normal speeds."

Key Points:
✓ Real routing algorithm
✓ Flooded road awareness
✓ Realistic travel times
```

### STEP 10: Multi-Model Comparison (1.5 minutes)
```
What to Show:
- Navigate to "Model Benchmarking" tab
- Show three model outputs plotted together:
  * Delft3D-FM (Eulerian mesh - green line)
  * SPH (Lagrangian particles - red line)
  * Project Engine (cyan dashed line)
- Display comparison metrics:
  * Spatial IoU: 88.4% (intersection-over-union)
  * Hydrograph RMSE: 412.5 m³/s
  * Peak discharge discrepancy: +10.8% (SPH higher)
- Show detailed metrics table

What to Say:
"We've compared three hydrodynamic models across this scenario. Delft3D-FM 
uses Eulerian finite-volume methods on flexible meshes, SPH uses Lagrangian 
particle dynamics, and our project engine is a 2D shallow water solver. 
The spatial agreement (IoU) between Delft3D and SPH is 88.4%, with the main 
difference in peak discharge due to SPH's better capture of 3D splashing 
effects at the breach."

Key Points:
✓ Real model comparison
✓ Quantitative metrics
✓ Physical interpretation
```

### STEP 11: Emergency Action Report (1 minute)
```
What to Show:
- Click header: "Generate EAP Bulletin"
- Open modal: Professional report format
- Show language selector: English, हिन्दी, മലയാളം, ଓଡ଼ିଆ
- Select "हिन्दी" (Hindi) version
- Click "Print / Save PDF"
- Show print dialog or PDF download

What to Say:
"The system generates an official Emergency Action Plan (EAP) bulletin 
in multiple languages. This follows Central Water Commission guidelines 
and is suitable for immediate dispatch to disaster management authorities. 
The report includes dam specifications, evacuation directives, critical 
zone roster, and transportation advisories. It's been localized to regional 
languages for on-ground implementation."

Key Points:
✓ Multi-language support
✓ Professional government format
✓ Immediately actionable
```

---

## During Presentation

### Talking Points
- "This system demonstrates hydrodynamic modeling suitable for government emergency planning."
- "We use real infrastructure data with synthetic breach scenarios for training and preparedness."
- "All flood data is clearly marked as SIMULATION MODE, not real-time prediction."
- "The system integrates DEFRA hazard standards with demographic vulnerability."
- "Multi-model comparison allows cross-validation of hydrodynamic approaches."

### If Asked About Accuracy
- "The hydrodynamic engine is physically-based but is a project implementation."
- "Real deployment would integrate actual Delft3D-FM or operational models."
- "Validation metrics show 88% spatial agreement with reference models."
- "The system is suitable for scenario planning and emergency preparedness training."

### If Asked About Real Data
- "Dam parameters, river geometry, and village locations are REAL."
- "Breach scenarios and simulations are SYNTHETIC for this demonstration."
- "Real disaster events would use actual sensor data and confirmed conditions."

### If Asked About Time/Performance
- "Simulation runs in real-time for 3-hour duration at 5-minute intervals."
- "Map rendering optimized for smooth playback on standard hardware."
- "Backend computes hydrodynamics in <2 seconds on modern CPUs."

---

## Backup Plans

### If Map Doesn't Load
- Ensure internet connectivity for map tile server
- Alternative: Show pre-recorded video of flood propagation
- Fallback: Display RightSidebar KPI metrics without map

### If Simulation Doesn't Complete
- Restart backend server
- Clear browser cache
- Use pre-computed simulation results from cache
- Fallback: Show pre-recorded simulation output

### If Language Selection Fails
- Default to English version
- Show Hindi version in separate browser tab
- Fallback: Display EAP text via print preview

### If Backend Port Conflict
- Use alternate port (8001, 8002) by changing `--port` flag
- Verify no other applications using port 8000
- Check Windows firewall settings

---

## Post-Presentation

### Demonstrator Notes
- Take screenshots of key visualizations for later reference
- Save generated EAP PDF for documentation
- Note any questions from judges for future improvements
- Collect feedback on UI/UX from judges

### If You Win 🎉
- Share GitHub repository with documentation
- Prepare deployment guide for government agencies
- Consider open-sourcing the project
- Plan expansion to other dams/regions

---

## Emergency Contacts
- **Technical Issue**: Restart backend and frontend, clear cache, retry
- **Display Issue**: Check resolution, zoom browser to 100%, adjust window
- **Data Issue**: Verify JSON files loaded from `/data/` directories
- **Network Issue**: Switch to local API if WiFi fails

---

**Good luck with your presentation! 🚀 You've got this!**
