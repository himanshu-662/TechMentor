import React, { useState, useEffect } from 'react';
import {
  Bot,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Terminal,
  Cpu,
  GitBranch,
  Repeat,
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
  Sliders,
  AlertTriangle,
  UserCheck,
  Layers,
  Database
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import TechMentorNav from '../../components/navigation/TechMentorNav';
import TechMentorFooter from '../../components/navigation/TechMentorFooter';

export const AgenticAIMentorLandingPage = ({ onNavigate, onLaunchStudio }) => {
  // Navigation & Scroll State
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Interactive Sandbox State
  const [activeDemoTab, setActiveDemoTab] = useState('react');
  const [activeTrajectoryStep, setActiveTrajectoryStep] = useState(0);

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
    if (onNavigate) onNavigate('agentic-studio-coming-soon');
    else if (onLaunchStudio) onLaunchStudio();
  };

  const AGENT_TRAJECTORY = [
    {
      step: 1,
      role: 'Planner Agent',
      phase: 'Task Decomposition',
      thought: 'User wants to identify the top 3 features correlating with loan default and train an interpretable classifier with 0% data leakage.',
      action: 'plan_subtasks([ "Ingest & clean dataset", "Calculate Pearson & Spearman correlations", "Fit Decision Tree & evaluate ROC-AUC" ])',
      status: 'Plan Formulated'
    },
    {
      step: 2,
      role: 'Specialist: Data Agent',
      phase: 'Tool Execution',
      thought: 'Executing tool data_cleaning_pipeline(impute="median", outliers="winsorize"). Checking for missing target values.',
      action: 'tool_call("clean_dataset", { dataset_id: "loan_v1", target: "default" })',
      observation: 'Output: 2,400 clean rows, 0 nulls, target class ratio: 78% non-default, 22% default.',
      status: 'Tool Succeeded'
    },
    {
      step: 3,
      role: 'Specialist: Math Agent',
      phase: 'Correlation Analysis',
      thought: 'Computing correlation matrix. Features "debt_to_income" (r=0.48) and "credit_score" (r=-0.62) show strong statistical signal.',
      action: 'tool_call("feature_selection", { method: "mutual_info", k: 3 })',
      observation: 'Top 3 Selected Features: [credit_score, debt_to_income, annual_income].',
      status: 'Observation Verified'
    },
    {
      step: 4,
      role: 'Critic / Reflection Agent',
      phase: 'Safety & Leakage Check',
      thought: 'Self-Correction Loop: Verifying whether correlation was computed across the entire dataset before train-test split.',
      action: 'validate_leakage_guardrail(pipeline_state)',
      observation: 'Warning Flag: Fit occurred on training split only (1,680 rows). Validation Gate Passed (0 Leakage).',
      status: 'Critique Approved'
    },
    {
      step: 5,
      role: 'Human-in-the-Loop Gate',
      phase: 'Approval Required',
      thought: 'Action requires user confirmation: Deploy model with 84.2% ROC-AUC to staging endpoint.',
      action: 'await_human_confirmation("Deploy LoanClassifier v1 to production endpoint?")',
      observation: 'User Approved manually at 14:32:05 UTC.',
      status: 'Ready for Human Approval'
    }
  ];

  const AGENT_PIPELINE = [
    {
      step: '01',
      name: 'Goal & Constraint Formulation',
      badge: 'Specification',
      formula: 'G = \\{ \\text{Objective}, \\, \\text{Budget}, \\, \\text{SafetyConstraints} \\}',
      summary: 'Translates natural language intent into structured state objects and security boundary parameters.'
    },
    {
      step: '02',
      name: 'Hierarchical Task Decomposition',
      badge: 'Planning',
      formula: 'T = \\text{DAG}(\\{ t_1, t_2, \\dots, t_n \\}), \\quad \\text{Dependencies} \\in E',
      summary: 'Builds a Directed Acyclic Graph (DAG) of interdependent subtasks with dynamic replanning.'
    },
    {
      step: '03',
      name: 'ReAct Loop & Tool Execution',
      badge: 'Execution',
      formula: 'a_t = \\pi(\\tau_{1:t-1}), \\quad o_t = \\text{Env}(a_t)',
      summary: 'Interleaves chain-of-thought reasoning with type-safe tool invocations and live environment observations.'
    },
    {
      step: '04',
      name: 'Reflection & Self-Correction',
      badge: 'Critic Loop',
      formula: '\\text{Eval}(o_t) \\rightarrow \\Delta \\text{Plan} \\text{ if failure detected}',
      summary: 'Catches execution bugs, syntax errors, and schema mismatches without crashing the workflow.'
    },
    {
      step: '05',
      name: 'Human-in-the-Loop Safety Gate',
      badge: 'Interruption',
      formula: '\\text{State} = \\text{Pause} \\iff \\text{RiskScore}(a_t) > \\theta',
      summary: 'Strict deterministic gates requiring human confirmation before irreversible operations or deployments.'
    },
    {
      step: '06',
      name: 'Episodic Memory Consolidation',
      badge: 'State Synthesis',
      formula: 'M_{t+1} = M_t \\cup \\text{Summarize}(\\tau_{1:T})',
      summary: 'Consolidates key lessons and trajectory checkpoints into long-term vector memory for future reuse.'
    }
  ];

  const PILLARS = [
    {
      num: '01',
      name: 'ReAct Loop Transparency',
      tagline: 'Visible Thought-Action-Observation chains.',
      desc: 'Black-box agents act unpredictably. ReAct makes every intermediate reasoning token, tool call payload, and return value auditable in real time.'
    },
    {
      num: '02',
      name: 'Pydantic-Enforced Tool Schemas',
      tagline: 'Type-safe parameter dispatchers.',
      desc: 'LLMs often hallucinate invalid arguments. GenAIMentor validates all tool calls against strict schemas before execution, preventing runtime failures.'
    },
    {
      num: '03',
      name: 'Deterministic Safety Circuits',
      tagline: 'Infinite loop prevention & token budgets.',
      desc: 'Strict circuit breakers enforce max recursion depths, token consumption ceilings, and tool rate limits to guarantee cost and execution safety.'
    },
    {
      num: '04',
      name: 'Multi-Agent Consensus Protocols',
      tagline: 'Specialist collaboration and peer review.',
      desc: 'Separates Planner, Coder, and Critic roles. The Critic agent must approve generated artifacts before execution proceeds to the next stage.'
    },
    {
      num: '05',
      name: 'Vector Episodic Memory',
      tagline: 'Context preservation across long horizons.',
      desc: 'Combines sliding-window short-term context with dense vector memory lookup to retrieve past solutions without blowing LLM context budgets.'
    },
    {
      num: '06',
      name: 'Human-in-the-Loop Interruption',
      tagline: 'Zero unapproved side-effects.',
      desc: 'Critical actions like deleting files, executing shell scripts, or deploying models trigger deterministic approval gates requiring explicit operator sign-off.'
    }
  ];

  const FAQS = [
    {
      q: 'What is AgenticAIMentor and when will its studio release?',
      a: 'AgenticAIMentor is TechMentor’s upcoming suite dedicated to autonomous multi-agent pipelines and ReAct loops. While the complete studio canvas is scheduled for Q4 2026, you can join the VIP waitlist, inspect interactive trajectory simulations, and explore our first-principles architecture today.'
    },
    {
      q: 'How does the ReAct framework prevent hallucinated actions?',
      a: 'ReAct (Reasoning + Acting) forces the agent to output an explicit reasoning thought before emitting a tool invocation. By grounding each action in recent observations and validating inputs with Pydantic schemas, hallucinated actions are caught before execution.'
    },
    {
      q: 'What makes Multi-Agent Swarms better than a single complex prompt?',
      a: 'Single prompts often suffer from context overload and lack self-criticism. Multi-agent systems delegate tasks to specialized personas (e.g. Planner, Coder, Data Engineer, Critic) that review each other’s work and reach consensus before returning an answer.'
    },
    {
      q: 'What safety guardrails are built into AgenticAIMentor?',
      a: 'We implement 4 deterministic layers of defense: 1. Strict tool schema validation, 2. Max recursion and token ceilings (infinite loop prevention), 3. Sandboxed execution environments, and 4. Human-in-the-loop interruption gates for sensitive operations.'
    },
    {
      q: 'Can I connect AgenticAIMentor to DataMentor pipelines?',
      a: 'Yes! When released, AgenticAIMentor will be able to orchestrate DataMentor 13-stage pipelines autonomously—running EDA, testing candidate imputers, selecting optimal features, and training models with full audit trails.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans antialiased overflow-x-hidden relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-amber-500/15 via-orange-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] bg-amber-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[65%] -right-60 w-[600px] h-[600px] bg-orange-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="agenticaimentor" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Announcement Pill */}
        <div 
          onClick={() => scrollToSection('features')}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/25 text-xs text-slate-300 shadow-sm mb-6 backdrop-blur hover:border-amber-500/50 transition-colors cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold text-white">Suite 04: Autonomous Multi-Agent Studio</span>
          <span className="text-slate-600">•</span>
          <span className="text-amber-400 font-medium">ReAct Loops & Tool Orchestration</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Don’t just prompt LLMs.{' '}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
            Architect autonomous agents with reflection.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          <strong className="text-slate-200 font-semibold">AgenticAIMentor</strong> empowers you to build goal-directed, self-correcting agent swarms. Master ReAct thought-action cycles, type-safe tool calling, dynamic planning DAGs, and human-in-the-loop safety circuits.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={launchTarget}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Explore Upcoming Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => scrollToSection('interactive-demo')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 backdrop-blur"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>Live Interactive ReAct Sandbox</span>
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
            <CheckCircle2 className="w-4 h-4 text-amber-400" /> ReAct Thought-Action Loops
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-orange-400" /> Human-in-the-Loop Safety Gates
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" /> Pydantic-Validated Tools
          </span>
          <span className="flex items-center gap-1.5">
            <Repeat className="w-4 h-4 text-emerald-400" /> Self-Reflection & Correction
          </span>
        </div>
      </section>

      {/* SECTION: Features */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="amber" className="mb-3">Architectural Pillars</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Deterministic Autonomous Workflows
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Move beyond single prompts to resilient, self-governing multi-agent systems with complete telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">ReAct Execution Loops</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Interleaves explicit chain-of-thought reasoning with deterministic tool invocations and live environment observations for verifiable problem-solving.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Pydantic Tool Calling</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Every tool parameter is strictly validated before invocation, preventing runtime crashes and catching hallucinated arguments instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Hierarchical Task Planning</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Decomposes complex, ambiguous prompts into directed acyclic graphs (DAGs) of ordered subtasks with dynamic replanning upon unexpected outcomes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-4">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Critic & Reflection Engine</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Dedicated Critic agents review generated code and data artifacts against strict leakage and quality heuristics before allowing the pipeline to proceed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Vector Episodic Memory</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Consolidates past solutions and conversation trajectories into semantic vector indexes for instant recall across long-horizon workflows.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Human-in-the-Loop Safeguards</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Non-negotiable interruption gates for sensitive operations (file writes, cloud deployments, code execution) requiring explicit human approval.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Interactive Sandbox */}
      <section id="interactive-demo" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Interactive Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Inspect a Live Multi-Agent Trajectory
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Step through an authentic autonomous agent trajectory from task decomposition to tool invocation, reflection, and human gate approval.
            </p>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-amber-400 hidden sm:inline">Agentic_ReAct_Simulator v1.8</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTrajectoryStep(0)}
                  title="Reset Trajectory"
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-amber-400 transition-all text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Stepper Header */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                {AGENT_TRAJECTORY.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTrajectoryStep(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      activeTrajectoryStep === idx
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Step {s.step}: {s.role.split(':')[0]}
                  </button>
                ))}
              </div>

              {/* Trajectory Card */}
              {(() => {
                const cur = AGENT_TRAJECTORY[activeTrajectoryStep];
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {cur.role}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Phase: {cur.phase}</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {cur.status}
                      </span>
                    </div>

                    {/* Thought */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wide block">
                        🧠 Chain-of-Thought Reasoning
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        "{cur.thought}"
                      </p>
                    </div>

                    {/* Action */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 font-mono text-xs text-amber-300 space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block">
                        ⚡ Tool Action Dispatched
                      </span>
                      <pre className="whitespace-pre-wrap">{cur.action}</pre>
                    </div>

                    {/* Observation */}
                    {cur.observation && (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                        <span className="text-[10px] text-emerald-400 uppercase font-sans font-bold block">
                          👁️ Environment Observation Received
                        </span>
                        <p>{cur.observation}</p>
                      </div>
                    )}

                    {/* Stepper Next/Prev buttons */}
                    <div className="flex justify-between pt-2">
                      <button
                        onClick={() => setActiveTrajectoryStep(Math.max(0, activeTrajectoryStep - 1))}
                        disabled={activeTrajectoryStep === 0}
                        className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 text-xs text-slate-300 hover:text-white"
                      >
                        ← Previous Step
                      </button>
                      <button
                        onClick={() => setActiveTrajectoryStep(Math.min(AGENT_TRAJECTORY.length - 1, activeTrajectoryStep + 1))}
                        disabled={activeTrajectoryStep === AGENT_TRAJECTORY.length - 1}
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs"
                      >
                        Next Step →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: 7 Explainability Pillars */}
      <section id="pillars" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="amber" className="mb-3">Our Core Doctrine</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            "Automate the Agency, But Audit the Intent."
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Every autonomous loop in AgenticAIMentor is constrained by our 7-layer explainability and safety framework.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.num}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-amber-400/40 group-hover:text-amber-400 transition-colors">
                    {pillar.num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-amber-300 font-mono">
                    Pillar {pillar.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {pillar.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-[11px] text-slate-300 font-mono">
                <span className="text-amber-400 block text-[10px] uppercase font-bold mb-0.5">Audited & Verified:</span>
                100% Deterministic Schema Dispatch
              </div>
            </div>
          ))}

          {/* 7th Wide Card */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xl font-bold text-amber-400">07. Production Standards & Benchmarking</span>
                <Badge variant="amber">Safety Benchmarks</Badge>
              </div>
              <h3 className="text-xl font-bold text-white">SWE-Bench & GAIA Production Standards</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                We prepare you for enterprise agent architectures with strict benchmarking against SWE-Bench coding standards, tool accuracy metrics, and loop termination guarantees.
              </p>
            </div>
            <button
              onClick={launchTarget}
              className="shrink-0 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Explore Upcoming Studio →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: Pipeline Roadmap */}
      <section id="pipeline" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="amber" className="mb-3">Complete Workflow</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              The 6-Stage Agentic Lifecycle
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Explore how goals are converted into verified autonomous executions with complete safety boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AGENT_PIPELINE.map((stage) => (
              <div
                key={stage.step}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-amber-400">Step {stage.step}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-amber-300 font-mono border border-slate-800">
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
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
                  <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
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
            <Badge variant="amber">Socratic Agent Mentorship</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              An AI Tutor That Demystifies Autonomous Reasoning
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Curious why an agent chose a specific tool or how to break an infinite reasoning loop? <strong className="text-amber-300 font-semibold">Menti.AI</strong> explains the state trajectory, tool parameter derivations, and consensus votes step-by-step.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">ReAct Telemetry Inspection</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Understand how the model derived its intermediate reasoning tokens.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Self-Correction Diagnostics</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Learn how Critic agents detect data leakage and syntax bugs before execution.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={launchTarget}
                className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xl shadow-amber-500/25 inline-flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                <span>Explore Upcoming Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-amber-500/30 shadow-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Agentic Socratic Console</h4>
                  <p className="text-[11px] text-slate-400">Context: Loan Default Classifier Trajectory</p>
                </div>
              </div>
              <Badge variant="amber">Trajectory Audit</Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Why did the Critic agent pause execution at Step 4?
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 font-mono">
                  Leakage Guard
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "The Data Specialist agent attempted to compute correlation across all 2,400 rows prior to train-test splitting. The Critic agent intercepted this action because fitting statistics on the entire dataset leaks target information into feature space. It forced a replan to fit only on X_train (1,680 rows)."
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 font-mono text-[11px] text-amber-300 overflow-x-auto whitespace-pre">
                GuardrailTriggered: PRE_SPLIT_TRANSFORMATION_BLOCKED (0% Leakage)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: First-Principles Comparison */}
      <section id="comparison" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="amber" className="mb-3">Feature Comparison</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Engineers Choose AgenticAIMentor
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Compare how AgenticAIMentor redefines autonomous workflows against fragile wrapper scripts and unmonitored agent loops.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-300">Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-amber-400 bg-amber-500/10 border-x border-amber-500/20">
                    AgenticAIMentor 🤖
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Fragile Framework Wrappers</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Raw Prompt Loops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-855">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Full ReAct Telemetry Inspection</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-400 bg-amber-500/10 border-x border-amber-500/20">
                    ✅ Step-by-Step Visible
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">⚠️ Hidden in verbose CLI logs</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ None</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Pydantic Type-Safe Tool Calling</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-400 bg-amber-500/10 border-x border-amber-500/20">
                    ✅ Guaranteed Schema Matching
                  </td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Partial support</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ High syntax error rate</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Dedicated Critic & Reflection Agent</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-400 bg-amber-500/10 border-x border-amber-500/20">
                    ✅ Built-in Peer Review
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Requires complex wiring</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ None</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Deterministic Human-in-the-Loop Gates</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-400 bg-amber-500/10 border-x border-amber-500/20">
                    ✅ Zero Unapproved Writes
                  </td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Ad-hoc callbacks</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Uncontrolled execution</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Infinite Loop Prevention Circuits</td>
                  <td className="p-4 sm:p-5 font-bold text-amber-400 bg-amber-500/10 border-x border-amber-500/20">
                    ✅ Depth & Token Guardrails
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Runaway token bills</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Easy recursion death-loops</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ Accordion */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="amber" className="mb-3">Got Questions?</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Everything you need to know about AgenticAIMentor and autonomous multi-agent pipelines.
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
                  <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
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
          <div className="relative rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 border border-amber-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Build Autonomous Multi-Agent Workflows?
            </h2>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              Explore the upcoming studio roadmap, join the priority developer waitlist, and master ReAct loops today.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={launchTarget}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span>Explore Upcoming Studio</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate && onNavigate('landing')}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5 text-amber-400" />
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
          className="fixed bottom-6 right-24 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-amber-500 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-slate-950 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          title="Scroll Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default AgenticAIMentorLandingPage;
