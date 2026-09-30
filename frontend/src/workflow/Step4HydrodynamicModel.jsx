import React, { useState, useEffect } from 'react';
import { runSimulation } from '../services/api';
import { useWorkflow } from '../WorkflowContext';
import { CheckCircle2, Loader, Radio } from 'lucide-react';

export default function Step4HydrodynamicModel({ damId, scenarioParams, onSimulationReady }) {
  const [modelType, setModelType] = useState('delft3d');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState([]);
  const [simulationId, setSimulationId] = useState(null);
  const [modelStatus, setModelStatus] = useState({ delft3d_available: false, mode: 'demo' });
  const { completeStep } = useWorkflow();

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch('/api/hydrodynamic/delft3d/config');
        const data = await res.json();
        setModelStatus(data);
        if (data.delft3d_available) {
          setModelType('delft3d');
        } else {
          setModelType('demo');
        }
      } catch (err) {
        console.warn('Hydrodynamic status unavailable; defaulting to demo mode.', err);
        setModelStatus({ delft3d_available: false, mode: 'demo' });
      }
    };
    loadStatus();
  }, []);

  const progressStages = [
    'Preparing Terrain',
    'Initializing Flow Field',
    'Generating Breach Conditions',
    'Solving Shallow-Water Equations',
    'Processing Flood Field',
    'Calculating Inundation Extent',
    'Analyzing Affected Communities',
    'Finalizing Simulation'
  ];

  const handleRunModel = async () => {
    setIsRunning(true);
    setProgress([]);

    // Simulate progress updates
    let currentStage = 0;
    const progressInterval = setInterval(() => {
      if (currentStage < progressStages.length) {
        setProgress(prev => [...prev, progressStages[currentStage]]);
        currentStage++;
      } else {
        clearInterval(progressInterval);
      }
    }, 400);

    try {
      const params = {
        dam_id: damId,
        ...scenarioParams,
        model_type: modelType
      };

      const result = await runSimulation(params);
      setSimulationId(result.simulation_id);
      onSimulationReady(result);
      
      // Complete final stages
      await new Promise(resolve => setTimeout(resolve, 800));
      completeStep({ simulationId: result.simulation_id });
    } catch (err) {
      console.error('Simulation failed:', err);
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <h1 className="text-3xl font-bold text-white mb-2">
          2D HYDRODYNAMIC MODEL
        </h1>
        <p className="text-slate-400">
          Configure and execute flood simulation
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          
          {!isRunning && !simulationId && (
            <>
              {/* Model Selection */}
              <div className="mb-8">
                <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Hydrodynamic Solver
                </div>
                <div className="space-y-3">
                  {[
                    { value: 'demo', label: 'Project 2D Shallow-Water Engine', desc: 'Operational in-app simulation engine' },
                    { value: 'delft3d', label: 'Delft3D-FM Flexible Mesh', desc: modelStatus.delft3d_available ? 'High-fidelity model available on this environment' : 'Demo mode: solver not installed in this environment', disabled: false },
                    { value: 'sph', label: 'DualSPHysics SPH', desc: 'Lagrangian particle solver adapter', disabled: true }
                  ].map(model => (
                    <label
                      key={model.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        modelType === model.value && !model.disabled
                          ? 'border-cyan-500 bg-cyan-950/30'
                          : model.disabled
                          ? 'border-slate-800 bg-slate-900/30 opacity-50 cursor-not-allowed'
                          : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="model"
                          value={model.value}
                          checked={modelType === model.value}
                          onChange={(e) => setModelType(e.target.value)}
                          disabled={model.disabled}
                          className="mt-1 cursor-pointer"
                        />
                        <div>
                          <div className="font-semibold text-white">{model.label}</div>
                          <div className="text-sm text-slate-400 mt-1">{model.desc}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Configuration Summary */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                  Simulation Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Model Type</div>
                    <div className="font-semibold text-slate-200 mt-1">
                      {modelType === 'demo' ? 'Project Engine' : modelType.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Delft3D Status</div>
                    <div className="font-semibold text-slate-200 mt-1">
                      {modelStatus.delft3d_available ? 'AVAILABLE' : 'DEMO MODE'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Simulation Duration</div>
                    <div className="font-semibold text-slate-200 mt-1">180 minutes</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Grid Resolution</div>
                    <div className="font-semibold text-slate-200 mt-1">10 x 10 m</div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-lg flex items-start gap-3 mb-8">
                <Radio className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                  {modelStatus.delft3d_available
                    ? 'Delft3D-FM is available in this environment and can be used for a high-fidelity flood propagation run.'
                    : 'Delft3D-FM is not installed in this environment; the system is operating in clearly labelled demonstration mode using the existing hydrodynamic engine.'}
                </div>
              </div>
            </>
          )}

          {/* Progress Display */}
          {isRunning && (
            <div className="space-y-4">
              <div className="text-center mb-8">
                <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                <p className="text-white font-semibold">Running Hydrodynamic Simulation...</p>
                <p className="text-sm text-slate-400 mt-1">This typically takes 30-60 seconds</p>
              </div>

              {/* Progress Checklist */}
              <div className="space-y-2">
                {progressStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg flex items-center gap-2 transition-all ${
                      progress.includes(stage)
                        ? 'bg-emerald-950/40 border border-emerald-800'
                        : 'bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {progress.includes(stage) ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin shrink-0" />
                    )}
                    <span className={progress.includes(stage) ? 'text-slate-200' : 'text-slate-400'}>
                      {stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion Message */}
          {simulationId && (
            <div className="text-center space-y-4">
              <div className="mb-8">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">MODEL RUN COMPLETE</p>
              </div>

              <div className="p-6 bg-emerald-950/30 border border-emerald-800/60 rounded-lg">
                <div className="text-sm text-emerald-200">
                  <div className="font-semibold mb-2">Simulation ID</div>
                  <div className="font-mono text-xs text-emerald-300">{simulationId}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-slate-500">Simulation Time</div>
                  <div className="font-bold text-slate-200 mt-2">180 min</div>
                </div>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-slate-500">Grid Points</div>
                  <div className="font-bold text-slate-200 mt-2">2,400+</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Action Bar */}
      <div className="p-6 border-t border-slate-800 bg-slate-950">
        {!isRunning && !simulationId && (
          <button
            onClick={handleRunModel}
            className="w-full max-w-sm mx-auto block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold rounded-lg transition-all"
          >
            START SIMULATION
          </button>
        )}
        {simulationId && (
          <button
            onClick={() => completeStep()}
            className="w-full max-w-sm mx-auto block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold rounded-lg transition-all"
          >
            VIEW FLOOD SIMULATION
          </button>
        )}
      </div>
    </div>
  );
}
