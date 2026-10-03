import React from 'react';
import { PieChart, Layers, CheckCircle2, ShieldCheck, BarChart3 } from 'lucide-react';
import Badge from '../common/Badge';

export const SplitDistributionChart = ({ splitResult }) => {
  if (!splitResult) return null;

  const { 
    train_rows, 
    test_rows, 
    train_percentage, 
    test_percentage, 
    target_type, 
    target_distribution,
    target_column 
  } = splitResult;

  // Class Distribution Data if Classification
  let classDistList = [];
  if (target_type === 'classification' && target_distribution?.train_counts) {
    const trainCounts = target_distribution.train_counts;
    const testCounts = target_distribution.test_counts || {};
    const allLabels = Array.from(new Set([...Object.keys(trainCounts), ...Object.keys(testCounts)]));

    classDistList = allLabels.map(label => {
      const trCount = trainCounts[label] || 0;
      const teCount = testCounts[label] || 0;
      const trTotal = train_rows || 1;
      const teTotal = test_rows || 1;

      return {
        label: String(label),
        trainCount: trCount,
        testCount: teCount,
        trainPct: Math.round((trCount / trTotal) * 1000) / 10,
        testPct: Math.round((teCount / teTotal) * 1000) / 10
      };
    });
  }

  return (
    <div className="space-y-6">
      {/* Partition Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Train Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-950 border border-blue-500/30 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-xs font-bold text-blue-300">Training Fold (X_train, y_train)</span>
            </div>
            <Badge variant="blue">{train_percentage}%</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{train_rows.toLocaleString()}</span>
            <span className="text-xs text-slate-400">rows</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${train_percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Used strictly for model fitting & parameter estimation in Step 11.
          </p>
        </div>

        {/* Test Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span className="text-xs font-bold text-purple-300">Testing Fold (X_test, y_test)</span>
            </div>
            <Badge variant="purple">{test_percentage}%</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">{test_rows.toLocaleString()}</span>
            <span className="text-xs text-slate-400">rows</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${test_percentage}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Completely isolated for unbiased evaluation in Steps 12 & 13.
          </p>
        </div>
      </div>

      {/* Target Distribution Breakdown */}
      {target_type === 'classification' && classDistList.length > 0 ? (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Target Stratification Proportions ({target_column})
              </h4>
            </div>
            <Badge variant="brand">Preserved Class Balance</Badge>
          </div>

          <div className="space-y-4 pt-1">
            {classDistList.map((item) => (
              <div key={item.label} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">Class: "{item.label}"</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                    <span>Train: <strong className="text-blue-400">{item.trainPct}%</strong> ({item.trainCount})</span>
                    <span>Test: <strong className="text-purple-400">{item.testPct}%</strong> ({item.testCount})</span>
                  </div>
                </div>

                {/* Comparative Dual Progress Bars */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-blue-400 font-semibold w-10">Train</span>
                    <div className="w-full bg-slate-800/70 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${item.trainPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-purple-400 font-semibold w-10">Test</span>
                    <div className="w-full bg-slate-800/70 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${item.testPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Stratified sampling ensures the percentage of each target class in the training fold matches the test fold.
          </p>
        </div>
      ) : target_type === 'regression' && target_distribution ? (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Continuous Target Moments Comparison ({target_column})
            </h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Train Mean</span>
              <span className="text-sm font-bold font-mono text-blue-400">{target_distribution.train_mean ?? 'N/A'}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Test Mean</span>
              <span className="text-sm font-bold font-mono text-purple-400">{target_distribution.test_mean ?? 'N/A'}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Train Std Dev</span>
              <span className="text-sm font-bold font-mono text-blue-400">{target_distribution.train_std ?? 'N/A'}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Test Std Dev</span>
              <span className="text-sm font-bold font-mono text-purple-400">{target_distribution.test_std ?? 'N/A'}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SplitDistributionChart;
