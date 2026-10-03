import React, { useState } from 'react';
import { Activity, TrendingUp, Info, Award, CheckCircle } from 'lucide-react';
import Badge from '../common/Badge';

export const ScreePlotVisualizer = ({ screeData = [], totalVariance = 0, method = 'pca' }) => {
  const [selectedComp, setSelectedComp] = useState(null);

  if (!screeData || screeData.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
        Simulate subspace to visualize the Scree Plot and variance ratios.
      </div>
    );
  }

  const numComponents = screeData.length;
  const maxIndividualRatio = Math.max(...screeData.map(d => d.explained_variance_ratio), 0.01);
  const totalVariancePct = (totalVariance * 100).toFixed(1);

  // Theoretical Kaiser threshold: average variance per feature is 1 / numComponents (in normalized space)
  const kaiserRatioThreshold = 1.0 / numComponents;

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 animate-fadeIn">
      {/* Title & Metrics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Scree Plot & Cumulative Explained Variance
            </h4>
            <p className="text-[11px] text-slate-400">
              Evaluates variance captured per component and cumulative retention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={parseFloat(totalVariancePct) >= 80 ? 'brand' : 'amber'}>
            Total Retained: {totalVariancePct}%
          </Badge>
          <Badge variant="purple">
            {numComponents} {method.toUpperCase()} Component{numComponents > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Threshold Indicators Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-slate-300">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-brand-600 to-brand-400" />
          <span>Individual Variance</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <div className="w-3 h-0.5 bg-brand-400" />
          <span>Cumulative Line</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-300">
          <div className="w-3 h-0.5 border-t border-dashed border-amber-400" />
          <span>80% Quality Threshold</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-300">
          <div className="w-3 h-0.5 border-t border-dashed border-purple-400" />
          <span>90% High-Fidelity Threshold</span>
        </div>
      </div>

      {/* SVG Interactive Scree Chart */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
        <div className="relative h-56 w-full">
          {/* Reference Guideline: 80% Cumulative */}
          <div 
            className="absolute left-0 right-0 border-t border-dashed border-amber-500/40 z-10 flex items-center justify-end pr-2 text-[10px] text-amber-400 font-mono"
            style={{ top: '20%' }}
          >
            80% Retention
          </div>

          {/* Reference Guideline: 90% Cumulative */}
          <div 
            className="absolute left-0 right-0 border-t border-dashed border-purple-500/40 z-10 flex items-center justify-end pr-2 text-[10px] text-purple-400 font-mono"
            style={{ top: '10%' }}
          >
            90% Retention
          </div>

          {/* Bars and Line Chart */}
          <div className="absolute inset-0 flex items-end justify-around gap-2 px-2 pb-6">
            {screeData.map((d, idx) => {
              const indPct = d.explained_variance_ratio * 100;
              const cumPct = d.cumulative_variance_ratio * 100;
              const barHeightPct = (d.explained_variance_ratio / maxIndividualRatio) * 75;
              const isSelected = selectedComp === idx;
              const passesKaiser = d.explained_variance_ratio >= kaiserRatioThreshold;

              return (
                <div
                  key={d.component}
                  onClick={() => setSelectedComp(idx)}
                  className="flex-1 max-w-[80px] h-full flex flex-col justify-end items-center cursor-pointer group"
                >
                  {/* Cumulative dot indicator above bar */}
                  <div 
                    className="relative w-full flex justify-center mb-1 transition-transform group-hover:scale-110"
                    title={`Cumulative: ${cumPct.toFixed(1)}%`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-400 border-2 border-slate-900 shadow-sm" />
                    <span className="absolute -top-4 text-[9px] font-mono font-bold text-brand-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {cumPct.toFixed(0)}%
                    </span>
                  </div>

                  {/* Individual Variance Bar */}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 relative ${
                      isSelected
                        ? 'bg-gradient-to-t from-brand-600 via-brand-500 to-amber-400 shadow-lg shadow-brand-500/20'
                        : 'bg-gradient-to-t from-slate-800 to-brand-500/70 group-hover:to-brand-400'
                    }`}
                    style={{ height: `${Math.max(barHeightPct, 6)}%` }}
                  >
                    {/* Hover Tooltip Value */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {indPct.toFixed(1)}%
                    </div>
                  </div>

                  {/* Component X-Axis Label */}
                  <div className="pt-2 text-center">
                    <span className={`text-[10px] font-mono font-bold block ${
                      isSelected ? 'text-brand-300' : 'text-slate-400'
                    }`}>
                      {d.component_name}
                    </span>
                    {passesKaiser && (
                      <span className="text-[8px] text-amber-400 font-bold block" title="Satisfies Kaiser criterion">
                        ★ &gt; Avg
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Component Inspection Box */}
        {selectedComp !== null && screeData[selectedComp] && (
          <div className="p-3 rounded-lg bg-slate-900 border border-brand-500/30 text-xs flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white font-mono">{screeData[selectedComp].component_name}:</span>
              <span className="text-brand-300 font-mono">
                {(screeData[selectedComp].explained_variance_ratio * 100).toFixed(2)}% individual variance
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-brand-400 font-mono">
                {(screeData[selectedComp].cumulative_variance_ratio * 100).toFixed(2)}% cumulative
              </span>
            </div>

            {screeData[selectedComp].singular_value && (
              <div className="text-[11px] font-mono text-slate-400">
                Singular Value (σ): <strong className="text-slate-200">{screeData[selectedComp].singular_value}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pedagogical Scree Heuristics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
          <div className="font-bold text-amber-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Cattell's Elbow Rule
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Locate the point on the scree plot where the steep downward drop suddenly levels out into flat rubble (the "elbow"). Components before the elbow capture true underlying signal; components along the flat tail represent random noise.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
          <div className="font-bold text-brand-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> 80% to 90% Threshold Heuristic
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            For predictive modeling, retain the minimum number of components required to exceed <strong>80%</strong> (standard) or <strong>90%</strong> (high precision) cumulative explained variance to avoid throwing away valuable signal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScreePlotVisualizer;
