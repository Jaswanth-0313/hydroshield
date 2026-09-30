import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Clock, 
  TrendingUp, 
  Gauge,
  Waves
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';

export default function BottomPanel({
  currentTimeMin = 30,
  onTimeChange,
  durationMin = 180,
  timeStep = 5,
  crossSections = []
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 4x
  const [selectedStationIdx, setSelectedStationIdx] = useState(0);

  // Playback timer effect
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onTimeChange((prevTime) => {
          if (prevTime >= durationMin) {
            setIsPlaying(false);
            return durationMin;
          }
          return Math.min(durationMin, prevTime + timeStep);
        });
      }, 1000 / playbackSpeed);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, durationMin, timeStep, onTimeChange]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    onTimeChange(0);
  };
  const stepBack = () => onTimeChange(Math.max(0, currentTimeMin - timeStep));
  const stepForward = () => onTimeChange(Math.min(durationMin, currentTimeMin + timeStep));

  // Format minutes into HH:MM string
  const formatTimeHHMM = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const currentStation = crossSections[selectedStationIdx] || crossSections[0] || {};
  const chartData = currentStation?.hydrograph || [];

  return (
    <div className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 flex flex-col md:flex-row items-center gap-4 text-slate-200 text-xs shadow-2xl z-30 select-none">
      
      {/* 1. Flood Propagation Timeline & Playback Bar */}
      <div className="flex-1 w-full space-y-1.5">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[10px] font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>FLOOD PROPAGATION TIMELINE</span>
            </div>
            
            <span className="px-2 py-0.5 bg-slate-900 text-cyan-300 font-mono font-bold border border-slate-700 rounded text-xs">
              Current Time: {formatTimeHHMM(currentTimeMin)} (T+{currentTimeMin} min)
            </span>
          </div>

          {/* Controls: Reset, Step, Play/Pause, Speed Multiplier */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 transition cursor-pointer"
              title="Reset Timeline to 00:00"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={stepBack}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 transition cursor-pointer"
              title="Step -5 min"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={togglePlay}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-cyan-900/40 text-xs font-mono"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>
            <button
              onClick={stepForward}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 transition cursor-pointer"
              title="Step +5 min"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Speed Multipliers */}
            <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
              {[1, 2, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                    playbackSpeed === s ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Range Slider Track */}
        <div className="relative pt-0.5">
          <input
            type="range"
            min="0"
            max={durationMin}
            step={timeStep}
            value={currentTimeMin}
            onChange={(e) => onTimeChange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-500 border border-slate-700/60"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>00:00 (Breach Initiation)</span>
            <span>01:00</span>
            <span>02:00</span>
            <span>{formatTimeHHMM(durationMin)} (Stabilization)</span>
          </div>
        </div>
      </div>

      {/* 2. Hydrograph Cross-Section Chart Overlay */}
      <div className="w-full md:w-80 h-24 bg-slate-900 border border-slate-800 rounded p-2 flex flex-col justify-between shrink-0">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1 text-slate-400">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold text-slate-200 truncate">{currentStation.name || 'Tailrace Gauge'}</span>
          </div>
          {crossSections.length > 1 && (
            <select
              value={selectedStationIdx}
              onChange={(e) => setSelectedStationIdx(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-slate-300 rounded px-1 text-[10px] cursor-pointer"
            >
              {crossSections.map((cs, idx) => (
                <option key={cs.reach_id} value={idx}>{cs.distance_from_dam_km} km gauge</option>
              ))}
            </select>
          )}
        </div>

        <div className="w-full h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time_min" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '10px', borderRadius: '4px' }}
                labelFormatter={(t) => `T+${t} min`}
                formatter={(val) => [`${val} m³/s`, 'Outflow']}
              />
              <Area type="monotone" dataKey="discharge_cumecs" stroke="#06b6d4" fill="url(#qGrad)" strokeWidth={1.5} />
              <ReferenceLine x={currentTimeMin} stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
