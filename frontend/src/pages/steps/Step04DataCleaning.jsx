import React from 'react';
import { 
  Sparkles, 
  Trash2, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  Table,
  Cpu
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import CleaningView from '../../components/cleaning/CleaningView';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';

export const Step04DataCleaning = () => {
  const { activeDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();

  const handleCleaningApplied = () => {
    updateStepStatus('cleaning', STEP_STATUSES.APPLIED);
    updateStepStatus('outliers', STEP_STATUSES.AVAILABLE);
  };

  const learnContent = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Understanding Data Cleaning & Missing Data Mechanisms</h3>
            <p className="text-xs text-slate-400">Step 04 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Real-world data is inherently messy, containing nulls, typographical errors, duplicate observations, and corrupted entries. 
          Proper data cleaning handles these flaws safely without corrupting statistical distributions or introducing data leakage.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Missingness Mechanisms (Donald Rubin)
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>MCAR (Missing Completely at Random):</strong> Missingness is totally independent of observed or unobserved data. Safe for listwise deletion or mean imputation.</li>
              <li><strong>MAR (Missing at Random):</strong> Missingness depends on observed features (e.g. younger people omitting income). Solved via model-based imputation.</li>
              <li><strong>MNAR (Missing Not at Random):</strong> Missingness relates directly to the unobserved value (e.g. extreme high earners skipping salary questions). Requires indicator flags.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Imputation Strategy Tradeoffs
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Mean Imputation:</strong> Preserves mean but severely shrinks sample variance and distorts correlation.</li>
              <li><strong>Median Imputation:</strong> Highly robust to outliers; ideal for skewed distributions (e.g. income).</li>
              <li><strong>Mode Imputation:</strong> Mandatory standard for categorical or discrete status columns.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <StepContainer
      stepId="cleaning"
      title="04 Data Cleaning"
      subtitle="Detect missing values, apply intelligent imputations, remove duplicates, and resolve type conflicts."
      icon={Sparkles}
      conceptId="missing_values"
      learnContent={learnContent}
    >
      <div className="space-y-6">
        {!activeDataset ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <Table className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Dataset Ingested</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please ingest or select a dataset in Step 01 first.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <CleaningView 
              activeDataset={activeDataset}
              datasetId={activeDataset.dataset_id} 
              onApplied={handleCleaningApplied}
              onNavigateToProfiling={() => goToStep('eda')}
              onNavigateToStage={(stg) => goToStep(stg)}
            />

            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleCleaningApplied();
                  goToStep('outliers');
                }}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <span>Proceed to 05. Outlier Detection</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step04DataCleaning;
