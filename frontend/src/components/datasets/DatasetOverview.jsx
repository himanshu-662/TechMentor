import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Table, 
  Layers, 
  Hash, 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  UploadCloud, 
  Info, 
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Database,
  Code
} from 'lucide-react';
import Badge from '../common/Badge';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';

export const DatasetOverview = ({ dataset, onReset, onNavigate, onDataValidated }) => {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'schema'
  const workflow = useWorkflow();

  const handleNavigate = (stage) => {
    if (onDataValidated) {
      onDataValidated();
    }
    if (onNavigate) {
      onNavigate(stage);
    } else if (workflow?.goToStep) {
      workflow.goToStep(stage);
    }
  };

  if (!dataset) return null;

  const {
    filename,
    file_type,
    file_size_formatted,
    row_count,
    column_count,
    column_names = [],
    detected_data_types = {},
    columns = [],
    preview_rows = [],
    dataset_id
  } = dataset;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Learning Progression Stepper */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pipeline Progression:
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1. Ingestion (Active)
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <button
              onClick={() => handleNavigate('eda')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 font-semibold shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> 2. Profiling Diagnostics
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
            <button
              onClick={() => handleNavigate('cleaning')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-slate-700/60 transition-colors"
            >
              3. Cleaning & Missing
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Header & Metadata Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">{filename}</h1>
            <Badge variant="brand">{file_type.toUpperCase()}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dataset ID: <code className="font-mono text-slate-300">{dataset_id}</code>
          </p>
        </div>

        <button
          onClick={onReset}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors inline-flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4 text-slate-400" />
          Upload Another Dataset
        </button>
      </div>

      {/* Metadata KPI Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Rows</span>
          <div className="mt-1 text-2xl font-bold text-white">{row_count.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">Records loaded</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Columns</span>
          <div className="mt-1 text-2xl font-bold text-white">{column_count}</div>
          <span className="text-[10px] text-slate-400">Features detected</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">File Size</span>
          <div className="mt-1 text-2xl font-bold text-white">{file_size_formatted}</div>
          <span className="text-[10px] text-slate-400">Disk footprint</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Format</span>
          <div className="mt-1 text-2xl font-bold text-brand-400 font-mono">.{file_type}</div>
          <span className="text-[10px] text-slate-400">Tabular structure</span>
        </div>
      </div>

      {/* 3. Educational Card: "What is Dataset Profiling?" */}
      <div className="rounded-xl p-6 bg-gradient-to-r from-slate-900 via-brand-950/30 to-slate-900 border border-brand-500/30 shadow-lg space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">What is Dataset Profiling? (Learning Concept)</h2>
            <p className="text-xs text-brand-300">Examining structure and quality before making changes</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>Dataset profiling</strong> is the essential first step in the machine learning lifecycle. It means systematically inspecting data types, null rates, distributions, and cardinality <em>before</em> applying any cleaning, scaling, or transformation algorithms.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-white mb-1">1. Prevent Silent Bugs</div>
            <p className="text-slate-400 text-[11px]">
              Catching numbers encoded as strings or inconsistent category spellings early.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-white mb-1">2. Choose Right Algorithms</div>
            <p className="text-slate-400 text-[11px]">
              Knowing whether distributions are skewed determines if you use Median vs Mean imputation.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-white mb-1">3. Avoid Data Leakage</div>
            <p className="text-slate-400 text-[11px]">
              Ensuring validation splits are planned before calculating statistical aggregates.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation for Preview vs Column Schema */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'bg-brand-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> First 10 Rows Preview
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-2 ${
                activeTab === 'schema'
                  ? 'bg-brand-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Detected Column Types ({column_count})
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Showing first {Math.min(10, preview_rows.length)} of {row_count} rows
          </span>
        </div>

        {/* Tab 1: 10-Row Data Preview Table */}
        {activeTab === 'preview' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 w-12 text-slate-400 font-mono">#</th>
                    {column_names.map((colName) => (
                      <th key={colName} className="py-3 px-4 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white">{colName}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-brand-400 lowercase font-mono border border-slate-700">
                            {detected_data_types[colName] || 'unknown'}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {preview_rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 text-[11px] font-medium">
                        {rowIndex + 1}
                      </td>
                      {column_names.map((colName) => {
                        const val = row[colName];
                        const isNull = val === null || val === undefined;
                        return (
                          <td key={colName} className="py-2.5 px-4 whitespace-nowrap text-xs">
                            {isNull ? (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-sans font-medium">
                                null
                              </span>
                            ) : (
                              <span className="text-slate-200">{String(val)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Detected Column Schema & Types Table */}
        {activeTab === 'schema' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Column Name</th>
                    <th className="py-3 px-4 font-semibold">Detected Type</th>
                    <th className="py-3 px-4 font-semibold">Missing (Null) Count</th>
                    <th className="py-3 px-4 font-semibold">Sample Non-Null Values</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {columns.map((col) => (
                    <tr key={col.name} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">
                        {col.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 font-mono text-[11px] border border-brand-500/20">
                          {col.data_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {col.null_count > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {col.null_count} nulls ({((col.null_count / row_count) * 100).toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-brand-400 inline-flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 0 (Complete)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {col.sample_values && col.sample_values.length > 0 ? (
                          col.sample_values.map(v => JSON.stringify(v)).join(', ')
                        ) : (
                          <span className="italic text-slate-400">All null</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Next Step Banner (Proceed to 03. EDA Process) */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Ready for 03. EDA Process Diagnostics?</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            03. EDA Process computes statistical summaries, skewness indices, moments, and detected quality issues.
          </p>
        </div>
        <button
          onClick={() => handleNavigate('eda')}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-bold inline-flex items-center gap-2 shrink-0 transition-colors shadow-md shadow-brand-500/20"
        >
          <span>Proceed to 03. EDA Process</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default DatasetOverview;
