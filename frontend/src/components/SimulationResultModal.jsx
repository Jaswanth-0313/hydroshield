import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Waves, 
  AlertTriangle, 
  Users, 
  Building2, 
  Navigation, 
  Activity,
  Clock
} from 'lucide-react';

export default function SimulationResultModal({ isOpen, onClose, simulation, villagesRisk = [] }) {
  if (!isOpen || !simulation) return null;

  const critCount = villagesRisk.filter(v => v.risk_level === 'CRITICAL').length;
  const highCount = villagesRisk.filter(v => v.risk_level === 'HIGH').length;
  const totalPop = villagesRisk.reduce((s, v) => s + (v.population || 0), 0);
  const popAtRisk = villagesRisk.filter(v => ['CRITICAL','HIGH'].includes(v.risk_level))
                                .reduce((s, v) => s + (v.population || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl text-slate-200 overflow-hidden">
        
        {/* Header Band */}
        <div className="bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-600/30 rounded-lg border border-cyan-600/40">
              <Waves className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Simulation Complete</h2>
              <p className="text-[11px] text-slate-400 font-mono">{simulation.simulation_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-amber-950/80 border border-amber-700/80 text-amber-300 rounded text-[10px] font-bold uppercase">
              SIMULATION OUTPUT
            </span>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Hydraulic KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Peak Discharge (Q&#x209A;)</div>
              <div className="text-xl font-black font-mono text-rose-400">
                {(simulation.peak_breach_discharge_cumecs / 1000).toFixed(1)}k
              </div>
              <div className="text-[10px] text-slate-400">m³/s</div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Inundated Area</div>
              <div className="text-xl font-black font-mono text-cyan-400">
                {simulation.total_inundated_area_sqkm}
              </div>
              <div className="text-[10px] text-slate-400">km²</div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Max Depth (d<sub>max</sub>)</div>
              <div className="text-xl font-black font-mono text-amber-400">
                {simulation.max_depth_m}
              </div>
              <div className="text-[10px] text-slate-400">m</div>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Wave Reach</div>
              <div className="text-xl font-black font-mono text-blue-400">
                {simulation.wave_front_reach_km}
              </div>
              <div className="text-[10px] text-slate-400">km</div>
            </div>
          </div>

          {/* Risk Summary Strip */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Population at Risk:</span>
              <span className="font-bold text-white font-mono">{popAtRisk.toLocaleString()} / {totalPop.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span className="text-slate-400">Critical Zones:</span>
              <span className="font-bold text-rose-300 font-mono">{critCount} villages</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span className="text-slate-400">High Risk:</span>
              <span className="font-bold text-orange-300 font-mono">{highCount} villages</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Earliest Arrival:</span>
              <span className="font-bold text-emerald-300 font-mono">{simulation.earliest_arrival_time_min} min</span>
            </div>
          </div>

          {/* Top 3 Priority Villages */}
          {villagesRisk.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">
                Top Priority Evacuation Communities:
              </div>
              <div className="space-y-1.5">
                {villagesRisk.slice(0, 3).map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        v.risk_level === 'CRITICAL' 
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-orange-950 text-orange-300 border-orange-800'
                      }`}>
                        {v.evacuation_priority}
                      </span>
                      <span className="font-semibold text-slate-100 text-[11px]">{v.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono">
                      <span className="text-slate-400">{v.population.toLocaleString()} pop</span>
                      <span className="text-cyan-300 font-bold">T+{v.flood_arrival_time_min}min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Activity className="w-4 h-4" />
              View Live Map & Time Slider
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
