import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  ShieldAlert, 
  Navigation, 
  Building2, 
  CheckCircle, 
  AlertTriangle,
  FileSpreadsheet,
  Info,
  ArrowRight
} from 'lucide-react';

export default function VillageRiskPage({
  villagesRisk = [],
  infrastructureRisk = [],
  onPlanEvacuation,
  activeDam
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('villages');
  const [selectedVillageForInfo, setSelectedVillageForInfo] = useState(null);

  const safeVillages = Array.isArray(villagesRisk) ? villagesRisk : [];
  const safeInfras = Array.isArray(infrastructureRisk) ? infrastructureRisk : [];

  // Filter villages
  const filteredVillages = safeVillages.filter((v) => {
    const matchesSearch = (v.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = riskFilter === 'ALL' || v.risk_level === riskFilter;
    return matchesSearch && matchesFilter;
  });

  // Filter infrastructure
  const filteredInfras = safeInfras.filter((inf) => {
    const matchesSearch = (inf.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = riskFilter === 'ALL' || inf.risk_level === riskFilter;
    return matchesSearch && matchesFilter;
  });

  const getPriorityBadge = (priority) => {
    const p = String(priority || '');
    if (p.includes('P1') || p.includes('CRITICAL')) return 'bg-rose-950 text-rose-300 border-rose-800';
    if (p.includes('P2') || p.includes('HIGH')) return 'bg-orange-950 text-orange-300 border-orange-800';
    if (p.includes('P3') || p.includes('MODERATE')) return 'bg-amber-950 text-amber-300 border-amber-800';
    return 'bg-emerald-950 text-emerald-300 border-emerald-800';
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'HIGH': return 'bg-orange-950 text-orange-400 border-orange-800';
      case 'MODERATE': return 'bg-amber-950 text-amber-400 border-amber-800';
      default: return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    }
  };

  const exportCSV = () => {
    const headers = "ID,Village Name,Population,Vulnerable Count,Distance (km),Arrival Time (min),Max Depth (m),Velocity (m/s),Risk Level,Evacuation Priority\n";
    const rows = safeVillages.map(v => 
      `"${v.id}","${v.name}",${v.population},${v.vulnerable_population_count},${v.distance_from_dam_km},${v.flood_arrival_time_min},${v.max_flood_depth_m},${v.max_flow_velocity_ms},"${v.risk_level}","${v.evacuation_priority}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dam_break_risk_matrix_${activeDam?.id || 'study'}.csv`;
    a.click();
  };

  const activeFocusVillage = selectedVillageForInfo || filteredVillages[0];

  return (
    <div className="flex-1 p-6 bg-slate-950 overflow-y-auto space-y-5 text-slate-200 text-xs select-none">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-mono uppercase">
              Community Vulnerability & Infrastructure Exposure Matrix
            </h2>
            <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-700 text-cyan-400 rounded text-xs font-mono">
              {activeDam?.name || 'Idukki Dam'} Reach ({safeVillages.length} Communities)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            DEFRA hazard ratings, demographic vulnerability weighting, and prioritized evacuation schedules
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer font-mono"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Matrix (.CSV)</span>
          </button>
        </div>
      </div>

      {/* "Why This Risk?" Diagnostic Rationale Box */}
      {activeFocusVillage && (
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-slate-950 border border-slate-700 rounded text-cyan-400 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Diagnostic Assessment for: <strong className="text-cyan-300">{activeFocusVillage.name}</strong></span>
                <span className={`px-2 py-0.2 rounded text-[10px] font-bold border font-mono ${getRiskBadge(activeFocusVillage.risk_level)}`}>
                  {activeFocusVillage.risk_level} ({activeFocusVillage.evacuation_priority})
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                <strong>Why this rating? </strong>
                {activeFocusVillage.max_flood_depth_m > 2.0 ? '• High stage depth (>2.0m) ' : '• Moderate depth '} 
                • Fast front arrival ({activeFocusVillage.flood_arrival_time_min} mins) 
                • {activeFocusVillage.population?.toLocaleString()} population exposed with {activeFocusVillage.vulnerable_population_count} vulnerable dependents.
              </div>
            </div>
          </div>

          <button
            onClick={() => onPlanEvacuation && onPlanEvacuation(activeFocusVillage.id)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs flex items-center gap-1 transition cursor-pointer shrink-0 font-mono"
          >
            <span>Plan Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub Tab Switcher & Search Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Toggle between Villages & Infrastructure */}
        <div className="flex bg-slate-900 border border-slate-800 rounded p-1 font-mono text-xs">
          <button
            onClick={() => setActiveSubTab('villages')}
            className={`px-4 py-1.5 rounded transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'villages' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Communities ({safeVillages.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('infrastructure')}
            className={`px-4 py-1.5 rounded transition cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'infrastructure' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Critical Infrastructure ({safeInfras.length})</span>
          </button>
        </div>

        {/* Search & Level Filter */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
            <input
              type="text"
              placeholder="Search settlement or facility name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
          >
            <option value="ALL">All Levels</option>
            <option value="CRITICAL">Critical (P1)</option>
            <option value="HIGH">High (P2)</option>
            <option value="MODERATE">Moderate (P3)</option>
            <option value="LOW">Low (P4)</option>
          </select>
        </div>

      </div>

      {/* 1. Village Risk Table View */}
      {activeSubTab === 'villages' && (
        <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-3">Rank / Community</th>
                  <th className="p-3">Population</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Wave Arrival</th>
                  <th className="p-3">Peak Depth / Vel</th>
                  <th className="p-3">Hazard Score</th>
                  <th className="p-3">Composite Risk</th>
                  <th className="p-3">Evacuation Priority</th>
                  <th className="p-3 text-right">Emergency Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filteredVillages.map((v, idx) => (
                  <tr 
                    key={v.id} 
                    onClick={() => setSelectedVillageForInfo(v)}
                    className={`hover:bg-slate-800/50 transition cursor-pointer ${
                      activeFocusVillage?.id === v.id ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                        <span>{v.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">ID: {v.id}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{v.population?.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">Vuln: {v.vulnerable_population_count}</div>
                    </td>
                    <td className="p-3 text-slate-300">{v.distance_from_dam_km} km</td>
                    <td className="p-3">
                      <span className="font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                        T+{v.flood_arrival_time_min}m
                      </span>
                    </td>
                    <td className="p-3 text-amber-300">
                      <div>{v.max_flood_depth_m} m</div>
                      <div className="text-[10px] text-slate-400">{v.max_flow_velocity_ms} m/s</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-200">{v.risk_breakdown?.hazard_score || 0}/100</div>
                      <div className="text-[10px] text-slate-500">DEFRA HR</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${getRiskBadge(v.risk_level)}`}>
                          {v.risk_level}
                        </span>
                        <span className="text-slate-400 text-[10px]">({v.risk_breakdown?.total_risk_score || 0} pts)</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${getPriorityBadge(v.evacuation_priority)}`}>
                        {v.evacuation_priority || 'P1 - Immediate'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlanEvacuation && onPlanEvacuation(v.id);
                        }}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-bold transition cursor-pointer"
                      >
                        Plan Route
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Critical Infrastructure Table View */}
      {activeSubTab === 'infrastructure' && (
        <div className="bg-slate-900 border border-slate-800 rounded overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="p-3">Facility Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Flood Arrival</th>
                  <th className="p-3">Peak Water Stage</th>
                  <th className="p-3">Inundation Status</th>
                  <th className="p-3">Risk Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filteredInfras.map((inf) => (
                  <tr key={inf.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-bold text-slate-100">{inf.name}</td>
                    <td className="p-3 text-slate-300 capitalize">{inf.category}</td>
                    <td className="p-3 text-slate-300">{inf.distance_from_dam_km} km</td>
                    <td className="p-3 text-cyan-300">T+{inf.flood_arrival_time_min}m</td>
                    <td className="p-3 text-amber-300">{inf.max_flood_depth_m} m</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        inf.is_inundated ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        {inf.is_inundated ? 'SUBMERGED / CUT-OFF' : 'OPERATIONAL'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold border rounded ${getRiskBadge(inf.risk_level)}`}>
                        {inf.risk_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
