import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ChevronDown,
  Layers,
  Database,
  Brain,
  Cpu,
  Bot,
  MessageSquareCode,
  ArrowRight,
  Menu,
  X,
  Compass,
  GraduationCap,
  Binary,
  Zap,
  LayoutGrid,
  RefreshCw,
  Activity
} from 'lucide-react';
import { checkHealth } from '../../services/api';

export const SUITES_CONFIG = [
  {
    id: 'menti',
    name: 'Menti.AI',
    badge: 'Socratic AI',
    tagline: 'Grounded Socratic Mentoring & 7 Explainability Pillars',
    icon: Sparkles,
    color: 'from-purple-500 to-indigo-500',
    hoverBorder: 'hover:border-purple-500/50',
    accentText: 'text-purple-400',
    accentBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    description: 'Zero-fabrication conversational mentor with real-time dataset context awareness.'
  },
  {
    id: 'datamentor',
    name: 'DataMentor',
    badge: '13-Step Studio',
    tagline: 'Data Preprocessing, Feature Engineering & Model Training',
    icon: Database,
    color: 'from-emerald-500 to-teal-500',
    hoverBorder: 'hover:border-emerald-500/50',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    description: 'Interactive end-to-end ML studio with visual distribution deltas and What-If inference.'
  },
  {
    id: 'genaimentor',
    name: 'GenAIMentor',
    badge: 'RAG Architecture',
    tagline: 'Document Ingestion, Hybrid BM25+Vector & Grounded Synthesis',
    icon: Layers,
    color: 'from-cyan-500 to-blue-500',
    hoverBorder: 'hover:border-cyan-500/50',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    description: 'Build complete RAG pipelines from chunking to reciprocal rank fusion and retrieval metrics.'
  },
  {
    id: 'agenticaimentor',
    name: 'AgenticAIMentor',
    badge: 'Autonomous Agents',
    tagline: 'ReAct Loops, Tool Calling, Planning & Multi-Agent Swarms',
    icon: Bot,
    color: 'from-amber-500 to-orange-500',
    hoverBorder: 'hover:border-amber-500/50',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    description: 'Architect autonomous multi-agent pipelines with reflection, memory, and safety gates.'
  },
  {
    id: 'nlpmentor',
    name: 'NLPMentor',
    badge: 'NLP Pipeline',
    tagline: 'Tokenizers, Embeddings, Syntactic Trees & Transformers',
    icon: MessageSquareCode,
    color: 'from-rose-500 to-pink-500',
    hoverBorder: 'hover:border-rose-500/50',
    accentText: 'text-rose-400',
    accentBg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    description: 'Explore the journey of text from BPE subwords to multi-head self-attention heatmaps.'
  },
  {
    id: 'dlmentor',
    name: 'DLMentor',
    badge: 'Deep Learning',
    tagline: 'Tensors, Autograd, Backpropagation & Neural Dynamics',
    icon: Binary,
    color: 'from-sky-500 to-blue-600',
    hoverBorder: 'hover:border-sky-500/50',
    accentText: 'text-sky-400',
    accentBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    description: 'Build neural computational graphs, loss surface optimizers, and vision transformer patches.'
  }
];

