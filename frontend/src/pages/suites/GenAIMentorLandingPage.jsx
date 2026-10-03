import React, { useState, useEffect } from 'react';
import {
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Database,
  Cpu,
  Search,
  FileText,
  Sliders,
  Compass,
  GraduationCap,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  BookOpen,
  Filter,
  BarChart2,
  Terminal,
  Bot
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import TechMentorNav from '../../components/navigation/TechMentorNav';
import TechMentorFooter from '../../components/navigation/TechMentorFooter';

export const GenAIMentorLandingPage = ({ onNavigate, onLaunchStudio }) => {
  // Navigation & Scroll State
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Interactive Sandbox State
  const [activeDemoTab, setActiveDemoTab] = useState('rrf');
  const [demoQuery, setDemoQuery] = useState('What is overfitting and how does regularization prevent it?');
  const [rrfKConstant, setRrfKConstant] = useState(60);
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkOverlap, setChunkOverlap] = useState(100);

  // Track Window Scroll for Back-To-Top Button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const RAG_STEPS = [
    {
      step: '01',
      name: 'Document Ingestion & Parsing',
      badge: 'Ingestion',
      summary: 'Extract raw text, tables, and section hierarchies from PDF, Markdown, TXT, HTML, and JSON files.',
      formula: 'D_{parsed} = \\text{ExtractHierarchy}(Doc)'
    },
    {
      step: '02',
      name: 'Semantic Chunking & Overlap',
      badge: 'Chunking',
      summary: 'Segment text into coherent semantic windows with sliding token overlaps to prevent sentence boundary context loss.',
      formula: 'C_i = [t_{i(S - O)}, \\, t_{i(S - O) + S}]'
    },
    {
      step: '03',
      name: 'Dense Vector Embeddings',
      badge: 'Embeddings',
      summary: 'Map text chunks to 384/768-dimensional dense vectors capturing conceptual and semantic intent.',
      formula: '\\vec{v}_i = \\text{Embed}(C_i) \\in \\mathbb{R}^{d}'
    },
    {
      step: '04',
      name: 'Vector Index & Cosine Lookups',
      badge: 'Vector DB',
      summary: 'Store embeddings in in-memory FAISS/Chroma indexes for sub-millisecond similarity lookups.',
      formula: '\\text{sim}(\\vec{q}, \\vec{v}) = \\frac{\\vec{q} \\cdot \\vec{v}}{\\|\\vec{q}\\| \\|\\vec{v}\\|}'
    },
    {
      step: '05',
      name: 'Sparse BM25 Keyword Search',
      badge: 'Lexical Index',
      summary: 'Inverted token index guaranteeing exact keyword matches for acronyms, function names, and technical terms.',
      formula: '\\text{IDF}(q_i) \\cdot \\frac{f(q_i, D)(k_1 + 1)}{f(q_i, D) + k_1(1 - b + b\\frac{|D|}{\\text{avg}})}'
    },
    {
      step: '06',
      name: 'Hybrid Reciprocal Rank Fusion',
      badge: 'RRF Ensemble',
      summary: 'Merges dense vector and sparse lexical candidate rankings into an optimal calibration-free ordering.',
      formula: 'RRF(d) = \\sum_{m \\in M} \\frac{1}{k + r_m(d)}, \\quad k=60'
    },
    {
      step: '07',
      name: 'Cross-Encoder Reranking',
      badge: 'Context Filter',
      summary: 'Re-scores top candidates with full joint cross-attention to discard distractors and meet strict token limits.',
      formula: 's = \\sigma(W \\cdot \\text{CrossAttention}([Q; \\, C_i]))'
    },
    {
      step: '08',
      name: 'Grounded Synthesis & Citation Audit',
      badge: 'Grounded LLM',
      summary: 'Generates responses backed by verified document citations with automated hallucination checks.',
      formula: 'R = \\text{LLM}(Prompt(Q, \\, Context)), \\quad \\text{Hallucination} = 0\\%'
    }
  ];

  const PILLARS = [
    {
      num: '01',
      name: 'Chunk Boundary Optimization',
      tagline: 'Preserving semantic completeness.',
      desc: 'Fixed-size character chunking splits sentences midway, severing noun-verb dependencies. Semantic chunking aligns boundaries with paragraphs and headers.'
    },
    {
      num: '02',
      name: 'Dense vs Sparse Complementarity',
      tagline: 'Why vectors alone miss critical terms.',
      desc: 'Vectors capture conceptual synonyms (car = automobile) but fail on exact technical serials, function names, and numbers. BM25 guarantees lexical precision.'
    },
    {
      num: '03',
      name: 'RRF Score Normalization',
      tagline: 'Parameter-free rank aggregation.',
      desc: 'Cosine similarity scores range [0, 1] while BM25 unbounded scores range [0, ∞). Reciprocal Rank Fusion uses rank positions r_m(d) rather than arbitrary scores.'
    },
    {
      num: '04',
      name: 'Cross-Attention Re-ranking',
      tagline: 'Joint query-document scoring.',
      desc: 'Bi-encoders embed query and document independently. Cross-encoders attend to all query tokens simultaneously across document tokens for maximal relevance.'
    },
    {
      num: '05',
      name: 'Context Window Budgeting',
      tagline: 'Preventing lost-in-the-middle degradation.',
      desc: 'LLMs suffer performance drops when key context is buried in the middle of a 100k window. Reranking places the most critical evidence at the top and bottom edges.'
    },
    {
      num: '06',
      name: 'Strict Citation Grounding',
      tagline: 'Verifiable document provenance.',
      desc: 'Every factual claim in GenAIMentor outputs references its source chunk ID, document title, and character offsets for immediate human verification.'
    }
  ];

  const FAQS = [
    {
      q: 'What is GenAIMentor and how does it fit into TechMentor?',
      a: 'GenAIMentor is TechMentor’s dedicated Generative AI and RAG architecture studio. While DataMentor specializes in tabular data preprocessing and classical ML, GenAIMentor guides you through building, inspecting, and evaluating grounded retrieval pipelines from document parsing to hybrid search and grounded synthesis.'
    },
    {
      q: 'Why does GenAIMentor use Hybrid Search (Vector + BM25) instead of vector search alone?',
      a: 'Vector embeddings excel at semantic similarity (e.g. matching "heart attack" with "myocardial infarction"), but often fail on exact keyword lookups, variable names, or acronyms. By combining dense vector similarity with sparse Okapi BM25 via Reciprocal Rank Fusion (RRF), you get the best of both worlds.'
    },
    {
      q: 'What is Reciprocal Rank Fusion (RRF) and why is k=60 standard?',
      a: 'RRF is an ensemble technique that combines ranked lists from multiple search algorithms without needing to calibrate raw score distributions. The formula 1 / (60 + rank) downweights lower-ranked results while ensuring that items appearing near the top of both lists receive a massive boost.'
    },
    {
      q: 'Can I test my own documents in the GenAIMentor studio?',
      a: 'Yes! GenAIMentor supports dragging and dropping PDFs, Markdown files, and text documents into your local in-memory knowledge base for immediate indexing, chunk visual inspection, and hybrid retrieval testing.'
    },
    {
      q: 'Does GenAIMentor send my documents to external cloud APIs?',
      a: 'By default, document parsing, chunking, BM25 indexing, and local embedding models run entirely client-side or on your local backend, preserving complete data sovereignty.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white font-sans antialiased overflow-x-hidden relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-cyan-500/15 via-blue-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[65%] -right-60 w-[600px] h-[600px] bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="genaimentor" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Announcement Pill */}
        <div 
          onClick={() => scrollToSection('features')}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/25 text-xs text-slate-300 shadow-sm mb-6 backdrop-blur hover:border-cyan-500/50 transition-colors cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">Suite 03: GenAI & RAG Pipeline</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-400 font-medium">Hybrid BM25 + Vector Retrieval</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Don’t just prompt models.{' '}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Master the retrieval pipeline behind them.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          <strong className="text-slate-200 font-semibold">GenAIMentor</strong> gives you end-to-end visibility into modern Retrieval-Augmented Generation. From semantic chunking and reciprocal rank fusion to cross-encoder reranking and citation grounding.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => onNavigate ? onNavigate('knowledge-base') : onLaunchStudio()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Launch Knowledge Base Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => scrollToSection('interactive-demo')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 backdrop-blur"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
            <span>Live Interactive RAG Sandbox</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('landing')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800 text-slate-300 font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>TechMentor Ecosystem</span>
          </button>
        </div>

        {/* Trust Strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Hybrid BM25 + Vector Search
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> Reciprocal Rank Fusion (RRF)
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Cross-Encoder Reranker
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-400" /> 100% Verifiable Citations
          </span>
        </div>
      </section>

      {/* SECTION: Features */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-3">Architectural Pillars</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Grounded RAG Excellence
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Say goodbye to naive vector-only search. Build robust, hybrid enterprise retrieval architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Hierarchical Document Parsing</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Parse PDFs, Markdown, TXT, and JSON files while maintaining chapter titles, tables, and parent-child structural metadata.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Semantic Chunk Optimization</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Configure chunk sizes and token overlaps with real-time visual inspection of sentence boundary splits and context preservation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Sparse BM25 + Dense Vectors</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Pair dense semantic sentence embeddings with exact inverted index BM25 scores to guarantee hits on critical technical keywords.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-4">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Reciprocal Rank Fusion (RRF)</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Ensemble dense and sparse candidates seamlessly without fragile manual score weighting using the robust formula 1 / (60 + rank).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Cross-Encoder Re-ranking</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Apply joint self-attention across top retrieved chunks to prune irrelevant distractors before constructing prompt contexts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Grounded Citation Audits</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every sentence in generated answers links back to source passage IDs, eliminating hallucinations and ensuring auditability.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Interactive Sandbox */}
      <section id="interactive-demo" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Interactive Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Test Hybrid Retrieval & RRF in Action
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Adjust queries and the RRF constant (k) to watch dense and sparse candidate lists merge into an optimal combined ranking.
            </p>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-cyan-400 hidden sm:inline">GenAI_RAG_SimEngine v2.4</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveDemoTab('rrf')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'rrf'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Hybrid RRF</span>
                  </button>
                  <button
                    onClick={() => setActiveDemoTab('chunking')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'chunking'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Chunk Visualizer</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setRrfKConstant(60);
                    setChunkSize(500);
                    setChunkOverlap(100);
                  }}
                  title="Reset Simulator"
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {activeDemoTab === 'rrf' && (
                <div className="space-y-6">
                  {/* Query Input */}
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1.5">Test Retrieval Query:</label>
                    <input
                      type="text"
                      value={demoQuery}
                      onChange={(e) => setDemoQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:border-cyan-500 outline-none"
                    />
                  </div>

                  {/* K Constant Slider */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">RRF Constant (k):</span>
                      <span className="font-mono text-cyan-400 font-bold">k = {rrfKConstant}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={rrfKConstant}
                      onChange={(e) => setRrfKConstant(parseInt(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>Aggressive (10)</span>
                      <span className="text-cyan-400 font-bold">Industry Standard (60)</span>
                      <span>Dampened (120)</span>
                    </div>
                  </div>

                  {/* Fusion Table */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-xs font-bold text-blue-400 block mb-2">1. Dense Vector Top 3</span>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 rounded bg-slate-950 border border-slate-850">
                          <span className="text-slate-200 block font-medium">Chunk #14: Regularization L2</span>
                          <span className="text-[10px] text-slate-500 font-mono">Sim: 0.892 (Rank 1)</span>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-850">
                          <span className="text-slate-200 block font-medium">Chunk #03: Bias-Variance</span>
                          <span className="text-[10px] text-slate-500 font-mono">Sim: 0.841 (Rank 2)</span>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-850">
                          <span className="text-slate-200 block font-medium">Chunk #29: Dropout Layers</span>
                          <span className="text-[10px] text-slate-500 font-mono">Sim: 0.798 (Rank 3)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-xs font-bold text-cyan-400 block mb-2">2. Sparse BM25 Top 3</span>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 rounded bg-slate-950 border border-slate-850">
                          <span className="text-slate-200 block font-medium">Chunk #14: Regularization L2</span>
                          <span className="text-[10px] text-slate-500 font-mono">BM25: 18.42 (Rank 1)</span>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-850">
                          <span className="text-slate-200 block font-medium">Chunk #51: Overfitting Def.</span>
                          <span className="text-[10px] text-slate-500 font-mono">BM25: 14.10 (Rank 2)</span>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-850">
                          <span className="text-slate-200 block font-medium">Chunk #03: Bias-Variance</span>
                          <span className="text-[10px] text-slate-500 font-mono">BM25: 11.85 (Rank 3)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/40">
                      <span className="text-xs font-bold text-cyan-300 block mb-2">3. Fused RRF Ranking</span>
                      <div className="space-y-2 text-xs">
                        <div className="p-2 rounded bg-slate-950 border border-cyan-500/30">
                          <span className="text-cyan-300 block font-bold">👑 Chunk #14 (Rank 1 Both)</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            RRF Score: {(1 / (rrfKConstant + 1) + 1 / (rrfKConstant + 1)).toFixed(5)}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800">
                          <span className="text-slate-200 block font-medium">Chunk #03 (Rank 2 + 3)</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            RRF Score: {(1 / (rrfKConstant + 2) + 1 / (rrfKConstant + 3)).toFixed(5)}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800">
                          <span className="text-slate-200 block font-medium">Chunk #51 (BM25 Match)</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            RRF Score: {(1 / (rrfKConstant + 2)).toFixed(5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === 'chunking' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">Chunk Size (Tokens):</span>
                        <span className="font-mono text-cyan-400 font-bold">{chunkSize} tokens</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="1000"
                        step="50"
                        value={chunkSize}
                        onChange={(e) => setChunkSize(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                      />
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300">Token Overlap:</span>
                        <span className="font-mono text-cyan-400 font-bold">{chunkOverlap} tokens</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        step="10"
                        value={chunkOverlap}
                        onChange={(e) => setChunkOverlap(parseInt(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Effective Step Size: {chunkSize - chunkOverlap} tokens</span>
                      <span className="text-cyan-400 font-semibold font-mono">Overlap Ratio: {((chunkOverlap / chunkSize) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                      <div style={{ width: '45%' }} className="bg-cyan-500/60 h-full text-[9px] text-center text-slate-950 font-bold">Chunk A</div>
                      <div style={{ width: '10%' }} className="bg-amber-400/80 h-full text-[9px] text-center text-slate-950 font-bold">Overlap</div>
                      <div style={{ width: '45%' }} className="bg-blue-500/60 h-full text-[9px] text-center text-slate-950 font-bold">Chunk B</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: 7 Explainability Pillars */}
      <section id="pillars" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-3">Our Core Doctrine</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            "Automate the Retrieval, But Explain the Grounding."
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Every step of GenAIMentor’s RAG pipeline is anchored in the 7 Pillars of explainable information retrieval.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.num}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-cyan-400/40 group-hover:text-cyan-400 transition-colors">
                    {pillar.num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-cyan-300 font-mono">
                    Pillar {pillar.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {pillar.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-[11px] text-slate-300 font-mono">
                <span className="text-cyan-400 block text-[10px] uppercase font-bold mb-0.5">Audited & Verified:</span>
                100% Deterministic Cosine + BM25 math
              </div>
            </div>
          ))}

          {/* 7th Wide Card */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xl font-bold text-cyan-400">07. Production Standards & Evaluation</span>
                <Badge variant="cyan">RAG Triad Metrics</Badge>
              </div>
              <h3 className="text-xl font-bold text-white">Context Precision, Recall & Faithfulness</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Evaluate RAG quality using industry-standard Ragas benchmarks: Context Relevance, Groundedness (zero-hallucination metric), and Answer Semantic Similarity.
              </p>
            </div>
            <button
              onClick={() => onNavigate ? onNavigate('knowledge-base') : onLaunchStudio()}
              className="shrink-0 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/20"
            >
              Open Knowledge Base Studio →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: Pipeline Roadmap */}
      <section id="pipeline" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="cyan" className="mb-3">Complete Pipeline</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              The 8-Stage RAG Architecture Pipeline
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Explore the deterministic path from document ingestion to grounded response synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {RAG_STEPS.map((stage) => (
              <div
                key={stage.step}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-cyan-400">Step {stage.step}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-cyan-300 font-mono border border-slate-800">
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {stage.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {stage.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-855 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
                    {stage.formula}
                  </span>
                  <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Verified <CheckCircle2 className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: AI Socratic Tutor Console Integration */}
      <section id="ai-mentor" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="cyan">Socratic RAG Mentorship</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              An AI Tutor That Diagnoses Your Retrieval Pipeline
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Wondering why a specific document wasn't retrieved? <strong className="text-cyan-300 font-semibold">Menti.AI</strong> explains the cosine similarity threshold, BM25 term frequencies, and reciprocal rank fusion scores step-by-step.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Chunk Visualizer Audits</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Identify sentence truncations, poor split points, and token overflows.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Hybrid Retrieval Tuning</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Receive mathematical guidance on adjusting k constants and cross-encoder cutoffs.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate ? onNavigate('knowledge-base') : onLaunchStudio()}
                className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xl shadow-cyan-500/25 inline-flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Launch Knowledge Base Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-cyan-500/30 shadow-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">GenAIMentor Retrieval Console</h4>
                  <p className="text-[11px] text-slate-400">Context: Knowledge Base (14 documents, 280 chunks)</p>
                </div>
              </div>
              <Badge variant="cyan">Active Grounding</Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Why did BM25 retrieve Chunk #51 over dense vector search?
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/15 text-cyan-300 font-mono">
                  RRF Audit
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Chunk #51 contained the exact acronym 'ROC-AUC' which appeared with high Inverse Document Frequency (IDF = 3.82) across your corpus. Dense embedding cosine was only 0.74 due to conversational wording, but BM25 scored 18.42, causing RRF to elevate it into the top-3 context window!"
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre">
                RRF_score = 1/(60 + 1) + 1/(60 + 4) = 0.01639 + 0.01562 = 0.03201
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: First-Principles Comparison */}
      <section id="comparison" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="cyan" className="mb-3">Feature Comparison</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Engineers Choose GenAIMentor
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Compare how GenAIMentor redefines grounded retrieval compared to black-box vector databases and naive toy scripts.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-300">Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-cyan-400 bg-cyan-500/10 border-x border-cyan-500/20">
                    GenAIMentor ⚡
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Black-Box Vector DBs</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Naive Python Scripts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Hybrid BM25 + Dense Vectors</td>
                  <td className="p-4 sm:p-5 font-bold text-cyan-400 bg-cyan-500/10 border-x border-cyan-500/20">
                    ✅ Native Dual-Channel Search
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Vector only (Dense blindness)</td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Complex manual setup</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Reciprocal Rank Fusion (RRF)</td>
                  <td className="p-4 sm:p-5 font-bold text-cyan-400 bg-cyan-500/10 border-x border-cyan-500/20">
                    ✅ Built-in Parameter-Free
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Not available</td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Requires custom math</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Visual Chunk Boundary Inspector</td>
                  <td className="p-4 sm:p-5 font-bold text-cyan-400 bg-cyan-500/10 border-x border-cyan-500/20">
                    ✅ Real-Time Overlap Tuning
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ CLI strings only</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Blind slicing</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Cross-Encoder Re-ranking</td>
                  <td className="p-4 sm:p-5 font-bold text-cyan-400 bg-cyan-500/10 border-x border-cyan-500/20">
                    ✅ Joint Self-Attention Scoring
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Expensive external plugin</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Omitted</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Verifiable Citation Grounding</td>
                  <td className="p-4 sm:p-5 font-bold text-cyan-400 bg-cyan-500/10 border-x border-cyan-500/20">
                    ✅ Exact Document Offsets
                  </td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Varies</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ High Hallucination Risk</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ Accordion */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="cyan" className="mb-3">Got Questions?</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Everything you need to know about GenAIMentor and RAG architecture.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all duration-200 hover:border-slate-700"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-white text-base sm:text-lg"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-855 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: Grand Footer CTA */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Master Grounded RAG & GenAI Pipelines?
            </h2>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              Launch GenAIMentor right now. Build hybrid indexes, inspect semantic chunks, and generate zero-hallucination answers.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate ? onNavigate('knowledge-base') : onLaunchStudio()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-xl shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span>Launch Knowledge Base Studio</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('landing')}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5 text-cyan-400" />
                <span>Explore TechMentor Ecosystem</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-24 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-cyan-500 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-slate-950 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          title="Scroll Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default GenAIMentorLandingPage;
