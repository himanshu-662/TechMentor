import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  RefreshCw, 
  RotateCcw, 
  History, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  BookOpen,
  Database
} from 'lucide-react';
import Badge from '../components/common/Badge';
import OutlierSummary from '../components/outliers/OutlierSummary';
import OutlierDetail from '../components/outliers/OutlierDetail';
import { getDatasetOutlierSummary, getOutlierHistory } from '../services/outlierService';
import { undoOperation } from '../services/cleaningService';

export const OutlierWorkspace = ({ datasetId, onApplied }) => {
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

    const res = await getDatasetOutlierSummary(datasetId);
    if (res.data) {
      setSummaryData(res.data);
    } else {
      setErrorMessage(res.error);
    }

    const histRes = await getOutlierHistory(datasetId);
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

    const res = await undoOperation(datasetId);
    if (res.data) {
      setSuccessMessage(res.data.message || 'Successfully reverted last operation.');
      fetchSummary();
    } else {
      setErrorMessage(res.error);
    }
    setIsUndoing(false);
  };

  const handleOperationSuccess = (applyResult) => {
    setSuccessMessage(applyResult?.message || 'Outlier treatment applied successfully.');
    fetchSummary();
    if (onApplied) {
      onApplied(applyResult);
    }
  };

  if (!datasetId) {
    return (
      <div className="p-12 text-center space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
        <Database className="w-10 h-10 mx-auto text-slate-500" />
        <h3 className="text-base font-bold text-white">No Dataset Uploaded</h3>
        <p className="text-xs text-slate-400">Please upload a dataset in Step 01 to begin outlier detection and treatment.</p>
      </div>
    );
  }

  if (isLoading && !summaryData) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-400" />
        <p className="text-xs">Computing empirical outlier boundaries across numerical features...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Step 05: Outlier Detection & Treatment Studio</h1>
            <Badge variant="brand">Step 05 Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Detect, explain, visualize, and safely treat numerical outliers using IQR, Z-Score, and Modified Z-Score.
          </p>
        </div>

        {/* History & Undo Toolbar */}
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
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Outlier Treatment Audit Trail</h3>
            </div>
            <span className="text-[11px] text-slate-400">Version Snapshots</span>
          </div>

          {historyList.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No outlier operations recorded yet. Dataset is in original state.</p>
          ) : (
            <div className="space-y-2">
              {historyList.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      Version #{item.version || idx + 1}: {item.treatment?.toUpperCase()} on '{item.column}'
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{item.reason}</p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Before Outliers: {item.before?.outliers} ➔ After Outliers: {item.after?.outliers} | Affected Rows: {item.affected_rows}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main View Switching */}
      {selectedColumn ? (
        <OutlierDetail
          datasetId={datasetId}
          column={selectedColumn}
          onBack={() => setSelectedColumn(null)}
          onOperationSuccess={handleOperationSuccess}
        />
      ) : (
        <OutlierSummary
          summaryData={summaryData}
          onSelectColumn={setSelectedColumn}
        />
      )}
    </div>
  );
};

export default OutlierWorkspace;
