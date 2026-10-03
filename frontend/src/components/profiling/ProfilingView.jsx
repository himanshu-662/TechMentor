import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Copy, 
  Layers, 
  Sliders, 
  RefreshCw,
  Info,
  Calendar,
  Key,
  Database,
  Eye,
  BookOpen
} from 'lucide-react';
import Badge from '../common/Badge';
import { getDatasetProfile } from '../../services/datasetService';
import ConceptModal from '../education/ConceptModal';
import { useWorkflow } from '../../state/WorkflowContext';

export const ProfilingView = ({ 
  activeDataset: propActiveDataset, 
  datasetId: propDatasetId,
  onNavigateToCleaning, 
  onNavigateToDatasets 
}) => {
  const workflow = useWorkflow();
  const effectiveDataset = propActiveDataset || workflow?.activeDataset;
  const effectiveDatasetId = propDatasetId || effectiveDataset?.dataset_id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedColumn, setSelectedColumn] = useState(null);

  // Stage 4 Contextual Education Modal State
  const [conceptModal, setConceptModal] = useState({
    isOpen: false,
    conceptId: null,
    column: null,
    initialLevel: 'beginner'
  });

  const openConcept = (conceptId, column = null, level = 'beginner') => {
    setConceptModal({
      isOpen: true,
      conceptId,
      column,
      initialLevel: level
    });
  };

  const getIssueConceptId = (issueType) => {
    if (!issueType) return 'data_quality';
    const it = issueType.toLowerCase();
    if (it.includes('missing')) return 'missing_values';
    if (it.includes('duplicate')) return 'duplicate_records';
    if (it.includes('near_constant')) return 'near_constant_features';
    if (it.includes('constant')) return 'constant_features';
    if (it.includes('identifier')) return 'identifier';
    if (it.includes('outlier')) return 'outlier';
    if (it.includes('skew')) return 'skewness';
    return issueType;
  };

  const fetchProfile = async () => {
    if (!effectiveDatasetId) return;
    setLoading(true);
    setError(null);
    const result = await getDatasetProfile(effectiveDatasetId);
    if (result.data) {
      setProfile(result.data);
    } else {
      setError(result.error || 'Failed to generate dataset profile.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [effectiveDatasetId]);

  const handleGoToIngestion = () => {
    if (onNavigateToDatasets) {
      onNavigateToDatasets();
    } else if (workflow?.goToStep) {
      workflow.goToStep('collection');
    }
  };

  if (!effectiveDatasetId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Database className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-white">No Dataset Loaded</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Please upload or load a dataset in Stage 1 (Collection) to view automated profiling and diagnostics.
        </p>
        <button
          onClick={handleGoToIngestion}
          className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" /> Go to Stage 1: Collection
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
        <h3 className="text-sm font-semibold text-white">Computing Statistical Dataset Profile...</h3>
        <p className="text-xs text-slate-400">
          Analyzing distributions, inferring semantic types, and detecting quality anomalies.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-sm font-semibold text-white">Profiling Error</h3>
        <p className="text-xs text-red-300">{error}</p>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
        >
          Retry Profiling
        </button>
      </div>
    );
  }

  const { dataset_summary = {}, columns = [], issues = [] } = profile || {};

  // Filter columns
  const filteredColumns = columns.filter((col) => {
    const matchesSearch = col.column_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || col.semantic_type.toUpperCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Pipeline Stepper connecting Stage 2 and Stage 3 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Pipeline Connection:
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1. Ingestion
            </span>
            <span className="text-slate-600">➔</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/30 font-semibold shadow-sm">
              <BarChart3 className="w-3.5 h-3.5" /> 2. Profiling (Active)
            </span>
            <span className="text-slate-600">➔</span>
            <button
              onClick={() => onNavigateToCleaning && onNavigateToCleaning(null)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-slate-700 transition-colors"
            >
              <span>3. Cleaning & Missing</span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Stage 2: Dataset Profiling</h1>
            <Badge variant="blue">Automated Diagnostics</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dataset: <span className="font-semibold text-slate-200">{effectiveDataset?.filename || effectiveDataset?.name || 'dataset.csv'}</span> • {profile?.status || 'Profile Generated'}
          </p>
        </div>

        <button
          onClick={fetchProfile}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          Re-Analyze
        </button>
      </div>

      {/* 3. Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Rows</span>
          <div className="mt-1 text-xl font-bold text-white">{dataset_summary.row_count?.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400">Records</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Columns</span>
          <div className="mt-1 text-xl font-bold text-white">{dataset_summary.column_count}</div>
          <span className="text-[10px] text-slate-400">Attributes</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Missing Cells</span>
          <div className={`mt-1 text-xl font-bold ${dataset_summary.missing_cells > 0 ? 'text-amber-400' : 'text-brand-400'}`}>
            {dataset_summary.missing_cells}
          </div>
          <span className="text-[10px] text-slate-400">{dataset_summary.missing_cells_percentage}% missingness</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Duplicate Rows</span>
          <div className={`mt-1 text-xl font-bold ${dataset_summary.duplicate_rows > 0 ? 'text-amber-400' : 'text-brand-400'}`}>
            {dataset_summary.duplicate_rows}
          </div>
          <span className="text-[10px] text-slate-400">{dataset_summary.duplicate_percentage}% duplicates</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Numerical</span>
          <div className="mt-1 text-xl font-bold text-blue-400">{dataset_summary.numerical_column_count}</div>
          <span className="text-[10px] text-slate-400">Continuous/Discrete</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Categorical</span>
          <div className="mt-1 text-xl font-bold text-purple-400">{dataset_summary.categorical_column_count}</div>
          <span className="text-[10px] text-slate-400">String / Category</span>
        </div>
      </div>

      {/* 4. Identified Quality Issues & Direct Stage 3 Action Links */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Detected Data Quality Issues</h2>
              <p className="text-xs text-slate-400">
                Stage 2 identified {issues.length} item(s) requiring attention or explainable preprocessing.
              </p>
            </div>
          </div>
          <Badge variant={issues.length === 0 ? "brand" : "amber"}>
            {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'} Detected
          </Badge>
        </div>

        {issues.length === 0 ? (
          <div className="p-4 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>High data cleanliness! No severe missingness or duplicate rows were detected.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {issues.map((issue) => {
              const isCleanable = issue.actionable_in_stage_3;
              const severityColor = 
                issue.severity === 'high' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                issue.severity === 'moderate' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                'text-blue-400 bg-blue-500/10 border-blue-500/20';

              return (
                <div 
                  key={issue.issue_id} 
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white text-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        {issue.column ? `Column: ${issue.column}` : 'Dataset-Level Issue'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${severityColor}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{issue.explanation}</p>
                    <p className="text-[11px] text-slate-400 italic">
                      Recommended: {issue.recommended_next_step}
                    </p>

                    {/* Educational Concept Explorers */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-900">
                      <button
                        type="button"
                        onClick={() => openConcept(getIssueConceptId(issue.issue_type), issue.column, 'beginner')}
                        className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3 text-brand-400" />
                        <span>What is this?</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openConcept(getIssueConceptId(issue.issue_type), issue.column, 'intermediate')}
                        className="py-1 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Why does it matter?</span>
                      </button>
                    </div>
                  </div>

                  {/* Connect to Stage 3 Cleaning */}
                  {isCleanable && (
                    <button
                      onClick={() => {
                        let action = 'impute_missing';
                        if (issue.issue_type === 'duplicate_rows') action = 'drop_duplicates';
                        if (issue.issue_type === 'constant_column') action = 'drop_column';
                        onNavigateToCleaning && onNavigateToCleaning({
                          action,
                          column: issue.column,
                          strategy: issue.issue_type === 'duplicate_rows' ? null : 'median'
                        });
                      }}
                      className="w-full mt-2 py-2 px-3 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 hover:text-brand-300 border border-brand-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm group"
                    >
                      <span>Resolve in Stage 3: Cleaning</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Column Profiling Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Column Profiles & Statistical Summaries</h2>
            <p className="text-xs text-slate-400">Click any column row to inspect detailed statistical distributions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Types</option>
              <option value="NUMERICAL">Numerical</option>
              <option value="CATEGORICAL">Categorical</option>
              <option value="DATETIME">Datetime</option>
              <option value="IDENTIFIER">Identifier</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Pandas Dtype</th>
                <th className="py-3 px-4">Semantic Type</th>
                <th className="py-3 px-4">Missing Rate</th>
                <th className="py-3 px-4">Unique Values</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {filteredColumns.map((col) => {
                const isSelected = selectedColumn?.column_name === col.column_name;
                return (
                  <tr
                    key={col.column_name}
                    onClick={() => setSelectedColumn(isSelected ? null : col)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-brand-500/10' : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      {col.semantic_type === 'identifier' && <Key className="w-3.5 h-3.5 text-amber-400" />}
                      {col.semantic_type === 'datetime' && <Calendar className="w-3.5 h-3.5 text-purple-400" />}
                      {col.column_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-400">{col.pandas_dtype}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        col.semantic_type === 'numerical' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        col.semantic_type === 'categorical' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        col.semantic_type === 'datetime' ? 'bg-brand-500/10 text-brand-400 border-brand-500/20' :
                        col.semantic_type === 'identifier' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {col.semantic_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {col.missing_count > 0 ? (
                        <span className="text-amber-400 font-semibold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {col.missing_count} ({col.missing_percentage.toFixed(1)}%)
                        </span>
                      ) : (
                        <span className="text-brand-400 inline-flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 0% Complete
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {col.unique_count.toLocaleString()} ({col.unique_percentage.toFixed(1)}%)
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Selected Column Inspector Drawer / Detail Card */}
      {selectedColumn && (
        <div className="bg-slate-900 border border-brand-500/30 rounded-xl p-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Detailed Column Analysis: <span className="text-brand-400 font-mono">{selectedColumn.column_name}</span>
              </h3>
              <Badge variant="brand">{selectedColumn.semantic_type}</Badge>
            </div>
            <button
              onClick={() => setSelectedColumn(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>

          {/* Numerical details */}
          {selectedColumn.numerical_profile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Mean</span>
                <div className="text-sm font-bold text-white">{selectedColumn.numerical_profile.mean?.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Median</span>
                <div className="text-sm font-bold text-white">{selectedColumn.numerical_profile.median?.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Std Dev</span>
                <div className="text-sm font-bold text-white">{selectedColumn.numerical_profile.standard_deviation?.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Min / Max</span>
                <div className="text-sm font-bold text-white">
                  {selectedColumn.numerical_profile.minimum} / {selectedColumn.numerical_profile.maximum}
                </div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">IQR (Q3 - Q1)</span>
                <div className="text-sm font-bold text-white">{selectedColumn.numerical_profile.IQR?.toFixed(2)}</div>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">Skewness</span>
                <div className={`text-sm font-bold ${Math.abs(selectedColumn.numerical_profile.skewness) > 1.0 ? 'text-amber-400' : 'text-white'}`}>
                  {selectedColumn.numerical_profile.skewness?.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Categorical details */}
          {selectedColumn.categorical_profile && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300">Top Categories & Frequencies:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedColumn.categorical_profile.top_categories?.map((cat, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-semibold text-white truncate max-w-[120px]">{cat.category}</span>
                    <span className="text-slate-400 font-mono">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action if column has nulls */}
          {selectedColumn.missing_count > 0 && (
            <div className="pt-2 flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs">
              <span className="text-amber-300 font-medium">
                This column contains {selectedColumn.missing_count} missing values ({selectedColumn.missing_percentage.toFixed(1)}%).
              </span>
              <button
                onClick={() => onNavigateToCleaning && onNavigateToCleaning({
                  action: 'impute_missing',
                  column: selectedColumn.column_name,
                  strategy: selectedColumn.semantic_type === 'numerical' ? 'median' : 'mode'
                })}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold inline-flex items-center gap-1.5 hover:bg-amber-400 transition-colors"
              >
                <span>Fix in Stage 3: Cleaning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Pedagogical Concept Explorers for Column */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Learn Concepts Relevant to '{selectedColumn.column_name}':
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedColumn.numerical_profile && (
                <>
                  <button
                    type="button"
                    onClick={() => openConcept('skewness', selectedColumn.column_name, 'beginner')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-slate-800 hover:border-brand-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                    <span>Learn about Skewness</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openConcept('median', selectedColumn.column_name, 'beginner')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-slate-800 hover:border-brand-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                    <span>Learn about Median vs Mean</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openConcept('iqr', selectedColumn.column_name, 'beginner')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-slate-800 hover:border-brand-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                    <span>Learn about IQR & Outliers</span>
                  </button>
                </>
              )}

              {selectedColumn.semantic_type === 'categorical' && (
                <button
                  type="button"
                  onClick={() => openConcept('categorical_data', selectedColumn.column_name, 'beginner')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-slate-800 hover:border-brand-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                  <span>Learn about Categorical Data & Cardinality</span>
                </button>
              )}

              {selectedColumn.semantic_type === 'identifier' && (
                <button
                  type="button"
                  onClick={() => openConcept('identifier', selectedColumn.column_name, 'beginner')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-slate-800 hover:border-brand-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                  <span>Learn about Identifiers & Leakage</span>
                </button>
              )}

              {selectedColumn.missing_count > 0 && (
                <button
                  type="button"
                  onClick={() => openConcept('missing_values', selectedColumn.column_name, 'beginner')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Learn about Missing Values (MCAR / MAR)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Educational Principle Card */}
      <div className="rounded-xl p-5 bg-gradient-to-r from-slate-900 via-brand-950/20 to-slate-900 border border-brand-500/20 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Why Profiling Connects to Cleaning (Learning Pillar)</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Data scientists never apply transformations blindfolded. Stage 2 (Profiling) diagnoses the data's shape, skewness, and missingness mechanisms so that Stage 3 (Cleaning) can apply theoretically sound, mathematically defensible imputations.
          </p>
        </div>
      </div>

      {/* Stage 4 Contextual Educational Concept Modal */}
      <ConceptModal
        isOpen={conceptModal.isOpen}
        onClose={() => setConceptModal(prev => ({ ...prev, isOpen: false }))}
        conceptId={conceptModal.conceptId}
        datasetId={effectiveDatasetId}
        column={conceptModal.column}
        initialLevel={conceptModal.initialLevel}
      />
    </div>
  );
};

export default ProfilingView;
