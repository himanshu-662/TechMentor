import React from 'react';
import { 
  Layers, 
  FileSpreadsheet, 
  HardDrive, 
  Table, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Cpu,
  ArrowRight
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import DatasetOverview from '../../components/datasets/DatasetOverview';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';

export const Step02DataLoading = () => {
  const { activeDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();

  const handleValidationComplete = () => {
    updateStepStatus('loading', STEP_STATUSES.APPLIED);
    updateStepStatus('eda', STEP_STATUSES.AVAILABLE);
  };

  const learnContent = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Understanding Data Loading & In-Memory DataFrames</h3>
            <p className="text-xs text-slate-400">Step 02 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Data loading parses raw bytes from storage disks or network streams and constructs structured, columnar in-memory data structures (such as Pandas DataFrames or Apache Arrow Tables). 
          During this stage, automatic schema inference establishes types (integer, float, categorical string, boolean, datetime) and reserves contiguous memory buffers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Memory & Typed Column Layouts
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Primitive Numeric Types:</strong> `int64`, `float64` utilize contiguous 8-byte C-arrays enabling SIMD vectorized execution.</li>
              <li><strong>Categorical Types:</strong> Categoricals replace redundant repeated strings with integer code pointers, reducing RAM by up to 80%.</li>
              <li><strong>Schema Validation:</strong> Ensures expected columns exist before executing downstream transformation pipelines.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Common Data Loading Failures
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Mixed Types in Columns:</strong> Numbers stored alongside text representations (e.g., "$1,200" or "N/A").</li>
              <li><strong>Out of Memory (OOM):</strong> Loading multi-gigabyte datasets without chunking or columnar memory mapping.</li>
              <li><strong>Encoding Mismatches:</strong> UTF-8 vs ISO-8859-1 character corruption.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <StepContainer
      stepId="loading"
      title="02 Data Loading"
      subtitle="Parse tabular streams, infer data types, calculate memory footprint, and inspect in-memory DataFrame schema."
      icon={Layers}
      conceptId="data_type"
      learnContent={learnContent}
    >
      <div className="space-y-6">
        {!activeDataset ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <Table className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Dataset Ingested</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please return to Step 01 (Data Collection) to upload or select a dataset first.
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
            <DatasetOverview 
              dataset={activeDataset} 
              onReset={() => goToStep('collection')}
              onNavigate={(stage) => {
                handleValidationComplete();
                goToStep(stage);
              }}
              onDataValidated={handleValidationComplete}
            />

            <div className="flex justify-end">
              <button
                onClick={() => {
                  handleValidationComplete();
                  goToStep('eda');
                }}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <span>Confirm Schema & Proceed to 03. EDA Process</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step02DataLoading;
