import React, { useEffect, useState } from 'react';
import { Waves, CheckCircle2, Cpu, Database, Activity } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Loading Indian Dam Reservoir Database...', icon: Database },
  { id: 2, label: 'Initializing 2D Shallow Water Physics Engine...', icon: Cpu },
  { id: 3, label: 'Calibrating DEFRA Flood Hazard Risk Classifier...', icon: Activity },
  { id: 4, label: 'Pre-computing Baseline Medium Breach Simulation...', icon: Waves },
  { id: 5, label: 'Loading Leaflet GIS Map & Geospatial Layers...', icon: CheckCircle2 },
];

export default function SplashScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setCurrentStep(step);
      if (step >= STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(onComplete, 400);
        }, 600);
      }
    }, 520);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-500 ${
        isDone ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated wave background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Logo & Title */}
      <div className="flex flex-col items-center gap-4 mb-12 relative z-10">
        <div className="p-5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl shadow-2xl shadow-cyan-500/25">
          <Waves className="w-14 h-14 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Dam Break Inundation Modeling
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">
            Emergency Decision Support System &bull; Smart India Hackathon 2025
          </p>
        </div>

        {/* Cyan divider */}
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full" />
      </div>

      {/* Init Steps */}
      <div className="space-y-2.5 w-80 relative z-10">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isComplete = idx < currentStep;
          const isActive = idx === currentStep - 1;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                isComplete
                  ? 'bg-emerald-950/40 border-emerald-800/60 opacity-80'
                  : isActive
                  ? 'bg-cyan-950/50 border-cyan-700/70 scale-[1.02]'
                  : 'bg-slate-900/40 border-slate-800/40 opacity-30'
              }`}
            >
              <div className={`flex-shrink-0 ${isComplete ? 'text-emerald-400' : isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                )}
              </div>
              <span className={`text-xs font-medium ${isComplete ? 'text-emerald-300' : isActive ? 'text-cyan-200' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom badges */}
      <div className="mt-12 flex gap-3 text-[10px] text-slate-500 font-mono relative z-10">
        <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">
          Froehlich (2008) Breach Equations
        </span>
        <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">
          DEFRA FD2320/TR2 Hazard Index
        </span>
        <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded">
          Sentinel-1 SAR Validated
        </span>
      </div>
    </div>
  );
}
