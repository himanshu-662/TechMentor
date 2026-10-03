import React, { useState } from 'react';
import { Sigma, ChevronDown, ChevronUp, Sparkles, Binary, CheckCircle2 } from 'lucide-react';
import Badge from '../common/Badge';

export const FormulaCard = ({ calculation, method }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!calculation) return null;

  const METHOD_TITLES = {
    standard: 'Standardization (Z-Score Scaling)',
    minmax: 'Min-Max Scaling (Range Normalization)',
    robust: 'Robust Scaling (Median & IQR)',
    log1p: 'Logarithmic Transformation (Natural Log1p)',
    yeo_johnson: 'Yeo-Johnson Power Transformation',
    box_cox: 'Box-Cox Power Transformation',
    none: 'No Transformation'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Card Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-950/40 hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Sigma className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Mathematical Formula & Live Calculation
              </h3>
              <Badge variant="purple">{METHOD_TITLES[method] || method}</Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live step-by-step evaluation using real non-fabricated dataset numbers
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-slate-800/80 text-xs">
          {/* Formula Display Box */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Governing Formula
              </span>
              <div className="font-mono text-sm text-brand-300 font-bold mt-1">
                {calculation.formula}
              </div>
            </div>

            {calculation.parameters && Object.keys(calculation.parameters).length > 0 && (
              <div className="flex flex-wrap gap-2 sm:justify-end">
                {Object.entries(calculation.parameters).map(([k, v]) => (
                  <span key={k} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    <strong className="text-slate-400">{k}:</strong> {typeof v === 'number' ? v.toFixed(4) : JSON.stringify(v)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Step-by-Step Derivation */}
          {calculation.steps && calculation.steps.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Step-by-Step Arithmetic Breakdown
              </span>
              <div className="space-y-1.5">
                {calculation.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded bg-slate-950/50 border border-slate-800/60 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-sans">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample Calculation */}
          {calculation.sample_calculation && (
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                Concrete Sample Point Execution
              </span>
              <div className="font-mono text-xs">
                {calculation.sample_calculation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FormulaCard;
