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
  Workflow
} from 'lucide-react';
import TechMentorNav, { SUITES_CONFIG } from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const TechMentorLandingPage = ({ onNavigate, onLaunchStudio }) => {
  // Sandbox State for Quick Demo
  const [activeSandboxTab, setActiveSandboxTab] = useState('data');
  const [skewValue, setSkewValue] = useState(2.4);
  const [sampleVal, setSampleVal] = useState(128.5);

  const ECOSYSTEM_STATS = [
    { value: '6 Suites', label: 'Specialized Learning Studios', color: 'text-brand-400' },
    { value: '37 Concepts', label: 'First-Principles Math Formulas', color: 'text-cyan-400' },
    { value: '7 Pillars', label: 'Explainability Dimensions', color: 'text-purple-400' },
    { value: '0% Fluff', label: 'Grounded Zero-Fabrication', color: 'text-emerald-400' }
  ];

  const CORE_PHILOSOPHY = [
    {
      title: '1. No Opaque Black Boxes',
      desc: 'AutoML platforms hide the decisions that matter. In TechMentor, every imputation, scaling factor, PCA eigenvalue, and attention weight is fully mathematically derived and visible.',
      icon: Eye,
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-400'
    },
    {
      title: '2. Interactive Visual Sandboxes',
      desc: 'Theory sticks when you can touch it. Adjust sliders for skewness, outlier thresholds, batch sizes, and BM25 k1 parameters to witness distribution changes in real time.',
      icon: Sliders,
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/5',
      text: 'text-cyan-400'
    },
    {
      title: '3. Grounded Zero-Fabrication',
      desc: 'Never trust an AI that guesses numbers. Menti.AI and the entire TechMentor platform compute moments directly from live in-memory datasets with strict factual verification.',
      icon: ShieldCheck,
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/5',
      text: 'text-blue-400'
    },
    {
      title: '4. Unified Engineering Continuum',
      desc: 'A cohesive learning journey bridging raw tabular preprocessing, deep neural layers, NLP tokenizers, hybrid RAG knowledge bases, and autonomous multi-agent decision pipelines.',
      icon: Workflow,
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/5',
      text: 'text-purple-400'
    }
  ];

  const LEARNING_PATHWAY = [
    {
      step: '01',
      title: 'Data Foundations & Preprocessing',
      suite: 'DataMentor',
      id: 'datamentor',
      color: 'from-emerald-500 to-teal-500',
      desc: 'Master the 13-stage pipeline: EDA, cleaning, outlier winsorization, encoding, scaling, PCA, and 12+ ML algorithms.'
    },
    {
      step: '02',
      title: 'Deep Learning & Neural Dynamics',
      suite: 'DLMentor',
      id: 'dlmentor',
      color: 'from-sky-500 to-blue-600',
      desc: 'Build computational autograd graphs, optimize high-dimensional loss surfaces, and train CNNs and Vision Transformers.'
    },
    {
      step: '03',
      title: 'Natural Language Processing',
      suite: 'NLPMentor',
      id: 'nlpmentor',
      color: 'from-rose-500 to-pink-500',
      desc: 'Traverse text strings to subword BPE tokenizers, syntactic dependency trees, word embeddings, and multi-head attention.'
    },
    {
      step: '04',
      title: 'Production RAG Architectures',
      suite: 'GenAIMentor',
      id: 'genaimentor',
      color: 'from-cyan-500 to-blue-500',
      desc: 'Construct end-to-end RAG: chunking, dense embeddings, sparse BM25, hybrid RRF rerankers, and retrieval evaluation.'
    },
    {
      step: '05',
      title: 'Autonomous Multi-Agent Pipelines',
      suite: 'AgenticAIMentor',
      id: 'agenticaimentor',
      color: 'from-amber-500 to-orange-500',
      desc: 'Architect ReAct reasoning loops, hierarchical planning trees, dynamic tool schemas, reflection, and human safety gates.'
    },
    {
      step: 'Co-Pilot',
      title: 'Socratic AI Mentoring Everywhere',
      suite: 'Menti.AI',
      id: 'menti',
      color: 'from-purple-500 to-indigo-500',
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-brand-500 selection:text-slate-950">
      <TechMentorNav currentSuite="ecosystem" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Universal Ecosystem Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 overflow-hidden border-b border-slate-900">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-500/15 via-indigo-500/10 to-transparent blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Ecosystem Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/25 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-brand-400" />
            <span>TechMentor Universal Ecosystem</span>
          </div>

          {/* Clean, Motivating Headline with Proper Proportion */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Learn by Building <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              AI & Data Science Concepts.
            </span>
          </h1>

          {/* Crisp, Concise Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-300/90 leading-relaxed font-normal">
            Master artificial intelligence with hands-on practical experience. Explore first-principles mathematics, interactive visual sandboxes, and zero-fabrication architectures across 6 specialized suites.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => onLaunchStudio ? onLaunchStudio() : (onNavigate && onNavigate('collection'))}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-300 hover:from-brand-300 hover:to-teal-200 text-slate-950 font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('suites-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/70 hover:bg-slate-850 text-slate-300 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Explore 6 Tool Suites</span>
            </button>
          </div>

          {/* Compact Ecosystem Stats */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {ECOSYSTEM_STATS.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className={`block text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</span>
                <span className="text-[11px] text-slate-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The 6 Tool Suites of TechMentor */}
      <section id="suites-grid" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Specialized Tool Suite
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Six Purpose-Built Studios. One Unified Platform.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Each suite targets a critical pillar of modern AI engineering with dedicated landing pages, transparent mathematics, and hands-on workspaces.
          </p>
        </div>

        {/* 6 Suites Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUITES_CONFIG.map((suite, idx) => {
            const IconComponent = suite.icon;
            return (
              <div
                key={suite.id}
                className="p-7 rounded-3xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-xl hover:shadow-2xl relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${suite.color} opacity-5 blur-2xl group-hover:opacity-15 transition-opacity pointer-events-none`} />

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
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
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
                    <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
                  </button>

                  <button
                    onClick={() => {
                      if (suite.id === 'datamentor' && onLaunchStudio) onLaunchStudio();
                      else if (suite.id === 'menti') onNavigate && onNavigate('menti-ai');
                      else if (suite.id === 'genaimentor') onNavigate && onNavigate('knowledge-base');
                      else if (onLaunchStudio) onLaunchStudio();
                      else onNavigate && onNavigate(suite.id);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                  >
                    Open Studio
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The "Learn by Building" Core Philosophy */}
      <section className="py-24 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  className={`p-8 rounded-3xl border ${item.border} ${item.bg} backdrop-blur-sm space-y-3 shadow-xl`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <IconComp className={`w-5 h-5 ${item.text}`} />
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
        </div>
      </section>

      {/* Cross-Suite Learning Pathway Journey */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            End-to-End Curriculum
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            The Complete AI & Data Science Progression
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From tabular data mastery to autonomous multi-agent systems, follow a coherent, scaffolded progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LEARNING_PATHWAY.map((stage, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-brand-400 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                    Step {stage.step}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    {stage.suite}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                  {stage.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {stage.desc}
                </p>
              </div>

              <button
                onClick={() => onNavigate && onNavigate(stage.id)}
                className="pt-4 border-t border-slate-800/80 text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center justify-between"
              >
                <span>Explore {stage.suite}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
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
        </div>
      </section>

      {/* Final Universal CTA */}
      <section className="py-24 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Start Building Real AI Systems Today.
        </h2>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Join thousands of learners, developers, and data scientists mastering artificial intelligence from first principles.
        </p>
        <button
          onClick={() => onLaunchStudio ? onLaunchStudio() : (onNavigate && onNavigate('collection'))}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 via-emerald-500 to-teal-500 hover:from-brand-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-xl shadow-brand-500/25 transition-all inline-flex items-center gap-2"
        >
          <span>Get Started with TechMentor</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default TechMentorLandingPage;
