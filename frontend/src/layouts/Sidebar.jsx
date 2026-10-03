import React from 'react';
import {
  LayoutDashboard,
  Database,
  FileSpreadsheet,
  BarChart3,
  Sparkles,
  Flame,
  Binary,
  Sliders,
  Minimize2,
  CheckSquare,
  Scissors,
  Cpu,
  PlayCircle,
  Award,
  BookOpen,
  MessageSquareCode,
  Activity,
  CheckCircle2,
  Lock,
  Trash2
} from 'lucide-react';
import { useWorkflow, STEP_STATUSES } from '../state/WorkflowContext';


const STEP_ICONS = {
  collection: Database,
  loading: FileSpreadsheet,
  eda: BarChart3,
  cleaning: Sparkles,
  outliers: Flame,
  encoding: Binary,
  scaling: Sliders,
  dimensionality: Minimize2,
  feature_selection: CheckSquare,
  split: Scissors,
  fitting: Cpu,
  prediction: PlayCircle,
  evaluation: Award
};

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { 
    steps, 
    currentStepId, 
    stepStates, 
    completedStepsCount, 
    totalSteps,
    activeDataset,
    clearActiveDataset 
  } = useWorkflow();


  const otherItems = [
    { id: 'dashboard', name: 'Overview', icon: LayoutDashboard, category: 'Core' },
    { id: 'chatbot', name: 'Menti.ai Tutor', icon: MessageSquareCode, category: 'Mentor & AI', badge: 'AI' },
    { id: 'genaimentor', name: 'GenAIMentor RAG', icon: Sparkles, category: 'Mentor & AI', badge: 'RAG' },
    { id: 'learning-hub', name: 'Learning Hub', icon: Activity, category: 'Mentor & AI' }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none overflow-hidden">
      {/* Brand Header (Click logo/brand to navigate Home) */}
      <div 
        onClick={() => onSelectTab('landing')}
        title="TechMentor - Return to Home"
        className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 cursor-pointer group hover:bg-slate-850/60 transition-all select-none"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
          <Activity className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight leading-tight group-hover:text-brand-300 transition-colors">
            TechMentor
          </h1>
          <p className="text-[11px] text-brand-400 font-medium">DataMentor ML Studio</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Progress</span>
          <span className="font-mono font-bold text-brand-400">
            {completedStepsCount} / {totalSteps} Completed
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-brand-500 to-brand-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${(completedStepsCount / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {/* Core Links */}
        <div className="space-y-1">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-brand-400" />
            <span>Workflow Overview</span>
          </button>
        </div>

        {/* 13 ML Pipeline Steps */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>13-Step ML Pipeline</span>
            <span className="text-brand-400 text-[9px] font-mono">EXACT</span>
          </div>

          <div className="space-y-0.5">
            {steps.map((step) => {
              const Icon = STEP_ICONS[step.id] || Sparkles;
              const isActive = activeTab === step.id;
              const status = stepStates[step.id] || STEP_STATUSES.AVAILABLE;
              const isCompleted = status === STEP_STATUSES.APPLIED || status === STEP_STATUSES.VALIDATED;
              const isLocked = status === STEP_STATUSES.LOCKED;

              return (
                <button
                  key={step.id}
                  onClick={() => onSelectTab(step.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-md'
                      : isCompleted
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      : isLocked
                      ? 'text-slate-400 hover:text-slate-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-white' : isCompleted ? 'text-brand-400' : 'text-slate-400'
                    }`} />
                    <span className="truncate">{step.name}</span>
                  </div>

                  <div className="shrink-0 ml-1">
                    {isCompleted ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-brand-400'}`} />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3 text-slate-400" />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mentor & Learning Hub Links */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Mentor & Education
          </div>
          {otherItems
            .filter(item => item.category === 'Mentor & AI')
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* Active Dataset Footer Widget */}
      {activeDataset && (
        <div className="px-3 py-2 bg-brand-950/40 border-t border-brand-500/20 flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse shrink-0"></span>
            <span className="text-[11px] font-mono text-brand-300 font-medium truncate max-w-[150px]">
              {activeDataset.filename || 'dataset.csv'}
            </span>
          </div>
          <button
            onClick={clearActiveDataset}
            title="Remove active dataset"
            className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Footer Branding */}
      <div className="p-3 border-t border-slate-800">

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" /> Learning-First Platform
          </div>
          <p className="mt-1 text-[10px] text-slate-400 leading-tight">
            Transparent explanations for all 13 ML stages.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
