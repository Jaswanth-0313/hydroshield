import React, { useState, useEffect } from 'react';
import { MapPin, Waves, Loader, CheckCircle2, SearchX } from 'lucide-react';
import { fetchDams } from '../services/api';
import { useWorkflow } from '../WorkflowContext';

export default function Step1StudyArea({ onDamSelected }) {
  const [dams, setDams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { completeStep, workflowData } = useWorkflow();
  const selectedDamId = workflowData?.selectedDamId || null;

  useEffect(() => {
    const loadDams = async () => {
      try {
        const damList = await fetchDams();
        setDams(Array.isArray(damList) ? damList : []);
      } catch (err) {
        console.error('Failed to load dams:', err);
        setDams([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadDams();
  }, []);

  const filteredDams = dams.filter((dam) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return [dam.name, dam.river, dam.state, dam.district]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  const handleSelectDam = (dam) => {
    onDamSelected(dam.id);
    completeStep({ selectedDamId: dam.id });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      <div className="p-8 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <h1 className="text-3xl font-bold text-white mb-2">SELECT STUDY AREA</h1>
        <p className="text-slate-400">Choose a dam and downstream river basin for inundation analysis.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Search dam or river..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-slate-400">Loading available study areas...</p>
            </div>
          </div>
        ) : filteredDams.length === 0 ? (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-slate-700 bg-slate-900/60 text-center">
            <SearchX className="w-10 h-10 text-slate-500 mb-3" />
            <p className="text-slate-300 text-lg font-medium">No matching dam or river found.</p>
            <p className="text-slate-500 mt-1">Try a different name, river, or state such as Idukki, Periyar, Kerala, Hirakud, or Mahanadi.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDams.map((dam) => {
              const isSelected = selectedDamId === dam.id;
              const capacity = dam.reservoir_info?.capacity_mcm ?? 'N/A';
              const height = dam.reservoir_info?.dam_height_m ?? 'N/A';

              return (
                <button
                  key={dam.id}
                  onClick={() => handleSelectDam(dam)}
                  className={`p-6 rounded-xl border text-left transition-all group ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-950/30 shadow-lg shadow-cyan-900/20'
                      : 'border-slate-800 bg-slate-900 hover:border-cyan-600 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">
                        {dam.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Waves className="w-4 h-4" />
                          {dam.river}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {dam.state}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500 bg-cyan-950 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-300">
                        <CheckCircle2 className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-t border-slate-800 pt-4">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Capacity</div>
                      <div className="text-sm font-bold text-slate-200">{capacity} MCM</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide">Height</div>
                      <div className="text-sm font-bold text-slate-200">{height} m</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${dam.data_available !== false ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      {dam.data_available !== false ? 'Data Available' : 'Demo Data Mode'}
                    </div>
                    <span className={`rounded-lg px-3 py-1.5 font-semibold ${
                      isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'
                    }`}>
                      {isSelected ? 'Selected' : 'Select'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
