import React from 'react';
import { 
  Activity, 
  Waves, 
  MapPin, 
  Users, 
  Building2, 
  Clock, 
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Gauge,
  Zap,
  Navigation
} from 'lucide-react';

export default function RightSidebar({
  currentSimulation,
  villagesRisk = [],
  infrastructureRisk = [],
  roadsStatus,
  onSelectVillage,
  onNavigateToTab
}) {
  const sim = currentSimulation || {};
  const peakDischarge = sim.peak_breach_discharge_cumecs || 14200.0;
  const inundatedArea = sim.total_inundated_area_sqkm || 28.5;
  const maxDepth = sim.max_flood_depth_m || 11.2;
  const maxVelocity = sim.max_flow_velocity_ms || 7.4;
  const earliestArrival = sim.earliest_village_arrival_min || 3.2;

  // Population & Infrastructure Exposure Stats
  const safeVillages = Array.isArray(villagesRisk) ? villagesRisk : [];
  const criticalVillages = safeVillages.filter(v => v.risk_level === 'CRITICAL');
  const highVillages = safeVillages.filter(v => v.risk_level === 'HIGH');
  const totalPopAtRisk = safeVillages
    .filter(v => v.risk_level === 'CRITICAL' || v.risk_level === 'HIGH')
    .reduce((sum, v) => sum + (v.population || 0), 0);

  const safeInfras = Array.isArray(infrastructureRisk) ? infrastructureRisk : [];
  const affectedInfras = safeInfras.filter(i => i.is_inundated);
  const cutoffRoads = roadsStatus?.cutoff_roads_count || 0;

  const getPriorityBadge = (priority) => {
    const p = String(priority || '');
    if (p.includes('P1') || p.includes('CRITICAL')) return 'bg-rose-950 text-rose-300 border-rose-800';
    if (p.includes('P2') || p.includes('HIGH')) return 'bg-orange-950 text-orange-300 border-orange-800';
    if (p.includes('P3') || p.includes('MODERATE')) return 'bg-amber-950 text-amber-300 border-amber-800';
    return 'bg-emerald-950 text-emerald-300 border-emerald-800';
  };

  return (
    <aside className="w-84 bg-slate-950 border-l border-slate-800/90 flex flex-col h-full overflow-y-auto text-slate-200 text-xs select-none">
      
      {/* 1. Primary Command KPIs (6 Essential Metrics) */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Activity className="w-3.5 h-3.5" />
            Hydrodynamic Telemetry HUD
          </span>
          <span className="text-emerald-400 text-[10px] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE
          </span>
        </div>

        {/* 6-Card KPI Grid */}
        <div className="grid grid-cols-2 gap-2">
          
          {/* 1. MAX FLOOD DEPTH */}
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>MAX FLOOD DEPTH</span>
              <Gauge className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">
              {maxDepth} <span className="text-xs font-normal text-slate-400">m</span>
            </div>
          </div>

          {/* 2. MAX FLOW VELOCITY */}
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>MAX VELOCITY</span>
              <Zap className="w-3 h-3 text-orange-400" />
            </div>
            <div className="text-lg font-bold text-orange-300 font-mono mt-0.5">
              {maxVelocity} <span className="text-xs font-normal text-slate-400">m/s</span>
            </div>
          </div>

          {/* 3. INUNDATED AREA */}
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>INUNDATED AREA</span>
              <MapPin className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
              {inundatedArea} <span className="text-xs font-normal text-slate-400">km²</span>
            </div>
          </div>

          {/* 4. POPULATION AT RISK */}
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>POPULATION AT RISK</span>
              <Users className="w-3 h-3 text-rose-400" />
            </div>
            <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
              {totalPopAtRisk.toLocaleString()}
            </div>
          </div>

          {/* 5. FLOOD ARRIVAL TIME */}
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>FLOOD ARRIVAL</span>
              <Clock className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">
              {earliestArrival} <span className="text-xs font-normal text-slate-400">min</span>
            </div>
          </div>

          {/* 6. CRITICAL ASSETS IMPACTED */}
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>CRITICAL ASSETS</span>
              <Building2 className="w-3 h-3 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-purple-300 font-mono mt-0.5">
              {affectedInfras.length} <span className="text-xs font-normal text-slate-400">nodes</span>
            </div>
          </div>

        </div>

        {/* Peak Discharge Banner */}
        <div className="p-2 bg-slate-900/90 border border-slate-800 rounded flex items-center justify-between font-mono text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Waves className="w-3 h-3 text-cyan-400" />
            Peak Outflow (Q_p):
          </span>
          <span className="font-bold text-cyan-300">{Number(peakDischarge).toLocaleString()} m³/s</span>
        </div>

      </div>

      {/* 2. Critical Lifelines & Transportation Impact */}
      <div className="p-3.5 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Navigation className="w-3.5 h-3.5" />
            Lifelines & Transportation
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono">
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">Submerged Roads</div>
            <div className="text-base font-bold text-rose-400 mt-0.5">
              {cutoffRoads} <span className="text-xs font-normal text-slate-400">Cut-off</span>
            </div>
          </div>
          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded">
            <div className="text-[10px] text-slate-400">Active Shelters</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">
              3 <span className="text-xs font-normal text-slate-400">Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Downstream Settlement Risk Priority Ranking */}
      <div className="p-3.5 flex-1 space-y-2">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            Community Vulnerability Ranking
          </span>
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('villages')}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer font-mono"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {safeVillages.slice(0, 5).map((v) => (
            <div
              key={v.id}
              onClick={() => onSelectVillage && onSelectVillage(v)}
              className="p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded transition cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="font-semibold text-slate-200 truncate text-xs">{v.name}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                  <span>Pop: {(v.population || 0).toLocaleString()}</span>
                  <span>•</span>
                  <span>{v.distance_from_dam_km}km</span>
                  <span>•</span>
                  <span className="text-cyan-300 font-bold">T+{v.flood_arrival_time_min}m</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 text-[10px] font-bold border rounded shrink-0 font-mono ${getPriorityBadge(v.evacuation_priority || v.risk_level)}`}>
                {v.risk_level}
              </span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
