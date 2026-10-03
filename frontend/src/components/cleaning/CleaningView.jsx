import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Sliders,
  Database,
  Trash2,
  GitCompare,
  Layers,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Info
} from 'lucide-react';
import Badge from '../common/Badge';
import ExplanationCard from '../learning/ExplanationCard';
import RecommendationCard from './RecommendationCard';
import MathCalculationCard from './MathCalculationCard';
import BeforeAfterDiff from './BeforeAfterDiff';
import HistoryTimeline from './HistoryTimeline';
import { getDatasetProfile } from '../../services/datasetService';
import cleaningService from '../../services/cleaningService';
import { useWorkflow } from '../../state/WorkflowContext';

export const CleaningView = ({
  activeDataset: propActiveDataset,
  datasetId: propDatasetId,
  initialTarget,
  onDatasetUpdated,
  onApplied,
  onNavigateToProfiling,
  onNavigateToStage
}) => {
  const workflow = useWorkflow();
  const effectiveDataset = propActiveDataset || workflow?.activeDataset;
  const effectiveDatasetId = propDatasetId || effectiveDataset?.dataset_id;

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);

  // Configuration state
  const [action, setAction] = useState(initialTarget?.action || 'impute_missing');
  const [selectedColumn, setSelectedColumn] = useState(initialTarget?.column || '');
  const [strategy, setStrategy] = useState(initialTarget?.strategy || 'median');
  const [constantValue, setConstantValue] = useState('');
  const [selectedRecommendationId, setSelectedRecommendationId] = useState(null);

  // Execution & result states
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // History & Undo states
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoError, setUndoError] = useState(null);

  // Sync initial target from props
  useEffect(() => {
    if (initialTarget) {
      if (initialTarget.action) setAction(initialTarget.action);
      if (initialTarget.column) setSelectedColumn(initialTarget.column);
      if (initialTarget.strategy) setStrategy(initialTarget.strategy);
      setPreviewResult(null);
      setApplySuccess(null);
    }
  }, [initialTarget]);

  // Load profile diagnostics
  const loadProfile = async () => {
    if (!effectiveDatasetId) return;
    setLoadingProfile(true);
    const result = await getDatasetProfile(effectiveDatasetId);
    if (result.data) {
      setProfile(result.data);
    }
    setLoadingProfile(false);
  };

  // Load recommendations
  const loadRecommendations = async () => {
    if (!effectiveDatasetId) return;
    setLoadingRecommendations(true);
    setRecommendationsError(null);
    const res = await cleaningService.getRecommendations(effectiveDatasetId);
    if (res.data) {
      setRecommendations(res.data);
      // Auto-configure first recommendation if no column is set
      if (!selectedColumn && res.data.length > 0) {
        applyRecommendationToForm(res.data[0]);
      }
    } else {
      setRecommendationsError(res.error);
    }
    setLoadingRecommendations(false);
  };

  // Load transformation history
  const loadHistory = async () => {
    if (!effectiveDatasetId) return;
    setLoadingHistory(true);
    const res = await cleaningService.getHistory(effectiveDatasetId);
    if (res.data) {
      setHistory(res.data);
    }
    setLoadingHistory(false);
  };

  // Initial data load on mount or activeDataset change
  useEffect(() => {
    if (effectiveDatasetId) {
      loadProfile();
      loadRecommendations();
      loadHistory();
      setPreviewResult(null);
      setApplySuccess(null);
    }
  }, [effectiveDatasetId]);

  // Helper to sync recommendation into the form
  const applyRecommendationToForm = (rec) => {
    setSelectedRecommendationId(rec.recommendation_id);
    setAction(rec.recommended_action);
    if (rec.column) {
      setSelectedColumn(rec.column);
    } else {
      setSelectedColumn('');
    }
    if (rec.recommended_strategy) {
      setStrategy(rec.recommended_strategy);
    }
    if (rec.suggested_constant !== undefined && rec.suggested_constant !== null) {
      setConstantValue(String(rec.suggested_constant));
    }
    setPreviewResult(null);
    setApplySuccess(null);
  };

  // Quick preview from a recommendation card
  const handleQuickPreview = async (rec) => {
    applyRecommendationToForm(rec);

    setActionError(null);
    setPreviewLoading(true);
    setApplySuccess(null);

    const payload = {
      operation: rec.recommended_action,
      column: rec.column || null,
      method: rec.recommended_action === 'impute_missing' ? rec.recommended_strategy : null,
      constant_value: rec.recommended_strategy === 'constant' ? (rec.suggested_constant ?? constantValue) : null,
      confirmation: false
    };

    const res = await cleaningService.previewCleaning(effectiveDatasetId, payload);
    if (res.data) {
      setPreviewResult(res.data);
    } else {
      setActionError(res.error || 'Failed to preview transformation.');
    }
    setPreviewLoading(false);
  };

  // Trigger preview from the configuration form
  const handlePreview = async () => {
    setActionError(null);
    setPreviewLoading(true);
    setApplySuccess(null);

    const payload = {
      operation: action,
      column: selectedColumn || null,
      method: action === 'impute_missing' ? strategy : null,
      constant_value: strategy === 'constant' ? constantValue : null,
      confirmation: false
    };

    const res = await cleaningService.previewCleaning(effectiveDatasetId, payload);
    if (res.data) {
      setPreviewResult(res.data);
    } else {
      setActionError(res.error || 'Failed to preview transformation.');
    }
    setPreviewLoading(false);
  };

  // Trigger apply transformation
  const handleApply = async () => {
    setActionError(null);
    setApplyLoading(true);

    const payload = {
      operation: action,
      column: selectedColumn || null,
      method: action === 'impute_missing' ? strategy : null,
      constant_value: strategy === 'constant' ? constantValue : null,
      confirmation: true
    };

    const res = await cleaningService.applyCleaning(effectiveDatasetId, payload);
    if (res.data) {
      setApplySuccess(res.data);
      setPreviewResult(null);

      // Update parent activeDataset state
      if (onDatasetUpdated) {
        onDatasetUpdated({
          ...effectiveDataset,
          row_count: res.data.row_count,
          column_count: res.data.column_count,
          preview_rows: res.data.preview_rows
        });
      }

      if (onApplied) {
        onApplied(res.data);
      }

      // Refresh profile, recommendations, and history timeline
      await Promise.all([loadProfile(), loadRecommendations(), loadHistory()]);
    } else {
      setActionError(res.error || 'Failed to apply transformation.');
    }
    setApplyLoading(false);
  };

  // Trigger undo last operation
  const handleUndo = async () => {
    setUndoError(null);
    setIsUndoing(true);
    const res = await cleaningService.undoOperation(effectiveDatasetId);
    if (res.data && res.data.success) {
      setApplySuccess(null);
      setPreviewResult(null);

      // Update parent dataset state
      if (onDatasetUpdated) {
        onDatasetUpdated({
          ...effectiveDataset,
          row_count: res.data.restored_row_count,
          column_count: res.data.restored_column_count
        });
      }

      // Reload dataset state
      await Promise.all([loadProfile(), loadRecommendations(), loadHistory()]);
    } else {
      setUndoError(res.error || 'Failed to rollback operation.');
    }
    setIsUndoing(false);
  };

  if (!effectiveDatasetId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center max-w-lg mx-auto space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
          <Database className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-semibold text-white">No Dataset Active</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Please upload a dataset or complete Stage 2 (Profiling) before applying cleaning transformations.
        </p>
      </div>
    );
  }

  const activeColProfile = selectedColumn && profile?.column_profiles?.[selectedColumn];
  const isNumericCol = activeColProfile?.semantic_type === 'numerical';
  const latestHistoryEntry = history && history.length > 0 ? history[history.length - 1] : null;
  const currentActiveVersion = latestHistoryEntry ? latestHistoryEntry.to_version : 'v0 (Raw)';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Pipeline Stepper connecting Stages */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Pipeline Workflow:
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1. Ingestion
            </span>
            <span className="text-slate-600">➔</span>
            <button
              onClick={onNavigateToProfiling}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Profiling Diagnostics</span>
            </button>
            <span className="text-slate-600">➔</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/30 font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> 3. Cleaning & Versioning (Active)
            </span>
            <span className="text-slate-600">➔</span>
            <button
              onClick={() => onNavigateToStage && onNavigateToStage('outliers')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-400 border border-slate-700/60"
            >
              <span>4. Next: Outliers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Header & Safety Guarantee */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Stage 3: Automated Cleaning & Versioning Engine</h1>
            <Badge variant="brand">Phase 5</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic recommendations grounded in profiling • Non-destructive snapshots • 7 Explainability Pillars
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
          <span className="text-slate-300">
            Active Snapshot: <strong className="text-brand-400 font-mono">{currentActiveVersion}</strong>
          </span>
        </div>
      </div>

      {/* 3. STEP: DETECT & RECOMMEND (Deterministic Cleaning Recommendations) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Automated Cleaning Recommendations (Grounded in Diagnostics)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadRecommendations}
              disabled={loadingRecommendations}
              className="text-slate-400 hover:text-white p-1 transition-colors"
              title="Refresh Recommendations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingRecommendations ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs text-slate-400">
              {recommendations.length} issue(s) detected
            </span>
          </div>
        </div>

        {recommendationsError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {recommendationsError}
          </div>
        )}

        {loadingRecommendations ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-400" />
            <span>Analyzing diagnostics to generate recommendations...</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold block">Dataset is completely clean!</span>
              <span className="text-brand-300/80">No missing values, duplicate rows, or zero-variance constant columns detected.</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.recommendation_id}
                recommendation={rec}
                isSelected={selectedRecommendationId === rec.recommendation_id}
                onSelectForConfig={applyRecommendationToForm}
                onQuickPreview={handleQuickPreview}
                isLoadingPreview={previewLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. STEP: CONFIGURE (Strategy and Parameter Tuning Console) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-400" />
            <span>Configure Cleaning Operation</span>
          </h2>
          <span className="text-xs text-slate-400">
            Customize parameters or test alternative strategies
          </span>
        </div>

        {/* Action Type Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => {
              setAction('impute_missing');
              setSelectedRecommendationId(null);
              setPreviewResult(null);
            }}
            className={`p-3.5 rounded-xl border text-left text-xs space-y-1 transition-all ${
              action === 'impute_missing'
                ? 'bg-brand-500/15 border-brand-500/50 text-white font-semibold shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-sm text-brand-400">1. Impute Missing Values</div>
            <p className="text-[11px] text-slate-400">Handle NaNs using median, mean, mode, or constant value.</p>
          </button>

          <button
            onClick={() => {
              setAction('drop_duplicates');
              setSelectedRecommendationId(null);
              setSelectedColumn('');
              setPreviewResult(null);
            }}
            className={`p-3.5 rounded-xl border text-left text-xs space-y-1 transition-all ${
              action === 'drop_duplicates'
                ? 'bg-brand-500/15 border-brand-500/50 text-white font-semibold shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-sm text-blue-400">2. Remove Duplicate Rows</div>
            <p className="text-[11px] text-slate-400">Deduplicate identical rows to prevent model bias.</p>
          </button>

          <button
            onClick={() => {
              setAction('drop_column');
              setSelectedRecommendationId(null);
              setPreviewResult(null);
            }}
            className={`p-3.5 rounded-xl border text-left text-xs space-y-1 transition-all ${
              action === 'drop_column'
                ? 'bg-brand-500/15 border-brand-500/50 text-white font-semibold shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="font-bold text-sm text-amber-400">3. Drop Column</div>
            <p className="text-[11px] text-slate-400">Prune constant, zero-variance, or unusable columns.</p>
          </button>
        </div>

        {/* Target Column Selector */}
        {(action === 'impute_missing' || action === 'drop_column') && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Target Column:</label>
            <select
              value={selectedColumn}
              onChange={(e) => {
                setSelectedColumn(e.target.value);
                setSelectedRecommendationId(null);
                setPreviewResult(null);
                const colProf = profile?.column_profiles?.[e.target.value];
                if (colProf?.semantic_type === 'numerical') setStrategy('median');
                else setStrategy('mode');
              }}
              className="w-full sm:w-96 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Select Column --</option>
              {profile?.columns?.map((c) => (
                <option key={c.column_name} value={c.column_name}>
                  {c.column_name} ({c.semantic_type}) {c.missing_count > 0 ? `• ${c.missing_count} missing (${c.missing_pct?.toFixed(1)}%)` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Imputation Strategy Selector */}
        {action === 'impute_missing' && selectedColumn && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Select Imputation Technique for <span className="text-brand-400 font-mono font-bold">{selectedColumn}</span>:</span>
              <span className="text-[11px] text-slate-400 font-mono">
                Detected Type: {activeColProfile?.semantic_type || 'Unknown'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Median */}
              <button
                onClick={() => { setStrategy('median'); setPreviewResult(null); }}
                disabled={!isNumericCol}
                className={`p-3.5 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  !isNumericCol ? 'opacity-30 cursor-not-allowed bg-slate-950 border-slate-900' :
                  strategy === 'median' ? 'bg-brand-500/15 border-brand-500/50 shadow-sm ring-1 ring-brand-500/30' :
                  'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Median</span>
                  <Badge variant="brand">Robust</Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Best for skewed continuous data. Preserves 50th percentile.
                </p>
              </button>

              {/* Mean */}
              <button
                onClick={() => { setStrategy('mean'); setPreviewResult(null); }}
                disabled={!isNumericCol}
                className={`p-3.5 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  !isNumericCol ? 'opacity-30 cursor-not-allowed bg-slate-950 border-slate-900' :
                  strategy === 'mean' ? 'bg-brand-500/15 border-brand-500/50 shadow-sm ring-1 ring-brand-500/30' :
                  'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Mean</span>
                  <Badge variant="info">Parametric</Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Best for symmetrical normal data with zero extreme outliers.
                </p>
              </button>

              {/* Mode */}
              <button
                onClick={() => { setStrategy('mode'); setPreviewResult(null); }}
                className={`p-3.5 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  strategy === 'mode' ? 'bg-brand-500/15 border-brand-500/50 shadow-sm ring-1 ring-brand-500/30' :
                  'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Mode</span>
                  <Badge variant="purple">Category</Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Replaces NaNs with the most frequent value.
                </p>
              </button>

              {/* Constant */}
              <button
                onClick={() => { setStrategy('constant'); setPreviewResult(null); }}
                className={`p-3.5 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  strategy === 'constant' ? 'bg-brand-500/15 border-brand-500/50 shadow-sm ring-1 ring-brand-500/30' :
                  'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Constant</span>
                  <Badge variant="default">Custom</Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fill missing cells with a custom static value or placeholder.
                </p>
              </button>

              {/* Drop Rows */}
              <button
                onClick={() => { setStrategy('drop_rows'); setPreviewResult(null); }}
                className={`p-3.5 rounded-xl border text-left text-xs space-y-1 transition-all ${
                  strategy === 'drop_rows' ? 'bg-brand-500/15 border-brand-500/50 shadow-sm ring-1 ring-brand-500/30' :
                  'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Drop Rows</span>
                  <Badge variant="warning">Listwise</Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Delete rows containing missing values in this column.
                </p>
              </button>
            </div>

            {/* Constant Value Input */}
            {strategy === 'constant' && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-w-sm">
                <label className="text-xs font-semibold text-slate-300">
                  Custom Replacement Value:
                </label>
                <input
                  type={isNumericCol ? 'number' : 'text'}
                  value={constantValue}
                  onChange={(e) => {
                    setConstantValue(e.target.value);
                    setPreviewResult(null);
                  }}
                  placeholder={isNumericCol ? 'e.g. 0' : 'e.g. Unknown'}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Buttons: Preview & Apply */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePreview}
              disabled={previewLoading || applyLoading || (action !== 'drop_duplicates' && !selectedColumn)}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 disabled:opacity-50 text-white text-xs font-bold border border-slate-700 transition-colors inline-flex items-center gap-2"
            >
              {previewLoading ? <RefreshCw className="w-4 h-4 animate-spin text-brand-400" /> : <GitCompare className="w-4 h-4 text-brand-400" />}
              <span>Preview 7-Pillar Explanation & Diff</span>
            </button>

            <button
              onClick={handleApply}
              disabled={previewLoading || applyLoading || (action !== 'drop_duplicates' && !selectedColumn)}
              className="px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md shadow-brand-500/20 transition-all inline-flex items-center gap-2"
            >
              {applyLoading ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : <CheckCircle2 className="w-4 h-4 text-slate-950" />}
              <span>Apply & Create Version Snapshot</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Never mutates raw files</span>
          </div>
        </div>

        {/* Action Error Notification */}
        {actionError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* 5. SUCCESS BANNER when Transformation is Applied */}
      {applySuccess && (
        <div className="rounded-xl p-6 bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 border border-brand-500/40 shadow-xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Transformation Successfully Applied!</h3>
                <p className="text-xs text-brand-300">{applySuccess.message}</p>
              </div>
            </div>
            <Badge variant="success">Version Snapshot: {applySuccess.new_version}</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Remaining Missing Cells</span>
              <div className="text-base font-bold text-white mt-0.5">{applySuccess.missing_cells}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Duplicate Rows</span>
              <div className="text-base font-bold text-white mt-0.5">{applySuccess.duplicate_rows}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Active Rows</span>
              <div className="text-base font-bold text-white mt-0.5">{applySuccess.row_count}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Active Columns</span>
              <div className="text-base font-bold text-white mt-0.5">{applySuccess.column_count}</div>
            </div>
          </div>

          {/* Quick Navigation linking back to Stage 2 or proceeding to Stage 4 */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                if (onNavigateToProfiling) onNavigateToProfiling();
                else if (workflow?.goToStep) workflow.goToStep('eda');
              }}
              className="px-4 py-2 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Return to 03 EDA / Profiling to Re-verify</span>
            </button>

            <button
              onClick={() => {
                if (onNavigateToStage) onNavigateToStage('outliers');
                else if (workflow?.goToStep) workflow.goToStep('outliers');
              }}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-slate-950 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-all shadow-md shadow-brand-500/20"
            >
              <span>Proceed to 05. Outlier Detection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 6. STEP: PREVIEW, EXPLAIN & COMPARE */}
      {(previewResult || applySuccess) && (
        <div className="space-y-6 animate-fadeIn">
          {/* 7-Pillars Explainability Card */}
          {(() => {
            const exp = previewResult?.explanation || applySuccess?.explanation;
            if (!exp) return null;
            return (
              <ExplanationCard
                operationTitle={exp.technique_used}
                moduleName={exp.module_name}
                technique={exp.technique_used}
                whatHappened={exp.what_happened}
                whyItHappened={exp.why_it_happened}
                whySelected={exp.selection_rationale}
                whatChanged={exp.impact_summary}
                whenToUse={exp.when_to_use}
                alternatives={exp.alternatives?.map(a => ({ name: a.name, desc: a.description }))}
              />
            );
          })()}

          {/* Section 17: Step-by-Step Educational Math Breakdown */}
          {(() => {
            const math = previewResult?.math_calculation || applySuccess?.math_calculation;
            const targetCol = previewResult?.column || applySuccess?.history_entry?.column || selectedColumn;
            const methodUsed = previewResult?.method || applySuccess?.history_entry?.method || strategy;
            if (!math) return null;
            return (
              <MathCalculationCard
                mathCalculation={math}
                column={targetCol}
                method={methodUsed}
              />
            );
          })()}

          {/* Quantitative Before vs After Shift & Sample Data Diff */}
          {previewResult && (
            <BeforeAfterDiff
              previewResult={previewResult}
              targetColumn={selectedColumn}
            />
          )}
        </div>
      )}

      {/* 7. STEP: HISTORY & UNDO (Audit Log and Rollback Engine) */}
      <HistoryTimeline
        history={history}
        activeVersion={currentActiveVersion}
        onUndo={handleUndo}
        isUndoing={isUndoing}
        undoError={undoError}
      />
    </div>
  );
};

export default CleaningView;
