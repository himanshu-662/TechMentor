import React from 'react';
import { BarChart3, CheckCircle2, XCircle, Award, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

export const FeatureScoreBarChart = ({ featureScores = [], k = 3, scoringFunc = 'f_classif', targetColumn = '' }) => {
  if (!featureScores || featureScores.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
        Simulate feature selection to view feature importance rankings and statistical scores.
      </div>
    );
  }

  const maxScore = Math.max(...featureScores.map(f => f.score), 1);
  const selectedCount = featureScores.filter(f => f.selected).length;
  const removedCount = featureScores.length - selectedCount;

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Feature Association Rankings vs Target ({targetColumn || 'Target'})
            </h4>
            <p className="text-[11px] text-slate-400">
              Scored via <strong className="text-slate-300 font-mono">{scoringFunc}</strong> • Higher score indicates stronger predictive relationship
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="brand">{selectedCount} Retained</Badge>
          <Badge variant="rose">{removedCount} Dropped</Badge>
        </div>
      </div>

      {/* Feature Ranking Bars */}
      <div className="space-y-3">
        {featureScores.map((feat) => {
          const widthPct = Math.max((feat.score / maxScore) * 100, 3);
          const isSelected = feat.selected;

          return (
            <div key={feat.feature} className="space-y-1 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isSelected ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-slate-800 text-slate-500'
                  }`}>
                    #{feat.rank}
                  </span>
                  <span className={`font-mono font-bold ${
                    isSelected ? 'text-white' : 'text-slate-400'
                  }`}>
                    {feat.feature}
                  </span>
                  {isSelected ? (
                    <span className="text-[10px] text-brand-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Selected
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-slate-600" /> Dropped
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  {feat.p_value !== null && feat.p_value !== undefined && (
                    <span className={`text-[10px] ${feat.p_value < 0.05 ? 'text-brand-400 font-semibold' : 'text-slate-500'}`}>
                      p = {feat.p_value < 0.0001 ? '<0.0001' : feat.p_value.toFixed(4)}
                    </span>
                  )}
                  <span className={`font-bold ${isSelected ? 'text-brand-300' : 'text-slate-500'}`}>
                    Score: {feat.score.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-brand-500 to-brand-400 shadow-sm shadow-brand-500/20' 
                      : 'bg-slate-800 opacity-60'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanatory Footer */}
      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Top <strong className="text-white font-mono">{k}</strong> highest-scoring features are selected to form the compact training subspace.</span>
        </div>
      </div>
    </div>
  );
};

export default FeatureScoreBarChart;
