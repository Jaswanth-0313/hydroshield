import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  AlertTriangle,
  CheckCircle2, 
  BarChart3, 
  HelpCircle,
  Zap,
  TrendingUp,
  Users,
  Building2,
  Navigation
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  CartesianGrid,
  ScatterChart,
  Scatter
} from 'recharts';

export default function AIModelPage({ activeDam, currentSimulation, villagesRisk = [] }) {
  const [modelMode, setModelMode] = useState('rule-based'); // 'rule-based' | 'prototype-ml'
  const safeVillages = Array.isArray(villagesRisk) ? villagesRisk : [];

  // Rule-Based Risk Classification (deterministic)
  const calculateRiskRating = (village) => {
    let score = 0;
    
    // Hazard rating (DEFRA)
    const depth = village.max_flood_depth_m || 0;
    const velocity = village.max_flow_velocity_ms || 0;
    const hazardRating = depth * (velocity + 0.5) + 0.5; // DF=0.5
    
    if (hazardRating >= 2.0) score += 40;
    else if (hazardRating >= 1.25) score += 30;
    else if (hazardRating >= 0.75) score += 15;
    
    // Population exposure
    const pop = village.population || 0;
    if (pop > 50000) score += 25;
    else if (pop > 10000) score += 15;
    else if (pop > 1000) score += 8;
    
    // Vulnerability (children, elderly, disabled)
    const vulnPct = (village.vulnerable_population_count || 0) / Math.max(1, pop);
    if (vulnPct > 0.25) score += 20;
    else if (vulnPct > 0.15) score += 12;
    else if (vulnPct > 0.05) score += 5;
    
    // Arrival time (early = more prep time)
    const arrival = village.flood_arrival_time_min || 999;
    if (arrival < 10) score += 15;
    else if (arrival < 30) score += 8;
    
    return Math.min(100, Math.round(score));
  };

  const riskAssessments = safeVillages.map(v => ({
    ...v,
    aiRiskScore: calculateRiskRating(v),
    riskCategory: calculateRiskRating(v) >= 75 ? 'CRITICAL' : 
                  calculateRiskRating(v) >= 55 ? 'HIGH' : 
                  calculateRiskRating(v) >= 35 ? 'MODERATE' : 'LOW'
  }));

  // Feature importance for rule-based system
  const featureImportance = [
    { name: 'Hazard Rating (d×v)', weight: 40 },
    { name: 'Population Exposure', weight: 25 },
    { name: 'Vulnerable Population %', weight: 20 },
    { name: 'Flood Arrival Time', weight: 15 }
  ];

  const criticalByAI = riskAssessments.filter(r => r.riskCategory === 'CRITICAL').length;
  const avgRiskScore = Math.round(riskAssessments.reduce((sum, r) => sum + r.aiRiskScore, 0) / Math.max(1, riskAssessments.length));

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100">
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-cyan-400" />
              AI Risk Intelligence
            </h2>
            <p className="text-sm text-slate-400 mt-1">{activeDam?.name || 'Study Area'} — Deterministic Risk Classification</p>
          </div>
        </div>

        {/* Model Mode Selector */}
        <div className="flex gap-2 items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase">Intelligence Mode:</span>
          <button
            onClick={() => setModelMode('rule-based')}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              modelMode === 'rule-based'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 inline mr-1" />
            Rule-Based (Deterministic)
          </button>
          <button
            onClick={() => setModelMode('prototype-ml')}
            className={`px-4 py-2 rounded text-sm font-medium transition text-amber-500 border border-amber-700 ${
              modelMode === 'prototype-ml'
                ? 'bg-amber-950/40'
                : 'bg-slate-800/40 hover:bg-amber-950/20'
            }`}
          >
            <span className="text-[11px] font-bold">PROTOTYPE</span>
            ML-Based (Future)
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        
        {/* Mode Information */}
        {modelMode === 'rule-based' && (
          <div className="bg-cyan-950/30 border border-cyan-800/60 rounded-lg p-4">
            <div className="text-sm text-cyan-200 space-y-2">
              <p className="font-semibold text-cyan-300">✓ Rule-Based Deterministic Classification</p>
              <p className="text-xs">
                This system uses proven DEFRA flood hazard criteria combined with demographic vulnerability weighting to classify communities into risk categories. All calculations are transparent, reproducible, and based on first-principles hydraulic principles.
              </p>
              <div className="text-xs opacity-75 mt-2 border-t border-cyan-800/40 pt-2">
                <strong>Transparency:</strong> All AI outputs are fully explainable. Each community's risk score is calculated from documented hydraulic and demographic factors without black-box neural networks.
              </div>
            </div>
          </div>
        )}

        {modelMode === 'prototype-ml' && (
          <div className="bg-amber-950/30 border border-amber-800/60 rounded-lg p-4">
            <div className="text-sm text-amber-200 space-y-2">
              <p className="font-semibold text-amber-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                PROTOTYPE: Machine Learning (Not Operational)
              </p>
              <p className="text-xs">
                ML-based risk prediction is currently in development phase. When operational, a trained neural network will learn patterns from historical flood events and expert assessments to predict risk beyond traditional rule-based systems.
              </p>
              <p className="text-xs opacity-75">Status: <span className="font-semibold">Model training pending</span></p>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Communities Assessed</div>
            <div className="text-3xl font-bold text-cyan-400 mt-2">{riskAssessments.length}</div>
            <div className="text-xs text-slate-400 mt-1">Total analyzed communities</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Critical Risk (AI)</div>
            <div className="text-3xl font-bold text-rose-400 mt-2">{criticalByAI}</div>
            <div className="text-xs text-slate-400 mt-1">Score ≥75 (highest urgency)</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Risk Score</div>
            <div className="text-3xl font-bold text-amber-400 mt-2">{avgRiskScore}</div>
            <div className="text-xs text-slate-400 mt-1">0-100 scale</div>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Feature Importance in Risk Assessment
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                <Bar dataKey="weight" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Classification Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Risk Category Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Risk Category Distribution</h3>
            <div className="space-y-3">
              {[
                { label: 'CRITICAL', count: riskAssessments.filter(r => r.riskCategory === 'CRITICAL').length, color: 'rose', threshold: '≥75' },
                { label: 'HIGH', count: riskAssessments.filter(r => r.riskCategory === 'HIGH').length, color: 'orange', threshold: '55-74' },
                { label: 'MODERATE', count: riskAssessments.filter(r => r.riskCategory === 'MODERATE').length, color: 'amber', threshold: '35-54' },
                { label: 'LOW', count: riskAssessments.filter(r => r.riskCategory === 'LOW').length, color: 'emerald', threshold: '<35' }
              ].map(cat => (
                <div key={cat.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold">{cat.label}</span>
                    <span className="text-xs text-slate-400">{cat.count} communities ({cat.threshold})</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className={`bg-${cat.color}-500 h-2 rounded-full`}
                      style={{ width: `${(cat.count / Math.max(1, riskAssessments.length)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation of Algorithm */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              How Risk Is Calculated
            </h3>
            <div className="text-sm space-y-3 text-slate-300">
              <div>
                <div className="font-semibold text-slate-100">1. Hazard Rating (HR)</div>
                <div className="text-xs text-slate-400 mt-1">HR = d × (v + 0.5) + 0.5 where d=depth, v=velocity</div>
              </div>
              <div>
                <div className="font-semibold text-slate-100">2. Population Exposure</div>
                <div className="text-xs text-slate-400 mt-1">Score based on total population at risk</div>
              </div>
              <div>
                <div className="font-semibold text-slate-100">3. Vulnerability Index</div>
                <div className="text-xs text-slate-400 mt-1">Percentage of vulnerable population (children, elderly, disabled)</div>
              </div>
              <div>
                <div className="font-semibold text-slate-100">4. Temporal Factor</div>
                <div className="text-xs text-slate-400 mt-1">Time available for evacuation/response (arrival time)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Risk Communities Ranking */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Communities Ranked by AI Risk Score
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-slate-400">Community</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-400">AI Score</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-400">Category</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-400">Population</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-400">Hazard Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {riskAssessments.sort((a, b) => b.aiRiskScore - a.aiRiskScore).slice(0, 10).map((v, i) => {
                  const hazardRating = (v.max_flood_depth_m || 0) * ((v.max_flow_velocity_ms || 0) + 0.5) + 0.5;
                  return (
                    <tr key={i} className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-medium text-slate-200">{i+1}. {v.name}</td>
                      <td className="py-3 px-4 text-right font-bold font-mono text-cyan-400">{v.aiRiskScore}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded border ${
                          v.riskCategory === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                          v.riskCategory === 'HIGH' ? 'bg-orange-950 text-orange-300 border-orange-800' :
                          v.riskCategory === 'MODERATE' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                          'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}>
                          {v.riskCategory}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">{(v.population || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{hazardRating.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
