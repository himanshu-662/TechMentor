import React, { useState, useEffect } from 'react';
import { 
  History, 
  Database, 
  FileSpreadsheet, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Search, 
  Clock, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import { listDatasets, getDatasetById, deleteDataset, clearAllDatasets } from '../../services/datasetService';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';

export const DatasetHistory = ({ onSelectDataset }) => {
  const { activeDataset, setActiveDataset, clearActiveDataset, updateStepStatus, goToStep } = useWorkflow();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activatingId, setActivatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);


  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    const res = await listDatasets();
    if (res.data) {
      setDatasets(res.data);
    } else {
      setError(res.error || 'Failed to retrieve stored datasets.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [activeDataset?.dataset_id]);

  const handleActivate = async (datasetSummary) => {
    if (activeDataset?.dataset_id === datasetSummary.dataset_id) {
      goToStep('loading');
      return;
    }

    setActivatingId(datasetSummary.dataset_id);
    setError(null);
    try {
      const res = await getDatasetById(datasetSummary.dataset_id);
      if (res.data) {
        setActiveDataset(res.data);
        updateStepStatus('collection', STEP_STATUSES.APPLIED);
        updateStepStatus('loading', STEP_STATUSES.AVAILABLE);
        if (onSelectDataset) {
          onSelectDataset(res.data);
        }
      } else {
        setError(res.error || 'Failed to activate dataset.');
      }
    } catch (err) {
      setError(err.message || 'Error loading dataset details.');
    } finally {
      setActivatingId(null);
    }
  };

  const handleDelete = async (datasetId) => {
    setDeletingId(datasetId);
    setError(null);
    try {
      const res = await deleteDataset(datasetId);
      if (res.data) {
        setDatasets(prev => prev.filter(d => d.dataset_id !== datasetId));
        if (activeDataset?.dataset_id === datasetId) {
          clearActiveDataset();
        }
      } else {
        setError(res.error || 'Failed to delete dataset.');
      }
    } catch (err) {
      setError(err.message || 'Error deleting dataset.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    setError(null);
    try {
      const res = await clearAllDatasets();
      if (res.data) {
        setDatasets([]);
        clearActiveDataset();
      } else {
        setError(res.error || 'Failed to clear all datasets.');
      }
    } catch (err) {
      setError(err.message || 'Error clearing datasets.');
    } finally {
      setClearingAll(false);
      setConfirmClearAll(false);
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recent';
    }
  };

  const filteredDatasets = datasets.filter(ds => 
    (ds.filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ds.file_type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Stored Dataset History</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {datasets.length} saved
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Persisted datasets on disk — switch between them or resume work across sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 focus:border-brand-500/50 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none w-36 sm:w-44 transition-all"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchHistory}
            disabled={loading}
            title="Refresh dataset list"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-400' : ''}`} />
          </button>

          {/* Remove All Datasets Button */}
          {(datasets.length > 0 || activeDataset) && (
            confirmClearAll ? (
              <div className="flex items-center gap-1.5 animate-fadeIn">
                <span className="text-[11px] text-rose-400 font-semibold">Remove all?</span>
                <button
                  onClick={handleClearAll}
                  disabled={clearingAll}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                >
                  {clearingAll ? 'Removing...' : 'Confirm Remove All'}
                </button>
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Remove all stored datasets from storage"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove All Datasets</span>
              </button>
            )
          )}
        </div>
      </div>



      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Content State */}
      {loading && datasets.length === 0 ? (
        <div className="py-8 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-400" />
          <p className="text-xs">Loading stored dataset history...</p>
        </div>
      ) : filteredDatasets.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <Database className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-400">
            {searchQuery ? 'No datasets match your filter.' : 'No stored datasets found. Upload a file above to begin.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredDatasets.map((ds) => {
            const isActive = activeDataset?.dataset_id === ds.dataset_id;
            const isActivating = activatingId === ds.dataset_id;
            const isDeleting = deletingId === ds.dataset_id;

            return (
              <div
                key={ds.dataset_id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-brand-950/20 border-brand-500/40 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* File info */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-white font-mono truncate max-w-xs sm:max-w-md">
                        {ds.filename}
                      </h4>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {ds.file_type}
                      </span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
                          Active
                        </span>
                      )}
                      {ds.version_count > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/20 font-mono">
                          v{ds.version_count}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                      <span>{Number(ds.row_count || 0).toLocaleString()} rows × {ds.column_count || 0} cols</span>
                      <span>•</span>
                      <span>{ds.file_size_formatted || 'Unknown size'}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatTimestamp(ds.uploaded_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {confirmDeleteId === ds.dataset_id ? (
                    <div className="flex items-center gap-1.5 animate-fadeIn">
                      <span className="text-[11px] text-rose-400 font-medium mr-1">Delete?</span>
                      <button
                        onClick={() => handleDelete(ds.dataset_id)}
                        disabled={isDeleting}
                        className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleActivate(ds)}
                        disabled={isActivating}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-brand-600/30 hover:bg-brand-600/50 text-brand-200 border border-brand-500/40'
                            : 'bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold shadow-sm'
                        }`}
                      >
                        {isActivating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Loading...</span>
                          </>
                        ) : isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                            <span>Active (Open)</span>
                          </>
                        ) : (
                          <>
                            <span>Use Dataset</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setConfirmDeleteId(ds.dataset_id)}
                        title="Delete dataset from storage"
                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DatasetHistory;
