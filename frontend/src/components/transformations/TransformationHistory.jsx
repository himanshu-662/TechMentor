import React from 'react';
import { History, Clock, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import Badge from '../common/Badge';

export const TransformationHistory = ({ historyList = [], onUndo, currentVersion = 0 }) => {
  if (historyList.length === 0) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2">
        <History className="w-6 h-6 mx-auto text-slate-500" />
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Transformations Applied Yet</h4>
        <p className="text-[11px] text-slate-400">
          Your dataset is in its baseline ingested state (Version #{currentVersion}).
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Transformation Audit Trail & Version Snapshots
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {historyList.length} operation{historyList.length === 1 ? '' : 's'} recorded
        </span>
      </div>

      <div className="space-y-2.5">
        {historyList.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <Badge variant="purple">{item.new_version || `v${idx + 1}`}</Badge>
                <span className="font-bold text-white">
                  Applied <strong>{item.method?.toUpperCase()}</strong> on column <strong>'{item.column}'</strong>
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">{item.timestamp}</span>
            </div>

            <p className="text-slate-400 text-[11px] leading-relaxed">
              {item.reason}
            </p>

            {item.before && item.after && (
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 text-slate-400">
                <span>
                  Mean: <strong className="text-slate-300">{item.before.mean?.toFixed(2) ?? 'N/A'}</strong> ➔ <strong className="text-brand-400">{item.after.mean?.toFixed(2) ?? 'N/A'}</strong>
                </span>
                <span>
                  Std: <strong className="text-slate-300">{item.before.std?.toFixed(2) ?? 'N/A'}</strong> ➔ <strong className="text-brand-400">{item.after.std?.toFixed(2) ?? 'N/A'}</strong>
                </span>
                <span>
                  Skew: <strong className="text-slate-300">{item.before.skewness?.toFixed(2) ?? 'N/A'}</strong> ➔ <strong className="text-brand-400">{item.after.skewness?.toFixed(2) ?? 'N/A'}</strong>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransformationHistory;
