import React, { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, BookOpen, Check } from 'lucide-react';
import Badge from '../common/Badge';

export const MathCalculationCard = ({ mathCalculation, column, method }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!mathCalculation) return null;

  const {
    formula,
    variables,
    sorted_values,
    calculation_steps,
    imputed_value,
    frequency_counts,
    mode_occurrences
  } = mathCalculation;

  return (
    <div className="bg-slate-900 border border-brand-500/30 rounded-xl overflow-hidden shadow-lg animate-fadeIn">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 bg-brand-500/10 border-b border-brand-500/20 flex items-center justify-between cursor-pointer hover:bg-brand-500/15 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>Step-by-Step Educational Math Breakdown</span>
              <Badge variant="brand">Section 17 Educational Proof</Badge>
            </h4>
            <p className="text-[11px] text-slate-400">
              Deterministic calculation behind {method} imputation for <span className="font-mono text-brand-300">{column}</span>
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4 text-xs">
          {/* Formula Block */}
          {formula && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Mathematical Definition / Formula
              </span>
              <div className="font-mono text-sm text-brand-300 font-semibold">
                {formula}
              </div>
            </div>
          )}

          {/* Variables Grid */}
          {variables && Object.keys(variables).length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Observed Variables & Input Parameters
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(variables).map(([key, val]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono block">{key}</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(4)) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sorted Sample Sequence for Median */}
          {sorted_values && sorted_values.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Sample Ordered Values (Ascending Sequence)
              </span>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-nowrap">
                {sorted_values.slice(0, 20).join(', ')}
                {sorted_values.length > 20 && ` ... (${sorted_values.length} values total)`}
              </div>
            </div>
          )}

          {/* Mode Frequency Counts */}
          {frequency_counts && Object.keys(frequency_counts).length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Top Category Frequencies
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(frequency_counts).slice(0, 4).map(([cat, count]) => (
                  <div key={cat} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-slate-300 truncate max-w-[100px]">{cat}</span>
                    <Badge variant={cat === String(imputed_value) ? 'brand' : 'default'}>
                      {count} times
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Execution Sequence */}
          {calculation_steps && calculation_steps.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Step-by-Step Derivation
              </span>
              <div className="space-y-1.5">
                {calculation_steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 font-mono text-[11px] leading-relaxed">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Imputed Value Result */}
          <div className="p-3.5 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-full bg-brand-500/20 text-brand-400">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-brand-300">
                Calculated Imputation Value:
              </span>
            </div>
            <div className="font-mono font-bold text-brand-400 text-sm">
              {typeof imputed_value === 'number' ? (Number.isInteger(imputed_value) ? imputed_value : imputed_value.toFixed(4)) : String(imputed_value)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathCalculationCard;
