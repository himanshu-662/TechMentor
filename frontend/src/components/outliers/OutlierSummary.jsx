import React, { useState } from 'react';
import { 
  Flame, 
  Search, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import Badge from '../common/Badge';

export const OutlierSummary = ({ summaryData, onSelectColumn }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!summaryData) return null;

  const {
    total_rows = 0,
    total_columns = 0,
    numerical_columns_count = 0,
    columns_with_outliers_count = 0,
    total_outliers_detected = 0,
    current_version = 0,
    columns = []
  } = summaryData;

  const filteredColumns = columns.filter((col) =>
    col.column.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Educational Notice Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 text-xs text-slate-300 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-white">
            <span>Essential Data Principle: An outlier is NOT automatically an error.</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
              Critical Rule
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Unusual observations often reflect genuine real-world phenomena (such as high-value transactions or rare occurrences). 
            Always evaluate whether unusual points represent data entry corruptions before deleting them.
          </p>
        </div>
      </div>

      {/* Dataset-Level Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Rows</span>
          <div className="mt-1 text-2xl font-bold text-white">{total_rows.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">Dataset records</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Numerical Features</span>
          <div className="mt-1 text-2xl font-bold text-brand-400">{numerical_columns_count}</div>
          <span className="text-[10px] text-slate-400">Inspected for outliers</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Features with Outliers</span>
          <div className="mt-1 text-2xl font-bold text-amber-400">{columns_with_outliers_count}</div>
          <span className="text-[10px] text-slate-400">Require domain review</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Flagged Outliers</span>
          <div className="mt-1 text-2xl font-bold text-rose-400 font-mono">{total_outliers_detected}</div>
          <span className="text-[10px] text-slate-400">Across all features</span>
        </div>
      </div>

      {/* Search & Columns Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Numerical Feature Outlier Diagnosis</h3>
            <p className="text-xs text-slate-400 mt-0.5">Click any feature to inspect calculation breakdowns, charts, and treatments.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Columns Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-4">Recommended Method</th>
                <th className="py-3 px-4">Flagged Outliers</th>
                <th className="py-3 px-4">Computed Boundaries</th>
                <th className="py-3 px-4">Skewness</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredColumns.map((col) => {
                const hasOutliers = col.outlier_count > 0;
                return (
                  <tr key={col.column} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {col.column}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {col.recommended_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {hasOutliers ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {col.outlier_count} ({col.outlier_percentage}%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-brand-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 0 Outliers
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {col.lower_bound !== null && col.upper_bound !== null ? (
                        <span>[{col.lower_bound} to {col.upper_bound}]</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className={Math.abs(col.skewness || 0) > 1.0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                        {col.skewness !== null ? col.skewness : '0.0'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectColumn(col.column)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-brand-500 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-all inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Analyze & Treat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutlierSummary;
