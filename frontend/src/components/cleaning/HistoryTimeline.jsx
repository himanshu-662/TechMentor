import React, { useState } from 'react';
import {
  History,
  RotateCcw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Layers,
  ChevronRight
} from 'lucide-react';
import Badge from '../common/Badge';

export const HistoryTimeline = ({
  history = [],
  onUndo,
  isUndoing = false,
  undoError = null,
  activeVersion = null
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const canUndo = history && history.length > 0;
  const lastOperation = canUndo ? history[history.length - 1] : null;

  const handleConfirmUndo = () => {
    setShowConfirmModal(false);
    if (onUndo) {
      onUndo();
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ' (' + d.toLocaleDateString() + ')';
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Dataset Transformation & Version History</span>
              {activeVersion && (
                <Badge variant="brand">Active Version: {activeVersion}</Badge>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Audit log of non-destructive version snapshots with instant rollback support
            </p>
          </div>
        </div>

        {/* Undo Button */}
        <div>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!canUndo || isUndoing}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-amber-300 border border-amber-500/30 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isUndoing ? 'animate-spin' : ''}`} />
            <span>{isUndoing ? 'Undoing Operation...' : 'Undo Last Operation'}</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Non-Destructive Storage:</strong> Raw dataset in{' '}
          <code className="text-[10px] text-brand-300 bg-slate-900 px-1 py-0.5 rounded">original/</code> is protected by SHA-256 integrity and is never mutated. Every change is an isolated version snapshot.
        </span>
      </div>

      {/* Undo Error */}
      {undoError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{undoError}</span>
        </div>
      )}

      {/* Timeline List */}
      {!history || history.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs">
          No transformations applied yet. Dataset is currently at baseline (raw upload).
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[19px] before:w-0.5 before:bg-slate-800">
          {[...history].reverse().map((entry, idx) => {
            const isLatest = idx === 0;
            return (
              <div key={entry.operation_id || idx} className="relative flex items-start gap-4 text-xs pl-2">
                {/* Node icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border z-10 ${
                    isLatest
                      ? 'bg-brand-500/20 text-brand-400 border-brand-500/50 shadow-md ring-2 ring-brand-500/20'
                      : 'bg-slate-950 text-slate-400 border-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                </div>

                {/* Content Box */}
                <div
                  className={`flex-1 p-3.5 rounded-xl border space-y-1.5 transition-all ${
                    isLatest
                      ? 'bg-slate-950/80 border-slate-700 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">
                        {entry.operation}
                      </span>
                      {entry.column && (
                        <span className="font-mono text-brand-300 text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {entry.column}
                        </span>
                      )}
                      {entry.method && (
                        <Badge variant="purple">{entry.method}</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      <span className="text-[10px] font-mono text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                        {entry.from_version} ➔ {entry.to_version}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs leading-relaxed">
                    {entry.description}
                  </p>

                  {entry.delta && Object.keys(entry.delta).length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-slate-400 font-mono">
                      <span>Impact:</span>
                      {Object.entries(entry.delta).map(([k, v]) => (
                        <span key={k} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-300">
                          {k}: <strong>{String(v)}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Undo */}
      {showConfirmModal && lastOperation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Revert Last Operation?</h3>
                <p className="text-xs text-slate-400">
                  Undo version <span className="font-mono text-amber-400">{lastOperation.to_version}</span> back to <span className="font-mono text-brand-400">{lastOperation.from_version}</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-slate-300">
              <div className="font-semibold text-slate-200">Operation to revert:</div>
              <div className="text-slate-400 leading-relaxed">
                "{lastOperation.description}"
              </div>
              <div className="text-[11px] text-brand-400 pt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>The dataset will safely restore its prior state without loss of original data.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUndo}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors shadow-md shadow-amber-500/20"
              >
                Confirm & Revert Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTimeline;
