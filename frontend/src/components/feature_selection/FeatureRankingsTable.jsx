import React, { useState } from 'react';
import { Table, CheckCircle2, XCircle, ArrowUpDown, Info } from 'lucide-react';
import Badge from '../common/Badge';

export const FeatureRankingsTable = ({ featureScores = [], k = 3, scoringFunc = 'f_classif' }) => {
  const [filterSelectedOnly, setFilterSelectedOnly] = useState(false);

  if (!featureScores || featureScores.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
        Simulate feature selection to inspect detailed statistical scores and significance metrics.
      </div>
    );
  }

  const displayedScores = filterSelectedOnly 
    ? featureScores.filter(f => f.selected)
    : featureScores;

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
              Feature Statistical Significance Table
            </h4>
            <p className="text-[11px] text-slate-400">
              Computed via {scoringFunc} hypothesis testing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSelectedOnly(!filterSelectedOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filterSelectedOnly 
                ? 'bg-brand-500/20 text-brand-300 border-brand-500/30' 
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {filterSelectedOnly ? 'Showing Selected Only' : 'Show All Features'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-4">Feature Name</th>
              <th className="py-2.5 px-3 text-right">Statistical Score</th>
              <th className="py-2.5 px-3 text-right">p-Value</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {displayedScores.map((row) => (
              <tr 
                key={row.feature} 
                className={`transition-colors ${
                  row.selected ? 'bg-brand-950/10 hover:bg-brand-950/20' : 'hover:bg-slate-900/40 opacity-70'
                }`}
              >
                <td className="py-2.5 px-3 font-bold text-slate-400">
                  #{row.rank}
                </td>
                <td className="py-2.5 px-4 font-semibold text-white">
                  {row.feature}
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-brand-300">
                  {row.score.toFixed(4)}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {row.p_value !== null && row.p_value !== undefined ? (
                    <span className={row.p_value < 0.05 ? 'text-brand-400 font-bold' : 'text-slate-500'}>
                      {row.p_value < 0.0001 ? '< 0.0001' : row.p_value.toFixed(6)}
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-center">
                  {row.selected ? (
                    <Badge variant="brand">Retained</Badge>
                  ) : (
                    <Badge variant="default">Dropped</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Info className="w-3.5 h-3.5 text-brand-400" /> Significance Thresholds:
        </div>
        <p className="leading-relaxed">
          Features with <strong className="text-brand-400 font-mono">p &lt; 0.05</strong> demonstrate statistically significant predictive separation under the null hypothesis. Features with higher p-values contribute primarily noise.
        </p>
      </div>
    </div>
  );
};

export default FeatureRankingsTable;
