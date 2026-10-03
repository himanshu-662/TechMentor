import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Trash2, 
  Scissors, 
  Sliders, 
  ArrowRight, 
  Sparkles,
  Info,
  Flag,
  CheckCircle2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import Badge from '../common/Badge';

export const TreatmentSelector = ({ 
  selectedTreatment, 
  onSelectTreatment, 
  lowerBound, 
  upperBound, 
  customLower, 
  customUpper, 
  onChangeCustomLower, 
  onChangeCustomUpper,
  onTriggerPreview,
  isProcessing = false
}) => {
  const [showGuide, setShowGuide] = useState(false);

  const treatments = [
    {
      id: 'cap',
      title: 'Cap / Winsorize (Recommended)',
      badge: 'Safe & Retains Rows',
      icon: Scissors,
      color: 'brand',
      desc: `Clamps extreme values to the calculated boundary limits (${lowerBound !== null ? lowerBound : '—'} to ${upperBound !== null ? upperBound : '—'}). Retains all rows while eliminating extreme statistical variance distortion.`
    },
    {
      id: 'flag',
      title: 'Flag as Anomaly (Indicator)',
      badge: 'Preserves Raw Values',
      icon: Flag,
      color: 'amber',
      desc: 'Creates a binary indicator column (e.g. column_is_outlier = 1) without altering original values. Perfect for tree models or fraud detection where anomaly presence is predictive.'
    },
    {
      id: 'remove',
      title: 'Remove Outlier Rows (Trimming)',
      badge: 'Reduces Row Count',
      icon: Trash2,
      color: 'rose',
      desc: 'Completely deletes rows containing outlier values. Use with caution: best for verified data corruption or sensor glitches to avoid losing statistical power.'
    },
    {
      id: 'custom_bounds',
      title: 'Custom Boundaries',
      badge: 'Manual Control',
      icon: Sliders,
      color: 'purple',
      desc: 'Specify your own custom lower floor and upper ceiling based on domain knowledge, physical constraints, or business logic.'
    },
    {
      id: 'keep',
      title: 'Keep Outliers',
      badge: 'No Data Change',
      icon: ShieldCheck,
      color: 'blue',
      desc: 'Do not modify or delete any rows. Ideal when unusual values represent verified real-world events or when using tree-based models (Random Forest, XGBoost) that partition thresholds naturally.'
    }
  ];

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Scissors className="w-4 h-4 text-brand-400" />
            Select Treatment Strategy
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose how detected outliers should be resolved. Simulates in non-destructive preview mode first.
          </p>
        </div>

        {/* Current Active Detection Bounds */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Current Bounds:</span>
          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-brand-300">
            [{lowerBound !== null ? lowerBound : '-∞'} , {upperBound !== null ? upperBound : '+∞'}]
          </span>
        </div>
      </div>

      {/* Decision Guide Expandable Callout */}
      <div className="rounded-xl border border-brand-500/20 bg-slate-950/70 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-brand-300 hover:text-brand-200 transition-colors bg-brand-500/5 hover:bg-brand-500/10"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>How to Decide: When to Remove vs Cap vs Flag Outliers</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>{showGuide ? 'Hide Decision Guide' : 'Show Decision Guide'}</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showGuide && (
          <div className="p-4 border-t border-slate-800/80 space-y-3 text-xs animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> When to REMOVE Outliers:
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Only when data is physically impossible (Age = 999, negative price) or a verified hardware sensor crash.
                </p>
                <div className="text-[10px] text-rose-400 font-semibold pt-1 border-t border-rose-500/20">
                  ⚠️ Danger: Never remove &gt; 3-5% of rows (causes truncation bias & sample loss).
                </div>
              </div>

              <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 space-y-1.5">
                <div className="font-bold text-brand-300 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5" /> When to CAP (Winsorize):
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Recommended for linear regression, neural networks, and distance models. Clamps extreme values to bounds while preserving 100% of rows and sample size.
                </p>
                <div className="text-[10px] text-brand-400 font-semibold pt-1 border-t border-brand-500/20">
                  ✅ Industry standard safe default for numerical features.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5" /> When to FLAG Anomaly:
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Best for fraud detection, cybersecurity, and tree models (XGBoost, Random Forest). Keeps original values and creates an <code className="text-amber-300 font-mono">is_outlier = 1</code> feature.
                </p>
                <div className="text-[10px] text-amber-400 font-semibold pt-1 border-t border-amber-500/20">
                  ⚡ Turns anomalies into predictive features for the model.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Treatment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {treatments.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTreatment === t.id;
          return (
            <div
              key={t.id}
              onClick={() => onSelectTreatment(t.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-950/30 border-brand-500 shadow-md ring-1 ring-brand-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold text-white">{t.title}</span>
                  </div>
                </div>
                <Badge variant={isSelected ? 'brand' : 'default'}>{t.badge}</Badge>
                <p className="text-[11px] text-slate-400 leading-relaxed">{t.desc}</p>
              </div>

              {/* Radio Indicator */}
              <div className="pt-3 flex items-center gap-2 text-xs font-medium border-t border-slate-800/60 mt-3">
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? 'border-brand-400 bg-brand-500' : 'border-slate-600 bg-slate-900'
                }`}>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>
                <span className={isSelected ? 'text-brand-400 font-semibold' : 'text-slate-500'}>
                  {isSelected ? 'Active Strategy' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Bounds Inputs */}
      {selectedTreatment === 'custom_bounds' && (
        <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sliders className="w-4 h-4" /> Configure Custom Boundaries
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onChangeCustomLower(lowerBound);
                  onChangeCustomUpper(upperBound);
                }}
                className="text-[10px] text-purple-400 hover:text-purple-300 underline"
              >
                Reset to Calculated Bounds
              </button>
              {lowerBound !== null && lowerBound < 0 && (
                <button
                  type="button"
                  onClick={() => onChangeCustomLower(0.0)}
                  className="text-[10px] text-brand-400 hover:text-brand-300 underline"
                >
                  Floor at 0.0 (Non-negative)
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Custom Lower Bound (Floor):
              </label>
              <input
                type="number"
                step="any"
                value={customLower !== null && customLower !== undefined ? customLower : ''}
                onChange={(e) => onChangeCustomLower(e.target.value !== '' ? parseFloat(e.target.value) : null)}
                placeholder={lowerBound !== null ? String(lowerBound) : "e.g. 0.0"}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Custom Upper Bound (Ceiling):
              </label>
              <input
                type="number"
                step="any"
                value={customUpper !== null && customUpper !== undefined ? customUpper : ''}
                onChange={(e) => onChangeCustomUpper(e.target.value !== '' ? parseFloat(e.target.value) : null)}
                placeholder={upperBound !== null ? String(upperBound) : "e.g. 1000.0"}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-purple-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Trigger Preview Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onTriggerPreview}
          disabled={isProcessing}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-900/40 transition-all inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isProcessing ? 'Generating Simulation Preview...' : 'Simulate Preview (Non-Destructive)'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TreatmentSelector;
