import React from 'react';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

export const LearningPrincipleBanner = () => {
  return (
    <div className="rounded-xl p-5 bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-brand-500/30 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide">
              Core Product Principle: Learning-First & Explainable Data Prep
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Not a Black-Box
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            TechMentor's DataMentor engine is designed so that every automated transformation, imputation, scaling, and feature selection step is transparent and understandable to beginners.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              <span>What & Why Happened</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              <span>Technique Selection Logic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              <span>Measurable Impact Diffs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
              <span>Alternatives & Guidance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPrincipleBanner;
