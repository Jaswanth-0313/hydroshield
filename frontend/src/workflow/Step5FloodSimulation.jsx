import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import InundationMap from '../maps/InundationMap';
import { useWorkflow } from '../WorkflowContext';

export default function Step5FloodSimulation({
  simulation,
  currentTimeMin,
  onTimeChange,
  timeStepData,
  maxExtent,
  riverGeojson,
  villagesRisk,
  infrastructureRisk,
  roadsStatus,
  shelters,
  evacuationRoute,
  onSelectVillage,
  crossSections
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const { completeStep } = useWorkflow();

  const durationMin = simulation?.duration_min || 180;
  const timeStep = 5;

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => { setIsPlaying(false); onTimeChange(0); };
  const handleStepBack = () => onTimeChange(Math.max(0, currentTimeMin - timeStep));
  const handleStepForward = () => onTimeChange(Math.min(durationMin, currentTimeMin + timeStep));

  // Auto-play
  React.useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onTimeChange(prev => {
          if (prev >= durationMin) {
            setIsPlaying(false);
            return durationMin;
          }
          return Math.min(durationMin, prev + timeStep);
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, durationMin, onTimeChange]);

  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const maxDepth = maxExtent?.max_depth_m || 11.2;
  const maxVelocity = maxExtent?.max_velocity_ms || 7.4;
  const inundatedArea = maxExtent?.total_inundated_area_sqkm || 28.5;
  const earliestArrival = simulation?.earliest_village_arrival_min || 3.2;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
      
      {/* Main Map - TAKES UP 70-80% OF SCREEN */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <InundationMap
          activeDam={simulation?.dam_data}
          timeStepData={timeStepData}
          maxExtent={maxExtent}
          riverGeojson={riverGeojson}
          villagesRisk={villagesRisk}
          infrastructureRisk={infrastructureRisk}
          roadsGeojson={roadsStatus}
          shelters={shelters}
          evacuationRoute={evacuationRoute}
          onSelectVillage={onSelectVillage}
        />

        {/* Floating Metrics Panel - TOP RIGHT */}
        <div className="absolute top-4 right-4 space-y-2 pointer-events-none">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'MAX DEPTH', value: maxDepth, unit: 'm', color: 'amber' },
              { label: 'MAX VELOCITY', value: maxVelocity, unit: 'm/s', color: 'orange' },
              { label: 'INUNDATED AREA', value: inundatedArea, unit: 'km²', color: 'cyan' },
              { label: 'ARRIVAL TIME', value: earliestArrival, unit: 'min', color: 'emerald' }
            ].map((metric) => (
              <div
                key={metric.label}
                className="p-3 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg pointer-events-auto"
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider text-slate-400`}>
                  {metric.label}
                </div>
                <div className={`text-lg font-bold mt-1 text-${metric.color}-400`}>
                  {metric.value.toFixed(1)} <span className="text-xs text-slate-400">{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Display - TOP CENTER */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg px-4 py-2 pointer-events-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Current Time
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {formatTime(currentTimeMin)} <span className="text-xs text-slate-400 ml-1">T+{currentTimeMin}min</span>
          </div>
        </div>
      </div>

      {/* Time Control Bar - BOTTOM */}
      <div className="bg-slate-950 border-t border-slate-800 p-4 space-y-3">
        
        {/* Timeline Slider */}
        <div>
          <input
            type="range"
            min="0"
            max={durationMin}
            step={timeStep}
            value={currentTimeMin}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>00:00</span>
            <span>03:00</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleReset}
            title="Reset"
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleStepBack}
            title="Step -5 min"
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handlePlayPause}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 rounded-lg text-white font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            {isPlaying ? (
              <><Pause className="w-4 h-4" /> PAUSE</>
            ) : (
              <><Play className="w-4 h-4 fill-white" /> PLAY</>
            )}
          </button>
          <button
            onClick={handleStepForward}
            title="Step +5 min"
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Multipliers */}
          <div className="ml-4 flex gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
            {[1, 2, 4].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  playbackSpeed === speed
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={() => completeStep()}
            className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-lg text-white text-sm font-bold transition-all cursor-pointer"
          >
            CONTINUE TO IMPACT ANALYSIS
          </button>
        </div>
      </div>

    </div>
  );
}
