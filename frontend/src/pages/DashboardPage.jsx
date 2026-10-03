import React from 'react';
import MetricCard from '../components/common/MetricCard';
import LearningPrincipleBanner from '../components/learning/LearningPrincipleBanner';
import ExplanationCard from '../components/learning/ExplanationCard';
import Badge from '../components/common/Badge';
import { 
  Database, 
  Layers, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Scissors,
  Award,
  PlayCircle
} from 'lucide-react';
import { useWorkflow, WORKFLOW_STEPS, STEP_STATUSES } from '../state/WorkflowContext';

export const DashboardPage = ({ onNavigate }) => {
  const { stepStates, completedStepsCount, totalSteps } = useWorkflow();

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <LearningPrincipleBanner />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Workflow Stages"
          value="13 Exact Steps"
          subtitle={`${completedStepsCount} of ${totalSteps} Completed`}
          icon={Layers}
          color="brand"
        />
        <MetricCard
          title="Dual Experience"
          value="Process + Learn"
          subtitle="Interactive pedagogical mode"
          icon={BookOpen}
          color="purple"
        />
        <MetricCard
          title="Leakage Safety"
          value="Zero Leakage"
          subtitle="Strict test set isolation"
          icon={ShieldCheck}
          color="blue"
        />
        <MetricCard
          title="Snapshot Safety"
          value="Immutable"
          subtitle="Version rollback & recovery"
          icon={Cpu}
          color="amber"
        />
      </div>

      {/* Two Column Layout: Explainability Preview & 13-Step Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Explainability Standard Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Pedagogical Framework</h2>
              <p className="text-xs text-slate-400">
                How every transformation presents its algorithmic rationale to students & practitioners
              </p>
            </div>
            <Badge variant="purple">Dual-Mode Standard</Badge>
          </div>

          <ExplanationCard />
        </div>

        {/* Right: Exact 13-Step Machine Learning Lifecycle */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">13-Step Machine Learning Lifecycle</h2>
            <span className="text-xs text-brand-400 font-mono font-bold">
              {Math.round((completedStepsCount / totalSteps) * 100)}% Complete
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {WORKFLOW_STEPS.map((step) => {
              const status = stepStates[step.id] || STEP_STATUSES.AVAILABLE;
              const isCompleted = status === STEP_STATUSES.APPLIED || status === STEP_STATUSES.VALIDATED;

              return (
                <div
                  key={step.id}
                  onClick={() => onNavigate && onNavigate(step.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                    isCompleted
                      ? 'bg-brand-950/20 border-brand-500/30 hover:border-brand-500/60'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-brand-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-brand-400">
                      {step.code}
                    </span>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-brand-400 transition-colors">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">{step.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isCompleted ? (
                      <span className="text-[10px] font-bold text-brand-400 px-2 py-0.5 rounded bg-brand-950/60 border border-brand-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400 transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
