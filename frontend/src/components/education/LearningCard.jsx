import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Database,
  Brain,
  AlertTriangle,
  Lightbulb,
  Table,
  CheckCircle,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import Badge from '../common/Badge';
import KnowledgeCheck from './KnowledgeCheck';

export const LearningCard = ({
  concept,
  evidence = null,
  initialLevel = 'beginner',
  onSelectConcept = null,
  embedded = false,
  showKnowledgeCheck = true,
  columnName = null,
}) => {
  const [level, setLevel] = useState(initialLevel);
  const [showExampleTable, setShowExampleTable] = useState(true);
  const [expandedDetails, setExpandedDetails] = useState(!embedded);

  if (!concept) {
    return null;
  }

  // Choose the explanation text corresponding to the active level
  const getExplanation = () => {
    if (level === 'intermediate') return concept.intermediate_explanation;
    if (level === 'technical') return concept.technical_explanation;
    return concept.beginner_explanation;
  };

  const categoryLabelMap = {
    data_fundamentals: 'Data Fundamentals',
    data_quality: 'Data Quality',
    data_types: 'Data Types',
    statistics: 'Statistics',
    advanced: 'Advanced Concept'
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all ${
      embedded ? 'border-brand-500/30 ring-1 ring-brand-500/20' : ''
    }`}>
      {/* Top Banner / Header */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="brand">
              {categoryLabelMap[concept.category] || concept.category}
            </Badge>
            {columnName && (
              <Badge variant="purple" className="font-mono">
                Column: {columnName}
              </Badge>
            )}
          </div>

          {/* 3-Tier Level Selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setLevel('beginner')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                level === 'beginner'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Beginner
            </button>
            <button
              type="button"
              onClick={() => setLevel('intermediate')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                level === 'intermediate'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Intermediate
            </button>
            <button
              type="button"
              onClick={() => setLevel('technical')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                level === 'technical'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Technical
            </button>
          </div>
        </div>

        {/* Title & Short Definition */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {concept.title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {concept.short_definition}
            </p>
          </div>
        </div>
      </div>

      {/* Main Educational Body */}
      <div className="p-5 space-y-5">
        {/* Level-Specific Explanation Box */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm leading-relaxed">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              {level.toUpperCase()} LEVEL EXPLANATION
            </span>
            <span className="text-slate-500 lowercase">
              {level === 'beginner' && 'everyday intuitive analogy'}
              {level === 'intermediate' && 'data science intuition'}
              {level === 'technical' && 'mathematical & algorithmic depth'}
            </span>
          </div>
          <p className="text-slate-200 font-normal whitespace-pre-line">
            {getExplanation()}
          </p>
        </div>

        {/* Grounded Real Dataset Evidence (if provided) */}
        {evidence && (
          <div className="p-4 rounded-xl bg-brand-950/30 border border-brand-500/30 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
              <Database className="w-3.5 h-3.5" />
              Live Dataset Evidence (Real Profiling Metrics)
            </div>
            <p className="text-sm font-medium text-slate-100 mb-3">
              {evidence.summary_statement}
            </p>
            {evidence.metrics && Object.keys(evidence.metrics).length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-brand-500/20 text-xs">
                {Object.entries(evidence.metrics)
                  .filter(([k]) => k !== 'column')
                  .slice(0, 4)
                  .map(([k, val]) => (
                    <div key={k} className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-400 block text-[10px] uppercase font-mono truncate">
                        {k.replace(/_/g, ' ')}
                      </span>
                      <span className="text-white font-semibold font-mono text-xs">
                        {typeof val === 'number' ? (Number.isInteger(val) ? val : val.toFixed(2)) : String(val ?? 'N/A')}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Real-World Concrete Example */}
        {concept.real_world_example && (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wide">
                <Table className="w-3.5 h-3.5 text-blue-400" />
                Real-World Example: {concept.real_world_example.title}
              </div>
              {concept.real_world_example.table_headers && (
                <button
                  type="button"
                  onClick={() => setShowExampleTable(!showExampleTable)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  {showExampleTable ? 'Hide Table' : 'Show Table'}
                  {showExampleTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-3">
              {concept.real_world_example.description}
            </p>

            {showExampleTable && concept.real_world_example.table_headers && (
              <div className="overflow-x-auto rounded-lg border border-slate-800 mb-3">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                    <tr>
                      {concept.real_world_example.table_headers.map((th, idx) => (
                        <th key={idx} className="p-2 font-mono">{th}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-slate-300">
                    {concept.real_world_example.table_rows?.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 font-mono">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300">
              <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span><strong>Key Takeaway:</strong> {concept.real_world_example.takeaway}</span>
            </div>
          </div>
        )}

        {/* Expandable Deep-Dive Section */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setExpandedDetails(!expandedDetails)}
            className="w-full py-2 px-3 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-850 flex items-center justify-between text-xs font-semibold text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              {expandedDetails ? 'Collapse Deep Dive & Interview Prep' : 'Expand Deep Dive & Interview Prep'}
            </span>
            {expandedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedDetails && (
            <div className="mt-3 space-y-4 text-xs">
              {/* Machine Learning Impact */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center gap-1.5 font-semibold text-purple-400 uppercase tracking-wide mb-1.5">
                  <Brain className="w-3.5 h-3.5" />
                  Machine Learning Model Impact
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {concept.ml_impact}
                </p>
              </div>

              {/* Common Mistakes & Traps */}
              {concept.common_mistakes && concept.common_mistakes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400 uppercase tracking-wide mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Common Traps to Avoid
                  </div>
                  <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                    {concept.common_mistakes.map((mistake, mIdx) => (
                      <li key={mIdx} className="leading-relaxed">{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Standard Methods Pills */}
              {concept.common_methods && concept.common_methods.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Standard Industry Functions & Techniques
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {concept.common_methods.map((method, mIdx) => (
                      <code
                        key={mIdx}
                        className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-brand-300 font-mono text-[11px]"
                      >
                        {method}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Interview Pro-Tip */}
              {concept.interview_tip && (
                <div className="p-3.5 rounded-xl bg-brand-950/25 border border-brand-500/25">
                  <div className="flex items-center gap-1.5 font-semibold text-brand-400 uppercase tracking-wide mb-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Data Science Interview Pro-Tip
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {concept.interview_tip}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Concepts Cross-Linking */}
        {concept.related_concepts && concept.related_concepts.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Related Concepts to Explore:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {concept.related_concepts.map((relId) => (
                <button
                  key={relId}
                  type="button"
                  onClick={() => onSelectConcept && onSelectConcept(relId)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-brand-500/20 hover:text-brand-300 border border-slate-700 hover:border-brand-500/30 text-xs font-medium text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{relId.replace(/_/g, ' ')}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Embedded Interactive Knowledge Check */}
        {showKnowledgeCheck && concept.knowledge_check && (
          <div className="pt-2">
            <KnowledgeCheck
              knowledgeCheck={concept.knowledge_check}
              conceptTitle={concept.title}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningCard;
