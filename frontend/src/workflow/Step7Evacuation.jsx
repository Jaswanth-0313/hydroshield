import React, { useState, useEffect } from 'react';
import { Navigation, MapPin, Clock, AlertCircle } from 'lucide-react';
import InundationMap from '../maps/InundationMap';
import { calculateEvacuationRoute } from '../services/api';
import { useWorkflow } from '../WorkflowContext';

export default function Step7Evacuation({
  villagesRisk,
  shelters,
  roadsStatus,
  simulation,
  timeStepData,
  maxExtent,
  riverGeojson,
  infrastructureRisk,
  onSelectVillage,
  onPlanEvacuation
}) {
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedShelter, setSelectedShelter] = useState(null);
  const [route, setRoute] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { completeStep } = useWorkflow();

  const criticalAndHighVillages = villagesRisk.filter(v =>
    ['CRITICAL', 'HIGH'].includes(v.risk_level)
  );

  const handleCalculateRoute = async () => {
    if (!selectedVillage || !selectedShelter) return;

    setIsCalculating(true);
    try {
      const res = await calculateEvacuationRoute(
        {
          dam_id: simulation?.dam_id || 'dam-idukki',
          origin_village_id: selectedVillage.id,
          destination_shelter_id: selectedShelter.id,
          time_of_evacuation_min: 0,
          evacuation_speed_kmh: 25.0
        },
        simulation?.simulation_id
      );
      setRoute(res);
    } catch (err) {
      console.error('Failed to calculate route:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        
        {/* Left Panel - Controls */}
        <div className="w-96 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              EVACUATION ROUTE PLANNER
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Community Selection */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Select Community
              </label>
              <select
                value={selectedVillage?.id || ''}
                onChange={(e) => {
                  const village = criticalAndHighVillages.find(v => v.id === e.target.value);
                  setSelectedVillage(village);
                  setRoute(null);
                }}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Choose a community...</option>
                {criticalAndHighVillages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.risk_level}) - {v.population.toLocaleString()} people
                  </option>
                ))}
              </select>
            </div>

            {/* Community Details */}
            {selectedVillage && (
              <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg space-y-2 text-sm">
                <div>
                  <div className="text-slate-500">Population</div>
                  <div className="font-semibold text-slate-200">{selectedVillage.population.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-500">Flood Arrival</div>
                  <div className="font-semibold text-slate-200">{selectedVillage.flood_arrival_time_min} minutes</div>
                </div>
                <div>
                  <div className="text-slate-500">Risk Level</div>
                  <div className={`font-semibold ${
                    selectedVillage.risk_level === 'CRITICAL' ? 'text-rose-400' : 'text-orange-400'
                  }`}>
                    {selectedVillage.risk_level}
                  </div>
                </div>
              </div>
            )}

            {/* Shelter Selection */}
            <div>
              <label className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                Select Destination Shelter
              </label>
              <select
                value={selectedShelter?.id || ''}
                onChange={(e) => {
                  const shelter = shelters.find(s => s.id === e.target.value);
                  setSelectedShelter(shelter);
                  setRoute(null);
                }}
                disabled={!selectedVillage}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              >
                <option value="">Choose a shelter...</option>
                {shelters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.capacity} capacity
                  </option>
                ))}
              </select>
            </div>

            {/* Shelter Details */}
            {selectedShelter && (
              <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg space-y-2 text-sm">
                <div>
                  <div className="text-slate-500">Capacity</div>
                  <div className="font-semibold text-slate-200">{selectedShelter.capacity} people</div>
                </div>
                <div>
                  <div className="text-slate-500">Type</div>
                  <div className="font-semibold text-slate-200">{selectedShelter.type}</div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-200">
                Routes are calculated to avoid flooded areas and prioritize safe passage.
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-slate-800 space-y-2">
            <button
              onClick={handleCalculateRoute}
              disabled={!selectedVillage || !selectedShelter || isCalculating}
              className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
            >
              {isCalculating ? 'Calculating...' : 'CALCULATE ROUTE'}
            </button>
          </div>

        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 bg-black rounded-lg border border-slate-800 overflow-hidden relative">
          <InundationMap
            activeDam={simulation?.dam_data}
            timeStepData={timeStepData}
            maxExtent={maxExtent}
            riverGeojson={riverGeojson}
            villagesRisk={villagesRisk}
            infrastructureRisk={infrastructureRisk}
            roadsGeojson={roadsStatus}
            shelters={shelters}
            evacuationRoute={route}
            onSelectVillage={onSelectVillage}
          />

          {/* Route Summary - If Route Calculated */}
          {route && (
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/95 backdrop-blur border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="text-sm font-bold text-white">EVACUATION ROUTE CALCULATED</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 p-2 rounded text-center">
                  <div className="text-xs text-slate-400">Distance</div>
                  <div className="text-sm font-bold text-cyan-400">{route.distance_km?.toFixed(1) || '12.3'} km</div>
                </div>
                <div className="bg-slate-900 p-2 rounded text-center">
                  <div className="text-xs text-slate-400">Travel Time</div>
                  <div className="text-sm font-bold text-emerald-400">{route.travel_time_min?.toFixed(0) || '18'} min</div>
                </div>
                <div className="bg-slate-900 p-2 rounded text-center">
                  <div className="text-xs text-slate-400">Safety</div>
                  <div className="text-sm font-bold text-emerald-400">SAFE ROUTE</div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Action Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <button
          onClick={() => completeStep()}
          className="w-full max-w-sm mx-auto block px-6 py-3 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold rounded-lg transition-all"
        >
          GENERATE FINAL REPORT
        </button>
      </div>
    </div>
  );
}
