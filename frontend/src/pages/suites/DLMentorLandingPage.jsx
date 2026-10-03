import React, { useState, useEffect } from 'react';
import {
  Binary,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  BarChart3,
  TrendingUp,
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
  Sliders,
  Bot
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import TechMentorNav from '../../components/navigation/TechMentorNav';
import TechMentorFooter from '../../components/navigation/TechMentorFooter';

export const DLMentorLandingPage = ({ onNavigate, onLaunchStudio }) => {
  // Navigation & Scroll State
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Interactive Sandbox State
  const [activeDemoTab, setActiveDemoTab] = useState('tensors');
  const [batchSize, setBatchSize] = useState(32);
  const [inFeatures, setInFeatures] = useState(128);
  const [outFeatures, setOutFeatures] = useState(64);
  const [learningRate, setLearningRate] = useState(0.001);

  // Computed tensor parameters & FLOPs
  const weightElements = inFeatures * outFeatures;
  const biasElements = outFeatures;
  const totalParams = weightElements + biasElements;
  const forwardFlops = 2 * batchSize * inFeatures * outFeatures;
  const memoryKb = (totalParams * 4) / 1024; // FP32 (4 bytes)

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
    if (onNavigate) onNavigate('dl-studio-coming-soon');
    else if (onLaunchStudio) onLaunchStudio();
  };

  const DL_STAGES = [
    {
      step: '01',
      name: 'Tensors, Strides & Memory Layouts',
      badge: 'Tensors',
      formula: 'X \\in \\mathbb{R}^{B \\times C \\times H \\times W}, \\quad \\text{stride}(i) = \\prod_{j=i+1}^D d_j',
      summary: 'N-dimensional arrays, broadcasting rules, contiguous memory layouts, and GPU tensor allocations.'
    },
    {
      step: '02',
      name: 'Computational Graphs & Autograd',
      badge: 'Autograd',
      formula: '\\frac{\\partial \\mathcal{L}}{\\partial x} = \\sum_{y \\in \\text{Children}(x)} \\frac{\\partial \\mathcal{L}}{\\partial y} \\cdot \\frac{\\partial y}{\\partial x}',
      summary: 'Dynamic Directed Acyclic Graph (DAG) construction and reverse-mode automatic differentiation.'
    },
    {
      step: '03',
      name: 'Loss Landscapes & Optimization Surfaces',
      badge: 'Optimizers',
      formula: 'm_t = \\beta_1 m_{t-1} + (1-\\beta_1)g_t, \\quad v_t = \\beta_2 v_{t-1} + (1-\\beta_2)g_t^2',
      summary: 'SGD with Nesterov momentum, RMSprop, AdamW decoupled weight decay, and Cosine Annealing schedulers.'
    },
    {
      step: '04',
      name: 'Normalization & Residual Connections',
      badge: 'Architecture',
      formula: '\\hat{x} = \\frac{x - \\mu_B}{\\sqrt{\\sigma_B^2 + \\epsilon}}, \\quad y = \\mathcal{F}(x) + x',
      summary: 'Batch Normalization, LayerNorm, RMSNorm, and residual identity mappings preventing gradient vanishing.'
    },
    {
      step: '05',
      name: 'Regularization & Generalization',
      badge: 'Generalization',
      formula: 'r \\sim \\text{Bernoulli}(1 - p), \\quad \\tilde{x} = \\frac{r \\odot x}{1 - p}',
      summary: 'Inverted Dropout, Weight Decay (L2 penalty), CutMix, and early stopping patience mechanics.'
    },
    {
      step: '06',
      name: 'FLOPs & Hardware Telemetry',
      badge: 'Profiling',
      formula: '\\text{FLOPs} = 2 \\cdot B \\cdot d_{\\text{in}} \\cdot d_{\\text{out}}, \\quad \\text{VRAM} = f(\\text{Params}, \\text{Activations})',
      summary: 'Analytical FLOP counting, peak GPU activation tracking, and memory bandwidth bottleneck audits.'
    }
  ];

  const PILLARS = [
    {
      num: '01',
      name: 'Reverse-Mode Automatic Differentiation',
      tagline: 'Why reverse autograd scales to millions of parameters.',
      desc: 'Forward-mode autograd requires one pass per input parameter; reverse-mode computes gradients for all inputs in a single backward pass from scalar loss.'
    },
    {
      num: '02',
      name: 'Memory Strides & Contiguity',
      tagline: 'Preventing silent memory copy performance bottlenecks.',
      desc: 'Transposing a tensor changes its stride vector without copying underlying bytes. Calling .contiguous() forces memory re-allocation when kernels require sequential memory.'
    },
    {
      num: '03',
      name: 'Adam vs. AdamW Decoupled Decay',
      tagline: 'Fixing L2 regularization in adaptive optimizers.',
      desc: 'In standard Adam, L2 weight decay gets scaled inversely by adaptive variance v_t. AdamW subtracts weight decay directly from weights, restoring proper regularization.'
    },
    {
      num: '04',
      name: 'Batch vs. Layer Normalization',
      tagline: 'Why transformers abandoned BatchNorm.',
      desc: 'BatchNorm computes statistics across batch samples, creating inter-sample dependencies that fail with variable sequence lengths. LayerNorm computes across hidden dimensions independently.'
    },
    {
      num: '05',
      name: 'Residual Highway Dynamics',
      tagline: 'Unimpeded gradient flow to early layers.',
      desc: 'By adding skip connection identity mappings y = F(x) + x, the gradient dL/dx contains the additive term 1.0, ensuring gradients can never vanish completely.'
    },
    {
      num: '06',
      name: 'Gradient Accumulation Math',
      tagline: 'Simulating massive batch sizes on single GPUs.',
      desc: 'Summing gradients over N micro-batches before calling optimizer.step() replicates the exact mathematical weight update of an N-times larger batch size.'
    }
  ];

  const FAQS = [
    {
      q: 'What is DLMentor and when will its studio release?',
      a: 'DLMentor is TechMentor’s dedicated Deep Learning, Tensor Calculus, and Autograd studio. The interactive studio canvas is scheduled for Q4 2026. Learners can explore tensor FLOP calculators, reverse autograd graph visualizers, and join the VIP waitlist today.'
    },
    {
      q: 'How does Automatic Differentiation differ from Symbolic and Numerical Differentiation?',
      a: 'Numerical differentiation (finite differences) suffers from floating-point roundoff errors and requires O(N) passes. Symbolic differentiation causes exponential formula explosion. Autograd applies the multivariable chain rule mechanically to elementary computer operations, achieving exact precision in O(1) backward passes.'
    },
    {
      q: 'Why does AdamW outperform traditional Adam on modern deep architectures?',
      a: 'In original Adam, L2 weight decay was added to the gradient, meaning parameters with large gradient history received smaller decay penalties. AdamW decouples weight decay from the gradient moments, applying uniform exponential decay regardless of gradient magnitude.'
    },
    {
      q: 'What is the difference between memory parameters and activation memory?',
      a: 'Parameters (weights and biases) require fixed storage (e.g. 4 bytes per float32 parameter). Activations store intermediate outputs for each layer during the forward pass so they can be reused during backpropagation. Activation memory scales directly with batch size and sequence length.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-slate-950 font-sans antialiased overflow-x-hidden relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-sky-500/15 via-blue-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] bg-sky-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[65%] -right-60 w-[600px] h-[600px] bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="dlmentor" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Announcement Pill */}
        <div 
          onClick={() => scrollToSection('features')}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-sky-500/25 text-xs text-slate-300 shadow-sm mb-6 backdrop-blur hover:border-sky-500/50 transition-colors cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="font-semibold text-white">Suite 06: Deep Learning & Computational Graphs</span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-400 font-medium">Tensors to Autograd Backpropagation</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Don’t just call model.backward().{' '}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
            Master the tensor calculus behind it.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          <strong className="text-slate-200 font-semibold">DLMentor</strong> demystifies the mathematical engine of neural networks. From multidimensional tensor strides and reverse-mode automatic differentiation to AdamW loss surfaces and residual gradient highways.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={launchTarget}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Explore Upcoming Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => scrollToSection('interactive-demo')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 backdrop-blur"
          >
            <Play className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
            <span>Live Interactive Tensor Sandbox</span>
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
            <CheckCircle2 className="w-4 h-4 text-sky-400" /> Reverse-Mode Autograd DAG
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" /> AdamW Decoupled Weight Decay
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Analytical FLOPs & Memory
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-teal-400" /> Zero Silent Copy Bottlenecks
          </span>
        </div>
      </section>

      {/* SECTION: Features */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="sky" className="mb-3">Architectural Pillars</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Mathematical & Hardware Clarity
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Understand how matrix multiplications, loss gradients, and GPU memory work at the hardware level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-4">
              <Binary className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Tensor Strides & Contiguity</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Visualize multidimensional buffer memory addresses, broadcasting rules, and non-contiguous stride modifications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Reverse Autograd Execution DAG</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Step through backward execution trees and observe the multivariable chain rule accumulating partial derivatives across branches.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Optimization Surfaces & AdamW</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Explore 3D loss topography curves, momentum escape routes from saddle points, and decoupled weight decay mechanics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Normalization & Residual Paths</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Compare Batch Normalization, LayerNorm, and RMSNorm, and see how residual identity connections prevent vanishing gradients.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Learning Rate Schedulers</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Simulate Cosine Annealing with Warm Restarts, linear warmups, and ReduceLROnPlateau triggers with live parameter sweeps.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Hardware Profiling & FLOPs</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Calculate exact forward/backward floating-point operations and peak activation VRAM requirements before deploying training jobs.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Interactive Sandbox */}
      <section id="interactive-demo" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Interactive Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Calculate Linear Layer FLOPs & Parameters
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Adjust batch size, input dimensions, and output features to inspect parameter counts, memory consumption, and forward FLOPs.
            </p>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-sky-400 hidden sm:inline">DLMentor_Tensor_Engine v1.6</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setBatchSize(32);
                    setInFeatures(128);
                    setOutFeatures(64);
                    setLearningRate(0.001);
                  }}
                  title="Reset Simulator"
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-sky-400 transition-all text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Batch Size (B):</span>
                    <span className="font-mono text-sky-400 font-bold">{batchSize}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="128"
                    step="1"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">In Features (d_in):</span>
                    <span className="font-mono text-sky-400 font-bold">{inFeatures}</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="512"
                    step="16"
                    value={inFeatures}
                    onChange={(e) => setInFeatures(parseInt(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300">Out Features (d_out):</span>
                    <span className="font-mono text-sky-400 font-bold">{outFeatures}</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="256"
                    step="8"
                    value={outFeatures}
                    onChange={(e) => setOutFeatures(parseInt(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* Real-time Math Output Card */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-sky-500/30 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Total Parameters</span>
                  <span className="text-base text-sky-300 font-bold">{totalParams.toLocaleString()} params</span>
                  <span className="text-[10px] text-slate-500 block">W: {weightElements} | b: {biasElements}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">FP32 Weight VRAM</span>
                  <span className="text-base text-blue-300 font-bold">{memoryKb.toFixed(1)} KB</span>
                  <span className="text-[10px] text-slate-500 block">4 bytes per float</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Forward FLOPs</span>
                  <span className="text-base text-indigo-300 font-bold">{forwardFlops.toLocaleString()} ops</span>
                  <span className="text-[10px] text-slate-500 block">2 * B * d_in * d_out</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Backward FLOPs (est.)</span>
                  <span className="text-base text-teal-300 font-bold">{(forwardFlops * 2).toLocaleString()} ops</span>
                  <span className="text-[10px] text-slate-500 block">~2x Forward Pass</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: 7 Explainability Pillars */}
      <section id="pillars" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="sky" className="mb-3">Our Core Doctrine</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            "Automate the Compute, But Explain the Calculus."
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Every layer of DLMentor is governed by the 7 Pillars of transparent deep learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.num}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-sky-400/40 group-hover:text-sky-400 transition-colors">
                    {pillar.num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-sky-300 font-mono">
                    Pillar {pillar.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                  {pillar.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-[11px] text-slate-300 font-mono">
                <span className="text-sky-400 block text-[10px] uppercase font-bold mb-0.5">Audited & Verified:</span>
                100% Exact Analytical Derivations
              </div>
            </div>
          ))}

          {/* 7th Wide Card */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xl font-bold text-sky-400">07. Production Standards & Distributed Training</span>
                <Badge variant="sky">DDP & FSDP</Badge>
              </div>
              <h3 className="text-xl font-bold text-white">Distributed Data Parallel (DDP) & Mixed Precision</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Scale your neural networks to multi-GPU clusters using PyTorch Distributed Data Parallel (DDP), gradient all-reduce synchronization, and FP16/BF16 mixed-precision loss scaling.
              </p>
            </div>
            <button
              onClick={launchTarget}
              className="shrink-0 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-sky-500/20"
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
            <Badge variant="sky" className="mb-3">Complete Pipeline</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              The 6-Stage Deep Learning Lifecycle
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Follow the execution path from tensor allocation to reverse autograd and optimizer stepping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DL_STAGES.map((stage) => (
              <div
                key={stage.step}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-sky-500/50 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-sky-400">Step {stage.step}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-sky-300 font-mono border border-slate-800">
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
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
                  <span className="text-xs font-semibold text-sky-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
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
            <Badge variant="sky">Socratic DL Mentorship</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              An AI Tutor That Proves Gradient Flow Mathematically
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Why did your network fail to converge? Are your gradients vanishing in early layers? <strong className="text-sky-300 font-semibold">Menti.AI</strong> computes the multivariable chain rule step-by-step with zero hand-waving.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Gradient Vanishing Diagnostics</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Diagnose saturated sigmoid/tanh activations and calculate LayerNorm fixes.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">AdamW Weight Decay Proofs</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Understand why decoupled weight decay preserves regularization strength.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={launchTarget}
                className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xl shadow-sky-500/25 inline-flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Explore Upcoming Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-sky-500/30 shadow-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Binary className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">DL Socratic Console</h4>
                  <p className="text-[11px] text-slate-400">Context: Autograd Chain Rule Derivation</p>
                </div>
              </div>
              <Badge variant="sky">Exact Calculus</Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Why does adding residual connections y = F(x) + x prevent vanishing gradients?
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/15 text-sky-300 font-mono">
                  Chain Rule Proof
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "When you backpropagate through y = F(x) + x, the derivative with respect to x is: dy/dx = dF(x)/dx + 1. By the chain rule: dL/dx = (dL/dy) * (dF(x)/dx + 1) = (dL/dy) * dF(x)/dx + (dL/dy). Notice that even if the weight layer derivative dF(x)/dx vanishes to 0, the additive term (dL/dy) ensures the error signal flows directly back to early layers!"
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 font-mono text-[11px] text-sky-300 overflow-x-auto whitespace-pre">
                {`dL/dx_l = dL/dx_L * (1 + d/dx_l Σ F_i)  ==> Gradient never vanishes completely!`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: First-Principles Comparison */}
      <section id="comparison" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="sky" className="mb-3">Feature Comparison</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Engineers Choose DLMentor
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Compare how DLMentor demystifies deep learning mechanics compared to black-box cloud frameworks and disconnected textbook formulas.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-300">Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-sky-400 bg-sky-500/10 border-x border-sky-500/20">
                    DLMentor 🧠⚙️
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Black-Box Frameworks</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Abstract Math Textbooks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Reverse Autograd Execution Tree</td>
                  <td className="p-4 sm:p-5 font-bold text-sky-400 bg-sky-500/10 border-x border-sky-500/20">
                    ✅ Live Interactive DAG Graph
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Opaque C++ binary core</td>
                  <td className="p-4 sm:p-5 text-slate-400">⚠️ Static 2D diagrams only</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Real-Time FLOPs & Parameter Math</td>
                  <td className="p-4 sm:p-5 font-bold text-sky-400 bg-sky-500/10 border-x border-sky-500/20">
                    ✅ Exact Analytical Profiling
                  </td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Requires custom hooks</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Manual hand calculation</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Tensor Strides & Memory Layout Visualizer</td>
                  <td className="p-4 sm:p-5 font-bold text-sky-400 bg-sky-500/10 border-x border-sky-500/20">
                    ✅ Interactive Contiguity Audit
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Silent performance drags</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ No hardware perspective</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">AdamW Weight Decay Decoupling Proof</td>
                  <td className="p-4 sm:p-5 font-bold text-sky-400 bg-sky-500/10 border-x border-sky-500/20">
                    ✅ Visual Loss Surface Simulation
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ One-line torch.optim call</td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Dense academic paper</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">7 Explainability Pillars</td>
                  <td className="p-4 sm:p-5 font-bold text-sky-400 bg-sky-500/10 border-x border-sky-500/20">
                    ✅ Multi-Tier Learning Depth
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ None</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ Theoretical only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ Accordion */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="sky" className="mb-3">Got Questions?</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Everything you need to know about DLMentor, autograd, and neural tensor architectures.
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
                  <ChevronDown className={`w-5 h-5 text-sky-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
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
          <div className="relative rounded-3xl bg-gradient-to-r from-sky-950 via-slate-900 to-blue-950 border border-sky-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-sky-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Master Neural Tensor Calculus & Deep Learning?
            </h2>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              Explore the upcoming studio roadmap, calculate layer FLOPs, and master automatic differentiation today.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={launchTarget}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-slate-950 font-bold text-base shadow-xl shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span>Explore Upcoming Studio</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('landing')}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5 text-sky-400" />
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
          className="fixed bottom-6 right-24 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-sky-500 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-slate-950 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          title="Scroll Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default DLMentorLandingPage;
