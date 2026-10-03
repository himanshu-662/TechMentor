import React from 'react';
import {
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Lock,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Server,
  FileCheck,
  Key,
  Cpu,
  AlertOctagon
} from 'lucide-react';
import Badge from '../components/common/Badge';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const SecurityPage = ({ onNavigate, onLaunchStudio }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden relative selection:bg-brand-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-brand-500/15 via-purple-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[65%] -right-60 w-[600px] h-[600px] bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="ecosystem" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Main Content */}
      <main className="relative pt-16 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-3">Security & Trust Engineering</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Enterprise-Grade Data Safety & Security
          </h1>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm max-w-2xl mx-auto">
            Engineered from first principles to protect your datasets against corruption, code execution vulnerabilities, and data leakage across TechMentor tools.
          </p>
        </div>

        {/* 4 Core Pillars of Security */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero <code className="text-xs bg-slate-900 px-1.5 py-0.5 rounded font-mono text-cyan-300">eval()</code> Safe Dispatchers</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Unlike fragile tools that execute dynamic string scripts, TechMentor (including DataMentor and AIMentor) strictly validates all transformation and cleaning requests using typed Pydantic models and pre-compiled mathematical AST dispatchers. Zero arbitrary code execution risk.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">SHA-256 Vault Immutability</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Raw original files are sealed with cryptographic SHA-256 digests. Every preprocessing and feature engineering operation writes to an isolated copy tree, ensuring your original records can never be accidentally modified or overwritten.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Granular Snapshot Rollback</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Each pipeline step creates an immutable version snapshot (v1, v2, v3...). If a transformation introduces unwanted skew or drops too many records, you can rollback to any previous version with a single click.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Data Leakage Guard</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Step 10 Train-Test split enforces strict estimator encapsulation. Parameters (mean μ, standard deviation σ, frequency maps) are fitted exclusively on the training fold, preventing subtle target contamination.
            </p>
          </div>
        </div>

        {/* Technical Architecture Deep Dive */}
        <section className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4 mb-12">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-brand-400" /> Defense-in-Depth Engineering Practices
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span><strong>Input Sanitization:</strong> CSV files are scanned and sanitized against formula injection attacks (<code className="text-xs bg-slate-950 px-1 py-0.5 rounded font-mono text-rose-300">=, +, -, @</code>).</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span><strong>Memory Thresholds:</strong> Large dataset protection with streaming chunk iterators and a 50MB file size ceiling to prevent memory starvation.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span><strong>Isolated In-Memory Sessions:</strong> Each dataset operates in an ephemeral context that can be fully purged at any time.</span>
            </div>
          </div>
        </section>

        {/* Global Call to Action */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-brand-950 to-slate-900 border border-brand-500/30 text-center">
          <h3 className="text-xl font-bold text-white">Experience Leak-Free, Safe ML</h3>
          <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
            Run your first deterministic pipeline in our studio or test our interactive sandbox.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={onLaunchStudio}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20"
            >
              Launch Studio Now
            </button>
          </div>
        </div>
      </main>

      {/* Unified Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default SecurityPage;
