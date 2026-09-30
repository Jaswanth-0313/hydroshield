import React from 'react';
import { 
  ShieldAlert, 
  Map, 
  Users, 
  Navigation, 
  GitCompare, 
  BrainCircuit, 
  CheckCircle2, 
  BookOpen, 
  Waves,
  Activity,
  FileText,
  Radio,
  Layers,
  Database
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  activeDam, 
  currentSimulation, 
  onOpenMethodology,
  onOpenEAPReport
}) {
  const isSynthetic = currentSimulation?.is_synthetic_demo ?? true;
  const modelType = currentSimulation?.model_type || 'demo';

  const navItems = [
    { id: 'dashboard', label: 'Command Overview', icon: Map },
    { id: 'villages', label: 'Risk & Vulnerability', icon: Users },
    { id: 'evacuation', label: 'Evacuation Decision Support', icon: Navigation },
    { id: 'compare', label: 'Model Benchmarking', icon: GitCompare },
    { id: 'ai', label: 'AI Risk Intelligence', icon: BrainCircuit },
    { id: 'validation', label: 'Satellite SAR Validation', icon: CheckCircle2 },
  ];

  return (
    <header className="bg-slate-950/95 backdrop-blur border-b border-slate-800 sticky top-0 z-50 text-white shadow-xl select-none">
      
      {/* Top Incident Command Banner */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80">
        
        {/* Brand & Mission Title */}
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500/50 rounded-md shadow-inner">
            {/* HYDROSHIELD Logo */}
            <img 
              src="/logo.svg" 
              alt="HYDROSHIELD" 
              className="w-6 h-6 text-white"
              onError={(e) => {
                // Fallback to icon if logo doesn't exist
                e.target.style.display = 'none';
                const sibling = e.target.nextElementSibling;
                if (sibling) sibling.style.display = 'block';
              }}
            />
            <Waves className="w-5 h-5 text-white hidden" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white uppercase font-mono">
                HYDROSHIELD
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 rounded font-mono">
                OPERATIONAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Hydrodynamic Emergency System
            </p>
          </div>
        </div>

        {/* Live System Badges & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Study Area & Dam Indicator */}
          <div className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] flex items-center gap-1.5 font-mono">
            <span className="text-slate-400">Study Area:</span>
            <span className="font-semibold text-slate-200">{activeDam?.name || 'Idukki Reservoir Basin'}</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400">{activeDam?.river || 'Periyar River'}</span>
          </div>

          {/* Model Execution Mode Indicator */}
          <div className={`px-2.5 py-1 rounded text-[11px] font-mono border flex items-center gap-1.5 ${
            isSynthetic 
              ? 'bg-slate-900 text-amber-300 border-amber-800/60' 
              : 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80'
          }`}>
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="text-slate-400">Data Source:</span>
            <span className="font-bold">
              {isSynthetic ? 'SIMULATION MODE' : `VERIFIED MODEL OUTPUT (${modelType.toUpperCase()})`}
            </span>
          </div>

          {/* Emergency Action Plan Bulletin Button */}
          <button
            onClick={onOpenEAPReport}
            className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white rounded text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-950 cursor-pointer"
            title="Generate Emergency Action Plan (EAP) incident report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate EAP Bulletin</span>
          </button>

          {/* Scientific Methodology Modal Button */}
          <button
            onClick={onOpenMethodology}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded text-xs font-medium transition flex items-center gap-1.5 cursor-pointer font-mono"
            title="Scientific equations and risk formulation reference"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Methodology</span>
          </button>

        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="px-4 flex items-center gap-1 bg-slate-950 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-cyan-500 text-cyan-300 bg-slate-900/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

    </header>
  );
}
