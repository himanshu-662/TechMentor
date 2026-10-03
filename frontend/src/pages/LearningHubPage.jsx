import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  GraduationCap,
  Layers,
  HelpCircle,
  Lightbulb,
  Compass,
  FileCode2,
  CheckCircle2,
  Brain,
  MessageSquare,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Badge from '../components/common/Badge';
import LearningCard from '../components/education/LearningCard';
import KnowledgeCheck from '../components/education/KnowledgeCheck';
import { getConcepts } from '../services/educationService';

export const LearningHubPage = () => {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [globalLevel, setGlobalLevel] = useState('beginner');
  const [activeConceptId, setActiveConceptId] = useState(null);
  const [viewMode, setViewMode] = useState('concepts'); // 'concepts' or 'quiz'

  const categories = [
    { id: 'all', label: 'All Concepts' },
    { id: 'data_fundamentals', label: 'Fundamentals' },
    { id: 'data_quality', label: 'Data Quality' },
    { id: 'data_types', label: 'Data Types' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const fetchConceptsData = async () => {
    setLoading(true);
    setError(null);
    const res = await getConcepts({
      category: selectedCategory !== 'all' ? selectedCategory : null,
      search: searchQuery || null
    });
    if (res.data) {
      setConcepts(res.data);
      if (res.data.length > 0 && !activeConceptId) {
        setActiveConceptId(res.data[0].concept_id);
      }
    } else {
      setError(res.error || 'Failed to fetch educational concepts.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConceptsData();
  }, [selectedCategory, searchQuery]);

  const activeConcept = concepts.find(c => c.concept_id === activeConceptId) || concepts[0];

  const pillars = [
    { title: "1. What happened?", desc: "Every operation clearly translates the internal data mutation into plain, unambiguous language for learners.", icon: HelpCircle },
    { title: "2. Why did it happen?", desc: "Points directly to the underlying dataset diagnostic, distribution anomaly, or trigger condition.", icon: Compass },
    { title: "3. Technique & Formula", desc: "Names the exact statistical/mathematical method and shows beginner-friendly explanations of how it works.", icon: FileCode2 },
    { title: "4. Why was this selected?", desc: "Reveals the heuristic decision tree that favored this approach over other potential methods.", icon: Lightbulb },
    { title: "5. Measurable Impact", desc: "Displays before-and-after distribution changes, statistical shifts, row/column counts, and variance deltas.", icon: Sparkles },
    { title: "6. Alternatives & When to Use", desc: "Outlines alternative options, trade-offs, pros/cons, and real-world data science rule-of-thumb best practices.", icon: BookOpen }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header & Stage Tracker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Learning & Explanation Engine
                </h1>
                <Badge variant="brand">Stage 4: Understand</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Deterministic, multi-level pedagogical encyclopedia connecting raw diagnostics to deep intuition.
              </p>
            </div>
          </div>
        </div>

        {/* Global Level Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 px-2 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-brand-400" /> Default Level:
          </span>
          <div className="inline-flex p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setGlobalLevel('beginner')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                globalLevel === 'beginner'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Beginner
            </button>
            <button
              type="button"
              onClick={() => setGlobalLevel('intermediate')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                globalLevel === 'intermediate'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Intermediate
            </button>
            <button
              type="button"
              onClick={() => setGlobalLevel('technical')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                globalLevel === 'technical'
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Technical
            </button>
          </div>
        </div>
      </div>

      {/* 2. Pipeline Stage Progress Context */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
          Data Preparation Pipeline Context:
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400">1. Upload</span>
          <span className="text-slate-600">➔</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400">2. Profile</span>
          <span className="text-slate-600">➔</span>
          <span className="px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-300 font-bold border border-brand-500/40">
            3. Understand (Current)
          </span>
          <span className="text-slate-600">➔</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/60 text-slate-500">4. Clean</span>
          <span className="text-slate-600">➔</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/60 text-slate-500">5. Transform</span>
          <span className="text-slate-600">➔</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800/60 text-slate-500">6. Feature Eng</span>
        </div>
      </div>

      {/* 3. Search & Category Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts or methods..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* View Mode Toggle: Concepts vs Self-Assessment Quizzes */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-200">{concepts.length}</span> concept(s)
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('concepts')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'concepts'
                ? 'bg-slate-800 text-brand-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Concept Explorer
          </button>
          <button
            type="button"
            onClick={() => setViewMode('quiz')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              viewMode === 'quiz'
                ? 'bg-slate-800 text-brand-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Practice Knowledge Checks
          </button>
        </div>
      </div>

      {/* 4. Main Explorer Layout */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
          <p className="text-sm">Loading concept catalog...</p>
        </div>
      ) : error ? (
        <div className="p-5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-sm">
          {error}
        </div>
      ) : viewMode === 'quiz' ? (
        /* Quiz Practice Mode */
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-brand-400 block mb-1">Knowledge Checks Arena</span>
            Test your understanding across all registered data concepts. Select choices to receive instant educational explanations.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concepts
              .filter(c => c.knowledge_check)
              .map((c) => (
                <div key={c.concept_id} className="h-full">
                  <KnowledgeCheck
                    knowledgeCheck={c.knowledge_check}
                    conceptTitle={c.title}
                  />
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* Split-Pane Concept Explorer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Concept List */}
          <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {concepts.map((concept) => {
              const isSelected = activeConcept?.concept_id === concept.concept_id;
              return (
                <button
                  key={concept.concept_id}
                  type="button"
                  onClick={() => setActiveConceptId(concept.concept_id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-850 border-brand-500/60 shadow-lg ring-1 ring-brand-500/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {concept.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {concept.short_definition}
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {concept.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Learning Card */}
          <div className="lg:col-span-8">
            {activeConcept ? (
              <LearningCard
                key={activeConcept.concept_id}
                concept={activeConcept}
                initialLevel={globalLevel}
                onSelectConcept={(id) => setActiveConceptId(id)}
                embedded={false}
              />
            ) : (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-sm">
                No concept selected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. 6 Explainability Pillars Reference Grid */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white">
            TechMentor Pedagogical Framework (DataMentor)
          </h2>
          <p className="text-xs text-slate-400">
            The 6 core pillars embedded into every diagnostic explanation and transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors space-y-3">
                <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Menti.ai Socratic Tutor Architecture */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              Menti.ai Socratic Tutor Architecture
            </h2>
            <p className="text-xs text-slate-400">
              Grounding RAG chatbot querying this exact deterministic knowledge base directly
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-slate-800">
          <p>
            The educational knowledge catalog established in Stage 4 serves as the deterministic ground truth for Menti.ai.
          </p>
          <p className="text-slate-400">
            Rather than relying on ungrounded hallucinations, Menti.ai retrieves concept definitions, mathematical formulations, and live dataset evidence from this module to answer student inquiries with high fidelity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LearningHubPage;
