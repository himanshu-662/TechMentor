import React, { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';
import { ShieldCheck, AlertCircle, RefreshCw, Layers, FileSpreadsheet, Database, Bot } from 'lucide-react';
import Badge from '../components/common/Badge';
import { useWorkflow } from '../state/WorkflowContext';

export const Header = () => {
  const { activeDataset, goToStep } = useWorkflow();
  const [healthStatus, setHealthStatus] = useState({ loading: true, healthy: false, data: null });

  const fetchHealth = async () => {
    setHealthStatus((prev) => ({ ...prev, loading: true }));
    const result = await checkHealth();
    if (result.data) {
      setHealthStatus({ loading: false, healthy: true, data: result.data });
    } else {
      setHealthStatus({ loading: false, healthy: false, data: null });
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumb context */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => goToStep('landing')}
          className="flex items-center gap-2.5 hover:opacity-90 transition-all cursor-pointer group"
          title="TechMentor - Return to Home"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 via-brand-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Layers className="w-3.5 h-3.5 text-slate-950" />
          </div>
          <span className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">TechMentor</span>
        </button>
        <span className="text-slate-600">/</span>
        <button
          onClick={() => goToStep('dashboard')}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors cursor-pointer font-medium"
        >
          DataMentor Studio
        </button>
        <span className="text-slate-700">•</span>
        <Badge variant="brand">v0.1.0</Badge>
      </div>

      {/* Right Section: Active Dataset & Backend Status */}
      <div className="flex items-center gap-3">
        {/* Active Dataset Pill */}
        {activeDataset ? (
          <button
            onClick={() => goToStep('loading')}
            title="Active working dataset in memory. Click to view Data Loading."
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-950/40 hover:bg-brand-950/70 border border-brand-500/30 text-xs transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-brand-400" />
            <span className="font-mono text-brand-300 font-semibold truncate max-w-[130px] sm:max-w-[200px]">
              {activeDataset.filename || 'dataset.csv'}
            </span>
            {activeDataset.row_count ? (
              <span className="text-[10px] text-brand-400/80 hidden md:inline">
                ({activeDataset.row_count.toLocaleString()} rows)
              </span>
            ) : null}
          </button>
        ) : (
          <button
            onClick={() => goToStep('collection')}
            title="No dataset loaded. Click to choose or upload a dataset."
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px]">No Dataset Active</span>
          </button>
        )}

        {/* Backend Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
          <span className="text-slate-400 hidden sm:inline">API:</span>
          {healthStatus.loading ? (
            <span className="inline-flex items-center gap-1 text-slate-400">
              <RefreshCw className="w-3 h-3 animate-spin" /> Checking...
            </span>
          ) : healthStatus.healthy ? (
            <span className="inline-flex items-center gap-1.5 text-brand-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
              Online
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Offline
            </span>
          )}
          <button 
            onClick={fetchHealth} 
            title="Refresh status"
            className="text-slate-400 hover:text-slate-200 ml-1"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Launch Menti.ai Button */}
        <button
          onClick={() => goToStep('chatbot')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/70 to-indigo-900/70 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/40 text-xs text-purple-200 transition-all shadow-md shadow-purple-950/40 group"
          title="Launch Dedicated Menti.ai Workspace"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <Bot className="w-3.5 h-3.5 text-purple-300 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-white">Menti.ai</span>
        </button>

        <div className="hidden lg:flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Explainable Mode
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;

