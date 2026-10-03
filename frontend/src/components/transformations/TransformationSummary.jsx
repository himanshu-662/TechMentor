import React, { useState } from 'react';
import { 
  Sliders, 
  Search, 
  Filter, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  BarChart2, 
  Layers,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import Badge from '../common/Badge';

export const TransformationSummary = ({ summaryData, onSelectColumn }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  if (!summaryData) return null;

  const {
    dataset_id,
    current_version,
    total_rows,
    total_columns,
    numerical_columns_count,
    columns = []
  } = summaryData;

  const filteredColumns = columns.filter((col) => {
    const matchesSearch = col.column.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'all' || col.recommended_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const skewedCount = columns.filter(c => Math.abs(c.skewness || 0) > 1.0).length;
  const outlierCount = columns.filter(c => (c.outlier_percentage || 0) > 2.0).length;

  const METHOD_COLORS = {
    standard: 'blue',
    minmax: 'brand',
    robust: 'purple',
    log1p: 'amber',
    yeo_johnson: 'brand',
    box_cox: 'indigo',
    none: 'slate'
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Numerical Features</span>
            <Sliders className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-bold text-white">{numerical_columns_count}</div>
          <p className="text-[11px] text-slate-500">out of {total_columns} total dataset features</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Skewed Features (|skew| &gt; 1.0)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{skewedCount}</div>
          <p className="text-[11px] text-slate-500">Recommend Log1p or Yeo-Johnson</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Features with Outliers (&gt;2%)</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{outlierCount}</div>
          <p className="text-[11px] text-slate-500">Recommend RobustScaler</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Snapshot Version</span>
            <Badge variant="purple">v{current_version}</Badge>
          </div>
          <div className="text-2xl font-bold text-white">v{current_version}</div>
          <p className="text-[11px] text-slate-500">Working non-destructive state</p>
        </div>
      </div>

      {/* Pedagogical Rule Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-brand-500/30 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 text-xs">
          <div className="font-bold text-brand-300">Core Principle: Not every feature needs transformation.</div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Tree-based models (Random Forest, XGBoost) split on rank orders and do not require scaling. 
            However, distance algorithms (KNN, SVM, K-Means) and linear regressions with regularization (Lasso/Ridge) 
            strictly require normalized scales to perform fairly.
          </p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search numerical column..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Recommended Methods</option>
            <option value="standard">StandardScaler</option>
            <option value="minmax">MinMaxScaler</option>
            <option value="robust">RobustScaler</option>
            <option value="log1p">Log1p</option>
            <option value="yeo_johnson">Yeo-Johnson</option>
            <option value="box_cox">Box-Cox</option>
          </select>
        </div>
      </div>

      {/* Feature Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Numerical Feature</th>
                <th className="p-3">Mean / Median</th>
                <th className="p-3">Spread (Std / Min - Max)</th>
                <th className="p-3">Skewness</th>
                <th className="p-3">Outliers</th>
                <th className="p-3">Recommended Transformation</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredColumns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 italic">
                    No numerical columns matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredColumns.map((col) => (
                  <tr key={col.column} className="hover:bg-slate-850/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{col.column}</div>
                      <span className="text-[10px] font-mono text-slate-500">{col.data_type}</span>
                    </td>

                    <td className="p-3 font-mono text-[11px]">
                      <div>μ = {col.mean !== null ? col.mean.toFixed(2) : 'N/A'}</div>
                      <div className="text-slate-400 text-[10px]">med = {col.median !== null ? col.median.toFixed(2) : 'N/A'}</div>
                    </td>

                    <td className="p-3 font-mono text-[11px]">
                      <div>σ = {col.std !== null ? col.std.toFixed(2) : 'N/A'}</div>
                      <div className="text-slate-400 text-[10px]">[{col.min?.toFixed(1)}, {col.max?.toFixed(1)}]</div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span>{col.skewness !== null ? col.skewness.toFixed(2) : '0.00'}</span>
                        {Math.abs(col.skewness || 0) > 1.0 && (
                          <Badge variant="amber">Skewed</Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span>{col.outlier_percentage.toFixed(1)}%</span>
                        {col.outlier_percentage > 2.0 && (
                          <Badge variant="purple">Heavy Tail</Badge>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <Badge variant={METHOD_COLORS[col.recommended_method] || 'brand'}>
                        {col.recommended_method}
                      </Badge>
                    </td>

                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectColumn(col.column)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-brand-400 hover:text-brand-300 font-semibold text-xs border border-slate-800 hover:border-slate-700 transition-all inline-flex items-center gap-1"
                      >
                        <span>Configure</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransformationSummary;
