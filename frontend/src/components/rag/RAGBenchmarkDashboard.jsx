import React, { useState } from 'react';
import {
  Award,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  BarChart3,
  RefreshCw,
  Zap,
  HelpCircle
} from 'lucide-react';
import knowledgeService from '../../services/knowledgeService';

export const RAGBenchmarkDashboard = () => {
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [method, setMethod] = useState('hybrid');
  const [kVal, setKVal] = useState(5);

  const handleRunBenchmark = async () => {
    setIsRunning(true);
    try {
      const data = await knowledgeService.runBenchmark({ k: kVal, method });
      setBenchmarkData(data);
    } catch (err) {
      alert('Failed to run benchmark: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Retrieval Quality Evaluation Benchmark</h3>
            <p className="text-xs text-slate-400">
              Evaluates Recall@K, Precision@K, and Mean Reciprocal Rank (MRR) across standard ML curriculum queries.
            </p>
          </div>
        </div>

        {/* Run Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['hybrid', 'semantic', 'keyword'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  method === m
                    ? 'bg-purple-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      {benchmarkData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in duration-300">
          {/* Recall@K */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Recall@{benchmarkData.k}</span>
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {(benchmarkData.recall_at_k * 100).toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500">Target hit in top {benchmarkData.k}</div>
          </div>

          {/* Precision@K */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Precision@{benchmarkData.k}</span>
              <BarChart3 className="w-4 h-4 text-brand-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-brand-400">
              {(benchmarkData.precision_at_k * 100).toFixed(1)}%
            </div>
            <div className="text-[11px] text-slate-500">Average top-k relevancy</div>
          </div>

          {/* Mean Reciprocal Rank */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">MRR Score</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-400">
              {benchmarkData.mrr.toFixed(3)}
            </div>
            <div className="text-[11px] text-slate-500">Mean Reciprocal Rank</div>
          </div>

          {/* Avg Latency */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium">Avg Latency</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-400">
              {benchmarkData.avg_latency_ms.toFixed(1)} ms
            </div>
            <div className="text-[11px] text-slate-500">Per retrieval query</div>
          </div>
        </div>
      )}

      {/* Per-Query Breakdown Table */}
      {benchmarkData && benchmarkData.details && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-in fade-in duration-300">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Benchmark Query Diagnostic Breakdown ({benchmarkData.details.length} Test Queries)
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              Method: <span className="uppercase text-purple-400">{method}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-mono text-[11px]">
                  <th className="p-3">#</th>
                  <th className="p-3">Test Query</th>
                  <th className="p-3">Expected Ground Truth</th>
                  <th className="p-3">Hit @ 1</th>
                  <th className="p-3">Hit @ K</th>
                  <th className="p-3">Reciprocal Rank</th>
                  <th className="p-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {benchmarkData.details.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="p-3 font-semibold text-white max-w-xs">{item.query}</td>
                    <td className="p-3 text-slate-300">
                      <div className="flex flex-wrap gap-1">
                        {item.expected_topics.map((t, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-purple-300 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      {item.hit_at_1 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> YES
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> NO
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {item.hit_at_k ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> HIT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-semibold font-mono text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> MISS
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-brand-400">
                      {item.reciprocal_rank.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">
                      {item.latency_ms.toFixed(1)} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Initial Empty State before running */}
      {!benchmarkData && (
        <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
          <Award className="w-10 h-10 text-purple-400/50 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No Benchmark Run Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click "Run Benchmark" to execute the deterministic evaluation suite and calculate Recall@K, Precision@K, and Mean Reciprocal Rank (MRR).
          </p>
        </div>
      )}
    </div>
  );
};

export default RAGBenchmarkDashboard;
