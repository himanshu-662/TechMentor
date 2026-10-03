import React from 'react';
import {
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  GitCommit,
  Tag,
  Calendar,
  CheckCircle2,
  Cpu,
  Layers,
  Code2,
  Sliders
} from 'lucide-react';
import Badge from '../components/common/Badge';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const ChangelogPage = ({ onNavigate, onLaunchStudio }) => {
  const RELEASES = [
    {
      version: 'v0.1.0',
      tag: 'Latest Release',
      date: 'October 2026',
      title: 'Initial Public Architecture & DataMentor 13-Stage Studio Launch',
      description: 'The inaugural release of TechMentor featuring DataMentor: an explainable, deterministic machine learning and data engineering studio alongside the Menti.ai conversational Socratic tutor.',
      highlights: [
        {
          category: 'DataMentor ML Studio',
          icon: Cpu,
          badge: 'Deterministic Math',
          items: [
            '13-Stage Pipeline with in-memory DataFrame operations and zero file mutation',
            '7-Pillar Pedagogical explainability audit on every single button click',
            'Real-time arithmetic proofs with step-by-step substitution formulas',
            'SHA-256 cryptographic vault sealing and snapshot rollback trees'
          ]
        },
        {
          category: 'Menti.ai Socratic Tutor',
          icon: Sparkles,
          badge: 'Grounded Assistant',
          items: [
            'Contextual Menti.ai tutor hooked into in-memory dataset moments & null profiles',
            'Zero Fabrication Guarantee with verifiable mathematical evidence',
            '3-Tier Educational Depth (Beginner, Intermediate, Technical) with 37+ built-in concepts',
            'Interactive quiz engine with instant remediation in Learning Hub'
          ]
        },
        {
          category: 'Live Interactive Sandbox',
          icon: Sliders,
          badge: 'Simulator',
          items: [
            'Live Feature Scaling sandbox with skewness slider and real-time histogram transformation',
            'Outlier Detection sandbox with dynamic IQR Tukey fences and reactive scatter plots',
            'What-If Live Prediction with SHAP force bar logit decompositions',
            'Live 7-Pillar audit explorer with copyable Scikit-Learn code snippets'
          ]
        },
        {
          category: 'Platform Security & Safety',
          icon: ShieldCheck,
          badge: 'Defense in Depth',
          items: [
            'Eliminated all eval() and exec() dynamically dispatched scripts',
            'AST-verified parameter dispatchers with strict Pydantic model validation',
            'Leakage-guarded train/test split enforcement with fit-on-train / transform-on-test guarantees'
          ]
        }
      ]
    },
    {
      version: 'v0.2.0 (Roadmap)',
      tag: 'In Development',
      date: 'Q4 2026 / Q1 2027',
      title: 'AIMentor Grounded RAG Studio & Multi-Modal AI Pipelines',
      description: 'Upcoming expansion of the TechMentor ecosystem: introducing AIMentor for end-to-end RAG pipelines, vector embedding benchmarking, and deep learning backpropagation visualization.',
      highlights: [
        {
          category: 'AIMentor RAG Pipeline',
          icon: Layers,
          badge: 'Upcoming Suite',
          items: [
            'AIMentor end-to-end vector indexing, semantic chunking, and dual BM25/Vector RRF hybrid search',
            'Interactive vector similarity playground with t-SNE / UMAP 3D embedding visualizations',
            'RAG Triad benchmark suite (Context Relevance, Groundedness, Answer Relevance)',
            'Custom knowledge corpus ingestion for enterprise PDF, Markdown, and API docs'
          ]
        },
        {
          category: 'Future Tools (VisionMentor & CodeMentor)',
          icon: Code2,
          badge: 'Roadmap',
          items: [
            'VisionMentor: Explainable computer vision transforms with convolutional kernel visualizers',
            'CodeMentor: AST-grounded Python code generation with formal static analysis',
            'Automated LaTeX & PDF data science audit certificates for research publications'
          ]
        }
      ]
    }
  ];

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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="brand" className="mb-3">What's New</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Release Notes & Roadmap
          </h1>
          <p className="text-slate-400 mt-4 text-xs sm:text-sm leading-relaxed">
            Follow the evolution of the TechMentor ecosystem: DataMentor (ML Preprocessing), AIMentor (RAG Pipelines), and Menti.ai (Socratic Tutor).
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-16">
          {RELEASES.map((release, rIdx) => (
            <div key={rIdx} className="relative pl-6 sm:pl-10 border-l border-slate-800 space-y-6">
              {/* Timeline Marker */}
              <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-slate-950 border-2 border-brand-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
              </div>

              {/* Version & Date Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl sm:text-2xl font-black text-white">
                    {release.version}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    release.tag === 'Latest Release'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}>
                    {release.tag}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{release.date}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100">{release.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                  {release.description}
                </p>
              </div>

              {/* Highlights Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {release.highlights.map((h, hIdx) => {
                  const Icon = h.icon;
                  return (
                    <div key={hIdx} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-brand-400" />
                          <h4 className="text-xs sm:text-sm font-bold text-white">{h.category}</h4>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {h.badge}
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {h.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Unified Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default ChangelogPage;
