import React, { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  TrendingDown,
  Layers,
  Table as TableIcon,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Badge from '../common/Badge';

export const BeforeAfterDiff = ({
  previewResult,
  targetColumn
}) => {
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'sample'

  if (!previewResult) return null;

  const {
    metrics_before = {},
    metrics_after = {},
    diff_summary = {},
    sample_before = [],
    sample_after = [],
    column = targetColumn
  } = previewResult;

  const rowsBefore = metrics_before.total_rows ?? '-';
  const rowsAfter = metrics_after.total_rows ?? '-';
  const rowsDiff = (typeof rowsBefore === 'number' && typeof rowsAfter === 'number')
    ? rowsAfter - rowsBefore
    : 0;

  const missingBefore = metrics_before.total_missing_cells ?? '-';
  const missingAfter = metrics_after.total_missing_cells ?? '-';
  const missingDiff = (typeof missingBefore === 'number' && typeof missingAfter === 'number')
    ? missingAfter - missingBefore
    : 0;

  // Collect table columns from sample rows
  const allSampleKeys = sample_after.length > 0
    ? Object.keys(sample_after[0])
    : (sample_before.length > 0 ? Object.keys(sample_before[0]) : []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4 p-5 animate-fadeIn">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-brand-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            Quantitative Before vs After Shift (Preview Mode)
          </h3>
          <Badge variant="brand">Non-Destructive Simulation</Badge>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'metrics'
                ? 'bg-brand-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Statistical Shifts
          </button>
          <button
            onClick={() => setActiveTab('sample')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'sample'
                ? 'bg-brand-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sample Data Diff
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Dataset Rows</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-slate-400">{rowsBefore}</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="font-bold text-white font-mono text-sm">{rowsAfter}</span>
            {rowsDiff !== 0 && (
              <span className="text-[10px] text-amber-400 font-bold font-mono">
                ({rowsDiff})
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Missing Cells</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-amber-400">{missingBefore}</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="font-bold text-brand-400 font-mono text-sm">{missingAfter}</span>
            {missingDiff < 0 && (
              <span className="text-[10px] text-brand-400 font-bold font-mono">
                ({missingDiff})
              </span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cells Imputed</span>
          <div className="mt-1 font-bold text-brand-400 font-mono text-sm">
            {diff_summary.cells_imputed ?? 0}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Rows Removed</span>
          <div className="mt-1 font-bold text-white font-mono text-sm">
            {diff_summary.rows_removed ?? 0}
          </div>
        </div>
      </div>

      {/* Tab 1: Detailed Statistical Metrics Comparison */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
          {/* Before Panel */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Before Transformation
              </span>
              <Badge variant="warning">Initial Snapshot</Badge>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Rows:</span>
                <span className="font-mono font-bold text-white">{rowsBefore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Missing Cells (Total):</span>
                <span className="font-mono font-bold text-amber-400">{missingBefore}</span>
              </div>
              {column && metrics_before.column_missing_count !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Column Missing:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {metrics_before.column_missing_count} ({metrics_before.column_missing_pct}%)
                  </span>
                </div>
              )}
              {metrics_before.column_mean !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Mean:</span>
                  <span className="font-mono text-white">{metrics_before.column_mean}</span>
                </div>
              )}
              {metrics_before.column_median !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Median:</span>
                  <span className="font-mono text-white">{metrics_before.column_median}</span>
                </div>
              )}
              {metrics_before.column_std !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Std Dev:</span>
                  <span className="font-mono text-white">{metrics_before.column_std}</span>
                </div>
              )}
            </div>
          </div>

          {/* After Panel */}
          <div className="p-4 rounded-xl bg-slate-950 border border-brand-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-brand-400 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                After Transformation (Projected)
              </span>
              <Badge variant="success">Simulated Result</Badge>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Rows:</span>
                <span className="font-mono font-bold text-white">{rowsAfter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Missing Cells (Total):</span>
                <span className="font-mono font-bold text-brand-400">{missingAfter}</span>
              </div>
              {column && metrics_after.column_missing_count !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Column Missing:</span>
                  <span className="font-mono font-bold text-brand-400">
                    {metrics_after.column_missing_count} ({metrics_after.column_missing_pct}%)
                  </span>
                </div>
              )}
              {metrics_after.column_mean !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Mean:</span>
                  <span className="font-mono text-white">{metrics_after.column_mean}</span>
                </div>
              )}
              {metrics_after.column_median !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Median:</span>
                  <span className="font-mono text-white">{metrics_after.column_median}</span>
                </div>
              )}
              {metrics_after.column_std !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Std Dev:</span>
                  <span className="font-mono text-white">{metrics_after.column_std}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sample Data Rows Diff Inspection */}
      {activeTab === 'sample' && (
        <div className="space-y-3 pt-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>First 5 records previewing transformed output:</span>
            {column && (
              <span className="text-brand-300 font-mono">
                Highlighted column: <strong>{column}</strong>
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/80 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-2.5 text-center text-slate-500 w-10">#</th>
                  {allSampleKeys.map((key) => (
                    <th
                      key={key}
                      className={`p-2.5 whitespace-nowrap font-bold ${
                        key === column ? 'text-brand-400 bg-brand-500/10' : 'text-slate-300'
                      }`}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sample_after.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-2.5 text-center text-slate-500">{idx + 1}</td>
                    {allSampleKeys.map((key) => {
                      const val = row[key];
                      const isTarget = key === column;
                      const wasNullBefore = sample_before[idx] && (sample_before[idx][key] === null || sample_before[idx][key] === undefined || sample_before[idx][key] === '');
                      const isImputed = isTarget && wasNullBefore && val !== null;

                      return (
                        <td
                          key={key}
                          className={`p-2.5 whitespace-nowrap ${
                            isImputed
                              ? 'bg-brand-500/20 text-brand-300 font-bold border-l-2 border-r-2 border-brand-500'
                              : (isTarget ? 'bg-brand-500/5 text-white' : 'text-slate-300')
                          }`}
                        >
                          {val === null || val === undefined ? (
                            <span className="text-amber-500 italic">null</span>
                          ) : (
                            String(val)
                          )}
                          {isImputed && (
                            <span className="ml-1.5 text-[9px] uppercase font-bold text-brand-400 bg-brand-950 px-1 py-0.5 rounded">
                              imputed
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeforeAfterDiff;
