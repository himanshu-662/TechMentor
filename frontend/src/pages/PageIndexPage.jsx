import React, { useState, useMemo } from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Database,
  Layers,
  Bot,
  MessageSquareCode,
  Binary,
  Cpu,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  FileSpreadsheet,
  Sliders,
  Award,
  Zap,
  LayoutDashboard,
  GraduationCap,
  Scale,
  Lock,
  Cookie,
  HelpCircle,
  FileText
} from 'lucide-react';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const ALL_PAGES_DIRECTORY = [
  // 1. Core Ecosystem
  {
    id: 'landing',
    title: 'TechMentor Universal Ecosystem',
    category: 'Ecosystem',
    badge: 'Universal Landing',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'The primary entry point introducing the 6 specialized suites, first-principles pedagogy, and unified learning pathways.',
    icon: Compass,
    color: 'from-brand-500 to-emerald-500',
    accentText: 'text-brand-400'
  },
  {
    id: 'pages',
    title: 'Page Index & Platform Directory',
    category: 'Ecosystem',
    badge: 'Directory',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Centralized directory and sitemap indexing every route, landing page, pipeline step, and legal document.',
    icon: Compass,
    color: 'from-cyan-500 to-blue-500',
    accentText: 'text-cyan-400'
  },

  // 2. The 6 Tool Suites (Landing Pages)
  {
    id: 'menti',
    title: 'Menti.AI Suite Landing',
    category: 'Suites',
    badge: 'Suite 01 • Socratic AI',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Context-aware conversational tutor grounded in live dataset moments with zero-fabrication guarantees.',
    icon: Sparkles,
    color: 'from-purple-500 to-indigo-500',
    accentText: 'text-purple-400'
  },
  {
    id: 'datamentor',
    title: 'DataMentor Suite Landing',
    category: 'Suites',
    badge: 'Suite 02 • ML Studio',
    status: 'active',
    statusLabel: 'Production Ready',
    description: '13-stage end-to-end preprocessing, feature engineering, and model training studio with interactive What-If inference.',
    icon: Database,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'genaimentor',
    title: 'GenAIMentor Suite Landing',
    category: 'Suites',
    badge: 'Suite 03 • RAG Architecture',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Complete RAG architecture pipeline: document ingestion, dense embeddings, BM25 indexing, and hybrid reciprocal rank fusion.',
    icon: Layers,
    color: 'from-cyan-500 to-blue-500',
    accentText: 'text-cyan-400'
  },
  {
    id: 'agenticaimentor',
    title: 'AgenticAIMentor Suite Landing',
    category: 'Suites',
    badge: 'Suite 04 • Autonomous Agents',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Architect goal-directed autonomous agents: ReAct reasoning loops, dynamic tool calling, memory stores, and multi-agent swarms.',
    icon: Bot,
    color: 'from-amber-500 to-orange-500',
    accentText: 'text-amber-400'
  },
  {
    id: 'nlpmentor',
    title: 'NLPMentor Suite Landing',
    category: 'Suites',
    badge: 'Suite 05 • NLP Pipeline',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Deconstruct language processing mechanics: byte-pair encoding (BPE) subword tokenizers, syntactic trees, and self-attention heatmaps.',
    icon: MessageSquareCode,
    color: 'from-rose-500 to-pink-500',
    accentText: 'text-rose-400'
  },
  {
    id: 'dlmentor',
    title: 'DLMentor Suite Landing',
    category: 'Suites',
    badge: 'Suite 06 • Deep Learning',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Master computational graphs, dynamic automatic differentiation (autograd), loss surfaces, and convolutional backbones.',
    icon: Binary,
    color: 'from-sky-500 to-blue-600',
    accentText: 'text-sky-400'
  },

  // 3. Interactive Studios & Workspaces
  {
    id: 'chatbot',
    title: 'Menti.AI Socratic Chatbot Workspace',
    category: 'Studios',
    badge: 'Active Studio',
    status: 'active',
    statusLabel: 'Active Studio',
    description: 'Dedicated full-screen Socratic tutor workspace with live dataset moment inspection and step-by-step reasoning.',
    icon: Sparkles,
    color: 'from-purple-500 to-indigo-500',
    accentText: 'text-purple-400'
  },
  {
    id: 'collection',
    title: 'DataMentor 13-Stage ML Studio',
    category: 'Studios',
    badge: 'Active Studio',
    status: 'active',
    statusLabel: 'Active Studio',
    description: 'The flagship interactive ML workspace taking raw tabular data through cleaning, feature engineering, and model deployment.',
    icon: Database,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'knowledge-base',
    title: 'GenAIMentor Knowledge Base & RAG Studio',
    category: 'Studios',
    badge: 'Active Studio',
    status: 'active',
    statusLabel: 'Active Studio',
    description: 'Interactive document store, vector chunk inspector, and hybrid BM25 + dense embedding retrieval benchmark playground.',
    icon: Layers,
    color: 'from-cyan-500 to-blue-500',
    accentText: 'text-cyan-400'
  },
  {
    id: 'learning-hub',
    title: 'Learning Hub & Concept Registry',
    category: 'Studios',
    badge: 'Active Studio',
    status: 'active',
    statusLabel: 'Active Studio',
    description: 'Interactive encyclopedia of 37+ first-principles machine learning concepts with mathematical formulas and quizzes.',
    icon: GraduationCap,
    color: 'from-brand-500 to-teal-500',
    accentText: 'text-brand-400'
  },
  {
    id: 'agentic-studio-coming-soon',
    title: 'AgenticAIMentor Studio (In Development)',
    category: 'Studios',
    badge: 'Upcoming Studio',
    status: 'coming-soon',
    statusLabel: 'Coming Soon',
    description: 'Autonomous multi-agent orchestration workbench with interactive ReAct visualizer and execution trace visualizer.',
    icon: Bot,
    color: 'from-amber-500 to-orange-500',
    accentText: 'text-amber-400'
  },
  {
    id: 'nlp-studio-coming-soon',
    title: 'NLPMentor Studio (In Development)',
    category: 'Studios',
    badge: 'Upcoming Studio',
    status: 'coming-soon',
    statusLabel: 'Coming Soon',
    description: 'Interactive subword tokenization playground and multi-head self-attention weight heatmaps inspector.',
    icon: MessageSquareCode,
    color: 'from-rose-500 to-pink-500',
    accentText: 'text-rose-400'
  },
  {
    id: 'dl-studio-coming-soon',
    title: 'DLMentor Studio (In Development)',
    category: 'Studios',
    badge: 'Upcoming Studio',
    status: 'coming-soon',
    statusLabel: 'Coming Soon',
    description: 'Live computational graph builder, dynamic tensor autograd gradient flow simulator, and loss surface visualizer.',
    icon: Binary,
    color: 'from-sky-500 to-blue-600',
    accentText: 'text-sky-400'
  },

  // 4. DataMentor 13 Pipeline Stages
  {
    id: 'collection',
    title: 'Step 01: Data Ingestion',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 01',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Upload local CSV/Excel or connect remote datasets with cryptographic SHA-256 verification and preview.',
    icon: Database,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'loading',
    title: 'Step 02: Data Deserialization & Loading',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 02',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Type inference, memory footprint estimation, and tabular schema deserialization into in-memory pandas DataFrames.',
    icon: FileSpreadsheet,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'eda',
    title: 'Step 03: Exploratory Data Analysis (EDA)',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 03',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Summary statistical moments (mean, variance, skewness, kurtosis) and interactive Pearson correlation heatmaps.',
    icon: Sliders,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'cleaning',
    title: 'Step 04: Data Cleaning & Imputation',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 04',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Deterministic missing value imputation (mean, median, mode, constant) and duplicate record elimination.',
    icon: Zap,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'outliers',
    title: 'Step 05: Outlier Detection & Winsorization',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 05',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Tukey IQR fences and Z-Score outlier detection with interactive trimming or 1.5x IQR winsorization.',
    icon: Sliders,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'encoding',
    title: 'Step 06: Categorical Encoding',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 06',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'One-Hot Encoding with dummy trap prevention, Target Encoding with smoothing, and Ordinal/Label encoding.',
    icon: Binary,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'scaling',
    title: 'Step 07: Feature Scaling & Transforms',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 07',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Z-score Standardization, Min-Max Normalization, Robust Scaling, and Log1p / Box-Cox skewness corrections.',
    icon: Sliders,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'dimensionality',
    title: 'Step 08: Dimensionality Reduction (PCA)',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 08',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Covariance matrix eigendecomposition, singular value decomposition (SVD), and scree plot variance analysis.',
    icon: Layers,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'selection',
    title: 'Step 09: Feature Selection & Mutual Information',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 09',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Filter methods: Shannon Mutual Information entropy ranking, ANOVA F-statistic, and collinearity thresholding.',
    icon: Sliders,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'split',
    title: 'Step 10: Train-Test Splitting & Partitioning',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 10',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Random and stratified class-preserving data splits with seed reproducibility to prevent training data leakage.',
    icon: Sliders,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'fitting',
    title: 'Step 11: Machine Learning Model Fitting',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 11',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Fit 12+ estimators (Random Forest, Gradient Boosting, XGBoost, SVM, Logistic Regression) with real-time loss tracking.',
    icon: Cpu,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'prediction',
    title: 'Step 12: Interactive What-If Simulator',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 12',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Real-time inference engine with live sliders for feature perturbation and instant model outcome calculation.',
    icon: Award,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'evaluation',
    title: 'Step 13: Model Evaluation & ROC-AUC',
    category: 'ML Pipeline',
    badge: 'Pipeline Step 13',
    status: 'active',
    statusLabel: 'Active Step',
    description: 'Confusion matrices, precision-recall trade-offs, ROC-AUC receiver operating characteristics, and residual plots.',
    icon: Award,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },

  // 5. Governance, Legal & Architecture
  {
    id: 'about',
    title: 'About the Platform & Founder',
    category: 'Company & Legal',
    badge: 'Platform Philosophy',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'The story behind TechMentor, founder profile (Himanshu Molkapuri / DMS AI Edu Tech), and our first-principles mission.',
    icon: GraduationCap,
    color: 'from-indigo-500 to-purple-500',
    accentText: 'text-indigo-400'
  },
  {
    id: 'features',
    title: 'Platform Capabilities & Architecture',
    category: 'Company & Legal',
    badge: 'Technical Specs',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Exhaustive breakdown of the 13 preprocessing stages, mathematical formulas, and zero-fabrication guarantees.',
    icon: Layers,
    color: 'from-brand-500 to-cyan-500',
    accentText: 'text-brand-400'
  },
  {
    id: 'security',
    title: 'Security & SHA-256 Dataset Vault',
    category: 'Company & Legal',
    badge: 'Data Protection',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Dataset immutability guarantees, cryptographic SHA-256 verification, in-memory isolation, and sandboxing architecture.',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-500',
    accentText: 'text-emerald-400'
  },
  {
    id: 'privacy',
    title: 'Privacy Policy (GDPR / CCPA)',
    category: 'Company & Legal',
    badge: 'Compliance',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Zero third-party telemetry, strict in-memory execution boundaries, and GDPR / CCPA compliant data handling practices.',
    icon: Lock,
    color: 'from-slate-400 to-slate-200',
    accentText: 'text-slate-300'
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    category: 'Company & Legal',
    badge: 'Legal',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Educational use terms, open API usage guidelines, and intellectual property provisions.',
    icon: FileText,
    color: 'from-slate-400 to-slate-200',
    accentText: 'text-slate-300'
  },
  {
    id: 'cookies',
    title: 'Cookie Policy & Local Storage',
    category: 'Company & Legal',
    badge: 'Transparency',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Transparent disclosure of localStorage keys, offline session state, and zero tracking cookies.',
    icon: Cookie,
    color: 'from-slate-400 to-slate-200',
    accentText: 'text-slate-300'
  },
  {
    id: 'contact',
    title: 'Contact & Engineering Support',
    category: 'Company & Legal',
    badge: 'Support',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Direct communication channels with the engineering team, bug reporting, and community links.',
    icon: HelpCircle,
    color: 'from-brand-500 to-emerald-500',
    accentText: 'text-brand-400'
  },
  {
    id: 'changelog',
    title: 'Release Notes & Product Roadmap',
    category: 'Company & Legal',
    badge: 'Changelog',
    status: 'active',
    statusLabel: 'Production Ready',
    description: 'Chronological changelog of releases, features shipped, and future engineering milestones.',
    icon: Clock,
    color: 'from-cyan-500 to-blue-500',
    accentText: 'text-cyan-400'
  },
  {
    id: 'dashboard',
    title: 'Pipeline Overview & Status Dashboard',
    category: 'Ecosystem',
    badge: 'Monitoring',
    status: 'active',
    statusLabel: 'Active Studio',
    description: 'High-level metrics summary, active dataset telemetry, and ML pipeline progress visualization.',
    icon: LayoutDashboard,
    color: 'from-brand-500 to-teal-500',
    accentText: 'text-brand-400'
  }
];

