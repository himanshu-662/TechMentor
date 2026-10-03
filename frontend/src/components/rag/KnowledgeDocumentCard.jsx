import React from 'react';
import {
  FileText,
  Layers,
  Calendar,
  RefreshCw,
  Archive,
  CheckCircle,
  Trash2,
  ExternalLink,
  Tag
} from 'lucide-react';

export const KnowledgeDocumentCard = ({
  document,
  onInspectChunks,
  onReindex,
  onToggleStatus,
  onDelete
}) => {
  const isActive = document.status === 'ACTIVE';
  const isArchived = document.status === 'ARCHIVED';

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
      isActive
        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
        : 'bg-slate-950/60 border-slate-800/60 opacity-80'
    }`}>
      {/* Header Info */}
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isActive ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-400'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate" title={document.title}>
                {document.title}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>v{document.version}</span>
                <span>•</span>
                <span className="uppercase">{document.source_type}</span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${
            isActive
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : isArchived
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
          }`}>
            {document.status}
          </span>
        </div>

        {document.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {document.description}
          </p>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-medium">
            <Tag className="w-3 h-3 text-purple-400" />
            {document.category}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">
            <Layers className="w-3 h-3 text-brand-400" />
            {document.chunk_count} chunks
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={() => onInspectChunks(document)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors font-medium text-[11px]"
        >
          <Layers className="w-3.5 h-3.5 text-brand-400" />
          <span>Chunks</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onReindex(document.document_id)}
            title="Re-index document embeddings"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-purple-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(document)}
            title={isActive ? 'Archive Document' : 'Activate Document'}
            className={`p-1.5 rounded-lg transition-colors ${
              isActive
                ? 'hover:bg-amber-500/20 text-slate-400 hover:text-amber-300'
                : 'hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300'
            }`}
          >
            {isActive ? <Archive className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onDelete(document.document_id)}
            title="Delete Document"
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeDocumentCard;
