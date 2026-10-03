import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { 
  Copy, 
  Check, 
  Zap, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Info
} from 'lucide-react';

/**
 * Renders the assistant's response in clean, direct, borderless text and standard markdown
 * with full visual LaTeX mathematical equation rendering support via KaTeX and real-time streaming cursor.
 */
export default function StructuredRAGResponse({ 
  content, 
  isStreaming = false,
  sources = [], 
  predictionResult = null,
  followUpQuestions = [],
  onSelectQuestion,
  isError 
}) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [showSources, setShowSources] = useState(false);

  const handleCopyCode = (codeText, idx) => {
    if (!codeText) return;
    navigator.clipboard.writeText(codeText);
    setCopiedCode(idx);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isError) {
    return (
      <div className="py-2 text-rose-300 text-xs sm:text-[13px] leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-rose-200">Notice: </span>
          <span>{content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 text-slate-100 font-sans text-xs sm:text-[13.5px] leading-relaxed">
      {/* 1. Live Prediction Summary (Clean inline presentation if query was a prediction) */}
      {predictionResult && (
        <div className="flex flex-wrap items-center gap-3 py-1.5 px-3 rounded-xl bg-purple-950/30 text-xs text-slate-300 mb-1">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-slate-400 font-medium">Outcome:</span>
            <span className="text-white font-bold">
              {predictionResult.predicted_label !== undefined
                ? String(predictionResult.predicted_label)
                : String(predictionResult.predicted)}
            </span>
          </div>
          {predictionResult.confidence !== null && predictionResult.confidence !== undefined && (
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <span>Confidence:</span>
              <span className="text-emerald-400 font-bold">
                {Math.round(predictionResult.confidence * 1000) / 10}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* 2. Direct Answer in Clean, Borderless Natural Markdown Text with KaTeX Formula Rendering */}
      <div className="prose prose-invert max-w-none text-slate-100 text-xs sm:text-[13.5px] leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-base font-bold text-white mt-3 mb-1.5" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-sm font-bold text-purple-300 mt-3 mb-1" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mt-2.5 mb-1" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-slate-100 text-xs sm:text-[13.5px] leading-relaxed my-1.5" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 space-y-1 my-1.5 text-slate-200 text-xs sm:text-[13.5px]" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-5 space-y-1 my-1.5 text-slate-200 text-xs sm:text-[13.5px]" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-slate-200 leading-relaxed" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="text-white font-semibold" {...props} />
            ),
            code: ({ node, inline, className, children, ...props }) => {
              if (inline) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-slate-900/90 text-purple-300 font-mono text-[11.5px]" {...props}>
                    {children}
                  </code>
                );
              }
              const codeString = String(children).replace(/\n$/, '');
              const blockId = Math.random().toString(36).substring(7);
              return (
                <div className="relative rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/60 my-2.5 shadow-inner">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/60 text-[10px] text-slate-400 font-mono">
                    <span className="text-purple-300 font-semibold">python</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(codeString, blockId)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedCode === blockId ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 text-[11px] sm:text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            },
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-2.5 rounded-lg">
                <table className="min-w-full text-xs text-left text-slate-200 divide-y divide-slate-800/70" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="px-3 py-1.5 bg-slate-900/60 font-semibold text-white text-[11px]" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-3 py-1.5 border-t border-slate-800/40 text-[11px]" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-2 border-purple-500 pl-3 my-2 text-slate-300 italic text-xs" {...props} />
            )
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-purple-400 align-middle animate-pulse rounded-xs" />
        )}
      </div>

      {/* 3. Subtle Collapsible Sources (Shown once completed) */}
      {!isStreaming && sources && sources.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-purple-300 transition-colors font-medium cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>{sources.length} Grounded Sources Cited</span>
            {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showSources && (
            <div className="mt-2 space-y-1.5 pl-2.5 border-l-2 border-purple-500/30 animate-in fade-in duration-150">
              {sources.map((src, i) => (
                <div key={i} className="text-[11px] text-slate-400">
                  <span className="text-purple-300 font-semibold">• {src.title || 'Curriculum Reference'}</span>
                  {src.similarity && (
                    <span className="text-slate-500 font-mono ml-1.5 text-[10px]">
                      ({Math.round(src.similarity * 100)}% match)
                    </span>
                  )}
                  {src.chunk_preview && (
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{src.chunk_preview}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Simple Follow-up Suggestion Chips (Shown once completed) */}
      {!isStreaming && followUpQuestions && followUpQuestions.length > 0 && onSelectQuestion && (
        <div className="pt-2 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mr-1">
            Suggested:
          </span>
          {followUpQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectQuestion(q)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-850 border border-slate-800/60 hover:border-purple-500/40 text-slate-300 hover:text-purple-200 text-[11px] transition-colors flex items-center gap-1 text-left cursor-pointer"
            >
              <span>{q}</span>
              <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
