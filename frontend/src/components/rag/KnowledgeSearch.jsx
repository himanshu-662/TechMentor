import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Zap,
  Key,
  Clock,
  CheckCircle2,
  FileText
} from 'lucide-react';
import knowledgeService from '../../services/knowledgeService';

export const KnowledgeSearch = () => {
  const [query, setQuery] = useState('');
  const [retrievalMethod, setRetrievalMethod] = useState('hybrid');
  const [category, setCategory] = useState('');
  const [topK, setTopK] = useState(4);
  const [results, setResults] = useState([]);
  const [latencyMs, setLatencyMs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await knowledgeService.searchKnowledge({
        query: query.trim(),
        retrieval_method: retrievalMethod,
        category: category || undefined,
        top_k: topK
      });
      setResults(data.results || []);
      setLatencyMs(data.latency_ms);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQueries = [
    'What is overfitting and how to avoid it?',
    'What is the difference between precision and recall?',
    'How does Principal Component Analysis work?',
    'Why use IQR for outlier detection?',
    'LangChain prompt templates and chains'
  ];

  return (
    <div className="space-y-6">
      {/* Search Bar & Configuration */}
      <form onSubmit={handleSearch} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Search className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Hybrid Retrieval Inspector</h3>
            <p className="text-[11px] text-slate-400">Test and inspect BM25 keyword, dense vector semantic, and hybrid rank fusion</p>
          </div>
        </div>

        {/* Input Field */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type an ML question or technical keyword (e.g., 'What is recall?')..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            {isLoading ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Retrieve</span>
          </button>
        </div>

        {/* Query Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mr-1">Presets:</span>
          {sampleQueries.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sample);
              }}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Controls Row */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Method Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-purple-400" />
              <span>Retrieval Mode</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['hybrid', 'semantic', 'keyword'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setRetrievalMethod(m)}
                  className={`py-1 rounded-lg font-medium text-[11px] capitalize transition-all ${
                    retrievalMethod === m
                      ? 'bg-brand-500 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Top-K Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Top-K Results</span>
              <span className="font-mono text-brand-400 font-bold">{topK} Chunks</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {/* Latency Status */}
          <div className="flex items-end justify-end pb-1 text-slate-400 font-mono text-[11px]">
            {latencyMs !== null && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Latency: {latencyMs.toFixed(1)} ms</span>
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Results Inspector */}
      {hasSearched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Retrieved Chunks ({results.length})
            </h4>
            <span className="text-[11px] font-mono text-purple-400">
              Method: <span className="uppercase">{retrievalMethod}</span>
            </span>
          </div>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((res, idx) => (
                <div
                  key={res.chunk_id || idx}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-300 font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <div>
                        <h5 className="text-sm font-semibold text-white">{res.title}</h5>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Section: <span className="text-purple-300">{res.section}</span> • Category: {res.category}
                        </p>
                      </div>
                    </div>

                    {/* Score Meter */}
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-brand-400">
                        {(res.score * 100).toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Score</div>
                    </div>
                  </div>

                  {/* Text Excerpt */}
                  <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {res.text}
                  </div>

                  {/* Component Breakdown */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-3">
                      {res.semantic_score !== undefined && res.semantic_score !== null && (
                        <span>Semantic: {(res.semantic_score * 100).toFixed(0)}%</span>
                      )}
                      {res.keyword_score !== undefined && res.keyword_score !== null && (
                        <span>Keyword: {(res.keyword_score * 100).toFixed(0)}%</span>
                      )}
                    </div>
                    {res.source_reference && (
                      <span className="truncate max-w-[200px]">Ref: {res.source_reference}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400">
              No matching chunks found above threshold.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeSearch;
