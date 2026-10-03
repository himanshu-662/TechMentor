import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Brain,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Database,
  Layers,
  MessageSquareCode,
  Terminal,
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
  Sliders,
  PlayCircle,
  Award,
  Flame,
  LineChart,
  Bot
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import TechMentorNav from '../../components/navigation/TechMentorNav';
import TechMentorFooter from '../../components/navigation/TechMentorFooter';

export const MentiAILandingPage = ({ onNavigate, onLaunchStudio }) => {
  // Navigation & Scroll State
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Interactive Sandbox State
  const [activeDemoTab, setActiveDemoTab] = useState('dialogue');
  const [selectedPillar, setSelectedPillar] = useState('intuition');
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [hintLevel, setHintLevel] = useState(1);
  const [sandboxSampleSkew, setSandboxSampleSkew] = useState(2.8);

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

  const PILLARS = [
    {
      num: '01',
      id: 'intuition',
      name: 'Core Intuition',
      tagline: 'High-level mental model without daunting jargon.',
      preview: 'Imputation replaces missing values so models don’t crash, but choosing the wrong method (like mean on skewed data) distorts your dataset’s true distribution.'
    },
    {
      num: '02',
      id: 'analogy',
      name: 'Real-World Analogy',
      tagline: 'Everyday scenarios that make abstract math click.',
      preview: 'Imagine calculating the average salary in a cafe. If Elon Musk walks in, the mean skyrockets to $50M, but the median person inside is still earning $60k. Median represents the typical customer.'
    },
    {
      num: '03',
      id: 'math',
      name: 'Mathematical Derivation',
      tagline: 'Rigorous first-principles equations with term derivations.',
      preview: 'x̃ = x_((n+1)/2) for odd n, and (x_(n/2) + x_(n/2 + 1))/2 for even n. Minimizes L1 loss |x - c|.'
    },
    {
      num: '04',
      id: 'code',
      name: 'Deterministic Python Code',
      tagline: 'Production-ready Python, NumPy & Scikit-Learn code.',
      preview: 'from sklearn.impute import SimpleImputer\nimputer = SimpleImputer(strategy="median")\nX_clean = imputer.fit_transform(X_raw)'
    },
    {
      num: '05',
      id: 'visuals',
      name: 'Visual Distribution Shift',
      tagline: 'Before-and-after histograms and delta curves.',
      preview: 'Before: Bimodal skewness (skew = +2.8, 14.2% nulls)\nAfter: Preserved interquartile range with zero variance explosion.'
    },
    {
      num: '06',
      id: 'pitfalls',
      name: 'Common Pitfalls & Leakage',
      tagline: 'Dangerous edge cases, leakage risks & beginner errors.',
      preview: 'Data Leakage Warning: Imputing missing values on the whole dataset before train-test split leaks test set central tendencies into your training feature space.'
    },
    {
      num: '07',
      id: 'edgecases',
      name: 'Industry Standards & Trade-Offs',
      tagline: 'Production heuristics used by senior ML practitioners.',
      preview: 'When to drop vs impute: If null fraction exceeds 40% and missingness is not MNAR (Missing Not At Random), dropping or indicator flagging prevents synthetic noise injection.'
    }
  ];

  const SAMPLE_CONVERSATIONS = [
    {
      user: 'Why did DataMentor impute the "Fare" column with median instead of mean?',
      socraticReply: 'Great observation! Let’s look at the actual distribution of your "Fare" column. The mean is $32.20, but the median is $14.45, with a positive skewness of +4.78. What do you think happens to the mean when a few first-class passengers paid $512 while most paid under $20?',
      datasetMoment: {
        feature: 'Fare',
        rows: 891,
        nulls: 0,
        mean: '$32.20',
        median: '$14.45',
        skew: '+4.78 (Severe Right Skew)'
      },
      hintLadder: [
        'Hint 1: Look at the difference between mean and median.',
        'Hint 2: The mean is sensitive to extreme values ($512 tickets).',
        'Hint 3: Median represents the 50th percentile (L1 risk minimizer) and resists extreme outliers.'
      ]
    },
    {
      user: 'Did my train-test split leak information into the training set?',
      socraticReply: 'Let’s check your pipeline timeline: StandardScaler was fitted on X_train (623 rows) and then applied to X_test (268 rows). Because the mean and standard deviation were computed solely on the training partition, no target or test variance leaked across the boundary!',
      datasetMoment: {
        feature: 'Pipeline Validation',
        trainRows: 623,
        testRows: 268,
        stratification: 'Preserved (Surv = 38.4%)',
        leakageStatus: 'Zero Leakage Verified'
      },
      hintLadder: [
        'Hint 1: Check which partition computed the scaling parameters (μ, σ).',
        'Hint 2: If test samples contributed to μ or σ, your test evaluation will be overly optimistic.',
        'Hint 3: DataMentor fits transformers strictly on X_train and only transforms X_test.'
      ]
    },
    {
      user: 'What is the intuition behind PCA dimensionality reduction?',
      socraticReply: 'Think of PCA as shining a flashlight on a 3-dimensional object from the angle that casts the largest, most informative shadow on a 2D wall. It finds the orthogonal directions of maximum variance and discards directions with negligible information.',
      datasetMoment: {
        feature: 'PCA Scree Analysis',
        originalDims: 14,
        reducedDims: 4,
        cumulativeVariance: '87.4%',
        reconstructionLoss: '12.6%'
      },
      hintLadder: [
        'Hint 1: High correlation between features means redundant geometric dimensions.',
        'Hint 2: Eigenvectors define the new orthogonal coordinate axes.',
        'Hint 3: Eigenvalues represent the variance captured along each principal component.'
      ]
    }
  ];

  const SOCRATIC_PIPELINE = [
    {
      step: '01',
      name: 'Dataset Moment Audit',
      badge: 'Context Ingestion',
      formula: 'M = \\{ \\mu, \\, \\tilde{x}, \\, \\sigma^2, \\, \\gamma_1, \\, IQR \\}',
      summary: 'Reads in-memory summary statistics and distribution moments directly from the active Pandas DataFrame.'
    },
    {
      step: '02',
      name: 'Socratic Inquiry Engine',
      badge: 'Guided Dialogue',
      formula: 'Q_{\\text{socratic}} = f(\\text{User Query}, \\, M_{\\text{dataset}})',
      summary: 'Formulates questions that guide the learner toward discovering the underlying principle rather than spoon-feeding raw code.'
    },
    {
      step: '03',
      name: '7-Pillar Rationale Retrieval',
      badge: 'Pedagogy',
      formula: '\\text{Pillar}(c) \\in \\{ \\text{Intuition, Analogy, Math, Code, Visual, Pitfall, Bounds} \\}',
      summary: 'Retrieves multi-tier pedagogical explanations calibrated to beginner, intermediate, and advanced mathematical levels.'
    },
    {
      step: '04',
      name: 'Deterministic Verification Gate',
      badge: 'Zero Hallucination',
      formula: '\\text{Check}(\\text{Claim}) == \\text{Compute}(DataFrame)',
      summary: 'Cross-checks every numerical claim, mean, or percentage against deterministic Python computations before outputting.'
    },
    {
      step: '05',
      name: 'Synthesized Code & Heuristics',
      badge: 'Executable Knowledge',
      formula: 'Code_{\\text{safe}} = \\text{Template}(X_{\\text{train}}, \\, y_{\\text{train}})',
      summary: 'Delivers leak-free, clean Scikit-Learn code snippets with inline commentary explaining key parameter choices.'
    },
    {
      step: '06',
      name: 'Active Mastery Check',
      badge: 'Retention',
      formula: '\\text{Quiz}(c) \\rightarrow \\text{Feedback}(\\text{Response})',
      summary: 'Reinforces learning with targeted conceptual checkpoint questions from the integrated TechMentor Learning Hub.'
    }
  ];

  const FAQS = [
    {
      q: 'How is Menti.AI different from general AI assistants like ChatGPT or Claude?',
      a: 'Generic chatbots have no access to your active dataset and frequently hallucinate numbers or suggest code that causes silent data leakage. Menti.AI is wired directly into TechMentor’s in-memory DataFrame moments, verifying every single statistical statement and using Socratic questioning to build deep intuition.'
    },
    {
      q: 'Does Menti.AI share my raw data with third-party model providers?',
      a: 'No. Menti.AI only passes calculated statistical moments (e.g. mean, variance, null counts, skewness metrics) and mathematical concepts. Your proprietary rows and raw tabular entries remain securely sandboxed in your local environment.'
    },
    {
      q: 'Can I ask Menti.AI about machine learning theory as well as practical code?',
      a: 'Absolutely. Menti.AI provides 3-tier learning depth for every concept: from high-level intuitive analogies to rigorous mathematical derivations with LaTeX formulas and clean, copy-pasteable Python/Scikit-Learn implementations.'
    },
    {
      q: 'What are the 7 Explainability Pillars?',
      a: 'The 7 Explainability Pillars are our core pedagogical doctrine: 1. Core Intuition, 2. Real-World Analogy, 3. Mathematical Formula, 4. Code Implementation, 5. Visual Distribution Shift, 6. Common Pitfalls & Leakage, and 7. Production Standards & Trade-Offs.'
    },
    {
      q: 'How does Menti.AI help with data leakage prevention?',
      a: 'Menti.AI inspects the entire pipeline lifecycle. If a transformation like scaling or imputation was computed across the full dataset prior to train-test splitting, Menti.AI proactively alerts you and provides the exact code to fix the leakage.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white font-sans antialiased overflow-x-hidden relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-purple-500/15 via-indigo-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] bg-purple-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[65%] -right-60 w-[600px] h-[600px] bg-violet-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="menti" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Glowing Announcement Pill */}
        <div 
          onClick={() => scrollToSection('features')}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/25 text-xs text-slate-300 shadow-sm mb-6 backdrop-blur hover:border-purple-500/50 transition-colors cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="font-semibold text-white">Suite 01: Socratic AI Tutor</span>
          <span className="text-slate-600">•</span>
          <span className="text-purple-400 font-medium">Real-Time Dataframe Awareness</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Don’t guess the answers.{' '}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
            Let your dataset guide the dialogue.
          </span>
        </h1>

        {/* Crisp Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          <strong className="text-slate-200 font-semibold">Menti.AI</strong> is the world’s first Socratic AI mentor connected directly into your in-memory machine learning pipeline. Learn by questioning with 0% hallucinations, verified dataset moments, and the 7 Explainability Pillars.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={() => onNavigate ? onNavigate('menti-ai') : onLaunchStudio()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Launch Menti.AI Workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => scrollToSection('interactive-demo')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 backdrop-blur"
          >
            <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20" />
            <span>Live Socratic Sandbox</span>
          </button>

          <button
            onClick={() => onNavigate && onNavigate('landing')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800 text-slate-300 font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>TechMentor Ecosystem</span>
          </button>
        </div>

        {/* Minimalist Trust Strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-400" /> 0% Hallucinations
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Grounded in DataFrame Moments
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> 7 Explainability Pillars
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-violet-400" /> Socratic Active Learning
          </span>
        </div>
      </section>

      {/* SECTION: Features & Core Architecture */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="purple" className="mb-3">Architectural Pillars</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built for Transparent AI Mentorship
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Every query sent to Menti.AI undergoes rigorous deterministic grounding before a response is returned.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Live In-Memory Telemetry</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Menti.AI queries your dataset’s active mean, median, skewness, null counts, and correlations in memory so you always receive mathematically accurate guidance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero-Fabrication Guardrail</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Strict deterministic safety filters ensure statistical metrics cannot be invented by the language model. If a metric cannot be verified, it is recalculated or omitted.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Socratic Progressive Questioning</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Instead of giving you blind answers, Menti.AI breaks complex decisions into intuitive thought steps—guiding you to build genuine data science mastery.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">The 7 Explainability Pillars</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Inspect any concept across 7 standardized layers: Intuition, Analogy, Mathematical Derivation, Python Code, Visual Delta, Common Pitfalls, and Production Trade-Offs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Proactive Leakage Detection</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Menti.AI monitors transformation order and warns you immediately if a scaler, imputer, or encoder is fit on the full dataset before train-test split.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Clean Scikit-Learn Snippets</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Receive verified, leak-free Python snippets using Scikit-Learn Pipeline and ColumnTransformer, complete with explanatory comments for every parameter.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Interactive Feature Simulator */}
      <section id="interactive-demo" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Interactive Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Experience Socratic Dialogue in Real Time
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Interact directly with Menti.AI’s Socratic dialogue engine, inspect underlying dataset moments, and step through progressive hint ladders.
            </p>
          </div>

          {/* Simulator Container */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            {/* Top Bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-purple-400 hidden sm:inline">Menti.AI_Socratic_Engine v2.4</span>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveDemoTab('dialogue')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'dialogue'
                        ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquareCode className="w-3.5 h-3.5" />
                    <span>Socratic Dialogue</span>
                  </button>
                  <button
                    onClick={() => setActiveDemoTab('moments')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'moments'
                        ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>In-Memory Moments</span>
                  </button>
                  <button
                    onClick={() => setActiveDemoTab('hints')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'hints'
                        ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Hint Ladder</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActiveQueryIndex(0);
                    setHintLevel(1);
                    setSandboxSampleSkew(2.8);
                  }}
                  title="Reset Simulator"
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-purple-400 transition-all text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* Sandbox Body */}
            <div className="p-6 md:p-8">
              {activeDemoTab === 'dialogue' && (
                <div className="space-y-6">
                  {/* Query Selectors */}
                  <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                    <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-400" /> Select Scenario:
                    </span>
                    {SAMPLE_CONVERSATIONS.map((sc, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveQueryIndex(idx);
                          setHintLevel(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          activeQueryIndex === idx
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Q{idx + 1}: {sc.user.slice(0, 32)}...
                      </button>
                    ))}
                  </div>

                  {/* Dialogue Flow */}
                  <div className="space-y-4">
                    {/* User Question */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                        You
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-200">
                        {SAMPLE_CONVERSATIONS[activeQueryIndex].user}
                      </div>
                    </div>

                    {/* Dataset Evidence Card */}
                    <div className="ml-11 p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <span className="text-purple-300 flex items-center gap-1.5 font-sans font-semibold">
                        <Database className="w-3.5 h-3.5 text-purple-400" />
                        Live DataFrame Context Attached:
                      </span>
                      <div className="flex flex-wrap gap-3 text-[11px] text-slate-300">
                        {Object.entries(SAMPLE_CONVERSATIONS[activeQueryIndex].datasetMoment).map(([k, v]) => (
                          <span key={k} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            <span className="text-slate-500 capitalize">{k}:</span> <strong className="text-purple-300">{String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Socratic Response */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-purple-500/40 rounded-2xl rounded-tl-sm p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">
                            Menti.AI Socratic Guidance
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Zero Fabrication
                          </span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {SAMPLE_CONVERSATIONS[activeQueryIndex].socraticReply}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === 'moments' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <Database className="w-4 h-4" /> Real-Time Statistical Moments
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Mean (μ):</span>
                          <span className="font-mono text-purple-300 font-bold">$32.20</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Median (x̃):</span>
                          <span className="font-mono text-emerald-300 font-bold">$14.45</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Std Deviation (σ):</span>
                          <span className="font-mono text-slate-200 font-bold">$49.69</span>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-950 border border-slate-800">
                          <span className="text-slate-400">Sample Skewness (γ₁):</span>
                          <span className="font-mono text-rose-400 font-bold">+{sandboxSampleSkew.toFixed(2)} (High)</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="text-xs text-slate-300 block mb-1">Adjust Distribution Skewness:</label>
                        <input
                          type="range"
                          min="0.1"
                          max="5.0"
                          step="0.1"
                          value={sandboxSampleSkew}
                          onChange={(e) => setSandboxSampleSkew(parseFloat(e.target.value))}
                          className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                        />
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-900/60 border border-purple-500/30 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-2">
                          Menti.AI Mathematical Deduction
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {sandboxSampleSkew > 2.0
                            ? 'The sample skewness exceeds +2.0. The arithmetic mean will be heavily biased by right-tail outliers. Menti.AI recommends Median imputation or Yeo-Johnson/Log1p power transformation.'
                            : 'Skewness is within normal Gaussian bounds (≤ 1.0). Standard Mean imputation or StandardScaler is mathematically sound without distorting central tendency.'}
                        </p>
                      </div>
                      <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-purple-300">
                        Pillar 03 Math Proof: argmin_c Σ |x_i - c| = x̃_median
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === 'hints' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                        Progressive Socratic Hint Ladder
                      </h4>
                      <span className="text-xs text-slate-400">
                        Level {hintLevel} of 3
                      </span>
                    </div>

                    <div className="space-y-3">
                      {SAMPLE_CONVERSATIONS[activeQueryIndex].hintLadder.map((hint, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                            idx + 1 <= hintLevel
                              ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                              : 'bg-slate-950 border-slate-850 text-slate-600'
                          }`}
                        >
                          <span className="font-bold mr-2">Level {idx + 1}:</span>
                          {idx + 1 <= hintLevel ? hint : 'Click "Reveal Next Hint" to unlock.'}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button
                        onClick={() => setHintLevel(Math.min(3, hintLevel + 1))}
                        disabled={hintLevel >= 3}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs transition-all"
                      >
                        Reveal Next Hint
                      </button>
                      <button
                        onClick={() => setHintLevel(1)}
                        className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs transition-all"
                      >
                        Reset Ladder
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: The 7 Explainability Pillars */}
      <section id="pillars" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="purple" className="mb-3">Our Core Doctrine</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            "Automate the Work, But Explain the Learning."
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Every answer provided by Menti.AI is grounded in our 7-layer pedagogical doctrine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.slice(0, 6).map((pillar) => (
            <div
              key={pillar.id}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-purple-400/40 group-hover:text-purple-400 transition-colors">
                    {pillar.num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-purple-300 font-mono">
                    Pillar {pillar.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  {pillar.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {pillar.preview}
                </p>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-[11px] text-slate-300 font-mono">
                <span className="text-purple-400 block text-[10px] uppercase font-bold mb-0.5">Audited & Verified:</span>
                100% Grounded in DataFrame moments
              </div>
            </div>
          ))}

          {/* 7th Wide Pillar */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xl font-bold text-purple-400">07. Production Heuristics & Bounds</span>
                <Badge variant="purple">Industry Standards</Badge>
              </div>
              <h3 className="text-xl font-bold text-white">Interview-Ready & Production-Grounded Rationale</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Menti.AI trains you with the mental models used by senior AI architects—so you understand not just how an algorithm works, but when its trade-offs make sense in production systems.
              </p>
            </div>
            <button
              onClick={() => onNavigate ? onNavigate('menti-ai') : onLaunchStudio()}
              className="shrink-0 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-purple-600/20"
            >
              Start Chatting in Workspace →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: Socratic Learning Pipeline */}
      <section id="pipeline" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="purple" className="mb-3">Dialogue Architecture</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              The 6-Stage Socratic Reasoning Loop
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Explore how Menti.AI structures every conversation from telemetry to conceptual retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SOCRATIC_PIPELINE.map((stage) => (
              <div
                key={stage.step}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-purple-400">Step {stage.step}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-purple-300 font-mono border border-slate-800">
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {stage.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {stage.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-855 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                    {stage.formula}
                  </span>
                  <span className="text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
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
            <Badge variant="purple">Zero-Fabrication Guarantee</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              An AI Tutor That Truly Understands Your Dataset
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Unlike generic disconnected bots, <strong className="text-purple-300 font-semibold">Menti.AI</strong> queries your actual in-memory moments, null percentages, and Scikit-Learn model artifacts before generating each response.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Mathematical Rigor</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Step-by-step arithmetic derivations computed directly from active DataFrame moments.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Interactive Socratic Feedback</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Learners retain 3x more knowledge by solving guided thought problems.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate ? onNavigate('menti-ai') : onLaunchStudio()}
                className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-purple-600/30 inline-flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Launch Menti.AI Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-purple-500/30 shadow-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Menti.AI Socratic Console</h4>
                  <p className="text-[11px] text-slate-400">Context: Active Titanic Dataset (891 rows, 12 columns)</p>
                </div>
              </div>
              <Badge variant="purple">Grounded Context</Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Why should we scale features for Distance-based algorithms?
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-300 font-mono">
                  Pillar 01
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "In algorithms like KNN, PCA, or SVM, distance between samples is calculated using Euclidean distance: d(p, q) = √Σ(p_i - q_i)². If feature A ranges from $0 to $100,000 (Income) and feature B ranges from 0 to 5 (Rating), feature A will completely dominate the distance metric, making feature B effectively invisible!"
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 font-mono text-[11px] text-purple-300 overflow-x-auto whitespace-pre">
                z = (x - μ) / σ  # StandardScaler centers mean at 0 and variance at 1
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: First-Principles Comparison */}
      <section id="comparison" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="purple" className="mb-3">Feature Comparison</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Practitioners Trust Menti.AI
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Compare how Menti.AI redefines machine learning guidance compared to generic AI chatbots and static online video courses.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-300">Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-purple-400 bg-purple-500/10 border-x border-purple-500/20">
                    Menti.AI 🧠✨
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Generic AI Chatbots</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Static Course Videos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Live In-Memory Dataset Telemetry</td>
                  <td className="p-4 sm:p-5 font-bold text-purple-400 bg-purple-500/10 border-x border-purple-500/20">
                    ✅ 100% Real Moments
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Zero Access to DataFrame</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Fixed toy data only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Zero Fabrication Verification Gate</td>
                  <td className="p-4 sm:p-5 font-bold text-purple-400 bg-purple-500/10 border-x border-purple-500/20">
                    ✅ Guaranteed Validated
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Frequent Hallucinations</td>
                  <td className="p-4 sm:p-5 text-slate-400">⚠️ Pre-recorded only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">7 Explainability Pillars</td>
                  <td className="p-4 sm:p-5 font-bold text-purple-400 bg-purple-500/10 border-x border-purple-500/20">
                    ✅ Built-in to Every Concept
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Unstructured answers</td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Superficial overview</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Automated Data Leakage Audits</td>
                  <td className="p-4 sm:p-5 font-bold text-purple-400 bg-purple-500/10 border-x border-purple-500/20">
                    ✅ Continuous Pipeline Tracking
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Suggests leaky code</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ No code inspection</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Socratic Progressive Hint Ladders</td>
                  <td className="p-4 sm:p-5 font-bold text-purple-400 bg-purple-500/10 border-x border-purple-500/20">
                    ✅ Active Discovery Learning
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Spoon-feeds answers</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Passive watching</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ Accordion */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="purple" className="mb-3">Got Questions?</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Everything you need to know about Menti.AI and Socratic mentorship.
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
                  <ChevronDown className={`w-5 h-5 text-purple-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
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
          <div className="relative rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Learn AI with Grounded Socratic Guidance?
            </h2>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              Launch Menti.AI right now. Connect your dataset or explore preloaded benchmarks with zero setup.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate ? onNavigate('menti-ai') : onLaunchStudio()}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span>Launch Menti.AI Workspace Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('landing')}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5 text-purple-400" />
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
          className="fixed bottom-6 right-24 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-purple-500 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          title="Scroll Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

// Internal icon fallback
const AlertTriangleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default MentiAILandingPage;
