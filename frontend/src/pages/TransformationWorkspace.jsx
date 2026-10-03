import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  RefreshCw, 
  RotateCcw, 
  History, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Database,
  BookOpen
} from 'lucide-react';
import Badge from '../components/common/Badge';
import TransformationSummary from '../components/transformations/TransformationSummary';
import TransformationDetail from '../components/transformations/TransformationDetail';
import TransformationHistory from '../components/transformations/TransformationHistory';
import { 
  getTransformationSummary, 
  getTransformationHistory, 
  undoTransformation 
} from '../services/transformationService';

export const TransformationWorkspace = ({ datasetId, onDatasetUpdated }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);

  const fetchSummary = async () => {
    if (!datasetId) return;
    setIsLoading(true);
    setErrorMessage(null);

    const res = await getTransformationSummary(datasetId);
    if (res.data) {
      setSummaryData(res.data);
    } else {
      setErrorMessage(res.error);
    }

    const histRes = await getTransformationHistory(datasetId);
    if (histRes.data) {
      setHistoryList(histRes.data.history || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchSummary();
  }, [datasetId]);

  const handleUndo = async () => {
    if (!datasetId) return;
    setIsUndoing(true);
    setErrorMessage(null);

    const res = await undoTransformation(datasetId);
    if (res.data) {
      setSuccessMessage(res.data.message || 'Successfully reverted last operation.');
      fetchSummary();
      if (onDatasetUpdated) onDatasetUpdated();
    } else {
      setErrorMessage(res.error);
    }
    setIsUndoing(false);
  };

  const handleOperationSuccess = (applyResult) => {
    setSuccessMessage(applyResult.message || 'Transformation applied successfully.');
    fetchSummary();
    if (onDatasetUpdated) onDatasetUpdated();
  };

  if (!datasetId) {
    return (
      <div className="p-12 text-center space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <Database className="w-10 h-10 mx-auto text-slate-500" />
        <h3 className="text-base font-bold text-white">No Dataset Loaded</h3>
        <p className="text-xs text-slate-400">Please upload or select a dataset in Stage 1 to begin feature scaling and transformations.</p>
      </div>
    );
  }

  if (isLoading && !summaryData) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-400" />
        <p className="text-xs">Computing feature distribution moments and scaling recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Stage 5: Data Transformations & Feature Scaling Studio</h1>
            <Badge variant="brand">Phase 7 Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Standardization, MinMax Scaling, Robust Scaling, Log1p, and Power Transforms (Yeo-Johnson & Box-Cox)
          </p>
        </div>

        {/* Action Toolbar: History, Undo, Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>History ({historyList.length})</span>
          </button>

          <button
            onClick={handleUndo}
            disabled={isUndoing || (summaryData?.current_version === 0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
              summaryData?.current_version > 0 && !isUndoing
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isUndoing ? 'animate-spin text-brand-400' : ''}`} />
            <span>Undo Last Step</span>
          </button>

          <button
            onClick={fetchSummary}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Refresh Analysis"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="underline text-brand-400">Dismiss</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="underline text-rose-400">Dismiss</button>
        </div>
      )}

      {/* History Drawer */}
      {showHistory && (
        <TransformationHistory
          historyList={historyList}
          currentVersion={summaryData?.current_version || 0}
        />
      )}

      {/* Main View Switching */}
      {selectedColumn ? (
        <TransformationDetail
          datasetId={datasetId}
          column={selectedColumn}
          onBack={() => setSelectedColumn(null)}
          onOperationSuccess={handleOperationSuccess}
        />
      ) : (
        <TransformationSummary
          summaryData={summaryData}
          onSelectColumn={setSelectedColumn}
        />
      )}
    </div>
  );
};

export default TransformationWorkspace;
