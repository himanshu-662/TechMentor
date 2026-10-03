import React, { useState } from 'react';
import {
  Search,
  Filter,
  Layers,
  BookOpen,
  Plus,
  RefreshCw,
  FolderOpen,
  X,
  FileText
} from 'lucide-react';
import KnowledgeDocumentCard from './KnowledgeDocumentCard';
import knowledgeService from '../../services/knowledgeService';

export const KnowledgeDocumentList = ({
  documents,
  stats,
  isLoading,
  onRefresh,
  onOpenUpload
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDocForChunks, setSelectedDocForChunks] = useState(null);
  const [docChunks, setDocChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Filter logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInspectChunks = async (doc) => {
    setSelectedDocForChunks(doc);
    setLoadingChunks(true);
    try {
      const chunks = await knowledgeService.getDocumentChunks(doc.document_id);
      setDocChunks(chunks);
    } catch (err) {
      console.error('Failed to load chunks', err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleReindex = async (documentId) => {
    try {
      await knowledgeService.reindexDocument(documentId);
      setActionMessage('Document successfully re-indexed!');
      setTimeout(() => setActionMessage(null), 3000);
      onRefresh();
    } catch (err) {
      alert('Failed to reindex document: ' + err.message);
    }
  };

  const handleToggleStatus = async (doc) => {
    try {
      if (doc.status === 'ACTIVE') {
        await knowledgeService.archiveDocument(doc.document_id);
      } else {
        await knowledgeService.activateDocument(doc.document_id);
      }
      onRefresh();
    } catch (err) {
      alert('Failed to change document status: ' + err.message);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document from the knowledge base?')) {
      return;
    }
    try {
      await knowledgeService.deleteDocument(documentId);
      onRefresh();
    } catch (err) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Notification */}
      {actionMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium animate-in fade-in">
          ✓ {actionMessage}
        </div>
      )}

      {/* Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400">Total Documents</div>
          <div className="text-xl font-bold text-white font-mono mt-0.5">
            {stats?.total_documents || documents.length}
          </div>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400">Active Documents</div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            {stats?.active_documents || documents.filter((d) => d.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400">Total Chunks</div>
          <div className="text-xl font-bold text-brand-400 font-mono mt-0.5">
            {stats?.total_chunks || 0}
          </div>
        </div>
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] font-medium text-slate-400">Knowledge Categories</div>
          <div className="text-xl font-bold text-purple-400 font-mono mt-0.5">
            {stats?.categories?.length || 0}
          </div>
        </div>
      </div>

      {/* Search & Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents, topics, or descriptions..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            title="Refresh documents list"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      {stats?.categories && stats.categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All ({documents.length})
          </button>
          {stats.categories.map((cat) => {
            const count = documents.filter((d) => d.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Document Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <KnowledgeDocumentCard
              key={doc.document_id}
              document={doc}
              onInspectChunks={handleInspectChunks}
              onReindex={handleReindex}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No documents found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'ALL'
              ? 'Try adjusting your search query or category filter.'
              : 'Upload a new document or text passage to seed your knowledge base.'}
          </p>
        </div>
      )}

      {/* Chunks Inspector Modal */}
      {selectedDocForChunks && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>{selectedDocForChunks.title}</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Document ID: {selectedDocForChunks.document_id} • v{selectedDocForChunks.version} • {docChunks.length} Chunks
                </p>
              </div>
              <button
                onClick={() => setSelectedDocForChunks(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chunks List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {loadingChunks ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-400" />
                  Loading semantic chunks...
                </div>
              ) : docChunks.length > 0 ? (
                docChunks.map((chunk, idx) => (
                  <div
                    key={chunk.chunk_id || idx}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-brand-400">
                        Chunk #{idx + 1} — Section: {chunk.section}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        ID: {chunk.chunk_id}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed font-sans whitespace-pre-wrap bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-[11px]">
                      {chunk.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No indexed chunks found for this document.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-right">
              <button
                type="button"
                onClick={() => setSelectedDocForChunks(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeDocumentList;
