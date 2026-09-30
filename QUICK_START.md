# HYDROSHIELD — Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide gets you running HYDROSHIELD locally for development, testing, or demonstration.

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org/)
- **Python 3.10+** — [Download](https://www.python.org/)
- **Git** — [Download](https://git-scm.com/)

## Option 1: Quick Start (Recommended for Windows)

### 1. Open Two Terminal Windows

**Terminal 1 - Backend**:
```powershell
cd path\to\sih\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m pytest tests/test_api.py -q
```

If tests pass, backend is ready. ✅

**Terminal 2 - Frontend**:
```powershell
cd path\to\sih\frontend
npm install
npm run dev
```

### 2. Open in Browser

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## Option 2: Using Python Direct Module (If Uvicorn has issues)

**Terminal 1 - Backend** (Alternative):
```powershell
cd path\to\sih\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app/main.py
```

Then proceed with Frontend in Terminal 2 as above.

---

## Option 3: Using Docker (Recommended for Clean Environment)

### Prerequisites
- Docker Desktop installed

### Run Both Services:

```bash
# Build images
docker-compose build

# Start services
docker-compose up
```

**Access**:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## Verify Installation

### Backend Health Check
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "HEALTHY",
  "engine": "Hydrodynamic 2D Solver",
  "ai_model": "Random Forest Loaded"
}
```

### Frontend Check
1. Visit `http://localhost:5173`
2. See "HYDROSHIELD" branding in the landing page
3. Click "START NEW ANALYSIS"
4. Select a dam (e.g., "Idukki")
5. Map should load showing study area

---

## Common Issues & Solutions

### "ModuleNotFoundError: No module named 'app'"

**Solution**: Ensure you're in the backend directory and virtual environment is activated:
```powershell
cd path\to\sih\backend
venv\Scripts\activate
python -m pytest tests/test_api.py -q  # Test if it works
```

### "npm ERR! Cannot find module"

**Solution**: Clean and reinstall:
```powershell
cd path\to\sih\frontend
rm -r node_modules package-lock.json  # Or delete manually
npm install
npm run dev
```

### "Connection refused" error in frontend

**Solution**: Backend not running. Start it first:
```powershell
cd path\to\sih\backend
python -m pytest tests/test_api.py -q  # Verify it works
# Then start backend
```

### Map shows blank or errors

**Solution**: Map uses public tile providers (no API key needed). Check browser console for specific errors.

---

## Key Features to Try

### 1. **Study Area Selection**
- Click "START NEW ANALYSIS"
- Select different dams: Idukki, Hirakud, Mullaperiyar, Tehri
- Each has different study area boundaries

### 2. **Workflow Steps**
- Follow workflow from Study Area → Breach Scenario → Flood Simulation
- Each step shows data preparation progress
- Simulation results update in real-time

### 3. **Dashboard Views**
- **Command Overview**: KPIs, map, critical communities
- **Risk & Vulnerability**: Risk assessment by community
- **Evacuation**: Community priority, shelter assignment, routes
- **Model Benchmarking**: Compare Delft3D, SPH, Demo solvers
- **AI Risk Intelligence**: Machine learning risk predictions
- **SAR Validation**: Satellite data comparison

### 4. **Methodology**
- Click "Methodology" button in header
- View flood hazard formulas (DEFRA)
- See risk assessment thresholds
- Understand breach discharge equations

### 5. **EAP Bulletin**
- Click "Generate EAP Bulletin"
- View emergency action plan for selected study area
- Download as PDF (feature ready)

---

## Environment Configuration

### For Local Development
No configuration needed — defaults to `http://localhost:8000/api`

### For Production Deployment
Create `.env` files:

**Frontend** (`frontend/.env.production`):
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
```

**Backend** (`backend/.env`):
```
FASTAPI_ENV=production
CORS_ORIGINS=https://yourdomain.com
PORT=8000
```

---

## File Structure Reference

```
sih/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── main.py       # Start here
│   │   ├── api/          # REST endpoints
│   │   ├── hydrodynamics/# Simulation engines
│   │   └── ...
│   ├── tests/test_api.py # Run tests here
│   └── requirements.txt
│
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx       # Main app
│   │   ├── pages/        # Dashboard pages
│   │   └── ...
│   ├── index.html
│   └── package.json
│
├── docs/                 # Documentation
├── DEPLOYMENT_GUIDE.md   # Full deployment guide
└── README.md
```

---

## Git Workflow

```bash
# Clone repository
git clone https://github.com/yourusername/hydroshield.git
cd hydroshield

# Create feature branch
git checkout -b feature/your-feature

# Make changes
# ... edit files ...

# Commit and push
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

---

## Performance Tips

### Frontend
- Build: `npm run build` (optimized production bundle)
- Preview: `npm run preview` (test production build locally)
- Dev with fast refresh: `npm run dev` (already enabled)

### Backend
- Production: Disable reload: `uvicorn app.main:app --host 0.0.0.0` (no `--reload`)
- Development: Use reload: `uvicorn app.main:app --reload` (default)

---

## Next Steps

1. ✅ Get HYDROSHIELD running locally
2. 📊 Explore the dashboards and features
3. 🔧 Modify code as needed
4. 🧪 Run tests: `pytest tests/`
5. 🚀 Deploy to production (see DEPLOYMENT_GUIDE.md)

---

## Useful Commands

```bash
# Backend Tests
cd backend
python -m pytest tests/test_api.py -v      # Verbose output
python -m pytest tests/test_api.py -q      # Quiet output
python -m pytest tests/test_api.py -k test_dams  # Specific test

# Frontend Build & Preview
cd frontend
npm run dev                                 # Development server
npm run build                               # Production build
npm run preview                             # Preview production build
npm run lint                                # Code linting

# Backend API Documentation
# Visit: http://localhost:8000/docs (when backend running)
# Alternative: http://localhost:8000/redoc
```

---

## Support

- 📖 See `DEPLOYMENT_GUIDE.md` for detailed setup
- 🐛 Check browser console for frontend errors
- 📋 Run `pytest` to verify backend
- 💬 Check backend logs for API errors

---

**Happy developing! 🚀**

For full documentation, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) and [STABILIZATION_COMPLETION_REPORT.md](./STABILIZATION_COMPLETION_REPORT.md)
