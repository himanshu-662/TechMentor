import React, { useState } from 'react';
import { 
  Table, 
  AlertTriangle, 
  Eye, 
  X, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck
} from 'lucide-react';
import Badge from '../common/Badge';

export const OutlierRecords = ({ records = [], column = "", totalFlagged = 0 }) => {
  const [selectedRow, setSelectedRow] = useState(null);

  if (!records || records.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
        <div className="w-10 h-10 mx-auto rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-white">No Outliers Flagged in this Configuration</h4>
        <p className="text-xs text-slate-400">All observations lie comfortably within the computed statistical boundaries.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Educational Notice */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-200">Domain Context Required: </span>
          Statistical detection identifies mathematically unusual observations, but domain expertise is required to determine if they are legitimate rare events or genuine errors.
        </div>
      </div>

      {/* Flagged Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-brand-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Flagged Outlier Records ({records.length} shown of {totalFlagged})
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Showing top extreme entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4 w-16">Row #</th>
                <th className="py-3 px-4 font-semibold text-white">{column} Value</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Score / Distance</th>
                <th className="py-3 px-4">Other Column Values</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {records.map((rec) => (
                <tr key={rec.index} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 text-slate-400 text-[11px] font-medium">
                    #{rec.index + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {typeof rec.value === 'number' ? rec.value.toLocaleString() : String(rec.value)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {rec.direction === 'high' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 font-sans">
                        <ArrowUpRight className="w-3 h-3" /> High Outlier
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans">
                        <ArrowDownRight className="w-3 h-3" /> Low Outlier
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-300 whitespace-nowrap text-[11px]">
                    {rec.score !== null && rec.score !== undefined ? (
                      <span className="text-brand-300">{rec.score > 0 ? `+${rec.score}` : rec.score}</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400 max-w-xs truncate font-sans">
                    {Object.entries(rec.row_data || {})
                      .slice(0, 3)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' | ')}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-sans">
                    <button
                      onClick={() => setSelectedRow(rec)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-brand-400" />
                      Inspect Row
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Inspection Modal */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">Full Row Inspection: Row #{selectedRow.index + 1}</h3>
              </div>
              <button 
                onClick={() => setSelectedRow(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              <span className="font-bold">{column}: </span>
              <span className="font-mono text-white text-sm font-semibold">{selectedRow.value}</span>
              <span className="ml-2">({selectedRow.direction === 'high' ? 'High Outlier' : 'Low Outlier'})</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">All Column Values:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedRow.row_data || {}).map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-400 truncate">{k}</div>
                    <div className="font-mono text-slate-200 truncate">{v !== null ? String(v) : <span className="text-amber-400 italic">null</span>}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlierRecords;
