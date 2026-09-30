import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Play, 
  Database, 
  Cpu, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  Settings2,
  RefreshCw,
  Gauge
} from 'lucide-react';

export default function LeftSidebar({
  dams = [],
  activeDam,
  onSelectDam,
  scenarios = [],
  onRunSimulation,
  isLoading
}) {
  const [selectedScenarioType, setSelectedScenarioType] = useState('medium');
  const [modelType, setModelType] = useState('demo');
  
  // Custom Scenario Physical Parameters
  const [waterLevel, setWaterLevel] = useState(activeDam?.current_water_level_m || 728.5);
  const [breachWidth, setBreachWidth] = useState(85.0);
  const [formationTime, setFormationTime] = useState(0.8);
  const [initialDischarge, setInitialDischarge] = useState(250.0);
  const [durationMin, setDurationMin] = useState(180);

  // Sync state when active dam changes
  useEffect(() => {
    if (activeDam) {
      setWaterLevel(activeDam.current_water_level_m || 728.5);
    }
  }, [activeDam]);

  // Handle Scenario Preset Selection
  const handlePresetSelect = (preset) => {
    setSelectedScenarioType(preset.type);
    if (preset.type !== 'custom') {
      setBreachWidth(preset.breach_width_m || 85.0);
      setFormationTime(preset.breach_formation_time_hr || 0.8);
      setWaterLevel(preset.reservoir_water_level_m || activeDam?.current_water_level_m || 728.5);
      setInitialDischarge(preset.initial_river_discharge_cumecs || 250.0);
    }
  };

  const handleLaunch = () => {
    onRunSimulation({
      dam_id: activeDam?.id || 'dam-idukki',
      scenario_type: selectedScenarioType,
      reservoir_water_level_m: Number(waterLevel),
      breach_width_m: Number(breachWidth),
      breach_formation_time_hr: Number(formationTime),
      initial_river_discharge_cumecs: Number(initialDischarge),
      simulation_duration_min: Number(durationMin),
      model_type: modelType,
    });
  };

  const reservoir = activeDam?.reservoir_info || {};

  return (
    <aside className="w-80 bg-slate-950 border-r border-slate-800/90 flex flex-col h-full overflow-y-auto text-slate-200 text-xs select-none">
      
      {/* 1. Dam & Study Area Selection */}
      <div className="p-3.5 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Database className="w-3.5 h-3.5" />
            1. Target Dam & River Basin
          </span>
        </div>

        <select
          value={activeDam?.id || ''}
          onChange={(e) => onSelectDam(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded p-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none cursor-pointer font-medium"
        >
          {dams.map((dam) => (
            <option key={dam.id} value={dam.id}>
              {dam.name} ({dam.river})
            </option>
          ))}
        </select>

        {/* Reservoir Telemetry Capsule */}
        <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-1 text-slate-300 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Gross Storage:</span>
            <span className="text-slate-200 font-semibold">{reservoir.capacity_mcm} MCM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Full Level (FRL):</span>
            <span className="text-cyan-400 font-bold">{reservoir.full_reservoir_level_m} m MSL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Structure Height:</span>
            <span className="text-slate-200">{reservoir.dam_height_m} m</span>
          </div>
        </div>
      </div>

      {/* 2. Breach Scenario Presets */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            2. Breach Scenario Preset
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {scenarios.map((sc) => {
            const isSelected = selectedScenarioType === sc.type;
            return (
              <button
                key={sc.id}
                onClick={() => handlePresetSelect(sc)}
                className={`p-2 rounded text-center border transition cursor-pointer flex flex-col items-center gap-0.5 ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="uppercase text-[11px] font-mono tracking-tight">{sc.type}</span>
                <span className="text-[10px] text-slate-400 font-mono">{sc.breach_width_m}m W</span>
              </button>
            );
          })}
        </div>

        {/* Custom Parameter Mode Button */}
        <button
          onClick={() => setSelectedScenarioType('custom')}
          className={`w-full py-1 px-2 rounded border text-center transition cursor-pointer flex items-center justify-center gap-1.5 font-mono text-[11px] ${
            selectedScenarioType === 'custom'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
              : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Settings2 className="w-3 h-3" />
          <span>Custom Parameter Mode</span>
        </button>
      </div>

      {/* 3. Physical Parameters Sliders */}
      <div className="p-3.5 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Sliders className="w-3.5 h-3.5" />
            3. Physical Breach Parameters
          </span>
        </div>

        {/* Breach Width Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Breach Width (B_avg):</span>
            <span className="font-mono text-cyan-300 font-bold">{breachWidth} m</span>
          </div>
          <input
            type="range"
            min="10"
            max="300"
            step="5"
            value={breachWidth}
            onChange={(e) => {
              setBreachWidth(e.target.value);
              setSelectedScenarioType('custom');
            }}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Formation Time Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Formation Time (t_f):</span>
            <span className="font-mono text-cyan-300 font-bold">{formationTime} hrs</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3.0"
            step="0.1"
            value={formationTime}
            onChange={(e) => {
              setFormationTime(e.target.value);
              setSelectedScenarioType('custom');
            }}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Reservoir Water Level */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Initial Reservoir Level:</span>
            <span className="font-mono text-cyan-300 font-bold">{waterLevel} m MSL</span>
          </div>
          <input
            type="range"
            min={(reservoir.full_reservoir_level_m || 700) - 40}
            max={(reservoir.crest_level_m || 740) + 2}
            step="0.5"
            value={waterLevel}
            onChange={(e) => {
              setWaterLevel(e.target.value);
              setSelectedScenarioType('custom');
            }}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Baseflow Discharge */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-400 font-mono">River Baseflow:</span>
            <span className="font-mono text-cyan-300 font-bold">{initialDischarge} m³/s</span>
          </div>
          <input
            type="range"
            min="50"
            max="1500"
            step="50"
            value={initialDischarge}
            onChange={(e) => {
              setInitialDischarge(e.target.value);
              setSelectedScenarioType('custom');
            }}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>

      {/* 4. Hydrodynamic Model Selection */}
      <div className="p-3.5 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
            4. Hydrodynamic Engine
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 p-2 bg-slate-900/60 hover:bg-slate-900 rounded border border-slate-800 cursor-pointer">
            <input
              type="radio"
              name="modelAdapter"
              value="demo"
              checked={modelType === 'demo'}
              onChange={(e) => setModelType(e.target.value)}
              className="text-cyan-500 focus:ring-0"
            />
            <div className="flex-1">
              <div className="font-bold text-slate-200">Project Shallow Water Engine</div>
              <div className="text-[10px] text-amber-400 font-mono">Real-Time Numerical Solver</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-900/60 hover:bg-slate-900 rounded border border-slate-800 cursor-pointer">
            <input
              type="radio"
              name="modelAdapter"
              value="delft3d"
              checked={modelType === 'delft3d'}
              onChange={(e) => setModelType(e.target.value)}
              className="text-cyan-500 focus:ring-0"
            />
            <div className="flex-1">
              <div className="font-bold text-slate-200">Delft3D-FM Flexible Mesh</div>
              <div className="text-[10px] text-emerald-400 font-mono">Eulerian 2D Model Adapter</div>
            </div>
          </label>

          <label className="flex items-center gap-2 p-2 bg-slate-900/60 hover:bg-slate-900 rounded border border-slate-800 cursor-pointer">
            <input
              type="radio"
              name="modelAdapter"
              value="sph"
              checked={modelType === 'sph'}
              onChange={(e) => setModelType(e.target.value)}
              className="text-cyan-500 focus:ring-0"
            />
            <div className="flex-1">
              <div className="font-bold text-slate-200">DualSPHysics SPH</div>
              <div className="text-[10px] text-emerald-400 font-mono">Lagrangian Particle Dynamics Adapter</div>
            </div>
          </label>
        </div>
      </div>

      {/* 5. Launch Simulation */}
      <div className="p-3.5 mt-auto">
        <button
          onClick={handleLaunch}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] text-white rounded font-bold text-xs shadow-md shadow-cyan-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer font-mono tracking-wide"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>COMPUTING HYDRODYNAMICS...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>EXECUTE INUNDATION SIMULATION</span>
            </>
          )}
        </button>
      </div>

    </aside>
  );
}
