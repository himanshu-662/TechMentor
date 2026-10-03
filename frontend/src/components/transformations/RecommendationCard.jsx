import React from 'react';
import { Sparkles, Info, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';

export const RecommendationCard = ({ recommendation, onSelectMethod }) => {
  if (!recommendation) return null;

  const METHOD_LABELS = {
    standard: 'StandardScaler (Z-Score)',
    minmax: 'MinMaxScaler ([0, 1])',
    robust: 'RobustScaler (Median & IQR)',
    log1p: 'Logarithmic (Log1p)',
    yeo_johnson: 'Yeo-Johnson Power Transform',
    box_cox: 'Box-Cox Power Transform',
    none: 'No Transformation'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Deterministic Engine Recommendation
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="brand">
            {METHOD_LABELS[recommendation.recommended_method] || recommendation.recommended_method}
          </Badge>
          <span className="text-[11px] font-mono text-brand-400/90 font-semibold">
            {Math.round((recommendation.confidence || 0.85) * 100)}% Confidence
          </span>
        </div>
      </div>

      {/* Rationale */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
        {recommendation.reason}
      </p>

      {/* Grounded Evidence */}
      {recommendation.evidence && Object.keys(recommendation.evidence).length > 0 && (
        <div className="flex flex-wrap gap-2 text-[11px]">
          {Object.entries(recommendation.evidence).map(([key, val]) => (
            <span key={key} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono">
              <strong className="text-slate-300">{key}:</strong> {String(val)}
            </span>
          ))}
        </div>
      )}

      {/* Educational Note */}
      {recommendation.educational_note && (
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{recommendation.educational_note}</span>
        </div>
      )}

      {/* Alternative Techniques */}
      {recommendation.alternative_methods && recommendation.alternative_methods.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Consider Alternative Transformations
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendation.alternative_methods.map((alt, idx) => (
              <div 
                key={idx} 
                className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-[11px] space-y-1 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{alt.name}</span>
                  {onSelectMethod && (
                    <button
                      onClick={() => onSelectMethod(alt.method_id)}
                      className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1"
                    >
                      <span>Choose</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-slate-400 text-[10px]">{alt.description}</p>
                <div className="text-[10px] text-slate-500 italic">
                  Trade-off: {alt.trade_off}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
