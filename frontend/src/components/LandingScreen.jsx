import React from 'react';
import { ArrowRight, ShieldCheck, Waves, Radar, Activity } from 'lucide-react';

export default function LandingScreen({ onStart }) {
  const features = [
    { icon: Radar, label: 'Flood mapping' },
    { icon: Waves, label: 'Hydrodynamic modeling' },
    { icon: Activity, label: 'Risk analysis' },
    { icon: ShieldCheck, label: 'Evacuation planning' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-hidden">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),transparent_30%)]" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-6 py-16">
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-blue-300">
            <img 
              src="/logo.svg" 
              alt="HYDROSHIELD" 
              className="w-4 h-4"
              onError={(e) => e.target.style.display = 'none'}
            />
            HYDROSHIELD
          </div>

          <div className="max-w-4xl">
            <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
              DAM-BREAK FLOOD MODELLING &<br />
              EMERGENCY DECISION SUPPORT
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300 md:text-xl">
              Flood propagation analysis, hydrodynamic forecasting, community risk assessment, and evacuation decision support for dam-break emergency operations.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"
              >
                <Icon className="h-4 w-4 text-cyan-400" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-7 py-3.5 text-base font-bold text-white transition hover:bg-cyan-500 active:scale-[0.99]"
            >
              START NEW ANALYSIS
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="text-sm text-slate-400">
              Study area • breach scenario • flood simulation • risk and evacuation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
