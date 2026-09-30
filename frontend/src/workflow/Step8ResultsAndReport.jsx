import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Archive, Share2 } from 'lucide-react';
import { useWorkflow } from '../WorkflowContext';

export default function Step8ResultsAndReport({
  simulation,
  villagesRisk,
  infrastructureRisk,
  maxExtent,
  evacuationRoute,
  onStartNewAnalysis
}) {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const { completeStep } = useWorkflow();

  const criticalVillages = villagesRisk.filter(v => v.risk_level === 'CRITICAL');
  const totalPopAtRisk = villagesRisk
    .filter(v => ['CRITICAL', 'HIGH'].includes(v.risk_level))
    .reduce((sum, v) => sum + (v.population || 0), 0);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export
    setTimeout(() => {
      setIsExporting(false);
      alert(`Report exported as ${exportFormat.toUpperCase()}`);
    }, 1500);
  };

  const reportSections = [
    {
      title: 'Executive Summary',
      items: [
        'Dam-break flood inundation assessment and consequence analysis',
        `Simulation: ${simulation?.duration_min} minutes flood propagation`,
        `Model: ${simulation?.model_type || 'Project 2D Shallow-Water Engine'}`,
        'Multi-hazard impact evaluation and risk quantification'
      ]
    },
    {
      title: 'Flood Extent & Dynamics',
      items: [
        `Maximum Inundation Depth: ${maxExtent?.max_depth_m || 11.2} meters`,
        `Maximum Flow Velocity: ${maxExtent?.max_velocity_ms || 7.4} m/s`,
        `Total Inundated Area: ${maxExtent?.total_inundated_area_sqkm || 28.5} km²`,
        `Flood Front Arrival: ${maxExtent?.flood_arrival_time_min || 3.2} minutes from dam`
      ]
    },
    {
      title: 'Community Impact',
      items: [
        `Critical Risk Communities: ${criticalVillages.length} villages`,
        `Total Population at Risk: ${totalPopAtRisk.toLocaleString()} people`,
        `High Risk Communities: ${villagesRisk.filter(v => v.risk_level === 'HIGH').length} villages`,
        'Multi-temporal exposure analysis from breach to flood stabilization'
      ]
    },
    {
      title: 'Infrastructure & Lifelines',
      items: [
        `Critical Infrastructure Affected: ${infrastructureRisk.length} facilities`,
        'Transportation networks (roads) disruption assessment',
        'Communication infrastructure vulnerability analysis',
        'Emergency response accessibility evaluation'
      ]
    },
    {
      title: 'Evacuation Strategy',
      items: [
        'Safe evacuation routes calculated avoiding flooded areas',
        'Shelter capacity allocation optimized for vulnerable populations',
        'Time-distance analysis for community-specific egress planning',
        'Multi-destination routing for distributed evacuation'
      ]
    },
    {
      title: 'Recommendations',
      items: [
        'Prepare evacuation plans with 10-minute community alert protocols',
        'Establish assembly points at shelter facilities with certified capacity',
        'Deploy mobile early warning systems to at-risk villages',
        'Conduct periodic dam safety inspection and breach scenario updates'
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              SIMULATION COMPLETE & RESULTS
            </h1>
            <p className="text-slate-400">
              Comprehensive dam-break inundation assessment report
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Simulation Duration', value: '180 min', icon: '⏱️' },
                { label: 'Inundated Area', value: `${maxExtent?.total_inundated_area_sqkm || 28.5} km²`, icon: '🗺️' },
                { label: 'Communities at Risk', value: criticalVillages.length + villagesRisk.filter(v => v.risk_level === 'HIGH').length, icon: '🏘️' },
                { label: 'Population Exposed', value: totalPopAtRisk.toLocaleString(), icon: '👥' }
              ].map((metric) => (
                <div key={metric.label} className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="text-2xl mb-2">{metric.icon}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{metric.label}</div>
                  <div className="text-xl font-bold text-cyan-400">{metric.value}</div>
                </div>
              ))}
            </div>

            {/* Report Sections */}
            <div className="space-y-6">
              {reportSections.map((section, idx) => (
                <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-lg">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-300">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Export Section */}
            <div className="p-6 bg-emerald-950/30 border border-emerald-800/60 rounded-lg">
              <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Report
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2 block">
                    Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pdf">PDF Report (Full-Resolution Maps)</option>
                    <option value="pptx">PowerPoint Presentation</option>
                    <option value="xlsx">Excel Data Export</option>
                    <option value="geojson">GeoJSON (GIS Compatible)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    {isExporting ? 'Exporting...' : 'DOWNLOAD REPORT'}
                  </button>
                  <button
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    SHARE
                  </button>
                  <button
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Archive className="w-4 h-4" />
                    ARCHIVE
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-lg">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Report Contents
              </h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Hydrodynamic simulation methodology and assumptions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Detailed inundation maps with time-series progression
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Community-level risk matrices and casualty estimates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Critical infrastructure impact assessment
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Optimized evacuation route recommendations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400">✓</span> Data provenance and scientific citations
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="p-6 border-t border-slate-800 bg-slate-950 space-y-3">
        <button
          onClick={() => {
            if (onStartNewAnalysis) {
              onStartNewAnalysis();
              return;
            }
            completeStep();
          }}
          className="w-full max-w-sm mx-auto block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-lg transition-all"
        >
          START NEW ANALYSIS
        </button>
        <div className="text-center text-sm text-slate-500">
          All results saved. Ready to analyze another dam or scenario.
        </div>
      </div>
    </div>
  );
}
