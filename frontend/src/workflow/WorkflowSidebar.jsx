import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const WORKFLOW_STEPS = [
  { id: 1, label: 'Study Area', description: 'Select dam and region' },
  { id: 2, label: 'Data Prep', description: 'Load study data' },
  { id: 3, label: 'Breach Scenario', description: 'Define failure' },
  { id: 4, label: 'Hydrodynamic Model', description: 'Configure solver' },
  { id: 5, label: 'Flood Simulation', description: 'Visualize' },
  { id: 6, label: 'Impact & Risk', description: 'Analyze consequences' },
  { id: 7, label: 'Evacuation', description: 'Plan evacuation' },
  { id: 8, label: 'Results & Report', description: 'Final report' }
];

export default function WorkflowSidebar({ currentStep = 1 }) {
  const completedSteps = Array.from({ length: currentStep - 1 }, (_, i) => i + 1);

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Workflow Progress
        </h2>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {WORKFLOW_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isLocked = step.id > currentStep;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-cyan-950/50 border-2 border-cyan-500'
                  : isCompleted
                  ? 'bg-emerald-950/30 border border-emerald-800/60'
                  : isLocked
                  ? 'bg-slate-950/50 border border-slate-800 opacity-50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isCurrent ? (
                    <Circle className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600" />
                  )}
                </div>

                {/* Label & Description */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${
                    isCompleted ? 'text-emerald-400' :
                    isCurrent ? 'text-cyan-400' :
                    'text-slate-200'
                  }`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {step.description}
                  </div>
                </div>

                {/* Step Number Badge */}
                <div className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${
                  isCurrent
                    ? 'bg-cyan-600 text-white'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {step.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 mb-2">
          Step {currentStep} of {WORKFLOW_STEPS.length}
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all"
            style={{ width: `${(currentStep / WORKFLOW_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
