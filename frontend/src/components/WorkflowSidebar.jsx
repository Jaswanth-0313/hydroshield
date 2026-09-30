import React from 'react';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { useWorkflow } from '../WorkflowContext';

export default function WorkflowSidebar() {
  const { currentStep, completedSteps, goToStep, WORKFLOW_STEPS } = useWorkflow();

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
          Workflow Progress
        </div>
        <div className="text-sm font-bold text-white">
          Step {currentStep} of {WORKFLOW_STEPS.length}
        </div>
        <div className="text-xs text-slate-400 mt-1">
          {WORKFLOW_STEPS[currentStep - 1].label}
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-1 p-3">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isLocked = !isCompleted && step.id > currentStep;

          return (
            <div key={step.id} className="space-y-0">
              <button
                onClick={() => !isLocked && goToStep(step.id)}
                disabled={isLocked}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-cyan-900/40 border-cyan-600 text-white shadow-lg'
                    : isCompleted
                    ? 'bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-800 cursor-pointer'
                    : isLocked
                    ? 'bg-slate-900/20 border-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-800/30 border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Circle className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold uppercase tracking-wider ${
                        isCurrent ? 'text-cyan-300' : 'text-slate-200'
                      }`}>
                        {String(step.id).padStart(2, '0')} {step.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {isCurrent && !isLocked && (
                    <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  )}
                </div>
              </button>

              {/* Step connector line */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="h-1 mx-6 bg-gradient-to-b from-slate-700/50 to-slate-800/0"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Overall Progress</span>
          <span className="text-xs font-bold text-cyan-400">
            {Math.round((completedSteps.length / WORKFLOW_STEPS.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / WORKFLOW_STEPS.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </aside>
  );
}
