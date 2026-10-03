import React from 'react';
import { Calculator, CheckCircle, Code2, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

export const OutlierCalculation = ({ calculation, column }) => {
  if (!calculation || !calculation.steps || calculation.steps.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
        No calculation breakdown available for this configuration.
      </div>
    );
  }

  const { method, formula, steps = [], parameters = {} } = calculation;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Formula Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Mathematical Formula ({method.toUpperCase()})
            </h4>
          </div>
          <Badge variant="purple">Exact Real Values</Badge>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-brand-300 border border-slate-800/80 overflow-x-auto">
          {formula}
        </div>
      </div>

      {/* Step-by-Step Calculation */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Step-by-Step Dataset Computation:</span>
        </div>

        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 font-mono text-xs text-slate-200 flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Note on zero fabrication */}
      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 px-2">
        <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
        <span>All calculations are computed dynamically using your live dataset observations without fabrication.</span>
      </div>
    </div>
  );
};

export default OutlierCalculation;
