import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  Divide, 
  Layers, 
  Hash, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  Wand2
} from 'lucide-react';
import Badge from '../common/Badge';

const FEATURE_TYPE_ICONS = {
  mathematical: Divide,
  interaction: Sparkles,
  ratio: Divide,
  datetime_parts: Calendar,
  cyclical: Clock,
  date_difference: Clock,
  aggregation: Layers,
  binning: Hash,
  indicator: CheckCircle2,
  frequency: TrendingUp,
  text_statistics: FileText,
};

const CONFIDENCE_BADGE_VARIANTS = {
  High: 'brand',
  Medium: 'brand',
  Low: 'slate'
};

export const FeatureOpportunityCard = ({ opportunity, onSelectOpportunity, onOpenConcept }) => {
  if (!opportunity) return null;

  const Icon = FEATURE_TYPE_ICONS[opportunity.feature_type] || Wand2;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md">
      <div className="space-y-2.5">
        {/* Header with Type, Category and Confidence */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {opportunity.category}
              </span>
              <h4 className="text-sm font-bold text-white leading-snug">
                {opportunity.title}
              </h4>
            </div>
          </div>
          <Badge variant={CONFIDENCE_BADGE_VARIANTS[opportunity.confidence] || 'brand'}>
            {opportunity.confidence} Confidence
          </Badge>
        </div>

        {/* Columns Involved */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400">Inputs:</span>
          {opportunity.columns_involved.map((col, idx) => (
            <span 
              key={idx} 
              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
            >
              {col}
            </span>
          ))}
        </div>

        {/* Educational Rationale */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          {opportunity.rationale}
        </p>
      </div>

      {/* Suggested Name & Action Buttons */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
          <span>Output:</span>
          <code className="text-brand-400 font-mono font-semibold bg-brand-950/40 px-1.5 py-0.5 rounded border border-brand-500/20 truncate">
            {opportunity.suggested_feature_name}
          </code>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {opportunity.educational_concept_id && onOpenConcept && (
            <button
              onClick={() => onOpenConcept(opportunity.educational_concept_id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
              title="Learn concept in depth"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onSelectOpportunity(opportunity)}
            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Configure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureOpportunityCard;
