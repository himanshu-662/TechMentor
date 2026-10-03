import React, { useState } from 'react';
import { BookOpen, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export const SourceCitation = ({ citation, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!citation) return null;

  return (
    <div className="relative inline-block mr-2 mb-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/25 transition-all shadow-sm"
      >
        <BookOpen className="w-3 h-3 text-purple-400" />
        <span className="font-semibold text-purple-200">[{index + 1}]</span>
        <span className="truncate max-w-[140px]">{citation.document_title}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 bg-slate-900 border border-purple-500/30 rounded-xl p-3.5 shadow-2xl z-50 text-left text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                {citation.category || 'General Knowledge'}
              </div>
              <h4 className="font-semibold text-white leading-snug">{citation.document_title}</h4>
              <p className="text-[11px] text-slate-400 font-mono">Section: {citation.section}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-1 rounded"
            >
              ✕
            </button>
          </div>

          <div className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
            "{citation.excerpt}"
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
            <span className="flex items-center gap-1 text-brand-400">
              <CheckCircle2 className="w-3 h-3" /> Grounded Source
            </span>
            {citation.relevance_score !== undefined && (
              <span>Relevance: {(citation.relevance_score * 100).toFixed(0)}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceCitation;
