import React, { useState, useEffect } from 'react';
import { fetchScenarios } from '../services/api';
import { useWorkflow } from '../WorkflowContext';

export default function Step3BreachScenario() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('medium');
  const [isCustom, setIsCustom] = useState(false);
  const { completeStep } = useWorkflow();

  // Custom parameters
  const [breachWidth, setBreachWidth] = useState(85);
  const [formationTime, setFormationTime] = useState(0.8);
  const [reservoirLevel, setReservoirLevel] = useState(728.5);
  const [riverBaseflow, setRiverBaseflow] = useState(250);

  useEffect(() => {
    const loadScenarios = async () => {
      try {
        const scList = await fetchScenarios();
        setScenarios(scList);
        if (scList.length > 1) {
          const medScenario = scList.find(s => s.type === 'medium') || scList[1];
          setSelectedScenario(medScenario.type);
        }
      } catch (err) {
        console.error('Failed to load scenarios:', err);
      }
    };
    loadScenarios();
  }, []);

  const handlePresetSelect = (scenario) => {
    setIsCustom(false);
    setSelectedScenario(scenario.type);
    setBreachWidth(scenario.breach_width_m || 85);
    setFormationTime(scenario.breach_formation_time_hr || 0.8);
  };

  const handleContinue = () => {
    const scenarioParams = {
      scenario_type: selectedScenario,
      breach_width_m: breachWidth,
      breach_formation_time_hr: formationTime,
      reservoir_water_level_m: reservoirLevel,
      initial_river_discharge_cumecs: riverBaseflow,
      simulation_duration_min: 180
    };
    completeStep({ scenarioParams });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <h1 className="text-3xl font-bold text-white mb-2">
          DEFINE DAM-BREACH SCENARIO
        </h1>
        <p className="text-slate-400">
          Select a preset scenario or configure custom breach parameters
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Scenario Presets */}
          <div className="mb-10">
            <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
              Scenario Presets
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handlePresetSelect(scenario)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedScenario === scenario.type && !isCustom
                      ? 'border-cyan-500 bg-cyan-950/30 shadow-lg'
                      : 'border-slate-700 bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <h4 className="text-lg font-bold text-white capitalize mb-2">
                    {scenario.type} Breach
                  </h4>
                  <div className="space-y-1 text-sm text-slate-400">
                    <div>Width: <span className="text-slate-200 font-semibold">{scenario.breach_width_m}m</span></div>
                    <div>Formation: <span className="text-slate-200 font-semibold">{scenario.breach_formation_time_hr}h</span></div>
                    <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500 italic">
                      {scenario.type === 'small' && 'Low severity • Piping failure'}
                      {scenario.type === 'medium' && 'Moderate severity • Mixed failure'}
                      {scenario.type === 'large' && 'High severity • Catastrophic failure'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Parameters Section */}
          <div className="mb-8">
            <button
              onClick={() => setIsCustom(!isCustom)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                isCustom
                  ? 'border-cyan-500 bg-cyan-950/30'
                  : 'border-slate-700 bg-slate-900 hover:border-slate-600'
              }`}
            >
              <span className="font-bold text-white">
                {isCustom ? '✓' : '+'} Custom Scenario
              </span>
            </button>

            {isCustom && (
              <div className="mt-4 p-6 bg-slate-900 border border-slate-800 rounded-lg space-y-6">
                
                {/* Breach Width */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-200">Breach Width</label>
                    <span className="text-sm font-bold text-cyan-400">{breachWidth} m</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    value={breachWidth}
                    onChange={(e) => { setBreachWidth(Number(e.target.value)); setIsCustom(true); }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="text-xs text-slate-500 mt-1">Range: 10 - 300 meters</div>
                </div>

                {/* Formation Time */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-200">Formation Time</label>
                    <span className="text-sm font-bold text-cyan-400">{formationTime} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={formationTime}
                    onChange={(e) => { setFormationTime(Number(e.target.value)); setIsCustom(true); }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="text-xs text-slate-500 mt-1">Range: 0.1 - 3.0 hours</div>
                </div>

                {/* Reservoir Level */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-200">Initial Reservoir Level</label>
                    <span className="text-sm font-bold text-cyan-400">{reservoirLevel} m MSL</span>
                  </div>
                  <input
                    type="range"
                    min="700"
                    max="735"
                    step="0.5"
                    value={reservoirLevel}
                    onChange={(e) => { setReservoirLevel(Number(e.target.value)); setIsCustom(true); }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="text-xs text-slate-500 mt-1">Range: 700 - 735 m MSL</div>
                </div>

                {/* River Baseflow */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-200">River Baseflow</label>
                    <span className="text-sm font-bold text-cyan-400">{riverBaseflow} m³/s</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    step="50"
                    value={riverBaseflow}
                    onChange={(e) => { setRiverBaseflow(Number(e.target.value)); setIsCustom(true); }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <div className="text-xs text-slate-500 mt-1">Range: 50 - 1500 m³/s</div>
                </div>
              </div>
            )}
          </div>

          {/* Scenario Summary */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
              Scenario Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-slate-500">Breach Width</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{breachWidth}m</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Formation</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{formationTime}h</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Reservoir Level</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{reservoirLevel}m</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Baseflow</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{riverBaseflow}m³/s</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Action Bar */}
      <div className="p-6 border-t border-slate-800 bg-slate-950">
        <button
          onClick={handleContinue}
          className="w-full max-w-sm mx-auto block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold rounded-lg transition-all"
        >
          RUN HYDRODYNAMIC MODEL
        </button>
      </div>
    </div>
  );
}
