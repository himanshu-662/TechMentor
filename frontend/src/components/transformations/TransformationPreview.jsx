import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  Sliders, 
  Sparkles,
  Layers,
  Table
} from 'lucide-react';
import Badge from '../common/Badge';
import FormulaCard from './FormulaCard';
import DistributionComparison from './DistributionComparison';

export const TransformationPreview = ({
  previewData,
  onClose,
  onApply,
  isApplying
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!previewData) return null;

  const {
    column,
    method,
    parameters,
    before,
    after,
    sample_rows,
    calculation,
    warnings,
    explanation
  } = previewData;

  const METHOD_NAMES = {
    standard: 'StandardScaler',
    minmax: 'MinMaxScaler',
    robust: 'RobustScaler',
    log1p: 'Log1p (Natural Log)',
    yeo_johnson: 'Yeo-Johnson Power Transform',
    box_cox: 'Box-Cox Power Transform',
    none: 'None'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Simulation Preview: {METHOD_NAMES[method] || method}
                </h2>
                <Badge variant="brand">Target: '{column}'</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review distribution shifts and mathematical derivations before applying to dataset version
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Warnings Banner if any */}
          {warnings && warnings.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Transformation Advisory</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Formula Card */}
          <FormulaCard calculation={calculation} method={method} />

          {/* Before vs After Visual Distribution Comparison */}
          <DistributionComparison before={before} after={after} />

          {/* Side-by-Side Sample Transformed Rows */}
          {sample_rows && sample_rows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Sample Data Transformation (First {sample_rows.length} Rows)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">Row-level preview</span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Row Index</th>
                      <th className="p-2.5">Original '{column}'</th>
                      <th className="p-2.5"></th>
                      <th className="p-2.5">Transformed Value ({METHOD_NAMES[method]})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {sample_rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-850/40 transition-colors">
                        <td className="p-2 text-slate-500">#{row.index}</td>
                        <td className="p-2 font-semibold text-slate-200">{row.original_value.toFixed(4)}</td>
                        <td className="p-2 text-slate-600">
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </td>
                        <td className="p-2 font-bold text-brand-400">{row.transformed_value.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Data Safety & Confirmation Gate */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Immutable Snapshot & Version Safety Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Applying this transformation will create a new immutable version snapshot (e.g. <code>v2</code>) in <code>versions/</code>.
              Your original raw dataset remains strictly untouched in <code>original/</code>, and this transformation can be reverted at any time with single-click Undo.
            </p>

            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-500 focus:ring-brand-500 focus:ring-offset-slate-950 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-200 select-none">
                I confirm applying the <strong>{METHOD_NAMES[method]}</strong> transformation to column <strong>'{column}'</strong>.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors"
          >
            Cancel Simulation
          </button>

          <button
            onClick={() => onApply({ column, method, confirmed: true, parameters })}
            disabled={!isConfirmed || isApplying}
            className={`px-5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 shadow-lg transition-all ${
              isConfirmed && !isApplying
                ? 'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 shadow-brand-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isApplying ? 'Persisting Version...' : 'Apply & Save Version Snapshot'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransformationPreview;
