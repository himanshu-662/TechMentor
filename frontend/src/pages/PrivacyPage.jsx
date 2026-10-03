import React from 'react';
import {
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Lock,
  Eye,
  CheckCircle2,
  Database,
  FileCheck,
  Server,
  UserCheck
} from 'lucide-react';
import Badge from '../components/common/Badge';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const PrivacyPage = ({ onNavigate, onLaunchStudio }) => {
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
          <Badge variant="brand" className="mb-3">Transparency & Trust</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-400 mt-3 text-xs sm:text-sm font-mono">
            Last updated: October 2026 • GDPR & CCPA Compliant Design
          </p>
        </div>

        {/* Highlight Callout */}
        <div className="p-6 rounded-2xl bg-brand-950/20 border border-brand-500/30 mb-10 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-brand-400 shrink-0 mt-1" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Our Core Privacy Commitment</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              TechMentor (including DataMentor, AIMentor, and Menti.ai) is built on a strict "Zero-Telemetry Data Privacy" principle. Your uploaded datasets are processed strictly in isolated memory sessions. We never sell your data, never log proprietary PII, and never use customer datasets to train external foundation models.
            </p>
          </div>
        </div>

        {/* Structured Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-400" /> 1. Information We Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              When using TechMentor tools (such as DataMentor for data preprocessing or AIMentor for RAG pipelines), you may provide structured numerical, tabular, or text datasets. These datasets are used solely for:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li>Generating exploratory statistical profiles (mean, standard deviation, quartiles, correlation).</li>
              <li>Performing user-directed transformations (imputation, categorical encoding, power scaling).</li>
              <li>Evaluating Scikit-Learn models and displaying What-If live predictions in your browser session.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" /> 2. In-Memory Processing & Vault Storage
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Your raw dataset files are stored in an isolated, encrypted vault directory with SHA-256 cryptographic verification hashes to guarantee immutability.
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              Transformation versions (v1, v2...) are preserved only for the duration of your workflow to enable single-click snapshot rollbacks. You can delete all working copies, artifacts, and snapshots instantly via the Data Management tab.
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> 3. Menti.ai & AIMentor Grounded Retrieval
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              When querying Menti.ai or exploring AIMentor RAG knowledge:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li>Only statistical summaries (column names, data types, null ratios, variance moments) are referenced to answer questions.</li>
              <li>Raw individual record rows containing sensitive personal identifiers are never passed into external foundation models.</li>
              <li>Queries are processed securely without retaining customer training data.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" /> 4. User Rights & Data Portability
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              In accordance with international privacy standards (including GDPR and CCPA):
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Right to Erasure:</strong> You can purge any uploaded dataset and fitted model at any time with zero residual retention.</li>
              <li><strong>Right to Portability:</strong> You can export your transformed datasets as standard CSV files and download fully reproducible standalone Python code at Step 13.</li>
              <li><strong>Right to Transparency:</strong> Our 7-Pillar audit trails ensure you have 100% visibility into every algorithm applied to your data.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" /> 5. Contact & Data Protection Officer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              If you have any questions regarding data handling or wish to submit a privacy request, please contact us via the <button onClick={() => onNavigate && onNavigate('contact')} className="text-brand-400 underline hover:text-brand-300">Contact page</button> or email our privacy engineering team at <code className="text-xs bg-slate-900 px-1.5 py-0.5 rounded font-mono text-brand-300">privacy@techmentor.ai</code>.
            </p>
          </section>
        </div>
      </main>

      {/* Unified Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default PrivacyPage;
