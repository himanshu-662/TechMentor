import React from 'react';
import { History, Undo2, Calendar, Sparkles, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import Badge from '../common/Badge';

export const FeatureHistory = ({ 
  history = [], 
  onUndo, 
  undoing = false 
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center space-y-2">
        <History className="w-8 h-8 text-slate-600 mx-auto" />
        <h4 className="text-xs font-semibold text-slate-300">No Features Engineered Yet</h4>
        <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
          Features you construct or generate will be recorded here in an immutable audit trail with snapshot rollbacks.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Engineered Features History ({history.length})
          </h3>
        </div>

        {onUndo && (
          <button
            onClick={onUndo}
            disabled={undoing}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>{undoing ? 'Reverting...' : 'Undo Last Feature'}</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {history.map((item, idx) => (
          <div 
            key={item.operation_id || idx} 
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand">
                  {item.feature_type}
                </Badge>
                <code className="text-xs font-mono font-bold text-brand-300">
                  {item.feature_name}
                </code>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-mono text-slate-400">v{item.new_version || (idx + 1)}</span>
                {item.timestamp && (
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                )}
              </div>
            </div>

            {item.formula && (
              <div className="font-mono text-[11px] text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                {item.formula}
              </div>
            )}

            {item.validation && (
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>Dtype: <strong className="text-slate-300">{item.validation.dtype || 'float64'}</strong></span>
                <span>•</span>
                <span>Nulls: <strong className="text-slate-300">{item.validation.null_count ?? 0}</strong></span>
                <span>•</span>
                <span>Unique: <strong className="text-slate-300">{item.validation.unique_count ?? 'N/A'}</strong></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureHistory;
