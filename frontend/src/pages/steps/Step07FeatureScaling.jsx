import React from 'react';
import { 
  Sliders, 
  TrendingUp, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Layers,
  Table,
  Cpu
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import TransformationWorkspace from '../TransformationWorkspace';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';

export const Step07FeatureScaling = () => {
  const { activeDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();

  const handleScalingApplied = () => {
    updateStepStatus('scaling', STEP_STATUSES.APPLIED);
    updateStepStatus('dimensionality', STEP_STATUSES.AVAILABLE);
  };

  const learnContent = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Understanding Feature Scaling & Normalization</h3>
            <p className="text-xs text-slate-400">Step 07 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Features measured in different units (e.g. Age in $[0, 100]$ vs Annual Income in $[20000, 500000]$) distort distance metrics and gradient descent updates. 
          Without scaling, gradient descent steps oscillate violently in high-magnitude dimensions while making negligible progress along low-magnitude dimensions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Scaler Formulations
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>StandardScaler (Z-Score):</strong> z = (x - μ) / σ. Centers distribution at mean 0 with unit variance 1.</li>
              <li><strong>MinMaxScaler:</strong> x' = (x - min) / (max - min). Bounds data within [0, 1]. Sensitive to extreme outliers.</li>
              <li><strong>RobustScaler:</strong> x' = (x - median) / IQR. Uses median and interquartile range, rendering it immune to extreme anomalies.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Algorithm Sensitivity Matrix
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Highly Sensitive (Requires Scaling):</strong> KNN, SVM, PCA, Neural Networks, Ridge/Lasso Regularized Regression.</li>
              <li><strong>Scale Invariant (No Scaling Needed):</strong> Decision Trees, Random Forests, Gradient Boosted Trees (XGBoost, LightGBM).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <StepContainer
      stepId="scaling"
      title="07 Feature Scaling"
      subtitle="Standardize or normalize continuous numerical features via StandardScaler, MinMaxScaler, RobustScaler, or Power Transforms."
      icon={Sliders}
      conceptId="feature_scaling"
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
            <TransformationWorkspace 
              datasetId={activeDataset.dataset_id} 
              onApplied={handleScalingApplied}
            />

            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleScalingApplied();
                  goToStep('dimensionality');
                }}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <span>Proceed to 08. Dimensionality Reduction</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step07FeatureScaling;
