import React, { useState } from 'react';
import { BarChart3, BoxSelect, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Badge from '../common/Badge';

export const DistributionComparison = ({ before, after }) => {
  const [activeTab, setActiveTab] = useState('histogram'); // 'histogram', 'boxplot', 'table'

  if (!before) return null;

  // Render SVG Histogram
  const renderHistogram = (bins, title, colorScheme) => {
    if (!bins || bins.length === 0) {
      return <div className="p-8 text-center text-xs text-slate-500 italic">No histogram data</div>;
    }

    const maxCount = Math.max(...bins.map(b => b.count), 1);
    const chartHeight = 120;
    const barWidth = 100 / bins.length;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span>{title}</span>
          <span className="font-mono text-slate-500">{bins.length} Bins</span>
        </div>

        <div className="h-32 bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-end gap-1 relative overflow-hidden">
          {bins.map((b, idx) => {
            const heightPct = Math.max((b.count / maxCount) * 100, 3);
            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                  <div className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    <span>Range: [{b.bin_start.toFixed(2)}, {b.bin_end.toFixed(2)}]</span>
                    <br />
                    <span className="font-bold text-brand-400">Count: {b.count}</span>
                  </div>
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t transition-all duration-300 ${
                    colorScheme === 'brand'
                      ? 'bg-gradient-to-t from-brand-600/60 to-brand-400 hover:to-brand-300'
                      : 'bg-gradient-to-t from-blue-600/60 to-cyan-400 hover:to-cyan-300'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
          <span>{bins[0]?.bin_start?.toFixed(2)}</span>
          <span>{bins[Math.floor(bins.length / 2)]?.bin_start?.toFixed(2)}</span>
          <span>{bins[bins.length - 1]?.bin_end?.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  // Render SVG Box Plot
  const renderBoxPlot = (stats, title, colorClass) => {
    if (!stats) {
      return <div className="p-8 text-center text-xs text-slate-500 italic">No box plot data</div>;
    }

    const { min, q1, median, q3, max, lower_whisker, upper_whisker, outlier_points } = stats;
    const range = max - min === 0 ? 1 : max - min;
    const getPos = (val) => Math.min(Math.max(((val - min) / range) * 100, 0), 100);

    const q1Pos = getPos(q1);
    const medPos = getPos(median);
    const q3Pos = getPos(q3);
    const lwPos = getPos(lower_whisker);
    const uwPos = getPos(upper_whisker);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span>{title}</span>
          <span className="font-mono text-slate-500 text-[10px]">IQR = {(q3 - q1).toFixed(2)}</span>
        </div>

        <div className="h-20 bg-slate-950 p-4 rounded-lg border border-slate-800 relative flex items-center">
          {/* Whisker Line */}
          <div
            className="absolute h-0.5 bg-slate-600 top-1/2 -translate-y-1/2"
            style={{ left: `${lwPos}%`, width: `${Math.max(uwPos - lwPos, 1)}%` }}
          />

          {/* Lower Whisker Cap */}
          <div
            className="absolute w-0.5 h-6 bg-slate-400 top-1/2 -translate-y-1/2"
            style={{ left: `${lwPos}%` }}
          />

          {/* Upper Whisker Cap */}
          <div
            className="absolute w-0.5 h-6 bg-slate-400 top-1/2 -translate-y-1/2"
            style={{ left: `${uwPos}%` }}
          />

          {/* Interquartile Box (Q1 to Q3) */}
          <div
            className={`absolute h-8 rounded border top-1/2 -translate-y-1/2 opacity-80 ${colorClass}`}
            style={{ left: `${q1Pos}%`, width: `${Math.max(q3Pos - q1Pos, 2)}%` }}
          />

          {/* Median Line */}
          <div
            className="absolute w-1 h-8 bg-amber-400 top-1/2 -translate-y-1/2 z-10"
            style={{ left: `${medPos}%` }}
            title={`Median: ${median.toFixed(2)}`}
          />

          {/* Outlier Points */}
          {outlier_points && outlier_points.map((pt, idx) => (
            <div
              key={idx}
              className="absolute w-2 h-2 rounded-full bg-rose-400/90 top-1/2 -translate-y-1/2 -translate-x-1/2 border border-rose-600"
              style={{ left: `${getPos(pt)}%` }}
              title={`Outlier: ${pt}`}
            />
          ))}
        </div>

        {/* Labels */}
        <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
          <span>Min: {min.toFixed(2)}</span>
          <span className="text-amber-400">Median: {median.toFixed(2)}</span>
          <span>Max: {max.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  const getMetricDelta = (beforeVal, afterVal, isInverse = false) => {
    if (beforeVal === undefined || afterVal === undefined || beforeVal === null || afterVal === null) return null;
    const delta = afterVal - beforeVal;
    if (Math.abs(delta) < 1e-4) return <Minus className="w-3 h-3 text-slate-500" />;
    const isPositive = delta > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = (isPositive && !isInverse) || (!isPositive && isInverse) ? 'text-brand-400' : 'text-blue-400';
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono ${color}`}>
        <Icon className="w-3 h-3" />
        <span>{delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}</span>
      </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-4">
      {/* View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Before vs. After Distribution Overlay
            </h3>
            <p className="text-[11px] text-slate-400">
              Visualizing changes in scale, center, spread, and tail shape
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('histogram')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'histogram'
                ? 'bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Histogram
          </button>
          <button
            onClick={() => setActiveTab('boxplot')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'boxplot'
                ? 'bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Box Plot
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'table'
                ? 'bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Metrics Table
          </button>
        </div>
      </div>

      {/* Main Comparative View */}
      {activeTab === 'histogram' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {renderHistogram(before.histogram_bins, 'Before Transformation (Raw Scale)', 'blue')}
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {after ? (
              renderHistogram(after.histogram_bins, 'After Transformation (Transformed Scale)', 'brand')
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">
                Click "Preview" to simulate transformed histogram
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'boxplot' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {renderBoxPlot(before.boxplot_stats, 'Before (Raw Spread)', 'bg-blue-500/30 border-blue-400')}
          </div>
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {after ? (
              renderBoxPlot(after.boxplot_stats, 'After (Transformed Spread)', 'bg-brand-500/30 border-brand-400')
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">
                Click "Preview" to simulate transformed box plot
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metrics Table Always Accessible / In Table Tab */}
      {(activeTab === 'table' || !after) && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Distribution Metric</th>
                <th className="p-2.5">Before</th>
                <th className="p-2.5">After</th>
                <th className="p-2.5">Shift (Delta)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              <tr>
                <td className="p-2 font-sans text-slate-400 font-medium">Mean (μ)</td>
                <td className="p-2">{before.mean !== null ? before.mean.toFixed(3) : 'N/A'}</td>
                <td className="p-2 text-brand-300">{after?.mean !== null && after?.mean !== undefined ? after.mean.toFixed(3) : '—'}</td>
                <td className="p-2">{after && getMetricDelta(before.mean, after.mean)}</td>
              </tr>
              <tr>
                <td className="p-2 font-sans text-slate-400 font-medium">Median</td>
                <td className="p-2">{before.median !== null ? before.median.toFixed(3) : 'N/A'}</td>
                <td className="p-2 text-brand-300">{after?.median !== null && after?.median !== undefined ? after.median.toFixed(3) : '—'}</td>
                <td className="p-2">{after && getMetricDelta(before.median, after.median)}</td>
              </tr>
              <tr>
                <td className="p-2 font-sans text-slate-400 font-medium">Std Dev (σ)</td>
                <td className="p-2">{before.std !== null ? before.std.toFixed(3) : 'N/A'}</td>
                <td className="p-2 text-brand-300">{after?.std !== null && after?.std !== undefined ? after.std.toFixed(3) : '—'}</td>
                <td className="p-2">{after && getMetricDelta(before.std, after.std)}</td>
              </tr>
              <tr>
                <td className="p-2 font-sans text-slate-400 font-medium">Min</td>
                <td className="p-2">{before.min !== null ? before.min.toFixed(3) : 'N/A'}</td>
                <td className="p-2 text-brand-300">{after?.min !== null && after?.min !== undefined ? after.min.toFixed(3) : '—'}</td>
                <td className="p-2">{after && getMetricDelta(before.min, after.min)}</td>
              </tr>
              <tr>
                <td className="p-2 font-sans text-slate-400 font-medium">Max</td>
                <td className="p-2">{before.max !== null ? before.max.toFixed(3) : 'N/A'}</td>
                <td className="p-2 text-brand-300">{after?.max !== null && after?.max !== undefined ? after.max.toFixed(3) : '—'}</td>
                <td className="p-2">{after && getMetricDelta(before.max, after.max)}</td>
              </tr>
              <tr>
                <td className="p-2 font-sans text-slate-400 font-medium">Skewness</td>
                <td className="p-2">{before.skewness !== null ? before.skewness.toFixed(3) : 'N/A'}</td>
                <td className="p-2 text-brand-300">{after?.skewness !== null && after?.skewness !== undefined ? after.skewness.toFixed(3) : '—'}</td>
                <td className="p-2">{after && getMetricDelta(Math.abs(before.skewness || 0), Math.abs(after.skewness || 0), true)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DistributionComparison;
