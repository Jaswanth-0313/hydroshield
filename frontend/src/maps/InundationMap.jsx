import React, { useEffect, useRef, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  GeoJSON, 
  Marker, 
  Popup, 
  CircleMarker, 
  Polyline, 
  ScaleControl,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Building2, 
  Navigation, 
  AlertTriangle,
  Compass,
  Maximize2,
  Minimize2,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';

// Fix standard leaflet icon assets
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Dam Icon
const damIcon = L.divIcon({
  className: 'custom-dam-marker',
  html: `<div style="background-color: #0284c7; border: 2px solid #ffffff; width: 26px; height: 26px; border-radius: 4px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(2, 132, 199, 0.8);">
          <span style="font-size: 13px;">🌊</span>
        </div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

// Custom Shelter Icon
const shelterIcon = L.divIcon({
  className: 'custom-shelter-marker',
  html: `<div style="background-color: #10b981; border: 2px solid #ffffff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);">
          <span style="font-size: 12px;">🛡️</span>
        </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Helper component to auto-recenter map when active dam changes
function MapController({ center, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const hasValidBounds = Array.isArray(bounds) &&
      bounds.length === 2 &&
      Array.isArray(bounds[0]) &&
      Array.isArray(bounds[1]) &&
      Number.isFinite(bounds[0][0]) &&
      Number.isFinite(bounds[0][1]) &&
      Number.isFinite(bounds[1][0]) &&
      Number.isFinite(bounds[1][1]);

    if (hasValidBounds) {
      map.fitBounds(bounds, { padding: [30, 30] });
      return;
    }

    if (Array.isArray(center) && center.length === 2 && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      map.setView(center, 12);
    }
  }, [center, bounds, map]);
  return null;
}

// Custom map action controls
function MapCustomControls({ onResetView, onZoomIn, onZoomOut, isFullscreen, onToggleFullscreen }) {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded p-1 shadow-xl backdrop-blur select-none">
      <button
        onClick={onZoomIn}
        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition cursor-pointer"
        title="Zoom In"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition cursor-pointer"
        title="Zoom Out"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <div className="w-full h-px bg-slate-800" />
      <button
        onClick={onResetView}
        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition cursor-pointer"
        title="Reset Study Area View"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onToggleFullscreen}
        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition cursor-pointer"
        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function InundationMap({
  activeDam,
  timeStepData,
  maxExtent,
  riverGeojson,
  villagesRisk = [],
  infrastructureRisk = [],
  roadsGeojson,
  shelters = [],
  evacuationRoute,
  onSelectVillage,
  onPlanEvacuation
}) {
  const [layers, setLayers] = useState({
    floodExtent: true,
    depthPoints: true,
    river: true,
    villages: true,
    roads: true,
    infrastructure: true,
    shelters: true,
    evacRoute: true,
  });

  const [mapStyle, setMapStyle] = useState('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef(null);

  const toggleLayer = (layerName) => {
    setLayers((prev) => ({ ...prev, [layerName]: !prev[layerName] }));
  };

  const fallbackLocation = { lat: 9.8497, lng: 76.9722 };
  const damLocation = activeDam?.location &&
    Number.isFinite(activeDam.location.lat) &&
    Number.isFinite(activeDam.location.lng)
    ? activeDam.location
    : fallbackLocation;

  const centerPos = [damLocation.lat, damLocation.lng];
  const bounds = Array.isArray(activeDam?.study_area_bounds) && activeDam.study_area_bounds.length === 2 &&
    Array.isArray(activeDam.study_area_bounds[0]) && Array.isArray(activeDam.study_area_bounds[1])
    ? activeDam.study_area_bounds
    : null;

  const handleResetView = () => {
    if (mapRef.current) {
      if (bounds && bounds.length === 2) {
        mapRef.current.fitBounds(bounds, { padding: [30, 30] });
      } else {
        mapRef.current.setView(centerPos, 12);
      }
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Village marker color based on DEFRA risk level
  const getVillageColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return '#f43f5e';
      case 'HIGH': return '#f97316';
      case 'MODERATE': return '#eab308';
      default: return '#10b981';
    }
  };

  return (
    <div className={`relative w-full h-full bg-slate-950 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      
      <MapContainer
        center={centerPos}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
        ref={mapRef}
      >
        <MapController center={centerPos} bounds={bounds} />
        <ScaleControl position="bottomleft" imperial={false} />

        {/* Base Tile Layer */}
        {mapStyle === 'dark' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            fallbackUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {mapStyle === 'streets' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        {mapStyle === 'satellite' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://www.usgs.gov/">USGS</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            fallbackUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* 1. River Centerline Layer */}
        {layers.river && riverGeojson && (
          <GeoJSON
            key={`river-${activeDam?.id}`}
            data={riverGeojson}
            style={{
              color: '#06b6d4',
              weight: 3,
              opacity: 0.85,
              dashArray: '3 3'
            }}
          />
        )}

        {/* 2. Dynamic Time-Step Flood Inundation Polygon */}
        {layers.floodExtent && timeStepData?.inundation_polygon && (
          <GeoJSON
            key={`inundation-${timeStepData.time_min}-${activeDam?.id}`}
            data={timeStepData.inundation_polygon}
            style={{
              color: '#0284c7',
              weight: 1.5,
              fillColor: '#38bdf8',
              fillOpacity: 0.55
            }}
          />
        )}

        {/* 3. Road Network with Submerged Status */}
        {layers.roads && roadsGeojson?.features?.map((road, i) => {
          if (!road?.geometry?.coordinates || !Array.isArray(road.geometry.coordinates)) return null;

          const isSubmerged = road.properties?.is_submerged;
          const coords = road.geometry.coordinates
            .filter(Array.isArray)
            .map(c => Array.isArray(c) && c.length >= 2 && Number.isFinite(c[0]) && Number.isFinite(c[1]) ? [c[1], c[0]] : null)
            .filter(Boolean);

          if (coords.length === 0) return null;

          return (
            <Polyline
              key={`road-${i}-${isSubmerged}`}
              positions={coords}
              pathOptions={{
                color: isSubmerged ? '#f43f5e' : '#10b981',
                weight: isSubmerged ? 3.5 : 2,
                dashArray: isSubmerged ? '5 5' : undefined,
                opacity: 0.85
              }}
            >
              <Popup>
                <div className="text-xs space-y-1 font-mono">
                  <div className="font-bold text-slate-100">{road.properties.name}</div>
                  <div className="text-[11px]">
                    Status: <span className={isSubmerged ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {isSubmerged ? 'SUBMERGED CUTOFF (>0.3m)' : 'PASSABLE'}
                    </span>
                  </div>
                  {isSubmerged && (
                    <div className="text-[10px] text-rose-300">
                      Depth: {road.properties.flood_depth_m}m | Arrival: {road.properties.flood_arrival_time_min}m
                    </div>
                  )}
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 4. Depth & Velocity Spatial Sampling Grid Points */}
        {layers.depthPoints && timeStepData?.depth_points?.features?.map((pt, i) => {
          const depth = pt.properties.depth_m || 0;
          if (depth <= 0.1) return null;
          const [lng, lat] = pt.geometry.coordinates;
          return (
            <CircleMarker
              key={`depth-pt-${i}-${timeStepData.time_min}`}
              center={[lat, lng]}
              radius={Math.min(10, Math.max(4, depth * 1.2))}
              pathOptions={{
                fillColor: depth > 5 ? '#e11d48' : depth > 2.5 ? '#f59e0b' : '#06b6d4',
                fillOpacity: 0.75,
                color: '#ffffff',
                weight: 1
              }}
            >
              <Popup>
                <div className="text-xs font-mono space-y-0.5">
                  <div className="font-bold text-cyan-300">Hydrodynamic Point Gauge</div>
                  <div>Water Depth: <strong className="text-amber-300">{depth} m</strong></div>
                  <div>Velocity: <strong className="text-cyan-300">{pt.properties.velocity_ms} m/s</strong></div>
                  <div>Arrival: T+{pt.properties.arrival_time_min} min</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 5. Dam Structure Marker */}
        {activeDam?.location && (
          <Marker position={[activeDam.location.lat, activeDam.location.lng]} icon={damIcon}>
            <Popup>
              <div className="text-xs font-mono space-y-1">
                <div className="font-bold text-cyan-400">{activeDam.name}</div>
                <div>Storage: {activeDam.reservoir_info?.capacity_mcm} MCM</div>
                <div>FRL: {activeDam.reservoir_info?.full_reservoir_level_m} m MSL</div>
                <div>Height: {activeDam.reservoir_info?.dam_height_m} m</div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 6. Villages and Communities */}
        {layers.villages && villagesRisk.map((village) => {
          if (!village?.coordinates || !Number.isFinite(village.coordinates.lat) || !Number.isFinite(village.coordinates.lng)) {
            return null;
          }

          const color = getVillageColor(village.risk_level);
          return (
            <CircleMarker
              key={village.id}
              center={[village.coordinates.lat, village.coordinates.lng]}
              radius={8}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.9,
                color: '#ffffff',
                weight: 1.5
              }}
            >
              <Popup>
                <div className="text-xs font-mono space-y-1.5 p-1 min-w-[200px]">
                  <div className="font-bold text-slate-100 flex items-center justify-between border-b border-slate-700 pb-1">
                    <span>{village.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] text-white" style={{ backgroundColor: color }}>
                      {village.risk_level}
                    </span>
                  </div>
                  <div className="space-y-0.5 text-[11px] text-slate-300">
                    <div>Population: <strong>{village.population?.toLocaleString()}</strong></div>
                    <div>Distance from Dam: <strong>{village.distance_from_dam_km} km</strong></div>
                    <div>Wave Arrival: <strong className="text-cyan-300">T+{village.flood_arrival_time_min} min</strong></div>
                    <div>Stage Depth: <strong className="text-amber-300">{village.max_flood_depth_m} m</strong></div>
                    <div>Velocity: <strong className="text-orange-300">{village.max_flow_velocity_ms} m/s</strong></div>
                  </div>
                  {onPlanEvacuation && (
                    <button
                      onClick={() => onPlanEvacuation(village.id)}
                      className="w-full py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-bold mt-1 transition cursor-pointer"
                    >
                      Plan Evacuation Route
                    </button>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* 7. Safe Emergency Shelters */}
        {layers.shelters && shelters.map((sh) => {
          if (!sh?.coordinates || !Number.isFinite(sh.coordinates.lat) || !Number.isFinite(sh.coordinates.lng)) {
            return null;
          }

          return (
            <Marker key={sh.id} position={[sh.coordinates.lat, sh.coordinates.lng]} icon={shelterIcon}>
              <Popup>
                <div className="text-xs font-mono space-y-1">
                  <div className="font-bold text-emerald-400">🛡️ {sh.name}</div>
                  <div>Elevation: <strong className="text-cyan-300">{sh.elevation_m} m MSL</strong></div>
                  <div>Capacity: <strong>{sh.capacity?.toLocaleString()} evacuees</strong></div>
                  <div className="text-emerald-300 font-semibold">Status: SAFE HIGH-GROUND</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 8. Evacuation Route Polyline */}
        {layers.evacRoute && evacuationRoute?.route_geojson && (
          <GeoJSON
            key={`evac-route-${evacuationRoute.origin_village?.id}-${evacuationRoute.total_distance_km}`}
            data={evacuationRoute.route_geojson}
            style={{
              color: '#10b981',
              weight: 4.5,
              opacity: 0.95
            }}
          />
        )}

      </MapContainer>

      {/* Floating Custom Map Control Buttons */}
      <MapCustomControls
        onResetView={handleResetView}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* North Indicator & Map Compass */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 border border-slate-700/80 rounded px-2 py-1 flex items-center gap-1.5 shadow-xl font-mono text-[10px] text-slate-300 backdrop-blur select-none">
        <Compass className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-bold text-cyan-400">N</span>
      </div>

      {/* Layer Visibility Control HUD */}
      <div className="absolute bottom-6 right-3 z-[1000] bg-slate-900/95 border border-slate-800 rounded p-2.5 shadow-2xl backdrop-blur text-xs select-none max-w-xs font-mono">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1 text-cyan-400">
            <Layers className="w-3.5 h-3.5" />
            GIS Layer Controls
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input type="checkbox" checked={layers.floodExtent} onChange={() => toggleLayer('floodExtent')} className="rounded accent-cyan-500" />
            <span>Flood Envelope</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input type="checkbox" checked={layers.depthPoints} onChange={() => toggleLayer('depthPoints')} className="rounded accent-cyan-500" />
            <span>Depth Gauges</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input type="checkbox" checked={layers.villages} onChange={() => toggleLayer('villages')} className="rounded accent-cyan-500" />
            <span>Communities</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input type="checkbox" checked={layers.roads} onChange={() => toggleLayer('roads')} className="rounded accent-cyan-500" />
            <span>Road Cutoffs</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input type="checkbox" checked={layers.shelters} onChange={() => toggleLayer('shelters')} className="rounded accent-cyan-500" />
            <span>Safe Shelters</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
            <input type="checkbox" checked={layers.river} onChange={() => toggleLayer('river')} className="rounded accent-cyan-500" />
            <span>River Axis</span>
          </label>
        </div>

        {/* Base Map Switcher */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800 text-[10px]">
          <span className="text-slate-400">Base Layer:</span>
          <div className="flex gap-1">
            {['dark', 'streets', 'satellite'].map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-1.5 py-0.5 rounded uppercase font-mono ${
                  mapStyle === style ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white bg-slate-800'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Legend HUD */}
      <div className="absolute bottom-6 left-16 z-[1000] bg-slate-900/90 border border-slate-800 rounded p-2.5 shadow-2xl backdrop-blur text-[10px] select-none font-mono text-slate-300 hidden md:block">
        <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Severity Legend</div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical (HR &ge; 2.0)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High (1.25 - 2.0)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (0.75 - 1.25)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low (&lt; 0.75)</span>
        </div>
      </div>

    </div>
  );
}
