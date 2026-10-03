import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, BookOpen, GitCompare, AlertCircle } from 'lucide-react';
import Badge from '../common/Badge';

export const ExplanationCard = ({
  operationTitle = "Missing Value Imputation",
  moduleName = "Cleaning",
  technique = "Median Imputation",
  whatHappened = "Replaced 42 missing numerical values in 'MonthlyIncome' with the distribution median ($4,250).",
  whyItHappened = "The column had 3.8% missing entries with strong right-skewness (skewness coefficient: 2.14).",
  whySelected = "Median imputation preserves central tendency for skewed distributions without being pulled by extreme outliers.",
  whatChanged = "Filled 42 null values. Mean shifted from $4,890 to $4,510; standard deviation decreased from $2,100 to $1,980.",
  whenToUse = "Best for continuous features with moderate missingness (<10%) and noticeable skewness or outliers where mean imputation would distort the metric.",
  alternatives = [
    { name: "KNN Imputation", desc: "Considers feature correlations but is computationally intensive for large datasets." },
    { name: "Mean Imputation", desc: "Best only when data is strictly normally distributed without outliers." },
    { name: "Dropping Rows", desc: "Causes unacceptable sample loss when dataset is small or medium." },
  ]
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 flex items-center justify-between cursor-pointer bg-slate-900/80 hover:bg-slate-850 transition-colors border-b border-slate-800/60"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">{operationTitle}</h3>
              <Badge variant="brand">{moduleName}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Technique: <span className="text-slate-200 font-medium">{technique}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-400 font-medium hidden sm:inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Explainable Operation
          </span>
          <button className="text-slate-400 hover:text-slate-200">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Explanation Body */}
      {isOpen && (
        <div className="p-5 space-y-4 text-sm bg-slate-950/40">
          {/* 1. What Happened */}
          <div className="rounded-lg p-3.5 bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wide mb-1">
              <HelpCircle className="w-3.5 h-3.5" /> 1. What happened?
            </div>
            <p className="text-slate-300 leading-relaxed">{whatHappened}</p>
          </div>

          {/* 2 & 4. Why it happened & Why selected */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg p-3.5 bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">
                <AlertCircle className="w-3.5 h-3.5" /> 2. Why did it happen?
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">{whyItHappened}</p>
            </div>

            <div className="rounded-lg p-3.5 bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wide mb-1">
                <Sparkles className="w-3.5 h-3.5" /> 3. Why was this technique selected?
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">{whySelected}</p>
            </div>
          </div>

          {/* 5. What Changed */}
          <div className="rounded-lg p-3.5 bg-slate-900 border border-slate-800">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">
              4. What changed in the dataset?
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">{whatChanged}</p>
          </div>

          {/* 6. Alternatives & When to use */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg p-3.5 bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wide mb-2">
                <GitCompare className="w-3.5 h-3.5" /> 5. What alternatives exist?
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {alternatives.map((alt, idx) => (
                  <li key={idx} className="flex flex-col">
                    <span className="font-semibold text-slate-200">• {alt.name}:</span>
                    <span className="text-slate-400 pl-3">{alt.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg p-3.5 bg-slate-900 border border-slate-800">
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                6. When should this technique be used?
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">{whenToUse}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplanationCard;
