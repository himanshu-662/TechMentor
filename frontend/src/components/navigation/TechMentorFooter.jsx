import React from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Github,
  Twitter,
  Linkedin,
  BookOpen,
  Layers,
  Database,
  Cpu,
  Binary,
  Bot,
  MessageSquareCode,
  GraduationCap,
  LayoutGrid
} from 'lucide-react';
import { SUITES_CONFIG } from './TechMentorNav';

export const TechMentorFooter = ({ onNavigate, onLaunchStudio }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-16 relative z-10 overflow-hidden">
      {/* Multi-Spectrum Continuum Top Divider */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-sky-500 via-rose-500 via-cyan-500 via-amber-500 to-purple-600 absolute top-0 left-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Callout Banner */}
        <div className="mb-14 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 text-slate-300 border border-slate-700/60">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Learn by Building from First Principles</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Ready to master AI & Data Science with hands-on practice?
            </h3>
            <p className="text-sm text-slate-400 max-w-xl">
              Choose any of the 6 specialized TechMentor suites to inspect raw math, visualize algorithmic steps, and build production pipelines.
            </p>
          </div>
          <button
            onClick={() => onLaunchStudio ? onLaunchStudio() : (onNavigate && onNavigate('collection'))}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-600 hover:from-brand-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all flex items-center gap-2 flex-shrink-0 active:scale-95"
          >
            <span>Launch DataStudio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate && onNavigate('landing')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 via-purple-600 to-rose-500 p-0.5 shadow-md shadow-purple-500/10 group-hover:shadow-cyan-500/30 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-cyan-400 group-hover:text-white group-hover:rotate-45 transition-all duration-300" />
                </div>
              </div>
              <span className="text-xl font-black text-white tracking-tight group-hover:opacity-95 transition-all">
                Tech<span className="bg-gradient-to-r from-emerald-400 via-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Mentor</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              TechMentor is an open, first-principles ecosystem for learning AI and Data Science by building real systems. We replace black-box models with complete mathematical transparency, interactive distribution visualizers, and grounded Socratic mentoring.
            </p>
            <div className="flex items-center gap-3 pt-2 text-slate-500">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero-Fabrication Guarantee
              </span>
              <span>•</span>
              <span className="text-xs text-slate-400 font-mono">v1.2.0 Production</span>
            </div>
          </div>

          {/* Suites Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase">
              TechMentor Suites
            </h4>
            <ul className="space-y-2 text-sm">
              {SUITES_CONFIG.map((suite) => (
                <li key={suite.id}>
                  <button
                    onClick={() => onNavigate && onNavigate(suite.id)}
                    className="hover:text-brand-400 transition-colors text-left flex items-center gap-1.5"
                  >
                    <span>{suite.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({suite.badge})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Pedagogy & Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase">
              Core Principles
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('about')}
                  className="hover:text-brand-400 transition-colors"
                >
                  7 Explainability Pillars
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('features')}
                  className="hover:text-brand-400 transition-colors"
                >
                  13-Stage Preprocessing Pipeline
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('learning-hub')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Learning Hub & Concept Quizzes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('security')}
                  className="hover:text-brand-400 transition-colors"
                >
                  SHA-256 Dataset Vault
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('genaimentor')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Hybrid RRF Retrieval
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase">
              Company & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('about')}
                  className="hover:text-brand-400 transition-colors"
                >
                  About the Platform
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('changelog')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Release Changelog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('privacy')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('terms')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('contact')}
                  className="hover:text-brand-400 transition-colors"
                >
                  Contact & Community
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate && onNavigate('pages')}
                  className="hover:text-cyan-300 text-cyan-400 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Page Directory & Sitemap</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TechMentor Ecosystem. Architected by <a href="https://www.linkedin.com/in/himanshu-molkapuri" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-brand-400 font-medium transition-colors">Himanshu Molkapuri</a> (<a href="https://dmsaiedu.tech" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">DMS AI Edu Tech</a>).</p>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate && onNavigate('pages')} className="hover:text-cyan-400 text-cyan-500 font-medium">
              Directory
            </button>
            <button onClick={() => onNavigate && onNavigate('privacy')} className="hover:text-slate-400">
              Privacy
            </button>
            <button onClick={() => onNavigate && onNavigate('terms')} className="hover:text-slate-400">
              Terms
            </button>
            <button onClick={() => onNavigate && onNavigate('cookies')} className="hover:text-slate-400">
              Cookies
            </button>
            <button onClick={() => onNavigate && onNavigate('security')} className="hover:text-slate-400">
              Security
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default TechMentorFooter;
