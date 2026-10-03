import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  ArrowRight,
  Database,
  HelpCircle
} from 'lucide-react';
import Badge from '../common/Badge';

export const DatasetUploadZone = ({ 
  onUpload, 
  uploadState, 
  uploadProgress, 
  errorMessage, 
  onResetError,
  onLoadSample
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      onUpload(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      onUpload(selectedFile);
    }
  };

  const isUploading = uploadState === 'uploading';
  const isProcessing = uploadState === 'processing';
  const isBusy = isUploading || isProcessing;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Branding & Subtitle */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Phase 2 Ingestion Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Upload Your Dataset
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Turn raw data into ML-ready data while learning every step.
        </p>
      </div>

      {/* Error Alert State */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3 text-rose-300 text-xs animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-rose-200">Upload Failed: </span>
              {errorMessage}
            </div>
          </div>
          {onResetError && (
            <button
              onClick={onResetError}
              className="text-rose-400 hover:text-rose-200 text-xs font-medium underline shrink-0"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center ${
          isDragOver
            ? 'border-brand-400 bg-brand-500/10 scale-[1.01]'
            : isBusy
            ? 'border-slate-700 bg-slate-900/60 cursor-wait'
            : 'border-slate-800 hover:border-brand-500/40 bg-slate-900/40 hover:bg-slate-900/60 cursor-pointer'
        }`}
        onClick={() => !isBusy && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileChange}
          className="hidden"
          disabled={isBusy}
        />

        <div className="max-w-md mx-auto space-y-4">
          {/* Animated Icon */}
          <div className="relative mx-auto w-16 h-16">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              isDragOver
                ? 'bg-brand-500/20 text-brand-300 scale-110 shadow-lg shadow-brand-500/20'
                : isBusy
                ? 'bg-brand-500/10 text-brand-400'
                : 'bg-slate-800 text-slate-300 group-hover:text-brand-400'
            }`}>
              {isBusy ? (
                <RefreshCw className="w-8 h-8 animate-spin text-brand-400" />
              ) : isDragOver ? (
                <UploadCloud className="w-8 h-8 text-brand-400 animate-bounce" />
              ) : (
                <UploadCloud className="w-8 h-8 text-slate-400" />
              )}
            </div>
          </div>

          {/* Status Messaging */}
          {isUploading && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">
                Uploading Dataset ({uploadProgress}%)
              </h3>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-brand-500 to-brand-400 h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">Streaming raw bytes securely to server...</p>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">
                Ingesting & Profiling Dataset Structure...
              </h3>
              <p className="text-xs text-slate-400">
                Parsing columns, inferring Pandas data types, and calculating metadata.
              </p>
            </div>
          )}

          {!isBusy && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {isDragOver ? 'Drop your file here to upload' : 'Drag & drop your dataset here'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  or click to browse your computer
                </p>
              </div>

              <button
                type="button"
                className="px-5 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-slate-950 font-semibold text-xs shadow-lg shadow-brand-500/20 transition-all inline-flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Browse Dataset Files
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span>Supported:</span>
                <span className="font-mono text-slate-300">.CSV</span>
                <span>•</span>
                <span className="font-mono text-slate-300">.XLSX</span>
                <span>•</span>
                <span className="font-mono text-slate-300">.XLS</span>
                <span>(Max 50 MB)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Test Sample Dataset Card */}
      {onLoadSample && !isBusy && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Want to test without a file?</h4>
              <p className="text-[11px] text-slate-400">
                Load our sample customer churn dataset (with realistic missing values & categorical features).
              </p>
            </div>
          </div>
          <button
            onClick={onLoadSample}
            type="button"
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium shrink-0 transition-colors inline-flex items-center gap-1.5"
          >
            Load Sample Dataset <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
          </button>
        </div>
      )}

      {/* Educational Concept Footer */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Why Ingestion Quality Matters: </span>
          The ingestion engine validates character encodings, delimiter structure, and type safety before any transformations occur.
        </div>
      </div>
    </div>
  );
};

export default DatasetUploadZone;
