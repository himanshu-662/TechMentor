import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  BookOpen, 
  HelpCircle, 
  ArrowRight, 
  Check, 
  Database,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import Badge from '../common/Badge';

export const FeaturePreview = ({ 
  previewData, 
  onApply, 
  applying = false, 
  onCancel,
  onOpenConcept 
}) => {
  const [confirmed, setConfirmed] = useState(false);

  if (!previewData) return null;

  const {
    feature_name,
    feature_type,
    formula_human_readable,
    preview_rows = [],
    validation = {},
    educational_explanation = {},
    ml_impact_explanation,
    step_by_step_calculation = [],
    warnings = []
  } = previewData;

  const handleApplyClick = () => {
    if (!confirmed) return;
    onApply({
      feature_type: feature_type,
      new_feature_name: feature_name,
      params: previewData.params || {},
      confirmed: true
    });
  };

  const sampleSourceCols = preview_rows.length > 0 ? Object.keys(preview_rows[0].source_values || {}) : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 shadow-xl animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Simulation Preview
            </span>
            <Badge variant={validation.valid ? 'brand' : 'rose'}>
              {validation.valid ? 'Simulation Passed' : 'Validation Errors'}
            </Badge>
          </div>
          <h3 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
            <span>Feature:</span>
            <code className="text-brand-400 font-mono bg-brand-950/40 px-2 py-0.5 rounded border border-brand-500/20">
              {feature_name}
            </code>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {previewData.educational_concept_id && onOpenConcept && (
            <button
              onClick={() => onOpenConcept(previewData.educational_concept_id)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:text-amber-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Educational Guide</span>
            </button>
          )}
        </div>
      </div>

      {/* Formula & Step-by-Step Calculation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Engineered Mathematical Expression
          </span>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-sm text-brand-300 font-semibold overflow-x-auto">
            {formula_human_readable}
          </div>
          <p className="text-xs text-slate-400">
            {ml_impact_explanation}
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Step-by-Step Calculation Process
          </span>
          <div className="space-y-1 text-xs text-slate-300">
            {step_by_step_calculation.map((step, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-brand-400 font-bold">•</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Integrity Summary */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Feature Health & Anomaly Check
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Total Sample Rows</span>
            <span className="text-sm font-bold font-mono text-white">{validation.total_rows || 0}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Missing Values</span>
            <span className={`text-sm font-bold font-mono ${validation.null_count > 0 ? 'text-amber-400' : 'text-brand-400'}`}>
              {validation.null_count || 0} ({validation.null_percentage || 0}%)
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Infinite Quotients (±Inf)</span>
            <span className={`text-sm font-bold font-mono ${validation.inf_count > 0 ? 'text-rose-400' : 'text-brand-400'}`}>
              {validation.inf_count || 0}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Unique Values / Variance</span>
            <span className={`text-sm font-bold font-mono ${validation.is_constant ? 'text-rose-400' : 'text-slate-200'}`}>
              {validation.unique_count || 0} {validation.is_constant ? '(0 Variance)' : ''}
            </span>
          </div>
        </div>

        {/* Warnings and Leakage Alerts */}
        {warnings && warnings.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {warnings.map((w, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Row Simulation Table */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          First 10 Rows Simulation Preview
        </span>
        <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400">
                <th className="px-3 py-2.5 font-semibold">Row #</th>
                {sampleSourceCols.map(col => (
                  <th key={col} className="px-3 py-2.5 font-semibold font-mono text-slate-300">
                    {col} (input)
                  </th>
                ))}
                <th className="px-3 py-2.5 font-bold font-mono text-brand-300 bg-brand-950/30 border-l border-slate-800">
                  {feature_name} (generated)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {preview_rows.map((row) => (
                <tr key={row.index} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-3 py-2 text-slate-400">{row.index + 1}</td>
                  {sampleSourceCols.map(col => (
                    <td key={col} className="px-3 py-2 text-slate-300">
                      {row.source_values[col] === null ? (
                        <span className="text-slate-400 italic">null</span>
                      ) : (
                        String(row.source_values[col])
                      )}
                    </td>
                  ))}
                  <td className={`px-3 py-2 font-bold bg-brand-950/20 border-l border-slate-800 ${
                    row.is_anomaly ? 'text-amber-400' : 'text-brand-300'
                  }`}>
                    {row.generated_value === null ? (
                      <span className="text-amber-400 italic">null</span>
                    ) : (
                      String(row.generated_value)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Concept Card */}
      {educational_explanation && educational_explanation.title && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/30 border border-brand-500/20 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Why this feature matters: {educational_explanation.title}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {educational_explanation.beginner_explanation || educational_explanation.short_definition}
          </p>
          {educational_explanation.interview_tip && (
            <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
              <strong>Interview Tip:</strong> {educational_explanation.interview_tip}
            </div>
          )}
        </div>
      )}

      {/* Confirmation & Apply Actions */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-900"
          />
          <span className="text-xs text-slate-300 font-medium">
            I understand and confirm creating new feature <code className="text-brand-400 font-mono">{feature_name}</code>
          </span>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Back to Editor
          </button>

          <button
            type="button"
            onClick={handleApplyClick}
            disabled={!confirmed || applying || !validation.valid}
            className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>{applying ? 'Creating Feature Snapshot...' : 'Confirm & Create Feature'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturePreview;
