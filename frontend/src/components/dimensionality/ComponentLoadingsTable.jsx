import React, { useState } from 'react';
import { Table, ArrowUpDown, Info, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

export const ComponentLoadingsTable = ({ loadings = {}, componentNames = [] }) => {
  const [selectedSortComp, setSelectedSortComp] = useState(componentNames[0] || 'PC_1');
  const [sortAsc, setSortAsc] = useState(false);

  if (!loadings || Object.keys(loadings).length === 0 || componentNames.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
        Simulate subspace to inspect feature loadings and eigenvector coefficients.
      </div>
    );
  }

  // Get list of original features from the first component's loadings
  const sampleComp = componentNames[0];
  const featureNames = Object.keys(loadings[sampleComp] || {});

  // Sort features by absolute loading on selected component
  const sortedFeatures = [...featureNames].sort((a, b) => {
    const valA = loadings[selectedSortComp]?.[a] || 0;
    const valB = loadings[selectedSortComp]?.[b] || 0;
    return sortAsc ? valA - valB : valB - valA;
  });

  const getWeightStyle = (val) => {
    const abs = Math.abs(val);
    if (abs > 0.4) {
      return val > 0 
        ? 'bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30' 
        : 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30';
    }
    if (abs > 0.2) {
      return val > 0 ? 'text-brand-400' : 'text-rose-400';
    }
    return 'text-slate-500';
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Component Loadings (Eigenvector Weights)
            </h4>
            <p className="text-[11px] text-slate-400">
              Reveals which original features contribute most strongly to each principal dimension
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort by:</span>
          <select
            value={selectedSortComp}
            onChange={(e) => setSelectedSortComp(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none"
          >
            {componentNames.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loadings Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-semibold text-slate-300">Original Feature</th>
              {componentNames.map((comp) => (
                <th 
                  key={comp} 
                  className={`py-2.5 px-3 text-center ${
                    comp === selectedSortComp ? 'text-brand-300 bg-brand-500/10' : 'text-slate-400'
                  }`}
                >
                  {comp}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sortedFeatures.map((feat) => (
              <tr key={feat} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2 px-4 font-semibold text-slate-200">
                  {feat}
                </td>
                {componentNames.map((comp) => {
                  const val = loadings[comp]?.[feat] !== undefined ? loadings[comp][feat] : 0;
                  return (
                    <td 
                      key={comp} 
                      className={`py-2 px-3 text-center ${
                        comp === selectedSortComp ? 'bg-slate-900/30' : ''
                      }`}
                    >
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${getWeightStyle(val)}`}>
                        {val >= 0 ? `+${val.toFixed(3)}` : val.toFixed(3)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explanatory Helper Note */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Info className="w-3.5 h-3.5 text-brand-400" /> How to Interpret Loadings:
        </div>
        <p className="leading-relaxed">
          Loadings range between <strong className="text-slate-200">-1.0 and +1.0</strong>. A loading near <strong>±1.0</strong> indicates that the original feature heavily dictates that principal component axis. Loadings near <strong>0.0</strong> indicate negligible influence. If multiple features load strongly in the same direction, they move together in that component.
        </p>
      </div>
    </div>
  );
};

export default ComponentLoadingsTable;