export const PageIndexPage = ({ onNavigate, onLaunchStudio }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Ecosystem', 'Suites', 'Studios', 'ML Pipeline', 'Company & Legal'];

  const filteredPages = useMemo(() => {
    return ALL_PAGES_DIRECTORY.filter((page) => {
      const matchesCategory = selectedCategory === 'All' || page.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        page.title.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query) ||
        page.id.toLowerCase().includes(query) ||
        page.badge.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-brand-500 selection:text-slate-950">
      {/* Universal Ecosystem Header */}
      <TechMentorNav currentSuite="ecosystem" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero / Header */}
      <section className="relative pt-12 pb-12 sm:pt-16 sm:pb-16 border-b border-slate-900 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-cyan-500/15 via-brand-500/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>TechMentor Platform Directory & Sitemap</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ecosystem Page Index <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-brand-300 bg-clip-text text-transparent">
              All Suites, Studios & Pipeline Steps
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 font-normal leading-relaxed">
            Directly navigate to any suite landing page, live pipeline workspace, Socratic mentor session, or platform document with a single click.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-500 uppercase block">Total Pages</span>
              <span className="text-xl font-bold text-white">{ALL_PAGES_DIRECTORY.length} Pages</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-mono text-purple-400 uppercase block">Tool Suites</span>
              <span className="text-xl font-bold text-white">6 Suites</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-mono text-emerald-400 uppercase block">ML Pipeline</span>
              <span className="text-xl font-bold text-white">13 Stages</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] font-mono text-cyan-400 uppercase block">First Principles</span>
              <span className="text-xl font-bold text-white">100% Deterministic</span>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Search & Filters */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800/80">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-brand-500 to-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat} {cat === 'All' ? `(${ALL_PAGES_DIRECTORY.length})` : ''}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, route, or category..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page) => {
            const IconComponent = page.icon;
            return (
              <div
                key={page.id}
                onClick={() => onNavigate && onNavigate(page.id)}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850/80 transition-all cursor-pointer group flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {page.badge}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        page.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {page.statusLabel}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${page.color} p-0.5 flex-shrink-0 mt-0.5`}>
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {page.title}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        route: <span className="text-slate-400 font-semibold">{page.id}</span>
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {page.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                  <span>Open Page</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {filteredPages.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">No pages matched "{searchQuery}"</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different category tab.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Universal Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default PageIndexPage;
