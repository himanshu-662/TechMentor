import React from 'react';
import { BarChart3, Sliders, Info, Sparkles } from 'lucide-react';
import Badge from '../common/Badge';

export const OutlierVisualization = ({ distribution, lowerBound, upperBound, column }) => {
  if (!distribution || distribution.count === 0) {
    return (
      <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
        No distribution data available to visualize.
      </div>
    );
  }

  const {
    min = 0,
    max = 100,
    q1 = 25,
    median = 50,
    q3 = 75,
    mean = 50,
    histogram_bins = []
  } = distribution;

  const range = (max - min) || 1;
  const getPercent = (val) => Math.max(0, Math.min(100, ((val - min) / range) * 100));

  const minPct = 0;
  const maxPct = 100;
  const q1Pct = getPercent(q1);
  const medianPct = getPercent(median);
  const q3Pct = getPercent(q3);
  const lowerFencePct = lowerBound !== null ? getPercent(lowerBound) : null;
  const upperFencePct = upperBound !== null ? getPercent(upperBound) : null;

  const maxBinCount = Math.max(...histogram_bins.map(b => b.count), 1);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Box Plot Section */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Tukey Box-and-Whisker Plot ({column})
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Five-Number Summary + Outlier Fences</span>
        </div>

        {/* SVG Box Plot Container */}
        <div className="relative pt-6 pb-8 px-4 bg-slate-950/70 rounded-xl border border-slate-800/80">
          <div className="relative h-16 w-full flex items-center">
            {/* Whiskers Line (Min to Max) */}
            <div className="absolute h-1 bg-slate-700 w-full rounded-full top-1/2 -translate-y-1/2" />

            {/* Interquartile Box (Q1 to Q3) */}
            <div
              className="absolute h-12 bg-brand-500/20 border-2 border-brand-400 rounded-lg top-1/2 -translate-y-1/2 transition-all"
              style={{
                left: `${q1Pct}%`,
                width: `${Math.max(2, q3Pct - q1Pct)}%`
              }}
            >
              {/* Median Line inside box */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-amber-400 -translate-x-1/2 shadow-lg"
                style={{ left: `${((median - q1) / ((q3 - q1) || 1)) * 100}%` }}
                title={`Median: ${median}`}
              />
            </div>

            {/* Lower Fence Marker */}
            {lowerFencePct !== null && (
              <div
                className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-rose-400 -translate-x-1/2"
                style={{ left: `${lowerFencePct}%` }}
                title={`Lower Fence: ${lowerBound}`}
              />
            )}

            {/* Upper Fence Marker */}
            {upperFencePct !== null && (
              <div
                className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-rose-400 -translate-x-1/2"
                style={{ left: `${upperFencePct}%` }}
                title={`Upper Fence: ${upperBound}`}
              />
            )}
          </div>

          {/* Scale Labels */}
          <div className="relative w-full h-4 mt-2 text-[10px] font-mono text-slate-400">
            <span className="absolute left-0">Min: {min}</span>
            <span className="absolute -translate-x-1/2 text-brand-300" style={{ left: `${q1Pct}%` }}>Q1: {q1}</span>
            <span className="absolute -translate-x-1/2 text-amber-300 font-bold" style={{ left: `${medianPct}%` }}>Median: {median}</span>
            <span className="absolute -translate-x-1/2 text-brand-300" style={{ left: `${q3Pct}%` }}>Q3: {q3}</span>
            <span className="absolute right-0">Max: {max}</span>
          </div>
        </div>
      </div>

      {/* 2. Frequency Histogram with Outlier Highlighting */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Frequency Distribution Histogram
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Outlier Bins Highlighted in Red/Amber</span>
        </div>

        {/* Histogram Bar Chart */}
        <div className="pt-6 pb-2 px-2 bg-slate-950/70 rounded-xl border border-slate-800/80">
          <div className="h-40 flex items-end gap-1.5 px-2">
            {histogram_bins.map((bin, idx) => {
              const heightPct = Math.max(8, (bin.count / maxBinCount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] font-mono p-1.5 rounded border border-slate-700 shadow-xl pointer-events-none z-10 whitespace-nowrap">
                    [{bin.bin_start} to {bin.bin_end}]: {bin.count} rows {bin.has_outlier && '(Outlier)'}
                  </div>

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t transition-all ${
                      bin.has_outlier
                        ? 'bg-rose-500/80 border-t-2 border-rose-400 hover:bg-rose-400'
                        : 'bg-brand-500/50 border-t-2 border-brand-400 hover:bg-brand-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center mt-1">
                    {bin.bin_start}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutlierVisualization;
