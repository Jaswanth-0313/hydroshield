import React, { useState } from 'react';
import { AlertTriangle, Users, Building2, Waves, ChevronDown } from 'lucide-react';
import { useWorkflow } from '../WorkflowContext';

export default function Step6ImpactAndRisk({
  villagesRisk,
  infrastructureRisk,
  roadsStatus,
  simulation,
  onSelectVillage
}) {
  const [expandedVillage, setExpandedVillage] = useState(null);
  const { completeStep } = useWorkflow();

  const criticalVillages = villagesRisk.filter(v => v.risk_level === 'CRITICAL');
  const highVillages = villagesRisk.filter(v => v.risk_level === 'HIGH');
  const totalPopAtRisk = villagesRisk
    .filter(v => ['CRITICAL', 'HIGH'].includes(v.risk_level))
    .reduce((sum, v) => sum + (v.population || 0), 0);

  const affectedInfra = infrastructureRisk.filter(i => i.is_inundated);
  const cutoffRoads = roadsStatus?.cutoff_roads_count || 0;

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'rose';
      case 'HIGH': return 'orange';
      case 'MODERATE': return 'amber';
      default: return 'emerald';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <h1 className="text-3xl font-bold text-white mb-2">
          FLOOD IMPACT & RISK ASSESSMENT
        </h1>
        <p className="text-slate-400">
          Analyze consequences and affected communities
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Summary Cards */}
        <div className="p-8 border-b border-slate-800 bg-slate-950">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'COMMUNITIES AT RISK', value: criticalVillages.length + highVillages.length, color: 'rose' },
              { icon: AlertTriangle, label: 'POPULATION EXPOSED', value: totalPopAtRisk.toLocaleString(), color: 'orange' },
              { icon: Building2, label: 'CRITICAL INFRASTRUCTURE', value: affectedInfra.length, color: 'purple' },
              { icon: Waves, label: 'ROADS AFFECTED', value: cutoffRoads, color: 'cyan' }
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{stat.label}</span>
                </div>
                <div className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* Critical Communities */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Critical Risk Communities ({criticalVillages.length})
              </h2>
              <div className="space-y-2">
                {criticalVillages.map((village) => (
                  <div
                    key={village.id}
                    className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-lg cursor-pointer hover:border-rose-700 transition"
                    onClick={() => setExpandedVillage(expandedVillage === village.id ? null : village.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-rose-400 flex items-center gap-2">
                          {village.name}
                          <ChevronDown className={`w-4 h-4 transition ${expandedVillage === village.id ? 'rotate-180' : ''}`} />
                        </h4>
                        <div className="text-sm text-rose-300 mt-1">
                          {village.population.toLocaleString()} residents • Arrival: {village.flood_arrival_time_min} min
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded">CRITICAL</span>
                    </div>

                    {expandedVillage === village.id && (
                      <div className="mt-4 pt-4 border-t border-rose-800/60 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-rose-300">Peak Depth</div>
                          <div className="font-bold text-white">{village.peak_flood_depth_m} m</div>
                        </div>
                        <div>
                          <div className="text-rose-300">Peak Velocity</div>
                          <div className="font-bold text-white">{village.peak_flow_velocity_ms} m/s</div>
                        </div>
                        <div>
                          <div className="text-rose-300">Hazard Rating</div>
                          <div className="font-bold text-white">{village.hazard_rating.toFixed(2)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* High Risk Communities */}
            {highVillages.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  High Risk Communities ({highVillages.length})
                </h2>
                <div className="space-y-2">
                  {highVillages.slice(0, 3).map((village) => (
                    <div key={village.id} className="p-4 bg-orange-950/30 border border-orange-800/60 rounded-lg">
                      <h4 className="font-bold text-orange-400">{village.name}</h4>
                      <div className="text-sm text-orange-300 mt-1">
                        {village.population.toLocaleString()} residents • Arrival: {village.flood_arrival_time_min} min
                      </div>
                    </div>
                  ))}
                  {highVillages.length > 3 && (
                    <div className="text-center text-sm text-slate-400 py-2">
                      +{highVillages.length - 3} more communities at high risk
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Infrastructure Impact */}
            {affectedInfra.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  Critical Infrastructure Impact ({affectedInfra.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {affectedInfra.slice(0, 4).map((infra) => (
                    <div key={infra.id} className="p-4 bg-purple-950/30 border border-purple-800/60 rounded-lg">
                      <h4 className="font-bold text-purple-400">{infra.name}</h4>
                      <div className="text-sm text-purple-300 mt-1">
                        Type: <span className="font-semibold">{infra.type}</span>
                      </div>
                      <div className="text-sm text-purple-300">
                        Inundation Depth: <span className="font-semibold">{infra.inundation_depth_m} m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="p-6 border-t border-slate-800 bg-slate-950">
        <button
          onClick={() => completeStep()}
          className="w-full max-w-sm mx-auto block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold rounded-lg transition-all"
        >
          PLAN EVACUATION ROUTES
        </button>
      </div>
    </div>
  );
}
