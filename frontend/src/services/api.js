/**
 * API Service Client for Dam Break Inundation Modeling System (HYDROSHIELD)
 * Supports both local development (/api) and production deployment (VITE_API_BASE_URL)
 */
import axios from 'axios';

// Use VITE_API_BASE_URL for production, fall back to relative /api for local development
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const DEMO_DAMS = [
  {
    id: 'dam-idukki',
    name: 'Idukki Dam & Cheruthoni Reservoir',
    river: 'Periyar River',
    state: 'Kerala',
    district: 'Idukki',
    location: { lat: 9.8497, lng: 76.9722 },
    current_water_level_m: 728.5,
    reservoir_info: {
      capacity_mcm: 1996,
      full_reservoir_level_m: 732.4,
      crest_level_m: 735,
      catchment_area_sqkm: 649.3,
      dam_height_m: 168.9,
      dam_length_m: 365.8,
      dam_type: 'Double Curvature Arch & Concrete Gravity (Cheruthoni)'
    },
    study_area_bounds: [[9.75, 76.85], [9.98, 77.1]],
    description: 'High-hazard concrete arch dam on the Periyar River serving a dense downstream valley.'
  },
  {
    id: 'dam-hirakud',
    name: 'Hirakud Dam',
    river: 'Mahanadi River',
    state: 'Odisha',
    district: 'Sambalpur',
    location: { lat: 21.57, lng: 83.87 },
    current_water_level_m: 190.2,
    reservoir_info: {
      capacity_mcm: 5896,
      full_reservoir_level_m: 192,
      crest_level_m: 195,
      catchment_area_sqkm: 83400,
      dam_height_m: 60.96,
      dam_length_m: 4800,
      dam_type: 'Composite Earth and Masonry Dam'
    },
    study_area_bounds: [[21.4, 83.75], [21.65, 84.15]],
    description: 'Long earthen dam on the Mahanadi River with extensive downstream floodplain exposure.'
  },
  {
    id: 'dam-tehri',
    name: 'Tehri Dam',
    river: 'Bhagirathi River',
    state: 'Uttarakhand',
    district: 'Tehri Garhwal',
    location: { lat: 30.378, lng: 78.48 },
    current_water_level_m: 825,
    reservoir_info: {
      capacity_mcm: 3540,
      full_reservoir_level_m: 830,
      crest_level_m: 839.5,
      catchment_area_sqkm: 7511,
      dam_height_m: 260.5,
      dam_length_m: 575,
      dam_type: 'Earth and Rock-fill Dam'
    },
    study_area_bounds: [[30.1, 78.2], [30.45, 78.6]],
    description: 'High-altitude Himalayan dam with steep gorge hydraulics and seismic risk considerations.'
  },
  {
    id: 'dam-mullaperiyar',
    name: 'Mullaperiyar Dam',
    river: 'Periyar River',
    state: 'Kerala',
    district: 'Idukki',
    location: { lat: 9.528, lng: 77.1436 },
    current_water_level_m: 41.5,
    reservoir_info: {
      capacity_mcm: 443,
      full_reservoir_level_m: 43.3,
      crest_level_m: 53.6,
      catchment_area_sqkm: 624,
      dam_height_m: 53.6,
      dam_length_m: 366,
      dam_type: 'Limestone-Surkhi Masonry Gravity Dam'
    },
    study_area_bounds: [[9.45, 76.95], [9.7, 77.25]],
    description: 'Historic masonry dam with a high-consequence downstream cascade into the Idukki valley.'
  }
];

const DEMO_SCENARIOS = [
  { id: 'scenario-small', name: 'Small breach', type: 'small', description: 'Localized breach, moderate downstream impact' },
  { id: 'scenario-medium', name: 'Medium breach', type: 'medium', description: 'Representative emergency planning breach case' },
  { id: 'scenario-large', name: 'Large breach', type: 'large', description: 'Extreme breach, high-risk emergency scenario' }
];

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error handling middleware
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 503 || error.code === 'ECONNREFUSED') {
      console.warn('Backend service unavailable. Using HYDROSHIELD demo data mode.');
    }
    return Promise.reject(error);
  }
);

export const fetchDams = async () => {
  try {
    const res = await api.get('/dams');
    return res.data;
  } catch (error) {
    console.warn('Live dam API unavailable, using demo dataset.', error.message);
    return DEMO_DAMS;
  }
};

export const fetchDamDetail = async (damId) => {
  try {
    const res = await api.get(`/dams/${damId}`);
    return res.data;
  } catch (error) {
    console.warn(`Live dam detail API unavailable for ${damId}, using demo dataset.`, error.message);
    return DEMO_DAMS.find((dam) => dam.id === damId) || DEMO_DAMS[0];
  }
};

export const fetchScenarios = async () => {
  try {
    const res = await api.get('/scenarios');
    return res.data;
  } catch (error) {
    console.warn('Live scenario API unavailable, using demo scenario presets.', error.message);
    return DEMO_SCENARIOS;
  }
};

export const runSimulation = async (params) => {
  const res = await api.post('/simulations/run', params);
  return res.data;
};

export const fetchSimulationSummary = async (simId) => {
  const res = await api.get(`/simulations/${simId}`);
  return res.data;
};

export const fetchSimulationTimestep = async (simId, timeMin) => {
  const res = await api.get(`/simulations/${simId}/timestep/${timeMin}`);
  return res.data;
};

export const fetchMaxExtent = async (simId) => {
  const res = await api.get(`/simulations/${simId}/max-extent`);
  return res.data;
};

export const fetchCrossSections = async (simId) => {
  const res = await api.get(`/simulations/${simId}/cross-sections`);
  return res.data;
};

export const fetchVillagesRisk = async (damId, simId) => {
  const res = await api.get('/risk/villages', {
    params: { dam_id: damId, simulation_id: simId },
  });
  return res.data;
};

export const fetchInfrastructureRisk = async (damId, simId) => {
  const res = await api.get('/risk/infrastructure', {
    params: { dam_id: damId, simulation_id: simId },
  });
  return res.data;
};

export const fetchRoadsStatus = async (damId, simId) => {
  const res = await api.get('/risk/roads', {
    params: { dam_id: damId, simulation_id: simId },
  });
  return res.data;
};

export const fetchShelters = async (damId) => {
  const res = await api.get('/risk/shelters', {
    params: { dam_id: damId },
  });
  return res.data;
};

export const fetchRiskMethodology = async () => {
  const res = await api.get('/risk/methodology');
  return res.data;
};

export const calculateEvacuationRoute = async (payload, simId) => {
  const res = await api.post('/evacuation/route', payload, {
    params: { simulation_id: simId },
  });
  return res.data;
};

export const fetchModelComparison = async (damId, scenarioId) => {
  const res = await api.get('/model-comparison', {
    params: { dam_id: damId, scenario_id: scenarioId },
  });
  return res.data;
};

export const fetchValidation = async (damId) => {
  const res = await api.get('/validation', {
    params: { dam_id: damId },
  });
  return res.data;
};

export const predictAIRisk = async (features) => {
  const res = await api.post('/ai/predict', features);
  return res.data;
};

export const fetchAIFeatures = async () => {
  const res = await api.get('/ai/feature-importance');
  return res.data;
};

export const triggerAITrain = async () => {
  const res = await api.post('/ai/train');
  return res.data;
};

export const uploadModelOutput = async (formData) => {
  const res = await api.post('/simulations/upload-model-output', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export default api;
