import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Table, 
  Layers, 
  BarChart3, 
  RefreshCw,
  Award,
  Cpu,
  Info,
  BookOpen,
  Sliders,
  CheckSquare
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import Badge from '../../components/common/Badge';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';
import featureSelectionService from '../../services/featureSelectionService';
import { getDatasetById } from '../../services/datasetService';
import FeatureScoreBarChart from '../../components/feature_selection/FeatureScoreBarChart';
import FeatureRankingsTable from '../../components/feature_selection/FeatureRankingsTable';
import FeatureSelectionLearningCard from '../../components/feature_selection/FeatureSelectionLearningCard';

export const Step09FeatureSelection = () => {
  const { activeDataset, setActiveDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();
  const datasetId = activeDataset?.dataset_id;

  const [summary, setSummary] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [scoringFunc, setScoringFunc] = useState('f_classif');
  const [k, setK] = useState(3);
  
  const [activeTab, setActiveTab] = useState('rankings'); // 'rankings' | 'table' | 'learn'
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (datasetId) {
      loadSummary();
    }
  }, [datasetId]);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    const res = await featureSelectionService.getSummary(datasetId);
    if (res.error) {
      setError(res.error);
    } else {
      setSummary(res.data);
      const potentialTargets = res.data.potential_target_columns || [];
      if (potentialTargets.length > 0) {
        setTargetColumn(potentialTargets[0]);
      }
      if (res.data.recommended_scoring) {
        setScoringFunc(res.data.recommended_scoring);
      }
      const featCount = res.data.numeric_feature_count || 3;
      setK(Math.max(1, Math.min(3, featCount)));
    }
    setLoading(false);
  };

  const handlePreview = async () => {
    if (!targetColumn) {
      setError('Please select a target column for feature selection scoring.');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await featureSelectionService.previewFeatureSelection(datasetId, {
      target_column: targetColumn,
      scoring_func: scoringFunc,
      k: parseInt(k, 10)
    });

    if (res.error) {
      setError(res.error);
    } else {
      setPreviewResult(res.data);
      if (activeTab === 'learn') {
        setActiveTab('rankings');
      }
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!targetColumn) return;
    setApplying(true);
    setError(null);
    const res = await featureSelectionService.applyFeatureSelection(datasetId, {
      target_column: targetColumn,
      scoring_func: scoringFunc,
      k: parseInt(k, 10)
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(res.data.message);
      updateStepStatus('feature_selection', STEP_STATUSES.APPLIED);
      updateStepStatus('split', STEP_STATUSES.AVAILABLE);
      setPreviewResult(null);

      // Re-hydrate active dataset with new snapshot version
      try {
        const refreshed = await getDatasetById(datasetId);
        if (refreshed.data) {
          setActiveDataset(refreshed.data);
        }
      } catch (e) {}

      loadSummary();
    }
    setApplying(false);
  };

  const learnContent = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Mastering Feature Selection</h3>
            <p className="text-xs text-slate-400">Step 09 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Feature selection identifies and retains only the subset of features that contribute maximal statistical signal to predicting the target variable. 
          Unlike PCA which creates artificial blended components, feature selection preserves original raw column interpretability while eliminating noise, reducing overfitting, and accelerating training speeds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> Scoring Metrics Comparison
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>ANOVA F-Test (Linear):</strong> Tests whether group means are distinct (F = MS_Between / MS_Within). Fast O(p) linear signal test.</li>
              <li><strong>Mutual Information (Non-Linear):</strong> Non-parametric metric measuring mutual dependence between feature and target. Captures complex curves.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Selection Families
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Filter Methods:</strong> Rank features by statistical criteria independently of models (e.g. SelectKBest).</li>
              <li><strong>Wrapper Methods:</strong> Iteratively evaluate model performance (e.g. Recursive Feature Elimination / RFE).</li>
              <li><strong>Embedded Methods:</strong> Selection happens during model optimization (e.g. Lasso L1 Penalty, Tree feature importances).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const totalNumeric = summary?.numeric_feature_count || 5;

  return (
    <StepContainer
      stepId="feature_selection"
      title="09 Feature Selection"
      subtitle="Rank and filter features using ANOVA F-tests or Mutual Information criteria to prune uninformative noise."
      icon={Filter}
      conceptId="feature_selection"
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
                <button onClick={() => setError(null)} className="underline text-red-400 text-xs">Dismiss</button>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-brand-900/20 border border-brand-700/50 rounded-xl text-brand-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  onClick={() => goToStep('split')}
                  className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>Go to 10. Train-Test Split</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Studio Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Config Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-400" />
                    Selection Controls
                  </h3>
                  <Badge variant="brand">{totalNumeric} Features</Badge>
                </div>

                {/* Target Column Selection */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold flex items-center justify-between">
                    <span>Target Variable (y):</span>
                    <span className="text-[10px] text-brand-400">Required</span>
                  </label>
                  <select
                    value={targetColumn}
                    onChange={(e) => {
                      setTargetColumn(e.target.value);
                      if (previewResult) setPreviewResult(null);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  >
                    {summary?.potential_target_columns?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Statistical Scoring Criterion */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Scoring Metric</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'f_classif', name: 'ANOVA (Classif)', sub: 'Linear Classification' },
                      { id: 'f_regression', name: 'ANOVA (Regress)', sub: 'Linear Correlation' },
                      { id: 'mutual_info_classif', name: 'Mutual Info (Cls)', sub: 'Non-Linear Entropy' },
                      { id: 'mutual_info_regression', name: 'Mutual Info (Reg)', sub: 'Non-Linear Curve' }
                    ].map((crit) => (
                      <button
                        key={crit.id}
                        type="button"
                        onClick={() => {
                          setScoringFunc(crit.id);
                          if (previewResult) setPreviewResult(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          scoringFunc === crit.id
                            ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{crit.name}</div>
                        <div className="text-[9px] opacity-75">{crit.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* K Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Select Top Features (k):</span>
                    <span className="text-brand-400 font-mono font-bold">{k} of {totalNumeric}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={Math.max(1, totalNumeric)}
                    value={k}
                    onChange={(e) => setK(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 feature</span>
                    <span>{totalNumeric} features</span>
                  </div>
                </div>

                {/* Dimension Metadata */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div>Input Features: <strong className="text-white">{totalNumeric} features</strong></div>
                  <div>Retained Subset: <strong className="text-brand-400">{k} features</strong></div>
                  <div>Discarded Noise: <strong className="text-rose-400">{Math.max(0, totalNumeric - k)} features</strong></div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handlePreview}
                    disabled={loading || !targetColumn}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{loading ? 'Evaluating Scores...' : 'Compute Feature Scores'}</span>
                  </button>

                  <button
                    onClick={handleApply}
                    disabled={applying || !targetColumn}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-40"
                  >
                    <span>{applying ? 'Filtering Dataset...' : 'Apply Top-K Selection'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Visualization & Deep-Dive Studio */}
              <div className="lg:col-span-2 space-y-4">
                {/* View Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                  {[
                    { id: 'rankings', label: 'Feature Rankings Chart', icon: BarChart3 },
                    { id: 'table', label: 'Significance & P-Values Table', icon: Table },
                    { id: 'learn', label: 'Educational Deep-Dive', icon: BookOpen }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-brand-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sub-view Content */}
                <div>
                  {activeTab === 'rankings' && (
                    <FeatureScoreBarChart
                      featureScores={previewResult?.feature_scores}
                      k={k}
                      scoringFunc={scoringFunc}
                      targetColumn={targetColumn}
                    />
                  )}

                  {activeTab === 'table' && (
                    <FeatureRankingsTable
                      featureScores={previewResult?.feature_scores}
                      k={k}
                      scoringFunc={scoringFunc}
                    />
                  )}

                  {activeTab === 'learn' && (
                    <FeatureSelectionLearningCard activeScorer={scoringFunc} />
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Proceed Navigation */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  updateStepStatus('feature_selection', STEP_STATUSES.APPLIED);
                  goToStep('split');
                }}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <span>Proceed to 10. Train-Test Split</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step09FeatureSelection;
