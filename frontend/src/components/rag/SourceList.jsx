import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle2, FileText } from 'lucide-react';
import SourceCitation from './SourceCitation';

export const SourceList = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-800/80">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Verified Knowledge Base Citations ({sources.length})</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-purple-300 transition-colors font-medium"
        >
          {isExpanded ? (
            <>
              Hide Excerpts <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              View All Excerpts <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Pill Badge Previews */}
      <div className="flex flex-wrap">
        {sources.map((citation, idx) => (
          <SourceCitation key={idx} citation={citation} index={idx} />
        ))}
      </div>

      {/* Expanded Detailed Excerpt Cards */}
      {isExpanded && (
        <div className="mt-3 space-y-2.5 animate-in fade-in duration-200">
          {sources.map((cit, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-950/80 border border-purple-500/20 rounded-xl text-xs space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-white">{cit.document_title}</span>
                  <span className="text-slate-400 font-mono text-[10px]">({cit.section})</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-purple-300 font-medium">
                  {cit.category}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed pl-7 italic border-l-2 border-purple-500/40 my-1">
                "{cit.excerpt}"
              </p>
              {cit.source_reference && (
                <div className="text-[10px] text-slate-400 pl-7 font-mono">
                  Ref: {cit.source_reference}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourceList;
