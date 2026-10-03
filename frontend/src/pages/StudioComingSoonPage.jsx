import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Bot,
  MessageSquareCode,
  Binary,
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  Database,
  Cpu,
  Sliders,
  ShieldCheck,
  Bell,
  Check,
  Zap,
  LayoutGrid
} from 'lucide-react';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

const SUITE_CONFIGS = {
  agenticaimentor: {
    id: 'agenticaimentor',
    name: 'AgenticAIMentor',
    suiteNumber: '04',
    title: 'Autonomous Multi-Agent & ReAct Studio',
    tagline: 'Orchestrating Goal-Directed Agentic Workflows with Socratic Supervision',
    icon: Bot,
    color: 'from-amber-500 to-orange-500',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    estimatedRelease: 'Q4 2026',
    progressPercent: 78,
    upcomingTools: [
      {
        title: 'Interactive ReAct Loop Engine',
        desc: 'Inspect step-by-step Thought, Action, Tool Execution, and Observation cycles with real-time token telemetry.'
      },
      {
        title: 'Multi-Agent Swarm Canvas',
        desc: 'Visual drag-and-drop orchestration canvas connecting Planner, Researcher, Coder, and Critic agents with shared state.'
      },
      {
        title: 'Deterministic Safety & Reflection Gates',
        desc: 'Strict human-in-the-loop interruption gates, tool execution sandboxes, and loop prevention circuits.'
      },
      {
        title: 'Vector Episodic & Working Memory',
        desc: 'Long-term semantic memory retrieval combined with sliding-window short-term context summarization.'
      }
    ]
  },
  nlpmentor: {
    id: 'nlpmentor',
    name: 'NLPMentor',
    suiteNumber: '05',
    title: 'Natural Language Processing & Transformer Studio',
    tagline: 'Deconstructing Language Representations from Byte-Pairs to Attention Heatmaps',
    icon: MessageSquareCode,
    color: 'from-rose-500 to-pink-500',
    accentText: 'text-rose-400',
    accentBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    estimatedRelease: 'Q4 2026',
    progressPercent: 82,
    upcomingTools: [
      {
        title: 'Byte-Pair Encoding (BPE) Visualizer',
        desc: 'Train tokenizers live on custom corpus and watch vocabulary merge operations step-by-step.'
      },
      {
        title: 'Interactive Self-Attention Heatmap',
        desc: 'Calculate Query, Key, and Value dot-products with softmax scaling and inspect multi-head attention distribution weights.'
      },
      {
        title: 'Syntactic Dependency & Parse Trees',
        desc: 'Universal dependency parsing with interactive tree graphs, POS tagging, and named entity recognition spans.'
      },
      {
        title: 'Continuous Vector Embedding Explorer',
        desc: 'Project 768-dimensional word and sentence embeddings onto 3D t-SNE / UMAP manifolds in real time.'
      }
    ]
  },
  dlmentor: {
    id: 'dlmentor',
    name: 'DLMentor',
    suiteNumber: '06',
    title: 'Deep Learning & Dynamic Autograd Studio',
    tagline: 'Mastering Computational Graphs, Backpropagation & Neural Loss Surfaces',
    icon: Binary,
    color: 'from-sky-500 to-blue-600',
    accentText: 'text-sky-400',
    accentBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    estimatedRelease: 'Q4 2026',
    progressPercent: 74,
    upcomingTools: [
      {
        title: 'Dynamic Computational Graph & Autograd',
        desc: 'Construct tensor nodes, run forward computation, and trace vector-Jacobian backpropagation gradients.'
      },
      {
        title: '3D Loss Surface Descent Visualizer',
        desc: 'Compare SGD, Momentum, RMSprop, and Adam trajectories across non-convex saddle points and local minima.'
      },
      {
        title: 'Convolutional Feature Map Inspector',
        desc: 'Pass images through 2D Conv, BatchNorm, and ReLU layers with live receptive field calculation.'
      },
      {
        title: 'Vision Transformer (ViT) Patch Projector',
        desc: 'Slice 2D images into 16x16 flattened linear patch projections and add learnable 1D positional embeddings.'
      }
    ]
  }
};

export const StudioComingSoonPage = ({ suiteId = 'agenticaimentor', onNavigate, onLaunchStudio }) => {
  const config = SUITE_CONFIGS[suiteId] || SUITE_CONFIGS.agenticaimentor;
  const SuiteIcon = config.icon;

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-brand-500 selection:text-slate-950">
      {/* Unified Header */}
      <TechMentorNav currentSuite={config.id} onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-900 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/15 via-purple-500/10 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Suite {config.suiteNumber} Studio • In Active Engineering</span>
          </div>

          {/* Big Title */}
          <div className="flex items-center justify-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${config.color} p-0.5 shadow-xl`}>
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <SuiteIcon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              {config.name} Studio
            </h1>
          </div>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 font-medium">
            {config.title}
          </p>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
            {config.tagline}. Our engineering team is currently implementing the deterministic computation graph, visualizers, and interactive sandboxes with strict zero-fabrication guarantees.
          </p>

          {/* Progress Indicator */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Engineering Implementation Progress</span>
              <span className="font-mono font-bold text-amber-400">{config.progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-1000`}
                style={{ width: `${config.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>Target Launch: {config.estimatedRelease}</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Architecture Validated
              </span>
            </div>
          </div>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto pt-2">
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>You're on the early VIP access list! We'll notify you the moment this studio goes live.</span>
              </div>
            ) : (
              <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for early studio access..."
                  required
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notify Me</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onNavigate && onNavigate(config.id)}
              className="px-5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-850 text-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <span>Explore {config.name} Landing Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('pages')}
              className="px-5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-850 text-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4 text-cyan-400" />
              <span>View All Pages Directory</span>
            </button>
          </div>
        </div>
      </section>

      {/* Planned Studio Tools Breakdown */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
            What We're Building
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Upcoming First-Principles Studio Features
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Like all TechMentor workspaces, this studio will provide interactive mathematical derivations and real-time computation with zero black-box magic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.upcomingTools.map((tool, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold flex items-center justify-center">
                  0{idx + 1}
                </span>
                <h3 className="text-base font-bold text-white">
                  {tool.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pl-10">
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Explore Active Live Studios Today */}
      <section className="py-16 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Live Studios Ready to Use Today
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Start Learning with Active TechMentor Studios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. DataMentor ML Studio */}
            <div
              onClick={() => onLaunchStudio ? onLaunchStudio() : (onNavigate && onNavigate('collection'))}
              className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/70 hover:bg-slate-850 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  DataMentor ML Studio
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  13 complete preprocessing stages, Tukey IQR winsorization, What-If prediction simulator, and 12+ model algorithms.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Launch 13-Stage Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Menti.AI Tutor */}
            <div
              onClick={() => onNavigate && onNavigate('chatbot')}
              className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/70 hover:bg-slate-850 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  Menti.AI Socratic Workspace
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated Socratic tutor with real-time in-memory dataset context awareness and zero-fabrication calculations.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-400">
                <span>Open Socratic Chatbot</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. GenAIMentor RAG Studio */}
            <div
              onClick={() => onNavigate && onNavigate('knowledge-base')}
              className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/70 hover:bg-slate-850 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  GenAIMentor Knowledge Base
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload documents, inspect chunk embeddings, benchmark BM25 keyword search, and run hybrid reciprocal rank fusion.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>Open RAG Knowledge Base</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default StudioComingSoonPage;
