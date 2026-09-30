import React, { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Users,
  Clock,
  AlertTriangle,
  Waves,
  Building2,
  TrendingUp,
  Shield,
  Route,
  Download,
} from 'lucide-react';
import InundationMap from '../maps/InundationMap';

export default function EnhancedEvacuationDashboard({
  villagesRisk = [],
  shelters = [],
  roadsStatus = {},
  simulation = null,
  timeStepData = null,
  maxExtent = null,
  riverGeojson = null,
  infrastructureRisk = [],
  activeDam = null,
  currentTimeMin = 0,
  onTimeChange = () => {},
  onSelectVillage = () => {},
}) {
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [evacuationMode, setEvacuationMode] = useState('priority'); // 'priority' | 'routes' | 'timeline'

  const safeVillages = Array.isArray(villagesRisk) ? villagesRisk : [];
  const safeShelters = Array.isArray(shelters) ? shelters : [];

  // Sort villages by priority (CRITICAL first)
  const priorityVillages = [...safeVillages].sort((a, b) => {
    const riskOrder = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 };
    const aRisk = riskOrder[a.risk_level] || 4;
    const bRisk = riskOrder[b.risk_level] || 4;
    return aRisk - bRisk;
  });

  const criticalVillages = safeVillages.filter(v => v.risk_level === 'CRITICAL');
  const highRiskVillages = safeVillages.filter(v => v.risk_level === 'HIGH');
  const totalPopulationToEvacuate = safeVillages.reduce((sum, v) => sum + (v.population || 0), 0);
  const totalShelterCapacity = safeShelters.reduce((sum, s) => sum + (s.capacity || 0), 0);

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'HIGH': return 'bg-orange-950 text-orange-300 border-orange-800';
      case 'MODERATE': return 'bg-amber-950 text-amber-300 border-amber-800';
      default: return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  const getShelterDistance = (village, shelter) => {
    if (!village || !shelter) return null;
    // Simplified distance calculation
    const lat1 = village.location?.lat || 0;
    const lon1 = village.location?.lng || 0;
    const lat2 = shelter.location?.lat || 0;
    const lon2 = shelter.location?.lng || 0;
    
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getRecommendedShelters = (village) => {
    return safeShelters
      .map(shelter => ({
        ...shelter,
        distance: getShelterDistance(village, shelter),
      }))
      .sort((a, b) => (a.distance || 999) - (b.distance || 999))
      .slice(0, 3);
  };

  const focusVillage = selectedCommunity || priorityVillages[0];
  const recommendedShelters = focusVillage ? getRecommendedShelters(focusVillage) : [];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Navigation className="w-6 h-6 text-cyan-400" />
              Evacuation Decision Support
            </h2>
            <p className="text-sm text-slate-400 mt-1">{activeDam?.name || 'Study Area'} — Community Evacuation Planning</p>
          </div>
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export Plan
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'priority', label: 'Priority Evacuation' },
            { id: 'routes', label: 'Routes & Shelters' },
            { id: 'timeline', label: 'Evacuation Timeline' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setEvacuationMode(tab.id)}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                evacuationMode === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-6 p-6">
        
        {/* Left Sidebar - Community List / Timeline */}
        <div className="w-96 space-y-4 overflow-y-auto">
          
          {/* Statistics */}
          <div className="space-y-2 bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Critical Communities</div>
                <div className="text-2xl font-bold text-rose-400 mt-1">{criticalVillages.length}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">High Risk</div>
                <div className="text-2xl font-bold text-orange-400 mt-1">{highRiskVillages.length}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total to Evacuate</div>
                <div className="text-2xl font-bold text-cyan-400 mt-1">{(totalPopulationToEvacuate / 1000).toFixed(0)}k</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Shelter Capacity</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{(totalShelterCapacity / 1000).toFixed(0)}k</div>
              </div>
            </div>
          </div>

          {/* Community Priority List */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Evacuation Priority</h3>
            <div className="space-y-2 overflow-y-auto flex-1">
              {priorityVillages.map(village => (
                <button
                  key={village.id}
                  onClick={() => setSelectedCommunity(village)}
                  className={`w-full p-3 rounded-lg border text-left transition ${
                    selectedCommunity?.id === village.id
                      ? 'bg-cyan-600/20 border-cyan-500'
                      : `${getRiskColor(village.risk_level)} hover:border-cyan-500`
                  }`}
                >
                  <div className="font-semibold text-sm">{village.name}</div>
                  <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {village.population?.toLocaleString()} people
                  </div>
                  <div className="text-xs opacity-75 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    Arrival: {village.flood_arrival_time_min?.toFixed(0) || '—'} min
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Map */}
        <div className="flex-1 rounded-lg border border-slate-800 overflow-hidden bg-black relative">
          <InundationMap
            activeDam={activeDam}
            timeStepData={timeStepData}
            maxExtent={maxExtent}
            riverGeojson={riverGeojson}
            villagesRisk={villagesRisk}
            infrastructureRisk={infrastructureRisk}
            roadsGeojson={roadsStatus}
            shelters={shelters}
            onSelectVillage={setSelectedCommunity}
          />
        </div>

        {/* Right Sidebar - Shelter Recommendations */}
        {focusVillage && (
          <div className="w-96 space-y-4 overflow-y-auto">
            
            {/* Community Detail */}
            <div className={`rounded-lg border p-4 ${getRiskColor(focusVillage.risk_level)}`}>
              <h3 className="font-bold text-lg">{focusVillage.name}</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Population:</span>
                  <span className="font-semibold">{focusVillage.population?.toLocaleString() || 'N/A'} people</span>
                </div>
                <div className="flex justify-between">
                  <span>Vulnerable:</span>
                  <span className="font-semibold">{focusVillage.vulnerable_population_count?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flood Arrival:</span>
                  <span className="font-semibold">{focusVillage.flood_arrival_time_min?.toFixed(0) || 'N/A'} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Depth:</span>
                  <span className="font-semibold">{focusVillage.max_flood_depth_m?.toFixed(1) || 'N/A'} m</span>
                </div>
                <div className="flex justify-between">
                  <span>Flow Velocity:</span>
                  <span className="font-semibold">{focusVillage.max_flow_velocity_ms?.toFixed(1) || 'N/A'} m/s</span>
                </div>
              </div>
            </div>

            {/* Recommended Shelters */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Recommended Shelters
              </h3>
              <div className="space-y-2">
                {recommendedShelters.map((shelter, idx) => (
                  <button
                    key={shelter.id}
                    onClick={() => setSelectedShelter(shelter)}
                    className={`w-full p-3 rounded-lg border text-left transition text-sm ${
                      selectedShelter?.id === shelter.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-slate-200'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-600'
                    }`}
                  >
                    <div className="font-semibold">
                      #{idx + 1} — {shelter.name}
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      Distance: {shelter.distance?.toFixed(1) || 'N/A'} km
                    </div>
                    <div className="text-xs opacity-75">
                      Capacity: {shelter.capacity?.toLocaleString() || 'N/A'} people
                    </div>
                    <div className="text-xs opacity-75 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Travel time: ~{Math.round(((shelter.distance || 0) / 25) * 60)} min (at 25 km/h)
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Critical Actions */}
            <div className="bg-amber-950/40 border border-amber-800 rounded-lg p-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Action Items
              </h3>
              <ul className="space-y-2 text-xs text-amber-100">
                <li>✓ Issue evacuation order immediately</li>
                <li>✓ Contact {recommendedShelters.length > 0 ? recommendedShelters[0].name : 'nearest shelter'} for capacity</li>
                <li>✓ Activate emergency transport (buses, vehicles)</li>
                <li>✓ Set up check-in point at primary shelter</li>
                <li>✓ Deploy medical teams to recommended shelters</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
