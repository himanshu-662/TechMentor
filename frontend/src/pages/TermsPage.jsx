import React from 'react';
import {
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  FileText,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Code2,
  Lock
} from 'lucide-react';
import Badge from '../components/common/Badge';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const TermsPage = ({ onNavigate, onLaunchStudio }) => {
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

      {/* Main Content */}
      <main className="relative pt-16 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-3">Legal Agreement</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm font-mono">
            Effective: October 2026 • Universal Academic & Commercial Guidelines
          </p>
        </div>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-400" /> 1. Acceptance of Terms
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              By accessing or using TechMentor (including DataMentor, AIMentor, and Menti.ai), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the studio or platform.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" /> 2. Ownership of Data & Exported Code
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              <strong>Your Data, Your Ownership:</strong> You retain complete, unrestricted ownership of all datasets uploaded to TechMentor tools, as well as all trained model weights, transformed CSVs, and exported Scikit-Learn Python pipelines.
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              TechMentor grants you a perpetual, royalty-free license to use all exported Python pipelines in personal, academic, and commercial production environments.
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> 3. Zero-Fabrication & Educational Disclaimer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              TechMentor operates under a strict Zero-Fabrication standard using deterministic arithmetic (NumPy, SciPy, Scikit-Learn). However, statistical models and transformations are educational and analytical tools.
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              Models generated through the platform should be independently validated and audited by qualified engineers prior to deployment in safety-critical domains (including medical diagnostic devices, aerospace, or autonomous navigation).
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> 4. Acceptable Use Policy
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              You agree not to misuse TechMentor services, including but not limited to:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li>Attempting to upload malicious CSV payloads or exploit CSV formula injection.</li>
              <li>Performing Denial of Service (DoS) attacks against the API services.</li>
              <li>Attempting to reverse-engineer proprietary pedagogical algorithms.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> 5. Limitation of Liability
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              To the maximum extent permitted by applicable law, TechMentor, DMS AI Edu Tech, and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the services.
            </p>
          </section>
        </div>
      </main>

      {/* Unified Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default TermsPage;
