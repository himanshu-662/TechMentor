import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  HelpCircle, 
  AlertCircle, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Table,
  ArrowRight
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import ProfilingView from '../../components/profiling/ProfilingView';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';

export const Step03EDA = () => {
  const { activeDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();

  const handleProfilingComplete = () => {
    updateStepStatus('eda', STEP_STATUSES.APPLIED);
    updateStepStatus('cleaning', STEP_STATUSES.AVAILABLE);
  };

  const learnContent = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Understanding Exploratory Data Analysis (EDA)</h3>
            <p className="text-xs text-slate-400">Step 03 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Exploratory Data Analysis is the critical diagnostic phase pioneered by John Tukey. Rather than fitting models blind, 
          EDA employs summary statistics, numerical moments, and visual distributions to uncover underlying patterns, test hypotheses, spot anomalies, and check assumptions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Statistical Moments & Measures
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>1st Moment (Mean / Center):</strong> Expected central value; sensitive to severe outliers.</li>
              <li><strong>2nd Moment (Variance / Spread):</strong> Measure of dispersion around the mean ($\sigma^2$).</li>
              <li><strong>3rd Moment (Skewness):</strong> Measure of asymmetry. Positive skew has a long right tail.</li>
              <li><strong>4th Moment (Kurtosis):</strong> Measure of tailedness and propensity for extreme outlier occurrences.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Key EDA Heuristics
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Pearson Correlation ($r$):</strong> Evaluates linear relationships ($-1 \le r \le +1$).</li>
              <li><strong>Anscombe's Quartet:</strong> Demonstrates why visual plotting is essential alongside summary numbers.</li>
              <li><strong>Cardinality Check:</strong> Detect IDs vs true categorical predictors.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <StepContainer
      stepId="eda"
      title="03 EDA Process"
      subtitle="Statistical profiling, moments analysis, correlation matrix, skewness inspection, and distribution histograms."
      icon={BarChart2}
      conceptId="skewness"
      learnContent={learnContent}
    >
      <div className="space-y-6">
        {!activeDataset ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <Table className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Dataset Ingested</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please ingest or select a dataset in Step 01 first to view automated profiling and diagnostics.
            </p>
            <button
              onClick={() => goToStep('collection')}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 transition-all shadow-md mt-2"
            >
              <span>Go to 01. Data Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <ProfilingView activeDataset={activeDataset} datasetId={activeDataset.dataset_id} />

            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleProfilingComplete();
                  goToStep('cleaning');
                }}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <span>Complete EDA & Proceed to 04. Data Cleaning</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step03EDA;
