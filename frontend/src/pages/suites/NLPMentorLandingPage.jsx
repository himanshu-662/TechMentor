import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  FileText,
  Binary,
  Layers,
  Cpu,
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
  Terminal,
  Hash,
  Sliders,
  Bot
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import TechMentorNav from '../../components/navigation/TechMentorNav';
import TechMentorFooter from '../../components/navigation/TechMentorFooter';

export const NLPMentorLandingPage = ({ onNavigate, onLaunchStudio }) => {
  // Navigation & Scroll State
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Interactive Sandbox State
  const [activeDemoTab, setActiveDemoTab] = useState('bpe');
  const [inputText, setInputText] = useState('Machine learning and natural language processing empower intelligent systems.');
  const [attentionHead, setAttentionHead] = useState(1);

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

  const launchTarget = () => {
    if (onNavigate) onNavigate('nlp-studio-coming-soon');
    else if (onLaunchStudio) onLaunchStudio();
  };

  // Simulated BPE Tokenizer demo
  const tokens = inputText.split(/\s+/).filter(Boolean).map((w, idx) => ({
    token: w,
    id: 1042 + idx * 7,
    type: idx % 2 === 0 ? 'Root' : 'Subword'
  }));

  const NLP_PIPELINE_STAGES = [
    {
      step: '01',
      name: 'Text Normalization & Cleansing',
      badge: 'Preprocessing',
      formula: 'T_{clean} = \\text{RegexClean}(\\text{NFKD}(T_{raw}))',
      summary: 'Unicode normalization (NFKD), punctuation stripping, casing control, and contraction expansion.'
    },
    {
      step: '02',
      name: 'Subword Tokenization (BPE / WordPiece)',
      badge: 'Tokenization',
      formula: 'V_{t+1} = V_t \\cup \\{ (c_1, c_2)_{\\text{argmax}} \\}',
      summary: 'Byte-Pair Encoding mapping variable-length strings to discrete integer token IDs with zero out-of-vocabulary failures.'
    },
    {
      step: '03',
      name: 'Embeddings & Positional Encodings',
      badge: 'Representation',
      formula: '\\vec{E} = \\text{Embedding}(t) + \\text{RoPE}(pos)',
      summary: 'Injecting geometric word meanings and token positions using Rotary Positional Embeddings (RoPE).'
    },
    {
      step: '04',
      name: 'Multi-Head Self-Attention',
      badge: 'Transformers',
      formula: '\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
      summary: 'Computes all-to-all token correlation matrices to contextualize polysemous words.'
    },
    {
      step: '05',
      name: 'Feed-Forward & Layer Normalization',
      badge: 'Non-Linearity',
      formula: '\\text{FFN}(x) = \\text{SwiGLU}(x W_1) W_2 + x',
      summary: 'Applies deep non-linear feature projections with residual bypass connections to prevent gradient vanishing.'
    },
    {
      step: '06',
      name: 'Logit Projection & Sampling',
      badge: 'Generation',
      formula: 'P(w_t) = \\text{softmax}\\left(\\frac{\\vec{z}}{T}\\right), \\quad \\text{Top-p} \\le 0.9',
      summary: 'Transforms final hidden states back to vocabulary distribution with Temperature and Top-p nucleus sampling.'
    }
  ];

  const PILLARS = [
    {
      num: '01',
      name: 'Subword Vocabulary Derivation',
      tagline: 'Why character and word tokenizers fail.',
      desc: 'Character tokenization creates overly long sequences; word tokenization explodes vocabulary with Out-Of-Vocabulary (OOV) tokens. BPE finds the optimal compression trade-off.'
    },
    {
      num: '02',
      name: 'Scaled Dot-Product Mechanics',
      tagline: 'Why we divide by sqrt(d_k).',
      desc: 'For large vector dimensions d_k, dot products grow large in magnitude, pushing softmax into regions with vanishingly small gradients. Scaling restores stable backpropagation.'
    },
    {
      num: '03',
      name: 'Rotary Position Embeddings (RoPE)',
      tagline: 'Relative token distance geometry.',
      desc: 'Instead of adding absolute sine/cosine vectors to embeddings, RoPE rotates the Query and Key vectors in the complex plane, preserving relative distance naturally.'
    },
    {
      num: '04',
      name: 'Causal Masking in Auto-regressive Models',
      tagline: 'Preventing future-token information leakage.',
      desc: 'Sets upper-triangular attention values to -∞ before softmax, guaranteeing that token t can only attend to past tokens 1 through t.'
    },
    {
      num: '05',
      name: 'Temperature & Top-p Dynamics',
      tagline: 'Controlling generation entropy.',
      desc: 'Temperature rescales logit steepness; Top-p dynamically cuts the cumulative probability tail, balancing creativity against incoherent degeneration.'
    },
    {
      num: '06',
      name: 'Perplexity & Cross-Entropy Loss',
      tagline: 'Evaluating language model fluency.',
      desc: 'Perplexity measures the exponential of average cross-entropy loss: PPL = exp(L). It represents the effective number of equally probable words the model is choosing between.'
    }
  ];

  const FAQS = [
    {
      q: 'What is NLPMentor and when will its studio launch?',
      a: 'NLPMentor is TechMentor’s dedicated Natural Language Processing & Transformer studio. Its studio release is scheduled for Q4 2026. Learners can explore tokenization simulators, interactive attention heatmaps, and join the priority developer waitlist today.'
    },
    {
      q: 'How does Byte-Pair Encoding (BPE) differ from WordPiece and SentencePiece?',
      a: 'BPE merges the most frequent adjacent character pairs iteratively. WordPiece merges pairs that maximize corpus language-model likelihood. SentencePiece treats the raw input as a byte stream (including spaces), making it fully language-independent.'
    },
    {
      q: 'What is the purpose of Multi-Head Attention over Single-Head Attention?',
      a: 'A single attention head can only focus on one type of relationship at a time (e.g. subject-verb agreement). Multiple heads allow the model to attend simultaneously to syntactic structure, semantic roles, coreference resolution, and punctuation cues.'
    },
    {
      q: 'How does Rotary Position Embedding (RoPE) improve upon sinusoidal positional encodings?',
      a: 'Absolute sinusoidal encodings add fixed coordinates to input embeddings, which degrade when sequences exceed the pre-trained length. RoPE encodes relative token distance directly into the inner product of Query and Key vectors, enabling superior context length extrapolation.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-rose-500 selection:text-white font-sans antialiased overflow-x-hidden relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-rose-500/15 via-pink-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] bg-rose-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[65%] -right-60 w-[600px] h-[600px] bg-pink-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="nlpmentor" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Announcement Pill */}
        <div 
          onClick={() => scrollToSection('features')}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-rose-500/25 text-xs text-slate-300 shadow-sm mb-6 backdrop-blur hover:border-rose-500/50 transition-colors cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="font-semibold text-white">Suite 05: NLP & Transformer Architecture</span>
          <span className="text-slate-600">•</span>
          <span className="text-rose-400 font-medium">BPE Tokenizers to Self-Attention</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Don’t just fine-tune models.{' '}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-rose-300 via-pink-400 to-rose-200 bg-clip-text text-transparent">
            Master the token mechanics behind them.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          <strong className="text-slate-200 font-semibold">NLPMentor</strong> reveals the journey of natural language from raw strings and Byte-Pair Encoding merges to multi-head self-attention heatmaps, positional rotations, and causal logit sampling.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={launchTarget}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Explore Upcoming Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => scrollToSection('interactive-demo')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 backdrop-blur"
          >
            <Play className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            <span>Live Interactive NLP Sandbox</span>
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
            <CheckCircle2 className="w-4 h-4 text-rose-400" /> Byte-Pair Encoding (BPE)
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-pink-400" /> Multi-Head Attention Matrices
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-300" /> Rotary Position Embeddings (RoPE)
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-400" /> Perplexity & Loss Audits
          </span>
        </div>
      </section>

      {/* SECTION: Features */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="rose" className="mb-3">Architectural Pillars</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Deep Linguistic & Transformer Clarity
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Understand how modern language models process, contextualize, and generate human language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
              <Hash className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Subword Tokenization (BPE)</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Inspect step-by-step vocabulary merges, byte fallback encodings, and token ID distributions with zero out-of-vocabulary artifacts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Multi-Head Attention Visualizers</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Explore dynamic attention heatmaps across individual heads, examining how words attend to syntactic subjects, verbs, and pronouns.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
              <Binary className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Rotary Positional Embeddings (RoPE)</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Visualize 2D rotation geometry in the complex plane, demonstrating how relative token distances are preserved across extended contexts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Causal Autoregressive Masking</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Inspect upper-triangular masking matrices that prevent future token leakage during decoder-only language model pre-training.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Decoding Dynamics (Top-k & Top-p)</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Simulate generation temperature scaling, nucleus sampling thresholds, and repetition penalty adjustments with live logit curves.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Perplexity & Evaluation Metrics</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Calculate corpus perplexity, BLEU, ROUGE, and token cross-entropy loss mathematically from test sample logits.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Interactive Sandbox */}
      <section id="interactive-demo" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Interactive Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Test BPE Tokenizer & Attention in Action
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Type custom text to see real-time subword tokenization, vocabulary mapping, and simulated self-attention weights.
            </p>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-rose-400 hidden sm:inline">NLPMentor_BPE_Engine v1.4</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveDemoTab('bpe')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'bpe'
                        ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5" />
                    <span>BPE Tokenizer</span>
                  </button>
                  <button
                    onClick={() => setActiveDemoTab('attention')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'attention'
                        ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Self-Attention Heatmap</span>
                  </button>
                </div>

                <button
                  onClick={() => setInputText('Machine learning and natural language processing empower intelligent systems.')}
                  title="Reset Text"
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition-all text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {activeDemoTab === 'bpe' && (
                <div className="space-y-6">
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1.5">Input Text:</label>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:border-rose-500 outline-none"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Token Count: <strong className="text-rose-400 font-mono">{tokens.length} tokens</strong></span>
                      <span>Avg Characters per Token: <strong className="text-white font-mono">{(inputText.length / (tokens.length || 1)).toFixed(1)}</strong></span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {tokens.map((t, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-rose-500/30 text-xs flex flex-col items-center gap-1"
                        >
                          <span className="font-mono text-rose-300 font-bold">"{t.token}"</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {t.id}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeDemoTab === 'attention' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Selected Attention Head:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((h) => (
                        <button
                          key={h}
                          onClick={() => setAttentionHead(h)}
                          className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
                            attentionHead === h
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-900 text-slate-400 border border-slate-800'
                          }`}
                        >
                          Head {h}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
                    <div className="min-w-[400px] grid grid-cols-5 gap-2 text-center text-[10px] font-mono">
                      <div className="text-slate-500">Q \ K</div>
                      {tokens.slice(0, 4).map((t, i) => (
                        <div key={i} className="text-slate-400 font-bold">{t.token.slice(0, 6)}</div>
                      ))}
                      {tokens.slice(0, 4).map((rowToken, r) => (
                        <React.Fragment key={r}>
                          <div className="text-slate-400 font-bold py-1 text-left">{rowToken.token.slice(0, 6)}</div>
                          {tokens.slice(0, 4).map((_, c) => {
                            const weight = r === c ? 0.65 : (r + c + attentionHead) % 3 === 0 ? 0.25 : 0.05;
                            return (
                              <div
                                key={c}
                                style={{ backgroundColor: `rgba(244, 63, 94, ${weight})` }}
                                className="py-2 rounded text-slate-100 font-bold border border-rose-500/20"
                              >
                                {weight.toFixed(2)}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
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
          <Badge variant="rose" className="mb-3">Our Core Doctrine</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            "Automate the Parsing, But Explain the Attention."
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Every layer of NLPMentor is designed around our 7-tier transformer explainability doctrine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.num}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-rose-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-rose-400/40 group-hover:text-rose-400 transition-colors">
                    {pillar.num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-rose-300 font-mono">
                    Pillar {pillar.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                  {pillar.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-[11px] text-slate-300 font-mono">
                <span className="text-rose-400 block text-[10px] uppercase font-bold mb-0.5">Audited & Verified:</span>
                100% Deterministic Matrix Algebra
              </div>
            </div>
          ))}

          {/* 7th Wide Card */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xl font-bold text-rose-400">07. Production Standards & Benchmarks</span>
                <Badge variant="rose">GLUE & MMLU</Badge>
              </div>
              <h3 className="text-xl font-bold text-white">GLUE, SuperGLUE & Perplexity Standards</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Benchmark fine-tuned models against industry standards using exact evaluation scripts for text classification, named-entity recognition, and summarization.
              </p>
            </div>
            <button
              onClick={launchTarget}
              className="shrink-0 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-rose-500/20"
            >
              Explore Upcoming Studio →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: Pipeline Stepper */}
      <section id="pipeline" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="rose" className="mb-3">Complete Pipeline</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              The 6-Stage NLP Pipeline
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Follow the transformation of human text into high-dimensional geometric representations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {NLP_PIPELINE_STAGES.map((stage) => (
              <div
                key={stage.step}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-rose-500/50 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-rose-400">Step {stage.step}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-rose-300 font-mono border border-slate-800">
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                    {stage.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {stage.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-855 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                    {stage.formula}
                  </span>
                  <span className="text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
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
            <Badge variant="rose">Socratic NLP Mentorship</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              An AI Tutor That Explains Transformer Algebra
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Why do decoder models use causal masking? Why divide by the square root of d_k? <strong className="text-rose-300 font-semibold">Menti.AI</strong> delivers first-principles proofs rather than hand-wavy analogies.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Mathematical Proofs</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Explore softmax saturation, temperature entropy scaling, and RoPE derivations.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Tokenizer Diagnostics</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Diagnose byte fallback behavior, emoji splits, and multilingual compression rates.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={launchTarget}
                className="px-6 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-rose-500/25 inline-flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Explore Upcoming Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-rose-500/30 shadow-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <MessageSquareCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">NLP Socratic Console</h4>
                  <p className="text-[11px] text-slate-400">Context: Attention Scaling Proof</p>
                </div>
              </div>
              <Badge variant="rose">Mathematical Derivation</Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  Why divide QK^T by sqrt(d_k)?
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-300 font-mono">
                  Variance Proof
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Assume components of q and k are independent random variables with mean 0 and variance 1. Their dot product q · k = Σ(q_i * k_i) has mean 0 and variance d_k! For large d_k (e.g. 64 or 128), large dot products push the softmax function into regions with tiny gradients (softmax saturation). Dividing by √d_k normalizes the variance back to 1.0!"
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 font-mono text-[11px] text-rose-300 overflow-x-auto whitespace-pre">
                {"Var(Σ q_i * k_i) = d_k  ==>  Var((q · k) / √d_k) = d_k / d_k = 1.0"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: First-Principles Comparison */}
      <section id="comparison" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="rose" className="mb-3">Feature Comparison</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Engineers Choose NLPMentor
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Compare how NLPMentor demystifies natural language processing compared to black-box one-liners and outdated regex pipelines.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-300">Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-rose-400 bg-rose-500/10 border-x border-rose-500/20">
                    NLPMentor 📖✨
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Opaque HuggingFace One-Liners</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Outdated NLTK/Regex Scripts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Interactive BPE Merge Visualizer</td>
                  <td className="p-4 sm:p-5 font-bold text-rose-400 bg-rose-500/10 border-x border-rose-500/20">
                    ✅ Step-by-Step Vocabulary Growth
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Opaque compiled rust binary</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Word-level only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Multi-Head Attention Heatmap Inspection</td>
                  <td className="p-4 sm:p-5 font-bold text-rose-400 bg-rose-500/10 border-x border-rose-500/20">
                    ✅ Live Interactive Matrix
                  </td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Requires custom BertViz code</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Not applicable</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Rotary Position Embedding (RoPE) Math</td>
                  <td className="p-4 sm:p-5 font-bold text-rose-400 bg-rose-500/10 border-x border-rose-500/20">
                    ✅ Geometric Derivation & Plots
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Hidden in model weights</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ None</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Live Decoding Temperature Simulator</td>
                  <td className="p-4 sm:p-5 font-bold text-rose-400 bg-rose-500/10 border-x border-rose-500/20">
                    ✅ Real-Time Logit Distribution Curves
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Blind generation kwargs</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Deterministic only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">7 Explainability Pillars</td>
                  <td className="p-4 sm:p-5 font-bold text-rose-400 bg-rose-500/10 border-x border-rose-500/20">
                    ✅ Standardized for All NLP Topics
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Zero pedagogical layer</td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Fragmented blogs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ Accordion */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="rose" className="mb-3">Got Questions?</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Everything you need to know about NLPMentor and transformer linguistics.
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
                  <ChevronDown className={`w-5 h-5 text-rose-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
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
          <div className="relative rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-pink-950 border border-rose-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-pink-500/20 blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Master Natural Language Processing?
            </h2>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              Explore the upcoming studio roadmap, test interactive tokenizers, and master transformer attention today.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={launchTarget}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-500 to-rose-600 hover:from-rose-300 hover:to-pink-400 text-white font-bold text-base shadow-xl shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span>Explore Upcoming Studio</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('landing')}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5 text-rose-400" />
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
          className="fixed bottom-6 right-24 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-rose-500 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          title="Scroll Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default NLPMentorLandingPage;
