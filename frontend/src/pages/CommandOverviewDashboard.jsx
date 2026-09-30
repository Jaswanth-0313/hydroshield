import React from 'react';
import {
  AlertTriangle,
  TrendingDown,
  Waves,
  Users,
  Building2,
  MapPin,
  Clock,
  Activity,
  Zap,
} from 'lucide-react';
import InundationMap from '../maps/InundationMap';

export default function CommandOverviewDashboard({
  activeDam,
  currentSimulation,
  maxExtent,
  villagesRisk,
  infrastructureRisk,
  roadsStatus,
  shelters,
  timeStepData,
  riverGeojson,
  currentTimeMin,
  onTimeChange,
  crossSections,
  onSelectVillage,
}) {
  // Calculate KPIs
  const maxDepth = maxExtent?.max_depth_m || 0;
  const maxVelocity = maxExtent?.max_velocity_ms || 0;
  const inundatedArea = maxExtent?.total_inundated_area_sqkm || 0;
  
  const criticalVillages = villagesRisk.filter(v => v.risk_level === 'CRITICAL') || [];
  const highRiskVillages = villagesRisk.filter(v => v.risk_level === 'HIGH') || [];
  const totalPopulationExposed = villagesRisk.reduce((sum, v) => sum + (v.population || 0), 0);
  
  const criticalInfra = infrastructureRisk.filter(i => i.risk_level === 'CRITICAL') || [];
  const affectedRoads = roadsStatus?.affected_segments || 0;

  // Top 5 high-risk communities
  const topCommunities = villagesRisk
    .filter(v => ['CRITICAL', 'HIGH'].includes(v.risk_level))
    .sort((a, b) => {
      const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (riskOrder[a.risk_level] || 4) - (riskOrder[b.risk_level] || 4);
    })
    .slice(0, 5);

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-950 text-rose-300 border-rose-700';
      case 'HIGH': return 'bg-orange-950 text-orange-300 border-orange-700';
      case 'MEDIUM': return 'bg-amber-950 text-amber-300 border-amber-700';
      default: return 'bg-emerald-950 text-emerald-300 border-emerald-700';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      
      {/* Main Layout: Map + Sidebars */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        
        {/* Left Panel - Analysis Summary */}
        <div className="w-80 space-y-4 overflow-y-auto">
          
          {/* Current Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Current Analysis</h3>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-xs text-slate-500">Dam</div>
                <div className="font-semibold text-slate-200">{activeDam?.name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">River</div>
                <div className="font-semibold text-slate-200">{activeDam?.river || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Scenario</div>
                <div className="font-semibold text-slate-200 capitalize">{currentSimulation?.scenario_name || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Simulation</div>
                <div className="font-semibold text-emerald-400">COMPLETE</div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Max Depth</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{maxDepth.toFixed(1)} m</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Max Velocity</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{maxVelocity.toFixed(1)} m/s</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Inundated Area</div>
              <div className="text-xl font-bold text-cyan-400 mt-1">{inundatedArea.toFixed(1)} km²</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Population Exposed</div>
              <div className="text-xl font-bold text-rose-400 mt-1">{(totalPopulationExposed / 1000).toFixed(1)}k</div>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Risk Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Critical Communities</span>
                <span className="font-bold text-rose-400">{criticalVillages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">High Risk Communities</span>
                <span className="font-bold text-orange-400">{highRiskVillages.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Critical Infrastructure</span>
                <span className="font-bold text-amber-400">{criticalInfra.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Affected Road Segments</span>
                <span className="font-bold text-slate-300">{affectedRoads}</span>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-amber-950/40 border border-amber-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Recommended Action
            </h3>
            <div className="text-sm text-amber-100 space-y-2">
              {criticalVillages.length > 0 && (
                <p>⚠️ <span className="font-semibold">{criticalVillages.length} CRITICAL communities</span> require immediate evacuation within minutes.</p>
              )}
              {highRiskVillages.length > 0 && (
                <p>⚠️ <span className="font-semibold">{highRiskVillages.length} HIGH-risk communities</span> need coordinated response within 30 minutes.</p>
              )}
              {criticalInfra.length > 0 && (
                <p>⚠️ <span className="font-semibold">{criticalInfra.length} critical facilities</span> at risk; activate emergency protocols.</p>
              )}
              {affectedRoads > 0 && (
                <p>⚠️ <span className="font-semibold">{affectedRoads} road segments</span> will be disrupted; plan alternate evacuation routes.</p>
              )}
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
            onSelectVillage={onSelectVillage}
          />

          {/* Floating Time Display */}
          <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg px-4 py-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Time</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
              {Math.floor(currentTimeMin / 60).toString().padStart(2, '0')}:{(currentTimeMin % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Right Panel - Top Communities */}
        <div className="w-80 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col overflow-hidden">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Top High-Risk Communities</h3>
          <div className="flex-1 overflow-y-auto space-y-2">
            {topCommunities.map((community, idx) => (
              <div
                key={community.id}
                className={`p-3 rounded-lg border cursor-pointer transition hover:border-cyan-600 ${getRiskColor(
                  community.risk_level
                )}`}
                onClick={() => onSelectVillage(community)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="text-xs font-bold">{idx + 1}. {community.name}</div>
                    <div className="text-xs opacity-75 mt-0.5">{community.population?.toLocaleString()} people</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-black/30 flex-shrink-0">
                    P{['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].indexOf(community.risk_level) + 1}
                  </span>
                </div>
                <div className="text-xs grid grid-cols-2 gap-1 opacity-75">
                  <div>
                    <Clock className="w-3 h-3 inline mr-1" />
                    {community.flood_arrival_time_min?.toFixed(1) || '—'} min
                  </div>
                  <div>
                    <Waves className="w-3 h-3 inline mr-1" />
                    {community.max_flood_depth_m?.toFixed(1) || '—'} m
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
