import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader, ChevronDown, Gauge, Waves, Mountain, Building2, Home, Navigation, AlertTriangle } from 'lucide-react';
import { fetchDamDetail } from '../services/api';
import { useWorkflow } from '../WorkflowContext';

export default function Step2DataPreparation({ damId, onDataReady }) {
  const [damDetail, setDamDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const { completeStep } = useWorkflow();

  useEffect(() => {
    const loadData = async () => {
      if (!damId) return;
      try {
        const detail = await fetchDamDetail(damId);
        setDamDetail(detail);
        // Simulate data loading delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.error('Failed to load dam detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [damId]);

  const dataItems = [
    { 
      key: 'location', 
      label: 'Dam Location', 
      icon: AlertTriangle,
      status: 'AVAILABLE',
      details: damDetail ? [
        { label: 'Dam Name', value: damDetail.name },
        { label: 'Location', value: `${damDetail.location?.lat.toFixed(4)}°, ${damDetail.location?.lng.toFixed(4)}°` },
        { label: 'District', value: damDetail.district },
        { label: 'State', value: damDetail.state },
        { label: 'Elevation', value: damDetail.location?.elevation_m ? `${damDetail.location.elevation_m} m MSL` : 'N/A' }
      ] : []
    },
    { 
      key: 'river', 
      label: 'River Geometry', 
      icon: Waves,
      status: 'AVAILABLE',
      details: damDetail ? [
        { label: 'River Name', value: damDetail.river },
        { label: 'River Slope', value: damDetail.river_slope ? `${damDetail.river_slope}` : 'N/A' },
        { label: 'Manning Coefficient', value: damDetail.manning_n ? damDetail.manning_n.toFixed(3) : 'N/A' },
        { label: 'Downstream Reach', value: `${damDetail.downstream_reach_length_km || 'N/A'} km` },
        { label: 'Average Width', value: damDetail.river_width_m ? `${damDetail.river_width_m} m` : 'N/A' }
      ] : []
    },
    { 
      key: 'terrain', 
      label: 'Terrain / DEM', 
      icon: Mountain,
      status: 'AVAILABLE',
      details: damDetail ? [
        { label: 'Study Area Bounds', value: damDetail.study_area_bounds ? `${damDetail.study_area_bounds.length} corner points` : 'N/A' },
        { label: 'Average Elevation', value: '320 m MSL' },
        { label: 'Elevation Range', value: damDetail.location?.elevation_m ? `0 – ${damDetail.location.elevation_m} m` : 'N/A' },
        { label: 'DEM Resolution', value: '30 m' },
        { label: 'Terrain Model', value: 'SRTM v3' }
      ] : []
    },
    { 
      key: 'reservoir', 
      label: 'Reservoir Information', 
      icon: Gauge,
      status: 'AVAILABLE',
      details: damDetail && damDetail.reservoir_info ? [
        { label: 'Reservoir Capacity', value: `${damDetail.reservoir_info.capacity_mcm} MCM` },
        { label: 'Full Reservoir Level', value: `${damDetail.reservoir_info.full_reservoir_level_m} m MSL` },
        { label: 'Dam Crest Level', value: `${damDetail.reservoir_info.crest_level_m} m MSL` },
        { label: 'Dam Height', value: `${damDetail.reservoir_info.dam_height_m} m` },
        { label: 'Dam Length', value: `${damDetail.reservoir_info.dam_length_m} m` },
        { label: 'Dam Type', value: damDetail.reservoir_info.dam_type },
        { label: 'Catchment Area', value: `${damDetail.reservoir_info.catchment_area_sqkm} km²` },
        { label: 'Current Water Level', value: `${damDetail.current_water_level_m} m MSL` }
      ] : []
    },
    { 
      key: 'settlements', 
      label: 'Downstream Settlements', 
      icon: Home,
      status: 'AVAILABLE',
      details: [
        { label: 'Communities at Risk', value: '15–25 villages' },
        { label: 'Total Population', value: '~180,000–250,000 people' },
        { label: 'Vulnerable Population', value: '~45,000–65,000 (children, elderly, disabled)' },
        { label: 'Distance from Dam', value: '5–50 km downstream' },
        { label: 'Settlement Density', value: 'Medium to High' }
      ]
    },
    { 
      key: 'roads', 
      label: 'Road Network', 
      icon: Navigation,
      status: 'AVAILABLE',
      details: [
        { label: 'Primary Routes', value: '3–5 major highways' },
        { label: 'Affected Segments', value: '8–15 km of national/state highways' },
        { label: 'Alternate Routes', value: '2–3 identified (10–30 km detour)' },
        { label: 'Critical Junctions', value: '2–3 chokepoints' },
        { label: 'Road Network Type', value: 'Mixed (paved and unpaved)' }
      ]
    },
    { 
      key: 'infrastructure', 
      label: 'Critical Infrastructure', 
      icon: Building2,
      status: 'AVAILABLE',
      details: [
        { label: 'Hospitals/Clinics', value: '2–4 major facilities' },
        { label: 'Schools', value: '8–12 schools' },
        { label: 'Bridges', value: '3–5 affected structures' },
        { label: 'Power Substations', value: '1–2 facilities' },
        { label: 'Telecom Centers', value: '2–3 facilities' }
      ]
    }
  ];

  const handleContinue = () => {
    completeStep();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <h1 className="text-3xl font-bold text-white mb-2">
          DATA PREPARATION
        </h1>
        <p className="text-slate-400">
          Loading study-area information...
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Loading Status */}
          {isLoading && (
            <div className="mb-8 p-6 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-4">
              <Loader className="w-6 h-6 text-cyan-400 animate-spin shrink-0" />
              <div>
                <p className="text-white font-semibold">Initializing data layer...</p>
                <p className="text-sm text-slate-400 mt-1">This may take a moment</p>
              </div>
            </div>
          )}

          {/* Data Checklist */}
          <div className="space-y-2 mb-8">
            <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
              Data Status
            </div>
            {dataItems.map((item) => {
              const Icon = item.icon || CheckCircle2;
              const isExpanded = expandedSection === item.key;
              return (
                <div key={item.key}>
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : item.key)}
                    className="w-full p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between hover:border-cyan-600 active:border-cyan-500 transition"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-cyan-400 shrink-0" />
                      <span className="text-slate-200 font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded">
                        {item.status}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-2 p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg border-t-0 -mt-1 pt-0 space-y-2 animate-in fade-in">
                      {item.details.map((detail, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <span className="text-slate-400">{detail.label}</span>
                          <span className="text-slate-200 font-medium text-right ml-4">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Section */}
          {damDetail && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg mb-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                Data Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Study Area</div>
                  <div className="text-sm font-semibold text-slate-200 mt-1">{damDetail.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">River</div>
                  <div className="text-sm font-semibold text-slate-200 mt-1">{damDetail.river}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Reservoir Capacity</div>
                  <div className="text-sm font-semibold text-slate-200 mt-1">
                    {damDetail.reservoir_info?.capacity_mcm} MCM
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Downstream Reach</div>
                  <div className="text-sm font-semibold text-slate-200 mt-1">
                    {damDetail.downstream_reach_length_km} km
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-lg flex items-start gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              All data has been verified and is ready for simulation. Some data sources may be synthetic or estimated for demonstration purposes.
            </div>
          </div>

        </div>
      </div>

      {/* Action Bar */}
      <div className="p-6 border-t border-slate-800 bg-slate-950">
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full max-w-sm mx-auto block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
        >
          CONTINUE TO BREACH SCENARIO
        </button>
      </div>
    </div>
  );
}
