import React from 'react';
import { 
  BookOpen, 
  Cpu, 
  ArrowLeft, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import Badge from '../common/Badge';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';

const STATUS_BADGES = {
  [STEP_STATUSES.LOCKED]: { variant: 'slate', label: 'Locked' },
  [STEP_STATUSES.AVAILABLE]: { variant: 'blue', label: 'Ready' },
  [STEP_STATUSES.ANALYZING]: { variant: 'amber', label: 'Analyzing' },
  [STEP_STATUSES.RECOMMENDATION_READY]: { variant: 'brand', label: 'Recommendation Ready' },
  [STEP_STATUSES.APPLIED]: { variant: 'brand', label: 'Completed' },
  [STEP_STATUSES.VALIDATED]: { variant: 'brand', label: 'Validated' }
};

export const StepContainer = ({
  stepId,
  title,
  subtitle,
  icon: Icon,
  conceptId,
  children,
  learnContent,
  onNext,
  onPrev,
  statusOverride
}) => {
  const { 
    steps, 
    currentStepId, 
    stepStates, 
    stepMode, 
    setStepMode, 
    openConceptModal,
    nextStep,
    prevStep
  } = useWorkflow();

  const currentStep = steps.find(s => s.id === stepId) || {};
  const currentStatus = statusOverride || stepStates[stepId] || STEP_STATUSES.AVAILABLE;
  const statusBadge = STATUS_BADGES[currentStatus] || { variant: 'slate', label: currentStatus };

  const activeConcept = conceptId || currentStep.educationalConceptId;

  const stepCode = currentStep.code || (currentStep.stepNumber ? String(currentStep.stepNumber).padStart(2, '0') : '');
  const rawTitle = title || currentStep.title || currentStep.name || '';
  let displayTitle = rawTitle;
  if (stepCode) {
    if (!rawTitle.startsWith(`${stepCode}.`) && !rawTitle.startsWith(`${stepCode} `)) {
      displayTitle = `${stepCode}. ${rawTitle}`;
    } else if (rawTitle.startsWith(`${stepCode} `)) {
      displayTitle = rawTitle.replace(`${stepCode} `, `${stepCode}. `);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0 shadow-inner">
              {Icon ? <Icon className="w-6 h-6" /> : <Layers className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold font-mono text-brand-400 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-500/20">
                  Step {stepCode ? `${stepCode}.` : ''} of 13
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {displayTitle}
                </h1>
                <Badge variant={statusBadge.variant}>
                  {statusBadge.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {subtitle || currentStep.description}
              </p>
            </div>
          </div>

          {/* Actions & Dual-Mode Toggle */}
          <div className="flex items-center gap-3 self-start lg:self-auto">
            {/* Learn Concept Button */}
            {activeConcept && (
              <button
                onClick={() => openConceptModal(activeConcept)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Open Educational Concept Guide"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Concept Guide</span>
              </button>
            )}

            {/* PROCESS vs LEARN Mode Switcher */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setStepMode('process')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  stepMode === 'process'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-950/40 ring-1 ring-brand-400/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className={`w-3.5 h-3.5 ${stepMode === 'process' ? 'text-brand-100' : 'text-slate-400'}`} />
                <span>PROCESS MODE</span>
              </button>

              <button
                onClick={() => setStepMode('learn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  stepMode === 'learn'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>LEARN MODE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Progress Strip */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Workflow Category: <strong className="text-slate-300">{currentStep.category}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev || prevStep}
              disabled={currentStep.stepNumber <= 1}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Previous</span>
            </button>
            <button
              onClick={onNext || nextStep}
              disabled={currentStep.stepNumber >= 13}
              className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Mode View */}
      {stepMode === 'process' ? (
        <div className="animate-fadeIn">
          {children}
        </div>
      ) : (
        <div className="animate-fadeIn space-y-4">
          {learnContent ? (
            learnContent
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-purple-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Pedagogical Learning Breakdown</h3>
              <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                Learn the statistical foundations, mathematical formulas, and algorithmic tradeoffs of {title || currentStep.title}.
              </p>
              {activeConcept && (
                <button
                  onClick={() => openConceptModal(activeConcept)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs inline-flex items-center gap-2 transition-colors shadow-md mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Deep Concept Visualizer</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepContainer;
