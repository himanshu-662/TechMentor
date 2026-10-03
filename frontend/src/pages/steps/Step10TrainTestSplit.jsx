import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Table, 
  Layers, 
  PieChart, 
  ShieldCheck,
  RefreshCw,
  Cpu,
  Info,
  Sliders,
  GitFork
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import Badge from '../../components/common/Badge';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';
import splitService from '../../services/splitService';
import TrainTestSplitLearningCard from '../../components/split/TrainTestSplitLearningCard';
import SplitDistributionChart from '../../components/split/SplitDistributionChart';

export const Step10TrainTestSplit = () => {
  const { activeDataset, updateStepStatus, nextStep, goToStep, setStepMode } = useWorkflow();
  const datasetId = activeDataset?.dataset_id;

  const [summary, setSummary] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [targetColumn, setTargetColumn] = useState('');
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [stratify, setStratify] = useState(true);
  const [loading, setLoading] = useState(false);
  const [splitResult, setSplitResult] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('distribution'); // 'distribution' | 'samples'

  useEffect(() => {
    if (datasetId) {
      loadSummaryAndTargets();
    }
  }, [datasetId]);

  const loadSummaryAndTargets = async () => {
    setError(null);
    const res = await splitService.getSummary(datasetId);
    if (res.data) {
      setSummary(res.data);
      const targets = res.data.potential_target_columns || [];
      setAvailableColumns(targets);
      if (res.data.recommended_target) {
        setTargetColumn(res.data.recommended_target);
      } else if (targets.length > 0) {
        setTargetColumn(targets[0]);
      }
      setStratify(res.data.recommended_stratify ?? true);
      setTestSize(res.data.recommended_test_size ?? 0.2);
    } else if (res.error) {
      setError(res.error);
    }
  };

  const handleExecuteSplit = async () => {
    if (!targetColumn) {
      setError('Please select a target variable column.');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await splitService.executeSplit(datasetId, {
      target_column: targetColumn,
      test_size: parseFloat(testSize),
      random_state: parseInt(randomState, 10),
      stratify
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSplitResult(res.data);
      setSuccessMessage(res.data.message);
      updateStepStatus('split', STEP_STATUSES.APPLIED);
      updateStepStatus('fitting', STEP_STATUSES.AVAILABLE);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Open in process mode consistent with other workflow steps
    setStepMode('process');
  }, [setStepMode]);

  return (
    <StepContainer
      stepId="split"
      title="10 Train-Test Split"
      subtitle="Partition feature matrices into strictly isolated training and testing folds to prevent data leakage."
      icon={Scissors}
      conceptId="train_test_split"
      learnContent={
        <div className="space-y-6">
          <TrainTestSplitLearningCard targetType={splitResult?.target_type || "classification"} />
        </div>
      }
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
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-red-200 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-brand-900/20 border border-brand-700/50 rounded-xl text-brand-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  onClick={nextStep}
                  className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                >
                  <span>Go to 11. Model Fitting</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Split Studio 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Partition Config Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    Partition Controls
                  </h3>
                  {summary && (
                    <Badge variant="slate">{summary.total_rows.toLocaleString()} rows</Badge>
                  )}
                </div>

                {/* Target Column Selection */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                    <span>Target Variable (y)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Prediction goal</span>
                  </label>
                  <select
                    value={targetColumn}
                    onChange={(e) => setTargetColumn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  >
                    {availableColumns.length > 0 ? (
                      availableColumns.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))
                    ) : (
                      <option value="">No candidate target found</option>
                    )}
                  </select>
                </div>

                {/* Test Size Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Test Fold Ratio</span>
                    <span className="text-purple-400 font-mono font-bold">
                      {Math.round((1 - testSize) * 100)}% Train / {Math.round(testSize * 100)}% Test
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.40"
                    step="0.05"
                    value={testSize}
                    onChange={(e) => setTestSize(parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>90% Train / 10% Test</span>
                    <span>60% Train / 40% Test</span>
                  </div>
                </div>

                {/* Random State Input */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                    <span>Random Seed</span>
                    <span className="text-[10px] text-slate-500 font-mono">Reproducibility</span>
                  </label>
                  <input
                    type="number"
                    value={randomState}
                    onChange={(e) => setRandomState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                {/* Stratification Checkbox */}
                <div className="pt-2 border-t border-slate-800 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="stratifyCheck"
                    checked={stratify}
                    onChange={(e) => setStratify(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="stratifyCheck" className="text-xs text-slate-300 cursor-pointer leading-relaxed">
                    <strong>Stratified Sampling:</strong> Preserves equal class ratio across splits (Crucial for imbalanced classification).
                  </label>
                </div>

                {/* Execute Button */}
                <button
                  onClick={handleExecuteSplit}
                  disabled={loading || !targetColumn}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-40"
                >
                  <Scissors className="w-4 h-4" />
                  <span>{loading ? 'Partitioning Dataset...' : 'Execute Isolated Split'}</span>
                </button>
              </div>

              {/* Right Column: Visualization & Results */}
              <div className="lg:col-span-2 space-y-6">
                {splitResult ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 animate-fadeIn">
                    {/* Results Tab Bar */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveTab('distribution')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            activeTab === 'distribution'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <PieChart className="w-3.5 h-3.5" />
                          <span>Distribution Breakdown</span>
                        </button>
                        <button
                          onClick={() => setActiveTab('samples')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            activeTab === 'samples'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Table className="w-3.5 h-3.5" />
                          <span>Partition Sample Records</span>
                        </button>
                      </div>

                      <Badge variant="purple">
                        Task: {splitResult.target_type}
                      </Badge>
                    </div>

                    {/* Tab 1: Partition Breakdown & Charts */}
                    {activeTab === 'distribution' && (
                      <SplitDistributionChart splitResult={splitResult} />
                    )}

                    {/* Tab 2: Sample Rows Preview */}
                    {activeTab === 'samples' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Inspection rows previewing partition attribution:</span>
                          <span className="font-mono text-purple-400">Target: {splitResult.target_column}</span>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
                              <tr>
                                <th className="py-2.5 px-3">Partition</th>
                                <th className="py-2.5 px-3">Index</th>
                                <th className="py-2.5 px-3">Sample Features</th>
                                <th className="py-2.5 px-3 text-brand-400">Target ($y$)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                              {splitResult.sample_rows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-900/40">
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      row.split_type === 'train' 
                                        ? 'bg-blue-950 text-blue-400 border border-blue-500/20' 
                                        : 'bg-purple-950 text-purple-400 border border-purple-500/20'
                                    }`}>
                                      {row.split_type.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500">#{row.index}</td>
                                  <td className="py-2.5 px-3">
                                    {Object.entries(row.features).slice(0, 4).map(([k, v]) => (
                                      <span key={k} className="mr-3 text-slate-400">
                                        {k}: <strong className="text-slate-200">{String(v)}</strong>
                                      </span>
                                    ))}
                                  </td>
                                  <td className="py-2.5 px-3 font-bold text-brand-400">
                                    {String(row.target_value)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Safeguards Summary */}
                    {splitResult.leakage_safeguards?.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                          Partition Isolation Guarantees
                        </span>
                        <ul className="text-xs text-slate-400 space-y-1">
                          {splitResult.leakage_safeguards.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                    <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Leakage Prevention Partitioning</h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Choose your target prediction column, configure train/test split ratios, and execute the partition to establish isolated folds for Step 11 Model Fitting.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  updateStepStatus('split', STEP_STATUSES.APPLIED);
                  goToStep('fitting');
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <span>Proceed to 11. Model Fitting</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step10TrainTestSplit;
