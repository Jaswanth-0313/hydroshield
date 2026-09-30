# HYDROSHIELD — Local Development & Deployment Guide

## Project Overview

**HYDROSHIELD** — Hydrodynamic Emergency System is a comprehensive dam-break flood modeling and emergency decision support platform built with:

- **Frontend**: React 19 + Vite + Tailwind CSS + Recharts + Leaflet
- **Backend**: Python FastAPI + Hydrodynamic Simulation Engines (Delft3D, SPH, Demo)
- **Database**: GeoJSON data files (demo mode)

## Local Development Setup

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.10+ (for backend)
- Git

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env.local for configuration (optional)
cp .env.example .env.local

# Run migrations (if applicable)

# Start development server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local for development
cp .env.example .env.local

# Update .env.local if needed (default uses http://localhost:8000/api)
# VITE_API_BASE_URL=http://localhost:8000/api

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Verify Installation

1. **Backend Health Check**:
   ```bash
   curl http://localhost:8000/api/health
   ```
   Expected response: `{"status": "HEALTHY", ...}`

2. **Frontend Load**:
   Visit `http://localhost:5173` in your browser
   - Landing page should display "HYDROSHIELD" branding
   - "START NEW ANALYSIS" button should be clickable
   - No console errors should appear

3. **API Integration**:
   - Select a dam from the dropdown
   - Dashboard should load and display map
   - No "API KEY REQUIRED" errors should appear

## Docker Deployment (Optional)

### Backend Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
```

## Production Deployment

### Render.com Deployment

This project includes a `render.yaml` configuration for deployment on Render.com:

```bash
git push
```

The system will automatically:
1. Deploy backend FastAPI service
2. Deploy frontend static site
3. Configure environment variables
4. Set up health checks

### Environment Variables

**Backend (.env)**:
```
FASTAPI_ENV=production
CORS_ORIGINS=https://yourdomain.com
PORT=8000
```

**Frontend (.env.production)**:
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
```

### Production Checklist

- [ ] API base URL configured correctly
- [ ] CORS origins restricted to frontend domain
- [ ] No secrets in source code
- [ ] Health checks passing
- [ ] Frontend builds without errors
- [ ] All API endpoints tested
- [ ] Maps load without API key errors
- [ ] Database connections working (if applicable)
- [ ] Error logging configured
- [ ] Performance monitoring enabled

## Troubleshooting

### Backend Won't Start (Module Not Found)

**Problem**: `ModuleNotFoundError: No module named 'app'`

**Solution**:
1. Ensure you're in the backend directory: `cd backend`
2. Verify virtual environment is activated
3. Ensure all `__init__.py` files exist in subdirectories
4. Try running from the SIH root: 
   ```bash
   cd sih
   python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   ```

### Frontend Build Fails

**Problem**: Bundle size warnings

**Solution**: Not critical for development. For production:
1. Enable code splitting in vite.config.js
2. Lazy load pages/components
3. Consider removing unused dependencies

### API Connection Error

**Problem**: Frontend shows API connection errors

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/api/health`
2. Check `.env.local` VITE_API_BASE_URL setting
3. Verify CORS is not blocking requests
4. Check browser console for specific error messages

### Map Not Loading

**Problem**: Map shows "API KEY REQUIRED" or blank

**Solution**:
1. Map uses public tile providers (OpenStreetMap, CartoDB)
2. No API key required
3. Check browser console for tile loading errors
4. Verify internet connection for tile CDN access

## Key File Structure

```
sih/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── api/                    # Route handlers
│   │   ├── hydrodynamics/          # Simulation engines
│   │   ├── gis/                    # Geographic data
│   │   ├── risk/                   # Risk assessment
│   │   └── ...
│   ├── tests/                      # API tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main app component
│   │   ├── components/             # React components
│   │   ├── pages/                  # Dashboard pages
│   │   ├── maps/                   # Map components
│   │   ├── services/api.js         # API client
│   │   ├── workflow/               # Workflow steps
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── docs/
├── render.yaml                     # Render.com deployment config
└── README.md
```

## API Endpoints

### Core Endpoints

- `GET /api/health` — System health check
- `GET /api/dams` — List available dams
- `GET /api/dams/{id}` — Dam detail
- `GET /api/scenarios` — List breach scenarios
- `POST /api/simulations/run` — Run simulation
- `GET /api/simulations/{id}` — Get simulation results

### Risk & Evacuation

- `GET /api/risk/villages` — Village risk assessment
- `GET /api/risk/infrastructure` — Infrastructure risk
- `GET /api/evacuation/route` — Calculate evacuation route
- `GET /api/risk/shelters` — Available shelters

### Model Comparison

- `GET /api/model-comparison` — Compare hydrodynamic models
- `GET /api/hydrodynamic/models` — Available models
- `GET /api/hydrodynamic/delft3d/config` — Delft3D status

### AI & Validation

- `GET /api/ai/predict` — AI risk prediction
- `GET /api/validation` — Model validation results

## Support & Documentation

For more information:
- See `docs/` directory for technical documentation
- Check `docs/MODEL_STATUS.md` for hydrodynamic model status
- Review `docs/SCIENTIFIC_VALIDATION.md` for validation details

## License

[Your License Here]

## Contact

[Your Contact Information]
