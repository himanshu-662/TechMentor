import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Database,
  Layers,
  Bot,
  MessageSquareCode,
  Binary,
  Cpu,
  GraduationCap,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  Eye,
  BookOpen,
  Sliders,
  Award,
  Terminal,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Workflow,
  Search,
  Code2,
  Lock
} from 'lucide-react';
import TechMentorNav, { SUITES_CONFIG } from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const TechMentorLandingPage = ({ onNavigate, onLaunchStudio }) => {
  // Sandbox State for Interactive Multi-Modal Demo
  const [activeSandboxTab, setActiveSandboxTab] = useState('data');
  const [skewValue, setSkewValue] = useState(2.4);
  const [bm25K1, setBm25K1] = useState(1.5);
  const [denseTopK, setDenseTopK] = useState(5);
  const [nlpTokens, setNlpTokens] = useState(['Trans', '##form', '##ers', 'learn', 'at', '##ten', '##tion']);
  const [activeTokenIdx, setActiveTokenIdx] = useState(0);

  const ECOSYSTEM_STATS = [
    { value: '6 Suites', label: 'Specialized Learning Studios', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5' },
    { value: '37+ Proofs', label: 'First-Principles Math Formulas', color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/5' },
    { value: '7 Pillars', label: 'Explainability Dimensions', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/5' },
    { value: '0% Fluff', label: 'Grounded Zero-Fabrication', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5' }
  ];

  const CORE_PHILOSOPHY = [
    {
      title: '1. No Opaque Black Boxes',
      desc: 'AutoML platforms hide the decisions that matter. In TechMentor, every imputation, scaling factor, PCA eigenvalue, and attention weight is fully mathematically derived and visible.',
      icon: Eye,
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-400',
      accent: 'Emerald Tabular ML'
    },
    {
      title: '2. Interactive Visual Sandboxes',
      desc: 'Theory sticks when you can touch it. Adjust sliders for skewness, outlier thresholds, batch sizes, and BM25 k1 parameters to witness distribution changes in real time.',
      icon: Sliders,
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/5',
      text: 'text-cyan-400',
      accent: 'Cyan Vector & RAG'
    },
    {
      title: '3. Grounded Zero-Fabrication',
      desc: 'Never trust an AI that guesses numbers. Menti.AI and the entire TechMentor platform compute moments directly from live in-memory datasets with strict factual verification.',
      icon: ShieldCheck,
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/5',
      text: 'text-purple-400',
      accent: 'Purple Socratic AI'
    },
    {
      title: '4. Unified Engineering Continuum',
      desc: 'A cohesive learning journey bridging raw tabular preprocessing, deep neural layers, NLP tokenizers, hybrid RAG knowledge bases, and autonomous multi-agent decision pipelines.',
      icon: Workflow,
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/5',
      text: 'text-amber-400',
      accent: 'Amber Agentic Swarms'
    }
  ];

  const LEARNING_PATHWAY = [
    {
      step: '01',
      title: 'Data Foundations & Preprocessing',
      suite: 'DataMentor',
      id: 'datamentor',
      color: 'from-emerald-500 to-teal-500',
      badge: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      desc: 'Master the 13-stage pipeline: EDA, cleaning, outlier winsorization, encoding, scaling, PCA, and 12+ ML algorithms.'
    },
    {
      step: '02',
      title: 'Deep Learning & Neural Dynamics',
      suite: 'DLMentor',
      id: 'dlmentor',
      color: 'from-sky-500 to-blue-600',
      badge: 'border-sky-500/30 text-sky-400 bg-sky-500/10',
      desc: 'Build computational autograd graphs, optimize high-dimensional loss surfaces, and train CNNs and Vision Transformers.'
    },
    {
      step: '03',
      title: 'Natural Language Processing',
      suite: 'NLPMentor',
      id: 'nlpmentor',
      color: 'from-rose-500 to-pink-500',
      badge: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
      desc: 'Traverse text strings to subword BPE tokenizers, syntactic dependency trees, word embeddings, and multi-head attention.'
    },
    {
      step: '04',
      title: 'Production RAG Architectures',
      suite: 'GenAIMentor',
      id: 'genaimentor',
      color: 'from-cyan-500 to-blue-500',
      badge: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
      desc: 'Construct end-to-end RAG: chunking, dense embeddings, sparse BM25, hybrid RRF rerankers, and retrieval evaluation.'
    },
    {
      step: '05',
      title: 'Autonomous Multi-Agent Pipelines',
      suite: 'AgenticAIMentor',
      id: 'agenticaimentor',
      color: 'from-amber-500 to-orange-500',
      badge: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      desc: 'Architect ReAct reasoning loops, hierarchical planning trees, dynamic tool schemas, reflection, and human safety gates.'
    },
    {
      step: 'Co-Pilot',
      title: 'Socratic AI Mentoring Everywhere',
      suite: 'Menti.AI',
      id: 'menti',
      color: 'from-purple-500 to-indigo-500',
      badge: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      desc: 'Active Socratic inquiry and the 7 Explainability Pillars guiding you across all suites without hallucinations.'
    }
  ];

  const FAQS = [
    {
      q: 'What is TechMentor and how does the ecosystem work?',
      a: 'TechMentor is a unified first-principles learning and engineering platform. Rather than treating AI as an opaque black box, TechMentor provides 6 specialized tool suites (Menti.AI, DataMentor, GenAIMentor, AgenticAIMentor, NLPMentor, and DLMentor) allowing learners and engineers to build every AI and Data Science concept from scratch with hands-on practical experience.'
    },
    {
      q: 'Can I use individual suites independently?',
      a: 'Yes! Each suite functions as a dedicated standalone studio (e.g. DataMentor for data preprocessing and ML training, GenAIMentor for building and benchmarking RAG pipelines), but all suites share common design tokens, pedagogical principles, and Menti.AI Socratic assistance.'
    },
    {
      q: 'What makes "Learn by Building" different from online courses or AutoML?',
      a: 'Passive video courses teach theory without execution, while AutoML tools hide the math behind one-click buttons. TechMentor gives you interactive visual sandboxes, live mathematical formula derivations, and step-by-step pipeline execution on your own datasets.'
    },
    {
      q: 'What is the Zero-Fabrication Guarantee?',
      a: 'Every metric, summary statistic, and Socratic explanation generated in TechMentor is calculated directly from actual in-memory data moments using deterministic Python, NumPy, and Scikit-Learn arithmetic. We strictly forbid LLM hallucinations or guessing numbers.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-purple-500 selection:text-white">
      <TechMentorNav currentSuite="ecosystem" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* ========================================================================= */}
      {/* SECTION 1: Multi-Chromatic Aurora Hero Section */}
      {/* ========================================================================= */}
      <section className="relative pt-14 pb-20 sm:pt-20 sm:pb-28 overflow-hidden border-b border-slate-900">
        {/* Layered Multi-Spectrum Ambient Glow Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-1/4 w-[500px] h-[350px] bg-gradient-to-b from-emerald-500/15 via-cyan-500/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-rose-500/10 via-amber-500/10 to-transparent blur-[160px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Multi-Spectrum Continuum Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 via-purple-500/15 to-rose-500/15 text-slate-200 border border-slate-700/70 shadow-lg shadow-purple-950/20 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="font-mono">TechMentor Multi-Suite AI Ecosystem</span>
          </div>

          {/* Master Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
            Step Inside the Black Box of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              First-Principles AI & Data Engineering.
            </span>
          </h1>

          {/* Multi-Hue Subtitle */}
          <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-slate-300/90 leading-relaxed font-normal">
            Master transparent intelligence through hands-on practice: <span className="text-emerald-400 font-semibold">DataMentor</span> for 13-stage ML pipelines, <span className="text-cyan-400 font-semibold">GenAIMentor</span> for grounded RAG, <span className="text-rose-400 font-semibold">NLPMentor</span> for attention mechanisms, and <span className="text-purple-400 font-semibold">Menti.ai</span> for Socratic AI tutoring.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => onLaunchStudio ? onLaunchStudio() : (onNavigate && onNavigate('collection'))}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 hover:opacity-95 text-slate-950 font-bold text-sm shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 group active:scale-95 select-none"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Launch DataStudio</span>
              <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('suites-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/80 hover:bg-slate-850 text-slate-300 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Explore 6 Specialized Studios</span>
            </button>
          </div>

          {/* 6-Suite Harmonized Trust Ribbon */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              DataMentor
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              DLMentor
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              NLPMentor
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              GenAIMentor
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              AgenticAI
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Menti.ai
            </span>
          </div>

          {/* Harmonized Ecosystem Stats */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {ECOSYSTEM_STATS.map((s, idx) => (
              <div key={idx} className={`p-3.5 rounded-2xl ${s.bg} border ${s.border} backdrop-blur-sm transition-all hover:scale-102`}>
                <span className={`block text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</span>
                <span className="text-[11px] text-slate-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: The 6 Specialized Suites of TechMentor */}
      {/* ========================================================================= */}
      <section id="suites-grid" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 text-slate-300 border border-slate-700/60">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>The Continuum of Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Six Specialized Studios. One Unified Platform.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Each suite targets a distinct layer of the machine learning stack with transparent mathematics, visual sandboxes, and reproducible pipelines.
          </p>
        </div>

        {/* 6 Suites Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUITES_CONFIG.map((suite) => {
            const IconComponent = suite.icon;
            return (
              <div
                key={suite.id}
                className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl hover:shadow-2xl relative overflow-hidden"
              >
                {/* Custom Themed Ambient Glow */}
                <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${suite.color} opacity-10 blur-3xl group-hover:opacity-25 transition-opacity pointer-events-none`} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${suite.color} p-0.5 shadow-md flex-shrink-0`}>
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${suite.accentBg}`}>
                      {suite.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {suite.name}
                    </h3>
                    <p className={`text-xs font-medium ${suite.accentText} mt-0.5`}>
                      {suite.tagline}
                    </p>
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {suite.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigate && onNavigate(suite.id)}
                    className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>View Suite Landing</span>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => {
                      if (suite.id === 'datamentor' && onLaunchStudio) onLaunchStudio();
                      else if (suite.id === 'menti') onNavigate && onNavigate('menti-ai');
                      else if (suite.id === 'genaimentor') onNavigate && onNavigate('knowledge-base');
                      else if (onLaunchStudio) onLaunchStudio();
                      else onNavigate && onNavigate(suite.id);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700/50`}
                  >
                    Open Studio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: Interactive Multi-Modal Visual Sandbox */}
      {/* ========================================================================= */}
      <section className="py-24 bg-slate-900/40 border-y border-slate-900 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Interactive Mathematical Playground
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Touch the Math. Watch the State Change.
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Test how parameters instantly reshape probability distributions, attention matrices, and RAG retrieval ranks.
            </p>
          </div>

          {/* Sandbox Interactive Card */}
          <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Multi-Spectrum Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/60 p-2 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveSandboxTab('data')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeSandboxTab === 'data'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Data Foundations (Skewness)</span>
              </button>

              <button
                onClick={() => setActiveSandboxTab('rag')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeSandboxTab === 'rag'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Hybrid RAG (BM25 + RRF)</span>
              </button>

              <button
                onClick={() => setActiveSandboxTab('nlp')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeSandboxTab === 'nlp'
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <MessageSquareCode className="w-4 h-4 text-rose-400" />
                <span>NLP (BPE Tokenizer)</span>
              </button>

              <button
                onClick={() => setActiveSandboxTab('menti')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeSandboxTab === 'menti'
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Menti.ai (Socratic Prover)</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 sm:p-8">
              {/* TAB 1: Data Foundations */}
              {activeSandboxTab === 'data' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-emerald-400">Step 07 • Feature Transformations</span>
                      <h3 className="text-xl font-bold text-white">Skewness Shift & Recommendation</h3>
                      <p className="text-xs text-slate-400">
                        Adjust sample skewness $\gamma_1$ to trigger deterministic transformation logic.
                      </p>
                    </div>

                    <div className="space-y-2 p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">Sample Skewness ($\gamma_1$):</span>
                        <span className="font-bold text-emerald-400">{skewValue.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="4.5"
                        step="0.1"
                        value={skewValue}
                        onChange={(e) => setSkewValue(parseFloat(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                      <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {skewValue > 1.0 ? 'Recommended: Log1p Transformation' : 'Recommended: StandardScaler'}
                      </span>
                      <p className="text-xs text-slate-300 font-mono">
                        {skewValue > 1.0 ? 'Formula: y = ln(1 + x)  [Compacts heavy right tail]' : 'Formula: z = (x - μ) / σ  [Preserves symmetry]'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                      <span>Statistical Moment</span>
                      <span>Simulated Value</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>1st Moment (Mean μ):</span>
                      <span className="text-emerald-400 font-bold">{(100 + skewValue * 15).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>2nd Moment (Std σ):</span>
                      <span className="text-emerald-400 font-bold">{(20 + skewValue * 8).toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Tail Compression Ratio:</span>
                      <span className="text-emerald-400 font-bold">{((1 + skewValue) * 1.8).toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RAG Pipeline */}
              {activeSandboxTab === 'rag' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-cyan-400">GenAIMentor • Reciprocal Rank Fusion</span>
                      <h3 className="text-xl font-bold text-white">Hybrid Retrieval Tuning</h3>
                      <p className="text-xs text-slate-400">
                        Adjust BM25 term saturation $k_1$ to balance exact keyword matches against semantic vectors.
                      </p>
                    </div>

                    <div className="space-y-2 p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-400">BM25 Parameter $k_1$:</span>
                        <span className="font-bold text-cyan-400">{bm25K1.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={bm25K1}
                        onChange={(e) => setBm25K1(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                      <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        {"RRF Fusion Score: RRF(d) = Σ 1 / (60 + r_m(d))"}
                      </span>
                      <p className="text-xs text-slate-300 font-mono">
                        {"Top Rank: Document Chunk #42 (Score: " + (0.0163 * bm25K1).toFixed(4) + ")"}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                      <span>Retriever Stream</span>
                      <span>Top Match Score</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Sparse BM25 Index:</span>
                      <span className="text-cyan-400 font-bold">{(8.42 * bm25K1).toFixed(2)} pts</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Dense Vector Cosine:</span>
                      <span className="text-cyan-400 font-bold">0.8924</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Fused RRF Rank:</span>
                      <span className="text-cyan-400 font-bold">Rank #1 (Grounded)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NLP Attention */}
              {activeSandboxTab === 'nlp' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-rose-400">NLPMentor • Byte-Pair Encoding & Self-Attention</span>
                      <h3 className="text-xl font-bold text-white">Subword Tokenizer Decomposition</h3>
                      <p className="text-xs text-slate-400">
                        {"Click on subwords to visualize query-key attention distribution QK^T / √d_k."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-900 border border-slate-800">
                      {nlpTokens.map((tok, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTokenIdx(idx)}
                          className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
                            activeTokenIdx === idx
                              ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/30'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {tok}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-rose-400" />
                        Active Subword: "{nlpTokens[activeTokenIdx]}"
                      </span>
                      <p className="text-xs text-slate-300 font-mono">
                        Attention Weight to "attention": {(0.68 + (activeTokenIdx % 3) * 0.1).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                      <span>Attention Parameter</span>
                      <span>Computed State</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>{"Embedding Dim (d_model):"}</span>
                      <span className="text-rose-400 font-bold">512</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>{"Scaling Factor (1/√d_k):"}</span>
                      <span className="text-rose-400 font-bold">0.125</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Softmax Peak Probability:</span>
                      <span className="text-rose-400 font-bold">0.9142</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Menti.ai Socratic Prover */}
              {activeSandboxTab === 'menti' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <span className="text-xs font-mono font-bold text-purple-400">Menti.ai • Socratic Zero-Fabrication</span>
                      <h3 className="text-xl font-bold text-white">Dynamic Moment Injection</h3>
                      <p className="text-xs text-slate-400">
                        Menti.ai computes exact moments before producing formal mathematical explanations.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>{'Socratic Inquiry: "Why divide by √d_k?"'}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {'"For large d_k, the variance of the dot product Σ q_i k_i scales to d_k. Dividing by √d_k pushes the variance back to 1.0, preventing softmax gradients from vanishing!"'}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                      <span>Proof Metric</span>
                      <span>Verification State</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Zero-Fabrication Guard:</span>
                      <span className="text-purple-400 font-bold">PASSED (Empirical)</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>KaTeX Math Formatting:</span>
                      <span className="text-purple-400 font-bold">{"Valid (μ=0, σ²=1)"}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>7 Pillars Alignment:</span>
                      <span className="text-purple-400 font-bold">100% Complete</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: The "Learn by Building" Pedagogical Foundation */}
      {/* ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            The Pedagogical Foundation
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Why "Learn by Building" Changes Everything
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Textbooks give you static equations; AutoML gives you black boxes. TechMentor bridges theory and production engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {CORE_PHILOSOPHY.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div
                key={idx}
                className={`p-8 rounded-3xl border ${item.border} ${item.bg} backdrop-blur-sm space-y-3 shadow-xl hover:scale-101 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <IconComp className={`w-5 h-5 ${item.text}`} />
                  </div>
                  <span className={`text-[11px] font-mono font-bold ${item.text}`}>
                    {item.accent}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: Cross-Suite Learning Pathway Journey */}
      {/* ========================================================================= */}
      <section className="py-24 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              End-to-End Curriculum
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              The Complete AI & Data Science Progression
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Follow a continuous learning continuum with hands-on studios at every step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEARNING_PATHWAY.map((stage, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group space-y-3 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${stage.badge}`}>
                      Step {stage.step}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {stage.suite}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate && onNavigate(stage.id)}
                  className="pt-4 border-t border-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between group-hover:translate-x-0.5 transition-all"
                >
                  <span>Explore {stage.suite}</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: Frequently Asked Questions */}
      {/* ========================================================================= */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Ecosystem FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-base font-bold text-white">
                {faq.q}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: Final Universal CTA */}
      {/* ========================================================================= */}
      <section className="py-24 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-gradient-to-r from-emerald-500/10 via-cyan-500/15 to-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Start Building Real AI Systems Today.
        </h2>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Join learners and engineers mastering artificial intelligence with complete mathematical transparency and zero hallucinations.
        </p>
        <button
          onClick={() => onLaunchStudio ? onLaunchStudio() : (onNavigate && onNavigate('collection'))}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 hover:opacity-95 text-slate-950 font-bold text-base shadow-xl shadow-purple-500/25 transition-all inline-flex items-center gap-2 select-none active:scale-95"
        >
          <span>Get Started with TechMentor</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </section>

      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default TechMentorLandingPage;