export const TechMentorNav = ({ currentSuite = 'ecosystem', onNavigate, onLaunchStudio }) => {
  const [isSuitesDropdownOpen, setIsSuitesDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [backendHealth, setBackendHealth] = useState({ loading: true, online: false });
  const dropdownRef = useRef(null);

  // Health check polling on load
  useEffect(() => {
    let isMounted = true;
    const testHealth = async () => {
      try {
        const res = await checkHealth();
        if (isMounted) {
          setBackendHealth({ loading: false, online: !!res.data });
        }
      } catch {
        if (isMounted) {
          setBackendHealth({ loading: false, online: false });
        }
      }
    };
    testHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsSuitesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo - Navigates Home/Landing */}
        <div
          onClick={() => {
            if (onNavigate) onNavigate('landing');
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3.5 group cursor-pointer select-none"
          title="TechMentor — Return to Home"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-cyan-500 via-purple-600 to-rose-500 p-0.5 shadow-lg shadow-purple-500/20 group-hover:shadow-cyan-500/35 transition-all duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-cyan-400 group-hover:text-white group-hover:rotate-45 transition-all duration-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white group-hover:opacity-95 transition-all">
                Tech<span className="bg-gradient-to-r from-emerald-400 via-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Mentor</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              First-Principles AI & Data Engineering
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* Suites Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsSuitesDropdownOpen(!isSuitesDropdownOpen)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isSuitesDropdownOpen || (currentSuite !== 'ecosystem' && currentSuite !== 'about' && currentSuite !== 'features' && currentSuite !== 'pages')
                  ? 'text-white bg-slate-800/70 border border-slate-700/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Tool Suites</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSuitesDropdownOpen ? 'rotate-180 text-brand-400' : 'text-slate-400'}`} />
            </button>

            {/* Dropdown Menu */}
            {isSuitesDropdownOpen && (
              <div className="absolute left-0 mt-2 w-[480px] p-3 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl shadow-black/60 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 mb-2 border-b border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    TechMentor Specialized Suites
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">6 First-Principles Tools</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUITES_CONFIG.map((suite) => {
                    const IconComponent = suite.icon;
                    const isActive = currentSuite === suite.id;
                    return (
                      <button
                        key={suite.id}
                        onClick={() => {
                          setIsSuitesDropdownOpen(false);
                          if (onNavigate) onNavigate(suite.id);
                        }}
                        className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between group ${
                          isActive
                            ? 'bg-slate-800/90 border-slate-700'
                            : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${suite.color} p-0.5 flex-shrink-0`}>
                            <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                              <IconComponent className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-200 block truncate group-hover:text-white">
                              {suite.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {suite.badge}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {suite.tagline}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <button
            onClick={() => onNavigate && onNavigate('features')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentSuite === 'features'
                ? 'text-white bg-slate-800/70 border border-slate-700/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Features</span>
          </button>

          {/* About */}
          <button
            onClick={() => onNavigate && onNavigate('about')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentSuite === 'about'
                ? 'text-white bg-slate-800/70 border border-slate-700/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>About</span>
          </button>

          {/* Page Index & Directory */}
          <button
            onClick={() => onNavigate && onNavigate('pages')}
            title="Explore All Pages & Directory"
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentSuite === 'pages'
                ? 'text-white bg-slate-800/70 border border-slate-700/50'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-cyan-400" />
            <span>Index</span>
          </button>
        </nav>

        {/* CTA & Actions Area */}
        <div className="flex items-center gap-3">
          {/* Subtle Backend Status Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400" title={backendHealth.online ? 'FastAPI Local Backend: Connected' : 'FastAPI Local Backend: Connecting...'}>
            <span className={`w-1.5 h-1.5 rounded-full ${backendHealth.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="hidden xl:inline">{backendHealth.online ? 'Engine Online' : 'Connecting'}</span>
          </div>

          {/* Launch Active Suite / Studio Button */}
          <button
            onClick={() => {
              if (currentSuite === 'datamentor') {
                if (onLaunchStudio) onLaunchStudio();
                else if (onNavigate) onNavigate('collection');
              } else if (currentSuite === 'menti') {
                if (onNavigate) onNavigate('menti-ai');
              } else if (currentSuite === 'genaimentor') {
                if (onNavigate) onNavigate('knowledge-base');
              } else if (currentSuite === 'agenticaimentor') {
                if (onNavigate) onNavigate('agentic-studio-coming-soon');
              } else if (currentSuite === 'nlpmentor') {
                if (onNavigate) onNavigate('nlp-studio-coming-soon');
              } else if (currentSuite === 'dlmentor') {
                if (onNavigate) onNavigate('dl-studio-coming-soon');
              } else if (onLaunchStudio) {
                onLaunchStudio();
              } else if (onNavigate) {
                onNavigate('collection');
              }
            }}
            className="relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-xl font-medium group transition-transform active:scale-95 shadow-lg shadow-brand-500/15 hover:shadow-brand-500/30"
          >
            <span className="w-full h-full bg-gradient-to-br from-brand-500 via-emerald-500 to-cyan-500 group-hover:from-brand-400 group-hover:to-cyan-400 absolute"></span>
            <span className="relative px-4 py-2 transition-all ease-out bg-slate-950 rounded-[10px] group-hover:bg-opacity-0 duration-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400 group-hover:text-white transition-colors" />
              <span className="text-xs sm:text-sm font-semibold text-white">
                Launch Studio
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-brand-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl px-4 pt-4 pb-6 space-y-4">
          {/* Quick Studio Launch for Mobile */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (onLaunchStudio) onLaunchStudio();
              else if (onNavigate) onNavigate('collection');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Studio Workbench</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-1 pt-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate && onNavigate('features');
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/50 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Features & First-Principles</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate && onNavigate('about');
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/50 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>About Founder & Mission</span>
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onNavigate && onNavigate('pages');
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-cyan-400 hover:bg-slate-800/50 flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Page Directory & Sitemap</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-2 px-1">
              TechMentor Tool Suites
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUITES_CONFIG.map((suite) => {
                const IconComponent = suite.icon;
                return (
                  <button
                    key={suite.id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate && onNavigate(suite.id);
                    }}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center gap-3 text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${suite.color} p-0.5 flex-shrink-0`}>
                      <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {suite.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {suite.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TechMentorNav;
