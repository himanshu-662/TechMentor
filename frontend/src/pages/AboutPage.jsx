import React from 'react';
import {
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Layers,
  GraduationCap,
  LineChart,
  Bot,
  Lock,
  Cpu,
  Award,
  ChevronRight,
  Database,
  Code2,
  Linkedin,
  Globe,
  Youtube,
  Send,
  ExternalLink
} from 'lucide-react';
import Badge from '../components/common/Badge';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

import himanshuPhoto from '../assets/himanshu_molkapuri.jpg';

export const AboutPage = ({ onNavigate, onLaunchStudio }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden relative selection:bg-brand-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-brand-500/15 via-purple-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[40%] -left-60 w-[600px] h-[600px] bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[70%] -right-60 w-[600px] h-[600px] bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="ecosystem" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-xs text-brand-400 font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Our Mission & Suite Vision
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
          "Automate the work, but{' '}
          <span className="bg-gradient-to-r from-brand-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            explain the learning.
          </span>"
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          <strong className="text-white">TechMentor</strong> is built to dismantle the black-box crisis in modern AI education and engineering. We unify <strong className="text-brand-300">DataMentor</strong> for 13-stage explainable data preprocessing & ML, <strong className="text-blue-400">AIMentor</strong> for grounded RAG pipelines, and <strong className="text-purple-400">Menti.ai</strong> for conversational first-principles mentoring.
        </p>
      </section>

      {/* The Core Problem & Our Answer */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: The Status Quo */}
          <div className="p-8 rounded-2xl bg-rose-950/10 border border-rose-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider mb-3">
                <span>The Problem With Black-Box ML</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                AutoML Hides the "Why"
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed space-y-3">
                Traditional AutoML tools test hundreds of models behind a curtain, outputting a model without teaching you why certain scalers were selected, why outliers were winsorized, or how data leakage was prevented.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Opaque decisions that fail in technical interviews and production reviews
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Hallucinated explanations from disconnected generic LLM wrappers
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Accidental data leakage across train/test splits
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-rose-500/20 text-xs font-mono text-rose-400">
              Result: Fragile models & zero skill growth
            </div>
          </div>

          {/* Card 2: The DataMentor Solution */}
          <div className="p-8 rounded-2xl bg-brand-950/20 border border-brand-500/30 flex flex-col justify-between shadow-xl shadow-brand-500/5">
            <div>
              <div className="flex items-center gap-2 text-brand-400 font-mono text-xs font-bold uppercase tracking-wider mb-3">
                <span>Our Solution</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Deterministic First-Principles Studio
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                DataMentor executes all 13 standard data science phases deterministically in memory. For every transformation, it outputs step-by-step arithmetic derivations, distribution deltas, and the 7 Explainability Pillars.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Live mathematical formulas calculated from real dataset moments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  7-Pillar Transparent Rationale for every algorithmic choice
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  SHA-256 Vault with instant single-click snapshot rollback
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-4 border-t border-brand-500/30 text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 100% Mathematical Explainability
            </div>
          </div>
        </div>
      </section>

      {/* 4 Foundational Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="brand" className="mb-3">Our Core Philosophy</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The 4 Foundational Pillars
          </h2>
          <p className="text-slate-400 mt-3 text-sm sm:text-base">
            How we ensure every calculation, insight, and AI tutor interaction is mathematically grounded.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold mb-4 font-mono">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2">Zero Fabrication Rule</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All statistical metrics, moments (mean μ, standard deviation σ, skewness, quartiles), and AI mentor responses are calculated directly from dataset memory using NumPy and SciPy. We never hallucinate numbers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-brand-400">
              Deterministic Math Engine
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold mb-4 font-mono">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2">7-Pillar Transparency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every action answers the 7 fundamental explainability questions: What happened, Why did it trigger, Which formula, Why this method, What changed, Viable alternatives, and Production guidelines.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-cyan-400">
              Audit-Ready Rationale
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold mb-4 font-mono">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2">Cryptographic Vault</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Raw datasets are immutable and sealed with SHA-256 cryptographic verification. Every operation generates an isolated snapshot (v1, v2...) that you can rollback with a single click.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-purple-400">
              SHA-256 Vault Sealing
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold mb-4 font-mono">
                04
              </div>
              <h3 className="text-base font-bold text-white mb-2">Leakage-Guarded Splits</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transformation parameters (mean, variance, encodings) are strictly fitted on the training split only and applied to test vectors without computing test statistics, guaranteeing 100% leak-free evaluation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
              Production Clean Pipelines
            </div>
          </div>
        </div>
      </section>

      {/* Who TechMentor is For */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="brand" className="mb-3">Who It's Built For</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Learners, Engineers, and Researchers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Students & Interviewees</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Master the exact mathematical reasoning tested in technical data science interviews. Inspect derivations for log-likelihood, F-scores, and covariance decomposition.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ML Practitioners</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quickly prototype and clean datasets without losing touch with what your pipeline is doing. Export clean, reproducible Scikit-Learn Python code.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Enterprise & Academic Teams</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Satisfy governance, compliance, and academic rigor with full 7-pillar audit trails that document every transformation made to the dataset.
            </p>
          </div>
        </div>
      </section>

      {/* Creator & Leadership: Himanshu Molkapuri */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="brand" className="mb-3">Architect & Creator</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built by Engineers for Engineers
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 leading-relaxed">
            TechMentor is conceived and engineered with a single guiding mission: making Machine Learning and AI engineering transparent, deterministic, and deeply educational.
          </p>
        </div>

        {/* Creator Highlight Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-brand-500/30 p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Portrait Image Column */}
            <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-tr from-brand-400 via-purple-500 to-emerald-400 p-1 shadow-2xl shadow-brand-500/25 group-hover:scale-105 transition-all duration-300">
                  <div className="w-full h-full rounded-[22px] bg-slate-950 overflow-hidden relative">
                    <img
                      src={himanshuPhoto}
                      alt="Himanshu Molkapuri - Creator & AI Architect"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = '/himanshu_molkapuri.jpg';
                      }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-900 border border-brand-500/50 text-brand-400 shadow-xl flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Himanshu Molkapuri
                </h3>
                <p className="text-xs text-brand-400 font-medium mt-0.5">
                  AI Generalist & Agentic Developer
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Founder @ DMS AI Edu Tech
                </p>
              </div>

              {/* Social & Community Links */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://www.linkedin.com/in/himanshu-molkapuri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/50 text-slate-400 hover:text-brand-400 transition-all shadow-sm"
                  title="Connect on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://dmsaiedu.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/50 text-slate-400 hover:text-brand-400 transition-all shadow-sm"
                  title="Visit DMS AI Edu Tech Platform"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@dmsaiedutech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/50 text-slate-400 hover:text-rose-400 transition-all shadow-sm"
                  title="YouTube Community & Tutorials"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://t.me/dmsaiedutech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-brand-500/50 text-slate-400 hover:text-cyan-400 transition-all shadow-sm"
                  title="Join Telegram Community"
                >
                  <Send className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Bio & Details Column */}
            <div className="md:col-span-8 space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed">
              <p>
                Himanshu Molkapuri is an <strong className="text-white font-semibold">AI Generalist, Agentic AI Developer, and Educator</strong> specializing in first-principles Machine Learning architectures, generative agent systems, and pedagogical data science technology.
              </p>

              <p className="text-slate-400">
                As the founder of <strong className="text-brand-300 font-semibold">DMS AI Edu Tech</strong>, Himanshu has spearheaded initiatives to empower thousands of engineering students and graduates with practical AI roadmaps, technical mastery, and interview-ready foundations.
              </p>

              {/* Research & Accomplishments Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-brand-400 font-semibold text-xs">
                    <Award className="w-3.5 h-3.5" />
                    <span>Academic Research</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Co-author of research in sensory intelligence and affective digital companions (IJCRT 2026).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                    <Brain className="w-3.5 h-3.5" />
                    <span>DMS AI Edu Tech</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Educational platform, active community, and tech tutorials under <span className="font-mono text-slate-300">@dms.ai.edu.tech</span>.
                  </p>
                </div>
              </div>

              {/* Direct Profile CTA */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/himanshu-molkapuri"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 hover:text-brand-200 text-xs font-semibold transition-all"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>Connect on LinkedIn</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>

                <a
                  href="https://dmsaiedu.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
                >
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span>dmsaiedu.tech</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Call to Action */}
      <section className="py-20 relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-slate-950 border border-brand-500/30 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Experience Explainable Data Science
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
            Ready to explore? Launch our 13-stage studio with our built-in datasets or upload your own CSV.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onLaunchStudio}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <span>Open Studio Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('features')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs sm:text-sm transition-all"
            >
              Explore 13 Pipeline Features
            </button>
          </div>
        </div>
      </section>

      {/* Unified Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default AboutPage;
