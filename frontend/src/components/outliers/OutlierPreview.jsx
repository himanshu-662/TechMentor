import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  Flame,
  Scissors,
  Trash2,
  BarChart3,
  TrendingDown,
  Info,
  Layers,
  Flag
} from 'lucide-react';
import Badge from '../common/Badge';

export const OutlierPreview = ({ 
  preview, 
  onClose, 
  onConfirmApply, 
  isApplying = false,
  isInline = false
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!preview) return null;

  const {
    column,
    treatment,
    detection_method,
    before,
    after,
    affected_rows,
    rows_removed,
    values_capped,
    lower_bound,
    upper_bound,
    sample_changed_records = [],
    warnings = [],
    educational_impact = {}
  } = preview;

  const handleApply = () => {
    if (!isConfirmed) return;
    onConfirmApply();
  };

  // Variance reduction percentage calculation
  const stdBefore = before?.std || 1.0;
  const stdAfter = after?.std || 1.0;
  const varianceReductionPct = stdBefore > 0 
    ? Math.max(0, Math.min(100, Math.round((1 - (stdAfter / stdBefore)) * 100))) 
    : 0;

  const renderContent = () => (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Outlier Treatment Simulation</h3>
              <Badge variant="brand">{treatment.toUpperCase()}</Badge>
              <Badge variant="purple">{column}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Non-destructive live preview. Compares distribution shifts before vs. after treatment.
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss Preview"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Warnings Banner */}
      {warnings.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-200">
            <AlertTriangle className="w-4 h-4" /> Treatment Notice:
          </div>
          {warnings.map((w, idx) => (
            <p key={idx} className="pl-5 text-slate-300">• {w}</p>
          ))}
        </div>
      )}

      {/* Educational Statistical Impact Banner */}
      {educational_impact?.summary && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-brand-950/20 to-slate-950 border border-brand-500/30 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 text-brand-400 font-bold uppercase tracking-wider text-[11px]">
            <Info className="w-4 h-4" />
            Statistical Impact Analysis
          </div>
          <p className="text-slate-300 leading-relaxed">
            {educational_impact.summary}
          </p>
        </div>
      )}

      {/* Key Metric Delta Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Outliers Delta */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Outliers Flagged</div>
          <div className="text-base font-bold font-mono text-white">
            <span className="text-rose-400">{before.outlier_count}</span>
            <span className="text-slate-500 mx-1.5">➔</span>
            <span className="text-brand-400">{after.outlier_count}</span>
          </div>
          <div className="text-[10px] text-brand-400 font-semibold">
            {before.outlier_count > 0 && after.outlier_count === 0 ? '100% resolved' : `${affected_rows} addressed`}
          </div>
        </div>

        {/* Rows Impact */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Row Count</div>
          <div className="text-base font-bold font-mono text-white">
            <span>{before.row_count}</span>
            <span className="text-slate-500 mx-1.5">➔</span>
            <span className={after.row_count < before.row_count ? 'text-amber-400' : 'text-brand-400'}>
              {after.row_count}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            {rows_removed > 0 ? `-${rows_removed} rows deleted` : '100% rows preserved'}
          </div>
        </div>

        {/* Std Dev / Variance Stabilization */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Std Deviation (σ)</div>
          <div className="text-base font-bold font-mono text-white">
            <span className="text-slate-400">{before.std}</span>
            <span className="text-slate-500 mx-1.5">➔</span>
            <span className="text-brand-300">{after.std}</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-semibold">
            {varianceReductionPct > 0 ? `-${varianceReductionPct}% variance` : 'Stable variance'}
          </div>
        </div>

        {/* Skewness Shift */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Skewness (S)</div>
          <div className="text-base font-bold font-mono text-white">
            <span className="text-slate-400">{before.skewness !== null && before.skewness !== undefined ? before.skewness : '—'}</span>
            <span className="text-slate-500 mx-1.5">➔</span>
            <span className="text-purple-300">{after.skewness !== null && after.skewness !== undefined ? after.skewness : '—'}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {Math.abs(after.skewness || 0) < Math.abs(before.skewness || 0) ? 'More symmetric' : 'Distribution shift'}
          </div>
        </div>
      </div>

      {/* Visual Histogram Comparison (Before vs After) */}
      {before?.histogram_bins && before.histogram_bins.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              Visual Distribution Shift (Histogram Frequency)
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-slate-700" /> In-Bounds
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Outlier Zone
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Before Histogram */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span className="font-bold text-slate-300">Before Treatment</span>
                <span>Range: [{before.min}, {before.max}]</span>
              </div>
              <div className="flex items-end gap-1 h-20 pt-2 px-1">
                {before.histogram_bins.map((b, i) => {
                  const maxC = Math.max(...before.histogram_bins.map(x => x.count), 1);
                  const hPct = Math.max(8, (b.count / maxC) * 100);
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col justify-end items-center group relative"
                    >
                      <div
                        className={`w-full rounded-t transition-all ${
                          b.has_outlier ? 'bg-rose-500/80 hover:bg-rose-400' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        style={{ height: `${hPct}%` }}
                      />
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[9px] font-mono px-1 py-0.5 rounded bg-slate-950 text-white border border-slate-700 pointer-events-none z-10 whitespace-nowrap">
                        {b.count} rows [{b.bin_start}..{b.bin_end}]
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* After Histogram */}
            <div className="p-3 bg-brand-950/20 rounded-xl border border-brand-500/30 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span className="font-bold text-brand-300">After Treatment (Simulated)</span>
                <span>Range: [{after.min}, {after.max}]</span>
              </div>
              <div className="flex items-end gap-1 h-20 pt-2 px-1">
                {(after.histogram_bins && after.histogram_bins.length > 0 ? after.histogram_bins : before.histogram_bins).map((b, i) => {
                  const bins = after.histogram_bins && after.histogram_bins.length > 0 ? after.histogram_bins : before.histogram_bins;
                  const maxC = Math.max(...bins.map(x => x.count), 1);
                  const hPct = Math.max(8, (b.count / maxC) * 100);
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col justify-end items-center group relative"
                    >
                      <div
                        className="w-full rounded-t bg-brand-500/80 hover:bg-brand-400 transition-all"
                        style={{ height: `${hPct}%` }}
                      />
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 text-[9px] font-mono px-1 py-0.5 rounded bg-slate-950 text-white border border-slate-700 pointer-events-none z-10 whitespace-nowrap">
                        {b.count} rows [{b.bin_start}..{b.bin_end}]
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Detailed Statistical Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Before */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before Treatment</span>
            <Badge variant="default">Current Snapshot</Badge>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Total Rows:</span>
              <span>{before.row_count?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-rose-300">
              <span className="font-sans text-slate-400">Outlier Count:</span>
              <span className="font-bold">{before.outlier_count}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Min / Max:</span>
              <span>{before.min} / {before.max}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Mean (μ):</span>
              <span>{before.mean}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Median:</span>
              <span>{before.median}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Std Dev (σ):</span>
              <span>{before.std}</span>
            </div>
          </div>
        </div>

        {/* After */}
        <div className="p-4 rounded-xl bg-brand-950/20 border border-brand-500/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">After Treatment</span>
            <Badge variant="brand">Simulated State</Badge>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Total Rows:</span>
              <span className={after.row_count !== before.row_count ? 'text-amber-400 font-bold' : ''}>
                {after.row_count?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-brand-400">
              <span className="font-sans text-slate-400">Outlier Count:</span>
              <span className="font-bold">{after.outlier_count}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Min / Max:</span>
              <span>{after.min} / {after.max}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Mean (μ):</span>
              <span>{after.mean}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Median:</span>
              <span>{after.median}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans text-slate-400">Std Dev (σ):</span>
              <span>{after.std}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Changed Records Table */}
      {sample_changed_records.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            Sample Altered Observations Preview:
          </span>
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Row #</th>
                  <th className="py-2.5 px-3 text-rose-300">Original Value</th>
                  <th className="py-2.5 px-3 text-brand-300">Treated Value</th>
                  <th className="py-2.5 px-3">Action Executed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sample_changed_records.map((rec) => (
                  <tr key={rec.index} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 text-slate-400">#{rec.index + 1}</td>
                    <td className="py-2 px-3 text-rose-300 font-bold">{rec.original_value}</td>
                    <td className="py-2 px-3 text-brand-300 font-bold">
                      {rec.treated_value !== null ? rec.treated_value : <span className="text-slate-500">Deleted</span>}
                    </td>
                    <td className="py-2 px-3 text-slate-300 font-sans text-[11px]">{rec.action_taken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mandatory Confirmation Checkbox */}
      <div className="pt-3 border-t border-slate-800 flex items-start gap-2.5 text-xs">
        <input
          type="checkbox"
          id="confirmOutlierApply"
          checked={isConfirmed}
          onChange={(e) => setIsConfirmed(e.target.checked)}
          className="mt-0.5 rounded bg-slate-950 border-slate-700 text-brand-500 focus:ring-brand-500 w-4 h-4 cursor-pointer"
        />
        <label htmlFor="confirmOutlierApply" className="text-slate-300 cursor-pointer select-none">
          I have reviewed the simulated statistical changes and confirm creating an immutable dataset version snapshot with this treatment.
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        {onClose && (
          <button
            onClick={onClose}
            disabled={isApplying}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Dismiss
          </button>
        )}
        <div className="ml-auto">
          <button
            onClick={handleApply}
            disabled={!isConfirmed || isApplying}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-lg ${
              isConfirmed && !isApplying
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/40 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isApplying ? 'Persisting Snapshot...' : 'Apply Treatment & Create Version Snapshot'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-brand-500/30 space-y-5 animate-fadeIn mt-6 shadow-xl">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default OutlierPreview;
