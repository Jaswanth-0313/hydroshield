import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  Compass,
  ArrowRight,
  Info,
  ShieldAlert,
  Route,
  Zap
} from 'lucide-react';
import InundationMap from '../maps/InundationMap';

export default function EvacuationPage({
  dams,
  activeDam,
  villagesRisk = [],
  shelters = [],
  roadsStatus,
  riverGeojson,
  timeStepData,
  maxExtent,
  evacuationRoute,
  onCalculateRoute,
  preselectedVillageId
}) {
  const [selectedVillageId, setSelectedVillageId] = useState(
    preselectedVillageId || villagesRisk[0]?.id || 'vil-idk-01'
  );
  const [convoySpeed, setConvoySpeed] = useState(25.0); // km/h
  const [departureTime, setDepartureTime] = useState(0.0); // minutes after breach

  useEffect(() => {
    if (preselectedVillageId) {
      setSelectedVillageId(preselectedVillageId);
    }
  }, [preselectedVillageId]);

  const handleComputeRoute = () => {
    onCalculateRoute({
      dam_id: activeDam?.id || 'dam-idukki',
      origin_village_id: selectedVillageId,
      time_of_evacuation_min: Number(departureTime),
      evacuation_speed_kmh: Number(convoySpeed)
    });
  };

  const selectedVillage = villagesRisk.find(v => v.id === selectedVillageId) || villagesRisk[0];
  const routeData = evacuationRoute;
  const isSafe = routeData?.safety_status === 'SAFE_ROUTE';
  const isCaution = routeData?.safety_status === 'CAUTION_ROUTE';
  const isImpassable = routeData?.safety_status === 'IMPASSABLE_FLOODED';

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-84px)] bg-slate-950 overflow-hidden text-slate-200 text-xs select-none">
      
      {/* Left Control & Route Direction Panel */}
      <div className="w-full md:w-96 bg-slate-950 border-r border-slate-800 flex flex-col h-full overflow-y-auto p-4 space-y-4 font-mono">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-3 space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-900 border border-slate-700 text-cyan-400 rounded">
              <Navigation className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white uppercase tracking-tight">
              EVACUATION ROUTE DECISION SUPPORT
            </h2>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            NetworkX Dijkstra graph router with dynamic flood impedance penalties (&gt;0.3m depth)
          </p>
        </div>

        {/* 1. Origin Community Selection */}
        <div className="space-y-1">
          <label className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            1. Origin Community
          </label>
          <select
            value={selectedVillageId}
            onChange={(e) => setSelectedVillageId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded p-2 text-xs focus:ring-1 focus:ring-cyan-500 cursor-pointer"
          >
            {villagesRisk.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.population?.toLocaleString()} pop | {v.risk_level})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Convoy Parameters */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-slate-400 text-[10px]">Convoy Speed (km/h):</label>
            <input
              type="number"
              min="5"
              max="60"
              value={convoySpeed}
              onChange={(e) => setConvoySpeed(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded p-1.5 text-xs focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 text-[10px]">Departure Offset (min):</label>
            <input
              type="number"
              min="0"
              max="120"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded p-1.5 text-xs focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Compute Action Button */}
        <button
          onClick={handleComputeRoute}
          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs transition cursor-pointer shadow-md shadow-cyan-900/30 flex items-center justify-center gap-1.5"
        >
          <Route className="w-4 h-4" />
          <span>CALCULATE SAFEST ESCAPE PATH</span>
        </button>

        {/* 3. Evacuation Telemetry Status Capsule */}
        {routeData && (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-2 text-[11px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400 font-bold uppercase text-[10px]">ROUTE SAFETY STATUS</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isSafe 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                  : isCaution 
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-rose-950 text-rose-300 border-rose-800'
              }`}>
                {isSafe ? 'SAFE ESCAPE PATH' : isCaution ? 'CAUTION: TIGHT HEADWAY' : 'NO SAFE ROUTE (IMPASSABLE)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-slate-400 text-[10px] block">TOTAL DISTANCE</span>
                <strong className="text-cyan-300">{routeData.total_distance_km} km</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ESTIMATED TRAVEL</span>
                <strong className="text-cyan-300">{routeData.total_travel_time_min} min</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">SAFETY HEADWAY</span>
                <strong className={routeData.time_headway_min > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {routeData.time_headway_min > 0 ? `+${routeData.time_headway_min} min` : `${routeData.time_headway_min} min (CUTOFF)`}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">SHELTER ELEVATION</span>
                <strong className="text-slate-200">{routeData.destination_shelter?.elevation_m || 650} m MSL</strong>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-800">
              <span className="text-slate-400 text-[10px] block">DESTINATION SHELTER:</span>
              <span className="font-bold text-emerald-400 text-xs">
                🛡️ {routeData.destination_shelter?.name || 'High-Ground Disaster Relief Center'}
              </span>
            </div>
          </div>
        )}

        {/* 4. Turn-by-Turn Guidance Steps */}
        {routeData?.steps && routeData.steps.length > 0 && (
          <div className="space-y-1.5 flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              TURN-BY-TURN EMERGENCY GUIDANCE
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {routeData.steps.map((step, idx) => (
                <div key={idx} className="p-2 bg-slate-900 border border-slate-800 rounded flex items-start gap-2 text-[10px]">
                  <span className="w-4 h-4 rounded bg-slate-800 flex items-center justify-center font-bold text-cyan-400 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="text-slate-200 font-semibold">{step.instruction}</div>
                    <div className="text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{step.road_name}</span>
                      <span>•</span>
                      <span>{step.distance_km} km ({step.estimated_time_min}m)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Right Map View */}
      <div className="flex-1 h-full relative">
        <InundationMap
          activeDam={activeDam}
          timeStepData={timeStepData}
          maxExtent={maxExtent}
          riverGeojson={riverGeojson}
          villagesRisk={villagesRisk}
          roadsGeojson={roadsStatus?.roads_geojson}
          shelters={shelters}
          evacuationRoute={routeData}
        />
      </div>

    </div>
  );
}
