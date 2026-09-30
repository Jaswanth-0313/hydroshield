import React, { useMemo, useState } from 'react';
import { X, BookOpen, Database, Waves, Map, Activity, ShieldCheck, Radar, Users, ChevronRight } from 'lucide-react';

const methodologyStages = [
  {
    id: 'study-area',
    name: 'Study Area Selection',
    purpose: 'Identify the reservoir, catchment, and downstream basin under evaluation.',
    input: 'Dam metadata, river basin, region and boundary selection.',
    processing: 'Filter candidate dams by river, state, and operational context; select the active study area used for scenario analysis.',
    output: 'Active reservoir basin and downstream exposure zone for analysis.',
    technology: 'HYDROSHIELD GIS dataset + study-area selector',
    icon: Map
  },
  {
    id: 'data-prep',
    name: 'Data Preparation',
    purpose: 'Assemble terrain, hydrology, infrastructure, and population inputs for the event model.',
    input: 'DEM, river geometry, roads, buildings, villages, and reservoir characteristics.',
    processing: 'Validate geometry, normalize coordinates, and prepare GIS layers for downstream flood analysis.',
    output: 'Structured geospatial and hydraulic datasets for simulation inputs.',
    technology: 'GeoJSON + reservoir metadata + GIS preprocessing',
    icon: Database
  },
  {
    id: 'breach',
    name: 'Dam & Breach Scenario',
    purpose: 'Define the breach parameters and reservoir conditions that generate the flood wave.',
    input: 'Reservoir level, breach width, formation time, depth, and failure mode.',
    processing: 'Combine dam geometry with breach equations and scenario presets to estimate outflow hydrograph.',
    output: 'Initial breach hydrograph and dam-failure boundary conditions.',
    technology: 'Froehlich peak-discharge relationship + scenario presets',
    icon: Activity
  },
  {
    id: 'hydrodynamic',
    name: 'Hydrodynamic Model',
    purpose: 'Translate the breach hydrograph into a physically based flood propagation model.',
    input: 'DEM + river geometry + dam/breach parameters + roughness and slope inputs.',
    processing: 'Physics-based flood routing through shallow water and flow propagation calculations.',
    output: 'Depth, velocity, arrival time, and flood extent fields over time.',
    technology: 'Demo engine / Delft3D-style shallow-water simulation approach',
    icon: Waves
  },
  {
    id: 'risk',
    name: 'Risk & Vulnerability',
    purpose: 'Translate modeled hazard into emergency consequence and prioritization layers.',
    input: 'Depth, velocity, arrival time, population, and vulnerability characteristics.',
    processing: 'Compute hazard, exposure, and vulnerability contributions to generate a composite risk score.',
    output: 'Risk map and community prioritization metrics for decision support.',
    technology: 'DEFRA-style hazard rating + composite risk model',
    icon: ShieldCheck
  },
  {
    id: 'evacuation',
    name: 'Evacuation Decision Support',
    purpose: 'Identify impacted communities and determine practical safe relocation routes.',
    input: 'Villages, shelters, road network, flood depth, and time-to-arrival.',
    processing: 'Filter impassable roads, rank communities by urgency, and identify shelter allocation and route options.',
    output: 'Priority evacuation list and recommended route guidance.',
    technology: 'Network analysis + GIS route optimization',
    icon: Users
  },
  {
    id: 'benchmarking',
    name: 'Model Benchmarking',
    purpose: 'Compare model outputs against available reference information and other solvers.',
    input: 'Simulation outputs from multiple model configurations and reference datasets.',
    processing: 'Compare hydrographs, inundation extents, and validation metrics from multiple solvers.',
    output: 'Quantitative benchmark summary for dispersion, error, and overlap metrics.',
    technology: 'Model comparison dashboard + validation metrics',
    icon: Radar
  },
  {
    id: 'ai',
    name: 'AI Risk Intelligence',
    purpose: 'Detect patterns and estimate community severity using structured risk attributes.',
    input: 'Hydraulic depth, exposure, vulnerable population, and hazard features.',
    processing: 'Apply an interpretable rule-based or trained model to classify risk levels and highlight drivers.',
    output: 'Risk prediction and feature-importance explanation for emergency officers.',
    technology: 'ML risk-classification pipeline + explainability layer',
    icon: BookOpen
  },
  {
    id: 'validation',
    name: 'Satellite SAR Validation',
    purpose: 'Assess the realism of modeled flood extent using reference data and benchmark products.',
    input: 'Observed flood footprint and simulated inundation polygon.',
    processing: 'Compare modelled and observed extents, compute IoU and error metrics.',
    output: 'Validation score and SAR-consistency assessment.',
    technology: 'Reference flood benchmark + overlap statistics',
    icon: Radar
  },
  {
    id: 'results',
    name: 'Results & Reporting',
    purpose: 'Package the full emergency decision support output into operational reporting.',
    input: 'Flood map, risk layer, safety recommendations, and emergency data package.',
    processing: 'Generate GIS summaries, dashboard packs, and EAP-ready documentation.',
    output: 'Emergency bulletin, flood map, risk report, and action plan.',
    technology: 'HYDROSHIELD reporting and case-pack generation',
    icon: ShieldCheck
  }
];

