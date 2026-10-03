import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  GitCompare,
  Sliders,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Badge from '../common/Badge';

export const RecommendationCard = ({
  recommendation,
  onSelectForConfig,
  onQuickPreview,
  isSelected,
  isLoadingPreview
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    column,
    issue_type,
    recommended_action,
    recommended_strategy,
    confidence,
    rationale,
    educational_context,
    alternatives,
    metrics_trigger
  } = recommendation;

  const getIssueBadge = () => {
    switch (issue_type) {
      case 'duplicate_rows':
        return <Badge variant="warning">Duplicate Rows</Badge>;
      case 'constant_column':
        return <Badge variant="purple">Constant Column</Badge>;
      case 'missing_values':
      default:
        return <Badge variant="brand">Missing Values</Badge>;
    }
  };

  const formatStrategyName = (action, strategy) => {
    if (action === 'drop_duplicates') return 'Drop Exact Duplicates';
    if (action === 'drop_column') return 'Drop Constant Column';
    if (strategy === 'median') return 'Median Imputation (Skew-Resistant)';
    if (strategy === 'mean') return 'Mean Imputation (Parametric)';
    if (strategy === 'mode') return 'Mode Imputation (Frequent Category)';
    if (strategy === 'drop_rows') return 'Listwise Row Deletion';
    return strategy || action;
  };

  const confidencePct = Math.round((confidence || 0.85) * 100);

  return (
    <div
      className={`rounded-xl border transition-all text-xs flex flex-col justify-between ${
        isSelected
          ? 'bg-slate-900 border-brand-500/60 shadow-lg ring-1 ring-brand-500/30'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Header: Issue Badge + Target + Confidence */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {getIssueBadge()}
            <span className="font-semibold text-white text-sm">
              {column ? column : 'Entire Dataset'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-brand-400 font-medium bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
            <Sparkles className="w-3 h-3" />
            <span>{confidencePct}% Confidence</span>
          </div>
        </div>

        {/* Recommended Technique Headline */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommended Action</span>
            <span className="font-bold text-white text-xs text-brand-400">
              {formatStrategyName(recommended_action, recommended_strategy)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {recommended_strategy || recommended_action}
          </span>
        </div>

        {/* Rationale */}
        <p className="text-slate-300 text-xs leading-relaxed">
          {rationale}
        </p>

        {/* Expandable Why & Alternatives */}
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-brand-400 hover:text-brand-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{showDetails ? 'Hide Educational Rationale' : 'Why this recommendation?'}</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showDetails && (
            <div className="mt-2.5 p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2 text-[11px] animate-fadeIn">
              {educational_context && (
                <div>
                  <span className="font-bold text-slate-300 block mb-0.5">Statistical Context:</span>
                  <p className="text-slate-400 leading-normal">{educational_context}</p>
                </div>
              )}

              {alternatives && alternatives.length > 0 && (
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="font-bold text-slate-300 block mb-1">Alternatives Evaluated:</span>
                  <ul className="space-y-1">
                    {alternatives.map((alt, idx) => (
                      <li key={idx} className="text-slate-400 flex items-start gap-1.5">
                        <span className="text-slate-600 font-bold">•</span>
                        <span>
                          <strong className="text-slate-300">{alt.name}:</strong> {alt.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {metrics_trigger && Object.keys(metrics_trigger).length > 0 && (
                <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 font-mono">
                  Trigger metrics: {JSON.stringify(metrics_trigger)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelectForConfig(recommendation)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
            isSelected
              ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isSelected ? 'Configuring' : 'Configure'}</span>
        </button>

        <button
          onClick={() => onQuickPreview(recommendation)}
          disabled={isLoadingPreview}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-brand-400 hover:text-brand-300 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <GitCompare className="w-3.5 h-3.5" />
          <span>Quick Preview</span>
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
