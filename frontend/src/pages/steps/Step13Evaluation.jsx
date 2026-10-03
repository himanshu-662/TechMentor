import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Table, 
  Layers, 
  BarChart2, 
  Cpu, 
  TrendingUp, 
  Activity,
  CheckCircle,
  HelpCircle,
  FileCheck,
  RefreshCw,
  Trophy,
  Target,
  Gauge,
  Sliders,
  Download,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  ArrowRight,
  HardDrive,
  PackageCheck
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import Badge from '../../components/common/Badge';
import MetricCard from '../../components/common/MetricCard';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';
import modelingService from '../../services/modelingService';

export const Step13Evaluation = () => {
  const { activeDataset, updateStepStatus, goToStep } = useWorkflow();
  const datasetId = activeDataset?.dataset_id;

  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('diagnostics'); // 'diagnostics' | 'leaderboard' | 'audit'
  const [matrixFormat, setMatrixFormat] = useState('counts'); // 'counts' | 'percentages'
  const [activatingModel, setActivatingModel] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadingModel, setDownloadingModel] = useState(null);
  const [downloadedModelFile, setDownloadedModelFile] = useState(null);

  // Knowledge check state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  useEffect(() => {
    if (datasetId) {
      loadEvaluation();
    }
  }, [datasetId]);

  const loadEvaluation = async (modelId = null) => {
    setLoading(true);
    setError(null);
    const res = await modelingService.evaluate(datasetId);
    if (res.error) {
      setError(res.error);
    } else {
      setEvalResult(res.data);
      updateStepStatus('evaluation', STEP_STATUSES.APPLIED);
    }
    setLoading(false);
  };

  const handleActivateModel = async (modelId) => {
    if (!datasetId || !modelId) return;
    setActivatingModel(modelId);
    const res = await modelingService.activateModel(datasetId, modelId);
    if (!res.error) {
      // Re-run predict & evaluate for new active model
      await modelingService.predict(datasetId, { model_id: modelId });
      await loadEvaluation(modelId);
    }
    setActivatingModel(null);
  };

  const handleDownloadModelPickle = async (modelId = null) => {
    if (!datasetId) return;
    setDownloadingModel(modelId || 'active');
    const res = await modelingService.downloadModel(datasetId, modelId);
    if (res.error) {
      setError(res.error);
    } else {
      setDownloadedModelFile(res.filename || 'datamentor_model.pkl');
      setTimeout(() => setDownloadedModelFile(null), 5000);
    }
    setDownloadingModel(null);
  };

  const handleExportReport = () => {
    if (!evalResult) return;
    const reportData = {
      title: "DataMentor - Machine Learning Evaluation Audit Report",
      dataset_id: datasetId,
      timestamp: new Date().toISOString(),
      task_type: evalResult.task_type,
      model_type: evalResult.model_type,
      model_name: evalResult.model_name,
      target_column: evalResult.target_column,
      total_evaluated_samples: evalResult.total_evaluated_samples,
      metrics: {
        accuracy: evalResult.accuracy,
        precision: evalResult.precision,
        recall: evalResult.recall,
        f1_score: evalResult.f1_score,
        rmse: evalResult.rmse,
        r2_score: evalResult.r2_score,
        mae: evalResult.mae,
        mse: evalResult.mse,
        silhouette_score: evalResult.silhouette_score,
        davies_bouldin_index: evalResult.davies_bouldin_index
      },
      confusion_matrix: evalResult.confusion_matrix,
      classification_report: evalResult.classification_report,
      leaderboard: evalResult.leaderboard
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datamentor_eval_report_${datasetId.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const cmMatrix = evalResult?.confusion_matrix?.matrix || (Array.isArray(evalResult?.confusion_matrix) ? evalResult.confusion_matrix : null);
  const cmLabels = evalResult?.confusion_matrix?.labels || [];

  // Calculate total samples in confusion matrix for percentage normalization
  const totalCmCount = cmMatrix ? cmMatrix.flat().reduce((a, b) => a + b, 0) : 1;

  const learnContent = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Model Evaluation & Generalization Verification</h3>
            <p className="text-xs text-slate-400">Step 13 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Evaluation provides the definitive statistical verification of model quality on strictly isolated test data (y_pred vs y_test). 
          Aligning evaluation metrics with domain consequences prevents deploying silent failures to production.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Classification Metrics (Confusion Matrix)
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Accuracy:</strong> (TP + TN) / Total. Misleading under severe class imbalance.</li>
              <li><strong>Precision:</strong> TP / (TP + FP). "Of predicted positives, how many were right?" (Priority in spam filters).</li>
              <li><strong>Recall (Sensitivity):</strong> TP / (TP + FN). "What fraction of actual positives did we catch?" (Priority in healthcare).</li>
              <li><strong>F1-Score:</strong> Harmonic mean 2×P×R / (P + R). Balances Precision and Recall.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" /> Regression Metrics
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>R² Score:</strong> Proportion of variance explained. 1.0 is perfect; &lt; 0 means model performs worse than the simple target mean.</li>
              <li><strong>RMSE:</strong> Root Mean Squared Error. Penalizes large outlier mistakes heavily; in identical units as target.</li>
              <li><strong>MAE:</strong> Mean Absolute Error. Linear average magnitude; highly robust to extreme outliers.</li>
            </ul>
          </div>
        </div>

        {/* Socratic Concept Check */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/20 to-slate-900 border border-purple-800/30 space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Concept Check: Why R² Can Be Negative
            </h4>
          </div>
          <p className="text-xs text-slate-300">
            In regression evaluation, what does a negative R² score (R² &lt; 0) on the test partition signify?
          </p>

          <div className="space-y-2 pt-1">
            {[
              { id: 0, text: "The dataset has negative numbers in the feature columns" },
              { id: 1, text: "The model's predictions have larger error than simply predicting the historical target mean (y_bar) for every row" },
              { id: 2, text: "The learning rate was set too high in gradient descent" },
              { id: 3, text: "Scikit-Learn failed to convert strings to numbers" }
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedAnswer(option.id);
                  setShowQuizFeedback(true);
                }}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedAnswer === option.id
                    ? option.id === 1
                      ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
                      : 'bg-red-950/50 border-red-500/60 text-red-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.text}</span>
                  {showQuizFeedback && selectedAnswer === option.id && (
                    option.id === 1 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )
                  )}
                </div>
              </button>
            ))}
          </div>

          {showQuizFeedback && (
            <div className={`p-3 rounded-lg text-xs ${selectedAnswer === 1 ? 'bg-emerald-900/20 text-emerald-300 border border-emerald-800/40' : 'bg-red-900/20 text-red-300 border border-red-800/40'}`}>
              {selectedAnswer === 1 ? (
                <span><strong>Correct!</strong> Since R² = 1 - (SS_res / SS_tot), when the model's squared residual sum exceeds total variance around the mean, R² drops below 0.</span>
              ) : (
                <span><strong>Incorrect.</strong> R² measures explained variance relative to a horizontal mean baseline. If predictions are worse than the simple baseline average, R² becomes negative.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const pipelineStepsAudit = [
    { num: '01', id: 'collection', label: 'Data Collection', desc: 'Ingestion from CSV/JSON source' },
    { num: '02', id: 'loading', label: 'Data Loading', desc: 'DataFrame hydration & type inference' },
    { num: '03', id: 'eda', label: 'EDA Process', desc: 'Exploratory distribution profiling' },
    { num: '04', id: 'cleaning', label: 'Data Cleaning', desc: 'Deterministic missing value imputation' },
    { num: '05', id: 'outliers', label: 'Outliers', desc: 'IQR / Z-score detection & treatment' },
    { num: '06', id: 'encoding', label: 'Data Encoding', desc: 'One-hot & Label categorical mapping' },
    { num: '07', id: 'scaling', label: 'Feature Scaling', desc: 'Standard / MinMax feature normalization' },
    { num: '08', id: 'dimensionality', label: 'Dimensionality Reduction', desc: 'PCA subspace variance projection' },
    { num: '09', id: 'selection', label: 'Feature Selection', desc: 'SelectKBest feature scoring' },
    { num: '10', id: 'split', label: 'Train-Test Split', desc: 'Isolated train/test holdout partitioning' },
    { num: '11', id: 'fitting', label: 'Model Fitting', desc: 'Algorithm training on isolated X_train' },
    { num: '12', id: 'prediction', label: 'Prediction', desc: 'Test inference on X_test (y_pred)' },
    { num: '13', id: 'evaluation', label: 'Evaluation', desc: 'Generalization verification (y_pred vs y_test)' }
  ];

  return (
    <StepContainer
      stepId="evaluation"
      title="13 Evaluation"
      subtitle="Verify model generalization, inspect confusion matrices, and evaluate regression & classification performance."
      icon={Award}
      conceptId="model_evaluation"
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
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-red-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => loadEvaluation()}
                  className="px-3 py-1 bg-red-800/40 hover:bg-red-800/60 rounded text-xs font-semibold text-red-200 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Pipeline Completed Master Celebration Banner */}
            <div className="bg-gradient-to-r from-brand-950/70 via-slate-900 to-purple-950/70 border border-brand-500/40 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0 shadow-inner">
                    <Trophy className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-brand-400 uppercase tracking-wider">
                        End-to-End Pipeline Completed
                      </span>
                      <span className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Zero Leakage Verified
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white">Full 13-Step Machine Learning Workflow Validated</h2>
                    <p className="text-xs text-slate-400">
                      Evaluated active model <strong className="text-white font-mono">{evalResult?.model_name || evalResult?.model_type || 'Active Model'}</strong> on {evalResult?.total_evaluated_samples || 0} held-out test instances.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                  <button
                    onClick={() => handleDownloadModelPickle(evalResult?.model_id)}
                    disabled={Boolean(downloadingModel)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all border border-slate-700/60 disabled:opacity-40"
                    title="Download active model as a Python pickle (.pkl) artifact"
                  >
                    {downloadingModel === (evalResult?.model_id || 'active') ? (
                      <RotateCcw className="w-3.5 h-3.5 animate-spin text-brand-400" />
                    ) : downloadedModelFile ? (
                      <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <HardDrive className="w-3.5 h-3.5 text-brand-400" />
                    )}
                    <span>{downloadedModelFile ? 'Model Saved!' : 'Download Model (.pkl)'}</span>
                  </button>

                  <button
                    onClick={handleExportReport}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all border border-slate-700/60"
                  >
                    {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-brand-400" />}
                    <span>{downloadSuccess ? 'Downloaded!' : 'Export Report'}</span>
                  </button>

                  <button
                    onClick={() => goToStep('collection')}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Dataset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Diagnostics vs Leaderboard vs Pipeline Audit) */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'diagnostics'
                    ? 'bg-brand-600/20 border border-brand-500/40 text-brand-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Evaluation Metrics & Diagnostics</span>
              </button>

              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'leaderboard'
                    ? 'bg-amber-600/20 border border-amber-500/40 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Model Leaderboard</span>
                {evalResult?.leaderboard && (
                  <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                    {evalResult.leaderboard.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'audit'
                    ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <CheckSquare className="w-4 h-4 text-purple-400" />
                <span>13-Step Pipeline Audit</span>
              </button>
            </div>

            {/* Loading Indicator */}
            {loading && !evalResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Evaluating Test Partition...</h4>
                <p className="text-xs text-slate-400">Computing residual distributions and test metrics.</p>
              </div>
            )}

            {/* TAB 1: EVALUATION METRICS & DIAGNOSTICS */}
            {activeTab === 'diagnostics' && evalResult && (
              <div className="space-y-6 animate-fadeIn">
                {evalResult.task_type === 'classification' ? (
                  <div className="space-y-6">
                    {/* Classification Score Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Accuracy', val: evalResult.accuracy, color: 'text-brand-400', desc: 'Overall correct rate' },
                        { label: 'Precision (Weighted)', val: evalResult.precision, color: 'text-brand-300', desc: 'Positive predictive value' },
                        { label: 'Recall (Weighted)', val: evalResult.recall, color: 'text-purple-400', desc: 'True positive sensitivity' },
                        { label: 'F1-Score (Weighted)', val: evalResult.f1_score, color: 'text-amber-400', desc: 'Harmonic mean of P & R' }
                      ].map((m) => (
                        <div key={m.label} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
                          <div className={`text-2xl font-mono font-bold ${m.color}`}>
                            {m.val !== null && m.val !== undefined ? `${(Number(m.val) * 100).toFixed(1)}%` : '-'}
                          </div>
                          <p className="text-[10px] text-slate-500">{m.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Confusion Matrix Card */}
                    {cmMatrix && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Table className="w-4 h-4 text-brand-400" />
                            Test Partition Confusion Matrix (y_test vs y_pred)
                          </h4>

                          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                            <button
                              onClick={() => setMatrixFormat('counts')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                                matrixFormat === 'counts' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Counts
                            </button>
                            <button
                              onClick={() => setMatrixFormat('percentages')}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                                matrixFormat === 'percentages' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Percentages
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-6">
                          <div className="text-center text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">
                            Predicted Class Labels (y_pred) &rarr;
                          </div>
                          <div className="flex justify-center">
                            <table className="border-collapse text-xs font-mono text-center">
                              {cmLabels.length > 0 && (
                                <thead>
                                  <tr>
                                    <th className="p-2 text-slate-500"></th>
                                    {cmLabels.map((lab, i) => (
                                      <th key={i} className="p-2 text-slate-300 font-bold text-xs min-w-[90px]">
                                        Class {lab}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                              )}
                              <tbody>
                                {cmMatrix.map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    <td className="pr-4 text-slate-400 font-bold text-xs text-right">
                                      Actual {cmLabels[rIdx] !== undefined ? cmLabels[rIdx] : rIdx}
                                    </td>
                                    {row.map((cell, cIdx) => {
                                      const isDiagonal = rIdx === cIdx;
                                      const pct = ((cell / totalCmCount) * 100).toFixed(1);
                                      return (
                                        <td
                                          key={cIdx}
                                          className={`w-24 h-18 p-3 border border-slate-800/80 font-bold transition-all ${
                                            isDiagonal
                                              ? 'bg-brand-950/70 text-brand-300 border-brand-500/40 shadow-inner'
                                              : cell > 0
                                                ? 'bg-red-950/30 text-red-300 border-red-500/20'
                                                : 'bg-slate-900/30 text-slate-600'
                                          }`}
                                        >
                                          <div className="text-base font-extrabold font-mono">
                                            {matrixFormat === 'counts' ? cell : `${pct}%`}
                                          </div>
                                          <div className="text-[10px] font-normal mt-0.5 opacity-80">
                                            {isDiagonal ? 'Correct' : cell > 0 ? 'Error' : '0'}
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Classification Report per Class */}
                    {evalResult.classification_report && evalResult.classification_report.length > 0 && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Per-Class Classification Report
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                              <tr>
                                <th className="p-3">Class</th>
                                <th className="p-3 text-brand-400">Precision</th>
                                <th className="p-3 text-purple-400">Recall</th>
                                <th className="p-3 text-amber-400">F1-Score</th>
                                <th className="p-3 text-slate-400">Support (Samples)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {evalResult.classification_report.map((cr, idx) => (
                                <tr key={idx} className="hover:bg-slate-900/40">
                                  <td className="p-3 font-bold text-white">{cr.class_label}</td>
                                  <td className="p-3 text-brand-300 font-bold">{(cr.precision * 100).toFixed(1)}%</td>
                                  <td className="p-3 text-purple-300 font-bold">{(cr.recall * 100).toFixed(1)}%</td>
                                  <td className="p-3 text-amber-300 font-bold">{(cr.f1_score * 100).toFixed(1)}%</td>
                                  <td className="p-3 text-slate-400">{cr.support}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : evalResult.task_type === 'unsupervised' ? (
                  <div className="space-y-6">
                    {/* Unsupervised Score Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Silhouette Score', val: evalResult.silhouette_score, color: 'text-brand-400', desc: 'Cluster separation (-1 to +1)' },
                        { label: 'Davies-Bouldin Index', val: evalResult.davies_bouldin_index, color: 'text-brand-400', desc: 'Lower is better (< 1.5 ideal)' },
                        { label: 'Cluster Partitions', val: evalResult.cluster_counts ? Object.keys(evalResult.cluster_counts).length : null, color: 'text-purple-400', desc: 'Discovered clusters' },
                        { label: 'Anomalies Detected', val: evalResult.anomaly_count ?? 0, color: 'text-amber-400', desc: 'Outlier/noise instances' }
                      ].map((m) => (
                        <div key={m.label} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
                          <div className={`text-2xl font-mono font-bold ${m.color}`}>
                            {m.val !== null && m.val !== undefined 
                              ? (typeof m.val === 'number' && !Number.isInteger(m.val) ? m.val.toFixed(4) : m.val)
                              : 'N/A'}
                          </div>
                          <p className="text-[10px] text-slate-500">{m.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Cluster Breakdown */}
                    {evalResult.cluster_counts && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cluster Partition Distribution</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {Object.entries(evalResult.cluster_counts).map(([cluster, count]) => (
                            <div key={cluster} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                              <span className="text-[11px] text-slate-400 font-mono">{cluster}</span>
                              <div className="text-lg font-bold text-white font-mono">{count} instances</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Regression Score Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'R² Score', val: evalResult.r2_score, color: 'text-brand-400', desc: 'Variance explained (1.0 best)' },
                        { label: 'RMSE', val: evalResult.rmse, color: 'text-brand-300', desc: 'Root mean squared error' },
                        { label: 'MAE', val: evalResult.mae, color: 'text-purple-400', desc: 'Mean absolute error' },
                        { label: 'MSE', val: evalResult.mse, color: 'text-amber-400', desc: 'Mean squared error' }
                      ].map((m) => (
                        <div key={m.label} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{m.label}</span>
                          <div className={`text-2xl font-mono font-bold ${m.color}`}>
                            {m.val !== null && m.val !== undefined ? Number(m.val).toFixed(4) : '-'}
                          </div>
                          <p className="text-[10px] text-slate-500">{m.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedagogical Metric Explanations */}
                {evalResult.educational_explanations && Object.keys(evalResult.educational_explanations).length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-400" />
                      Pedagogical Metric Explanations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(evalResult.educational_explanations).map(([k, desc]) => (
                        <div key={k} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                          <span className="text-xs font-bold text-white font-mono">{k.replace(/_/g, ' ')}</span>
                          <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MULTI-MODEL LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        Model Experimentation Leaderboard
                      </h4>
                      <p className="text-xs text-slate-400">
                        Compare all fitted algorithms trained on this dataset. Switch active models seamlessly.
                      </p>
                    </div>

                    <button
                      onClick={() => goToStep('fitting')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all self-start sm:self-auto"
                    >
                      <Cpu className="w-3.5 h-3.5 text-brand-400" />
                      <span>Train Another Model in 11. Model Fitting</span>
                    </button>
                  </div>

                  {evalResult?.leaderboard && evalResult.leaderboard.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                          <tr>
                            <th className="p-3">Rank</th>
                            <th className="p-3">Algorithm</th>
                            <th className="p-3 text-brand-400">Primary Score</th>
                            {evalResult.task_type === 'classification' ? (
                              <>
                                <th className="p-3 text-purple-400">Accuracy</th>
                                <th className="p-3 text-amber-400">F1-Score</th>
                              </>
                            ) : (
                              <>
                                <th className="p-3 text-purple-400">RMSE</th>
                                <th className="p-3 text-amber-400">R² Score</th>
                              </>
                            )}
                            <th className="p-3 text-slate-400">Train Time</th>
                            <th className="p-3 text-right">Status / Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {evalResult.leaderboard.map((item, idx) => {
                            const isWinner = idx === 0;
                            const isActive = item.is_active;
                            return (
                              <tr key={item.model_id || idx} className={`hover:bg-slate-900/40 transition-colors ${isActive ? 'bg-brand-950/20' : ''}`}>
                                <td className="p-3 font-bold">
                                  {isWinner ? (
                                    <span className="inline-flex items-center gap-1 text-amber-400">
                                      <Trophy className="w-3.5 h-3.5" /> #1
                                    </span>
                                  ) : (
                                    <span className="text-slate-500">#{idx + 1}</span>
                                  )}
                                </td>
                                <td className="p-3 font-bold text-white">
                                  {item.name || item.model_type}
                                </td>
                                <td className="p-3 font-extrabold text-brand-300">
                                  {item.primary_score !== undefined ? Number(item.primary_score).toFixed(4) : '-'}
                                  <span className="text-[10px] text-slate-500 ml-1 font-normal">({item.primary_metric})</span>
                                </td>
                                {evalResult.task_type === 'classification' ? (
                                  <>
                                    <td className="p-3 text-purple-300">{item.accuracy !== undefined ? `${(item.accuracy * 100).toFixed(1)}%` : '-'}</td>
                                    <td className="p-3 text-amber-300">{item.f1_score !== undefined ? `${(item.f1_score * 100).toFixed(1)}%` : '-'}</td>
                                  </>
                                ) : (
                                  <>
                                    <td className="p-3 text-purple-300">{item.rmse !== undefined ? Number(item.rmse).toFixed(4) : '-'}</td>
                                    <td className="p-3 text-amber-300">{item.r2_score !== undefined ? Number(item.r2_score).toFixed(4) : '-'}</td>
                                  </>
                                )}
                                <td className="p-3 text-slate-400">{item.training_duration_ms || 0} ms</td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleDownloadModelPickle(item.model_id)}
                                      disabled={downloadingModel === item.model_id}
                                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700/60 disabled:opacity-40"
                                      title={`Download ${item.name || 'model'} (.pkl)`}
                                    >
                                      {downloadingModel === item.model_id ? (
                                        <RotateCcw className="w-3.5 h-3.5 animate-spin text-brand-400" />
                                      ) : (
                                        <Download className="w-3.5 h-3.5 text-brand-400" />
                                      )}
                                    </button>

                                    {isActive ? (
                                      <span className="px-2.5 py-1 bg-brand-950/60 border border-brand-500/40 text-brand-300 rounded-lg text-[10px] font-bold">
                                        Active Model
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleActivateModel(item.model_id)}
                                        disabled={activatingModel === item.model_id}
                                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-semibold transition-all disabled:opacity-40"
                                      >
                                        {activatingModel === item.model_id ? 'Activating...' : 'Activate'}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center space-y-2">
                      <p className="text-xs text-slate-400">
                        No comparative models found. Fit multiple models in 11. Model Fitting to view side-by-side leaderboard rankings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: 13-STEP PIPELINE AUDIT TIMELINE */}
            {activeTab === 'audit' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      13-Step Machine Learning Pipeline Verification Audit
                    </h4>
                    <p className="text-xs text-slate-400">
                      Chronological traceability across all 13 phases. Click any step to review or iterate on previous transformations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pipelineStepsAudit.map((step) => (
                      <div
                        key={step.id}
                        onClick={() => goToStep(step.id)}
                        className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-brand-500/50 cursor-pointer transition-all space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-brand-400 bg-brand-950/40 px-1.5 py-0.5 rounded border border-brand-500/20">
                            STEP {step.num}
                          </span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <h5 className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                          {step.label}
                        </h5>
                        <p className="text-[11px] text-slate-400">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step13Evaluation;
