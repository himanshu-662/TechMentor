import React from 'react';
import { 
  Sliders, 
  BarChart2, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Layers, 
  TrendingUp, 
  Maximize2, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import Badge from '../common/Badge';

export const TransformationSelector = ({
  selectedMethod,
  onSelectMethod,
  featureRange,
  onChangeFeatureRange,
  metrics,
  supportedMethods = [],
  onPreview,
  isPreviewing
}) => {
  const hasNegatives = (metrics?.negative_count || 0) > 0;
  const isStrictlyPositive = (metrics?.min !== undefined && metrics?.min !== null) ? metrics.min > 0 : true;

  const METHODS = [
    {
      id: 'standard',
      title: 'StandardScaler (Z-Score)',
      badge: 'Zero-Mean & Unit Variance',
      icon: BarChart2,
      color: 'blue',
      formula: 'z = (x - μ) / σ',
      description: 'Centers feature around 0.0 with standard deviation of 1.0. Optimal for linear models, SVMs, and neural networks.',
      disabled: false,
      disabledReason: null
    },
    {
      id: 'minmax',
      title: 'MinMaxScaler',
      badge: 'Bounded Range',
      icon: Maximize2,
      color: 'brand',
      formula: "x' = (x - min) / (max - min)",
      description: 'Rescales feature strictly into a target range [a, b]. Essential for neural net activations and distance metrics without outliers.',
      disabled: false,
      disabledReason: null,
      hasConfig: true
    },
    {
      id: 'robust',
      title: 'RobustScaler',
      badge: 'Outlier Resistant',
      icon: Layers,
      color: 'purple',
      formula: "x' = (x - median) / IQR",
      description: 'Centers using Median and scales using IQR. Extreme outliers in the upper/lower 25% tails will not distort the scaling.',
      disabled: false,
      disabledReason: null
    },
    {
      id: 'log1p',
      title: 'Logarithmic (Log1p)',
      badge: 'Right-Skew Compression',
      icon: TrendingUp,
      color: 'amber',
      formula: "x' = ln(1 + x)",
      description: 'Compresses large values and right-tailed skewness for positive monetary and count features.',
      disabled: hasNegatives,
      disabledReason: hasNegatives ? 'Disabled: Feature contains negative numbers. Logarithm is undefined for x < 0. Use Yeo-Johnson instead.' : null
    },
    {
      id: 'yeo_johnson',
      title: 'Yeo-Johnson Power Transform',
      badge: 'Gaussian Reshaping',
      icon: Sparkles,
      color: 'brand',
      formula: 'ψ(λ, x) (MLE calibrated)',
      description: 'Parametric power transformation optimizing normality. Versatile and natively supports positive, zero, and negative numbers.',
      disabled: false,
      disabledReason: null
    },
    {
      id: 'box_cox',
      title: 'Box-Cox Power Transform',
      badge: 'Strictly Positive (x > 0)',
      icon: Sparkles,
      color: 'indigo',
      formula: 'y^(λ) = (y^λ - 1) / λ',
      description: 'Classic variance stabilization and normality transform. Strictly requires all values to be strictly positive (x > 0).',
      disabled: !isStrictlyPositive,
      disabledReason: !isStrictlyPositive ? 'Disabled: Box-Cox strictly requires all values > 0. Feature contains zero or negative values. Use Yeo-Johnson.' : null
    },
    {
      id: 'none',
      title: 'No Transformation',
      badge: 'Keep Raw Values',
      icon: RotateCcw,
      color: 'slate',
      formula: "x' = x",
      description: 'Preserve raw feature scale and units without modification.',
      disabled: false,
      disabledReason: null
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Select Transformation Method
            </h3>
            <p className="text-[11px] text-slate-400">
              Configure mathematical scaling or power distribution reshaping
            </p>
          </div>
        </div>

        <button
          onClick={onPreview}
          disabled={isPreviewing}
          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isPreviewing ? 'animate-spin' : ''}`} />
          <span>{isPreviewing ? 'Simulating...' : 'Simulate Preview'}</span>
        </button>
      </div>

      {/* Method Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {METHODS.map((m) => {
          const isSelected = selectedMethod === m.id;
          const Icon = m.icon;

          return (
            <div
              key={m.id}
              onClick={() => !m.disabled && onSelectMethod(m.id)}
              className={`p-3.5 rounded-xl border transition-all relative flex flex-col justify-between ${
                m.disabled
                  ? 'bg-slate-950/40 border-slate-800/50 opacity-45 cursor-not-allowed'
                  : isSelected
                  ? 'bg-brand-500/10 border-brand-500/50 shadow-md shadow-brand-500/10 cursor-pointer'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 cursor-pointer'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white">{m.title}</span>
                  </div>

                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-slate-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {m.description}
                </p>

                <div className="font-mono text-[10px] text-brand-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                  {m.formula}
                </div>
              </div>

              {/* Disabled Reason Tooltip / Notice */}
              {m.disabled && m.disabledReason && (
                <div className="mt-2 text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                  <span>{m.disabledReason}</span>
                </div>
              )}

              {/* MinMax Range Inputs when selected */}
              {isSelected && m.id === 'minmax' && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Feature Range [Min, Max]
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400">Lower Bound</label>
                      <input
                        type="number"
                        value={featureRange.min}
                        onChange={(e) => onChangeFeatureRange({ ...featureRange, min: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Upper Bound</label>
                      <input
                        type="number"
                        value={featureRange.max}
                        onChange={(e) => onChangeFeatureRange({ ...featureRange, max: parseFloat(e.target.value) || 1 })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransformationSelector;