export default function RiskFormulaModal({ isOpen, onClose }) {
  const [selectedStage, setSelectedStage] = useState(methodologyStages[0]);

  const selectedDetail = useMemo(() => {
    return methodologyStages.find((stage) => stage.id === selectedStage.id) || methodologyStages[0];
  }, [selectedStage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl text-slate-200">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">HYDROSHIELD Methodology</h2>
              <p className="text-xs text-slate-400">Project-specific emergency modeling workflow and technical pipeline</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.5fr] max-h-[78vh] overflow-hidden">
          <div className="border-r border-slate-800 bg-slate-950/60 overflow-y-auto p-4">
            <div className="space-y-3">
              {methodologyStages.map((stage) => {
                const Icon = stage.icon;
                const active = selectedDetail.id === stage.id;

                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      active
                        ? 'border-cyan-500 bg-cyan-950/30 text-cyan-100'
                        : 'border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${active ? 'bg-cyan-900/60 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{stage.name}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-y-auto p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300">
                <selectedDetail.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedDetail.name}</h3>
                <p className="text-xs text-slate-400">HYDROSHIELD operational workflow</p>
              </div>
            </div>

            <div className="p-3.5 bg-cyan-950/30 border border-cyan-800 rounded-lg text-xs text-cyan-100">
              <span className="font-semibold">Purpose:</span> {selectedDetail.purpose}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Input</div>
                <p className="text-slate-200">{selectedDetail.input}</p>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Processing</div>
                <p className="text-slate-200">{selectedDetail.processing}</p>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Output</div>
                <p className="text-slate-200">{selectedDetail.output}</p>
              </div>
              <div className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-2">Technology</div>
                <p className="text-slate-200">{selectedDetail.technology}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
              <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wide mb-2">Scientific framing</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                HYDROSHIELD uses the actual project architecture in this repository: GIS data layers, dam metadata, hydrograph and inundation simulation logic, exposure analysis, risk scoring, evacuation ranking, and model benchmarking. Where a capability is demonstrative or simulation-based, it is clearly labeled as such rather than presented as a live operational system.
              </p>
            </div>

            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-2">
              <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wide">Representative equations</h4>
              <div className="bg-slate-950/80 border border-slate-800 rounded p-3 text-xs font-mono text-cyan-300 leading-6">
                HR = d × (v + 0.5) + DF<br />
                Total Risk = 0.40 × Hazard + 0.30 × Vulnerability + 0.30 × Exposure<br />
                Q_peak = 0.607 × V_w^0.295 × h_w^1.24
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900">
          <button onClick={onClose} className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer">
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
}
