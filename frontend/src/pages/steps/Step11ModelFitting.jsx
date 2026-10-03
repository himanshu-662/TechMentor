import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlayCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Layers, 
  BarChart3, 
  Cpu, 
  Clock, 
  Activity, 
  Award, 
  Table, 
  Sliders, 
  ShieldCheck, 
  GitBranch, 
  Network, 
  Zap, 
  Target,
  Search,
  GitCompare,
  Filter,
  Check,
  RotateCcw
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import Badge from '../../components/common/Badge';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';
import modelingService from '../../services/modelingService';
import ModelFittingLearningCard from '../../components/modeling/ModelFittingLearningCard';

export const Step11ModelFitting = () => {
  const { activeDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();
  const datasetId = activeDataset?.dataset_id;

  const [summary, setSummary] = useState(null);
  
  // Model catalog filtering & selection
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'classification', 'regression', 'unsupervised'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlgoId, setSelectedAlgoId] = useState('logistic_regression');

  // Hyperparameters state
  const [maxDepth, setMaxDepth] = useState(5);
  const [nEstimators, setNEstimators] = useState(100);
  const [regularizationC, setRegularizationC] = useState(1.0);
  const [alpha, setAlpha] = useState(1.0);
  const [nNeighbors, setNNeighbors] = useState(5);
  const [nClusters, setNClusters] = useState(3);
  const [eps, setEps] = useState(0.5);
  const [minSamples, setMinSamples] = useState(5);

  const [loading, setLoading] = useState(false);
  const [fitResult, setFitResult] = useState(null);
  const [fittedModels, setFittedModels] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Right-hand view mode: 'active' | 'comparison' | 'inspect'
  const [rightPanelTab, setRightPanelTab] = useState('active');
  const [compareModelAId, setCompareModelAId] = useState('');
  const [compareModelBId, setCompareModelBId] = useState('');
  const [activatingId, setActivatingId] = useState(null);

  useEffect(() => {
    if (datasetId) {
      loadModelingSummary();
      loadFittedModels();
    }
  }, [datasetId]);

  const loadModelingSummary = async () => {
    setError(null);
    const res = await modelingService.getSummary(datasetId);
    if (res.data) {
      setSummary(res.data);
      if (res.data.recommended_model) {
        setSelectedAlgoId(res.data.recommended_model);
      }
    } else if (res.error) {
      setError(res.error);
    }
  };

  const loadFittedModels = async () => {
    if (!datasetId) return;
    const res = await modelingService.listModels(datasetId);
    if (res.data && Array.isArray(res.data)) {
      setFittedModels(res.data);
      if (res.data.length > 0) {
        // Default comparison selectors
        setCompareModelAId(prev => prev || res.data[0].model_id);
        if (res.data.length > 1) {
          setCompareModelBId(prev => prev || res.data[1].model_id);
        } else {
          setCompareModelBId(prev => prev || res.data[0].model_id);
        }
      }
    }
  };

  // Filter available algorithms by category tab and search query
  const allAlgos = useMemo(() => summary?.available_algorithms || [], [summary]);

  const filteredAlgos = useMemo(() => {
    return allAlgos.filter(alg => {
      const matchCat = activeCategory === 'all' || alg.category === activeCategory;
      const matchSearch = !searchQuery.trim() || 
        alg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alg.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alg.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allAlgos, activeCategory, searchQuery]);

  const handleFitModel = async () => {
    setError(null);
    setLoading(true);
    const hyperparams = {};

    if (selectedAlgoId.includes('tree') || selectedAlgoId.includes('forest') || selectedAlgoId.includes('boosting')) {
      hyperparams.max_depth = parseInt(maxDepth, 10);
    }
    if (selectedAlgoId.includes('forest') || selectedAlgoId.includes('boosting') || selectedAlgoId === 'isolation_forest') {
      hyperparams.n_estimators = parseInt(nEstimators, 10);
    }
    if (selectedAlgoId === 'logistic_regression' || selectedAlgoId === 'svc' || selectedAlgoId === 'svr') {
      hyperparams.C = parseFloat(regularizationC);
    }
    if (['ridge', 'lasso', 'elastic_net'].includes(selectedAlgoId)) {
      hyperparams.alpha = parseFloat(alpha);
    }
    if (selectedAlgoId.includes('knn')) {
      hyperparams.n_neighbors = parseInt(nNeighbors, 10);
    }
    if (selectedAlgoId === 'kmeans') {
      hyperparams.n_clusters = parseInt(nClusters, 10);
    }
    if (selectedAlgoId === 'dbscan') {
      hyperparams.eps = parseFloat(eps);
      hyperparams.min_samples = parseInt(minSamples, 10);
    }

    const res = await modelingService.fitModel(datasetId, {
      model_type: selectedAlgoId,
      hyperparameters: hyperparams
    });

    if (res.error) {
      setError(res.error);
    } else {
      setFitResult(res.data);
      setSuccessMessage(res.data.message);
      updateStepStatus('fitting', STEP_STATUSES.APPLIED);
      updateStepStatus('prediction', STEP_STATUSES.AVAILABLE);
      await loadFittedModels();
      setRightPanelTab('active');
    }
    setLoading(false);
  };

  const handleActivateModel = async (modelId) => {
    setActivatingId(modelId);
    setError(null);
    const res = await modelingService.activateModel(datasetId, modelId);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(`Activated model ${modelId} for inference and evaluation.`);
      await loadFittedModels();
    }
    setActivatingId(null);
  };

  const learnContent = (
    <div className="space-y-6">
      <ModelFittingLearningCard 
        taskType={summary?.target_type || "classification"} 
        selectedModel={selectedAlgoId} 
      />
    </div>
  );

  // Compare models lookup
  const modelA = fittedModels.find(m => m.model_id === compareModelAId) || fittedModels[0];
  const modelB = fittedModels.find(m => m.model_id === compareModelBId) || (fittedModels.length > 1 ? fittedModels[1] : fittedModels[0]);

  return (
    <StepContainer
      stepId="fitting"
      title="11 Model Fitting"
      subtitle="Select algorithm architecture across Supervised & Unsupervised families, tune complexity hyperparameters, and fit on X_train."
      icon={PlayCircle}
      conceptId="model_fitting"
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
              <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-xl text-red-200 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-brand-950/40 border border-brand-500/40 rounded-xl text-brand-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  onClick={nextStep}
                  className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-brand-950/40"
                >
                  <span>Go to 12. Model Prediction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Studio Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Model Catalog & Hyperparameter Tuning (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-brand-400" />
                    Model Configuration
                  </h3>
                  {summary?.target_type && (
                    <Badge variant="brand">
                      Target: {summary.target_type.toUpperCase()}
                    </Badge>
                  )}
                </div>

                {/* Training Partition Metadata */}
                {summary && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Target Column:</span>
                      <strong className="text-white font-mono">{summary.target_column || 'None / Unsupervised'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Training Partition:</span>
                      <span className="font-mono text-brand-400 font-bold">{summary.train_rows.toLocaleString()} rows</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Feature Matrix:</span>
                      <span className="font-mono text-slate-200">{summary.feature_count} numerical features</span>
                    </div>
                  </div>
                )}

                {/* AI Recommendation Banner */}
                {summary?.recommendation_reason && (
                  <div className="p-3 bg-gradient-to-r from-brand-950/60 via-slate-900/80 to-brand-950/60 border border-brand-500/30 rounded-xl space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-400">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Recommendation</span>
                    </div>
                    <div className="text-[11px] text-slate-300 leading-relaxed">
                      {summary.recommendation_reason}
                    </div>
                  </div>
                )}

                {/* Filter Tabs: All, Classification, Regression, Unsupervised */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-brand-400" />
                      Model Family Filter
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">{filteredAlgos.length} choices</span>
                  </div>

                  <div className="grid grid-cols-4 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs gap-1">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'classification', label: 'Clf' },
                      { id: 'regression', label: 'Reg' },
                      { id: 'unsupervised', label: 'Unsup' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveCategory(tab.id)}
                        className={`py-1.5 px-2 rounded-lg font-bold text-center transition-all text-[11px] ${
                          activeCategory === tab.id
                            ? 'bg-brand-600 text-white shadow-sm ring-1 ring-brand-400/30'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search any algorithm (e.g. Forest, Boosting, Lasso)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
                    />
                  </div>
                </div>

                {/* Algorithm Catalog Selector */}
                <div className="space-y-2">
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {filteredAlgos.map((alg) => {
                      const isSelected = selectedAlgoId === alg.id;
                      return (
                        <div
                          key={alg.id}
                          onClick={() => setSelectedAlgoId(alg.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                            isSelected
                              ? 'bg-brand-950/40 border-brand-500 text-white shadow-sm shadow-brand-950/30 ring-1 ring-brand-500/20'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="text-xs font-bold flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              {alg.name}
                              {alg.recommended && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center gap-0.5">
                                  <Award className="w-3 h-3" /> Best Fit
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${
                                alg.category === 'classification'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : alg.category === 'regression'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              }`}>
                                {alg.category}
                              </span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
                              )}
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight">{alg.desc}</div>
                          {alg.compatible === false && (
                            <div className="text-[10px] text-amber-400/90 font-mono">
                              * Target auto-adapts for this model family
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Hyperparameter Controls */}
                <div className="space-y-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <Sliders className="w-3.5 h-3.5 text-brand-400" />
                    <span>Hyperparameter Tuning</span>
                  </div>

                  {/* Tree / Forest / Boosting Depth */}
                  {(selectedAlgoId.includes('tree') || selectedAlgoId.includes('forest') || selectedAlgoId.includes('boosting')) && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Max Depth (<code>max_depth</code>)</span>
                        <span className="text-brand-400 font-mono font-bold">{maxDepth}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={maxDepth}
                        onChange={(e) => setMaxDepth(e.target.value)}
                        className="w-full accent-brand-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>1 (Stump / High Bias)</span>
                        <span>20 (Deep / High Variance)</span>
                      </div>
                    </div>
                  )}

                  {/* Forest / Boosting / Isolation Forest Estimators */}
                  {(selectedAlgoId.includes('forest') || selectedAlgoId.includes('boosting') || selectedAlgoId === 'isolation_forest') && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Estimators (<code>n_estimators</code>)</span>
                        <span className="text-brand-400 font-mono font-bold">{nEstimators} trees</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="300"
                        step="10"
                        value={nEstimators}
                        onChange={(e) => setNEstimators(e.target.value)}
                        className="w-full accent-brand-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>10 (Fast)</span>
                        <span>300 (Stable / Robust)</span>
                      </div>
                    </div>
                  )}

                  {/* Regularization C (Logistic, SVC, SVR) */}
                  {(selectedAlgoId === 'logistic_regression' || selectedAlgoId === 'svc' || selectedAlgoId === 'svr') && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Inverse Regularization ($C$)</span>
                        <span className="text-brand-400 font-mono font-bold">{regularizationC}</span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="10.0"
                        step="0.1"
                        value={regularizationC}
                        onChange={(e) => setRegularizationC(parseFloat(e.target.value))}
                        className="w-full accent-brand-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0.01 (Heavy Penalty)</span>
                        <span>10.0 (Light Penalty)</span>
                      </div>
                    </div>
                  )}

                  {/* Alpha Penalty (Ridge, Lasso, ElasticNet) */}
                  {['ridge', 'lasso', 'elastic_net'].includes(selectedAlgoId) && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Penalty Strength ($\alpha$)</span>
                        <span className="text-brand-400 font-mono font-bold">{alpha}</span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="10.0"
                        step="0.05"
                        value={alpha}
                        onChange={(e) => setAlpha(parseFloat(e.target.value))}
                        className="w-full accent-brand-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>0.01 (Near-OLS)</span>
                        <span>10.0 (Heavy Shrinkage)</span>
                      </div>
                    </div>
                  )}

                  {/* K-Nearest Neighbors */}
                  {selectedAlgoId.includes('knn') && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Neighbors ($k$)</span>
                        <span className="text-brand-400 font-mono font-bold">{nNeighbors}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="25"
                        step="1"
                        value={nNeighbors}
                        onChange={(e) => setNNeighbors(e.target.value)}
                        className="w-full accent-brand-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>1 (High Variance)</span>
                        <span>25 (High Smoothing)</span>
                      </div>
                    </div>
                  )}

                  {/* KMeans Clusters */}
                  {selectedAlgoId === 'kmeans' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">Clusters ($k$)</span>
                        <span className="text-brand-400 font-mono font-bold">{nClusters}</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        step="1"
                        value={nClusters}
                        onChange={(e) => setNClusters(e.target.value)}
                        className="w-full accent-brand-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>2 Clusters</span>
                        <span>10 Clusters</span>
                      </div>
                    </div>
                  )}

                  {/* DBSCAN Parameters */}
                  {selectedAlgoId === 'dbscan' && (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Epsilon ($\epsilon$)</span>
                          <span className="text-brand-400 font-mono font-bold">{eps}</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="5.0"
                          step="0.1"
                          value={eps}
                          onChange={(e) => setEps(parseFloat(e.target.value))}
                          className="w-full accent-brand-500 cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400 font-medium">Min Samples</span>
                          <span className="text-brand-400 font-mono font-bold">{minSamples}</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="20"
                          step="1"
                          value={minSamples}
                          onChange={(e) => setMinSamples(parseInt(e.target.value, 10))}
                          className="w-full accent-brand-500 cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleFitModel}
                  disabled={loading || (summary && !summary.has_split)}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-950/40 disabled:opacity-40 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{loading ? 'Optimizing & Fitting...' : `Fit ${selectedAlgoId.replace(/_/g, ' ').toUpperCase()}`}</span>
                </button>
              </div>

              {/* Right Column: Active Model Summary, Model Comparison Studio, and Individual Comparison (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* View Switcher Tabs */}
                <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRightPanelTab('active')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        rightPanelTab === 'active'
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-950/40 ring-1 ring-brand-400/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Active Model</span>
                    </button>

                    <button
                      onClick={() => setRightPanelTab('comparison')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        rightPanelTab === 'comparison'
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-950/40 ring-1 ring-brand-400/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Model Comparison</span>
                      {fittedModels.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                          {fittedModels.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setRightPanelTab('inspect')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        rightPanelTab === 'inspect'
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-950/40 ring-1 ring-brand-400/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Individual Comparison</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    {fittedModels.length} Fitted
                  </span>
                </div>

                {/* TAB 1: ACTIVE MODEL SUMMARY */}
                {rightPanelTab === 'active' && (
                  <>
                    {fitResult ? (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-brand-400" />
                            Training Summary & Convergence
                          </h4>
                          <Badge variant="brand">
                            Fit Time: {fitResult.training_duration_ms} ms
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase">Algorithm</span>
                            <div className="text-xs font-bold text-white font-mono truncate">{fitResult.model_type}</div>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase">Training Rows</span>
                            <div className="text-xs font-bold text-brand-400 font-mono">{fitResult.train_rows.toLocaleString()}</div>
                          </div>
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                            <span className="text-[10px] text-slate-400 uppercase">Feature Inputs</span>
                            <div className="text-xs font-bold text-brand-400 font-mono">{fitResult.feature_count} features</div>
                          </div>
                        </div>

                        {/* Feature Importances / Coefficients */}
                        {fitResult.feature_importances && Object.keys(fitResult.feature_importances).length > 0 && (
                          <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-400 font-semibold">
                                {fitResult.task_type === 'unsupervised' 
                                  ? 'Centroid Feature Variance / Dispersion:' 
                                  : 'Learned Feature Weights / Gini Importances:'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">Sorted by magnitude</span>
                            </div>
                            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                              {Object.entries(fitResult.feature_importances)
                                .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                                .map(([feat, imp]) => {
                                  const absVal = Math.abs(Number(imp));
                                  const maxImp = Math.max(...Object.values(fitResult.feature_importances).map(v => Math.abs(v)), 0.001);
                                  const widthPct = Math.min(100, Math.max(5, (absVal / maxImp) * 100));

                                  return (
                                    <div key={feat} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5">
                                      <div className="flex justify-between text-xs font-mono">
                                        <span className="text-slate-200 font-bold">{feat}</span>
                                        <span className="text-brand-400 font-bold">{Number(imp).toFixed(4)}</span>
                                      </div>
                                      <div className="w-full h-2 rounded-full bg-slate-800/70 overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-brand-600 to-teal-400 transition-all duration-500 rounded-full"
                                          style={{ width: `${widthPct}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                        <Award className="w-12 h-12 text-slate-600 mx-auto" />
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">Model Optimizer Ready</h4>
                          <p className="text-xs text-slate-400 max-w-md mx-auto">
                            Choose an algorithm architecture across Supervised (Regression / Classification) or Unsupervised (Clustering & Anomaly Detection), tune hyperparameters, and click "Fit Model".
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* TAB 2: MODEL COMPARISON TABLE */}
                {rightPanelTab === 'comparison' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <GitCompare className="w-4 h-4 text-brand-400" />
                          Fitted Models Comparison Studio
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Side-by-side comparison of all models trained in this workspace session.
                        </p>
                      </div>
                      <button
                        onClick={loadFittedModels}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Refresh models"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {fittedModels.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-xl">
                        <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                        <p>No fitted models recorded in this session yet.</p>
                        <p className="text-[11px] text-slate-500">Pick any algorithm on the left and click "Fit Model" to begin comparing.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
                            <tr>
                              <th className="py-2.5 px-3">Model</th>
                              <th className="py-2.5 px-3">Family</th>
                              <th className="py-2.5 px-3">Fit Time</th>
                              <th className="py-2.5 px-3">Top Features</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {fittedModels.map((m) => {
                              const topFeats = Object.entries(m.feature_importances || {})
                                .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                                .slice(0, 2)
                                .map(([k]) => k)
                                .join(', ');

                              return (
                                <tr key={m.model_id} className="hover:bg-slate-900/40">
                                  <td className="py-2.5 px-3 font-semibold text-white">
                                    <div className="flex items-center gap-1.5">
                                      <span>{m.name || m.model_type}</span>
                                      {m.is_active && (
                                        <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">{m.model_id}</div>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                                      {m.task_type}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-brand-300 font-bold">
                                    {m.training_duration_ms} ms
                                  </td>
                                  <td className="py-2.5 px-3 text-[11px] text-slate-400 truncate max-w-[140px]" title={topFeats}>
                                    {topFeats || '-'}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {m.is_active ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                                        <Check className="w-3 h-3" /> Active
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-500">Standby</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {m.is_active ? (
                                      <span className="text-[11px] text-brand-400 font-semibold">Active</span>
                                    ) : (
                                      <button
                                        onClick={() => handleActivateModel(m.model_id)}
                                        disabled={activatingId === m.model_id}
                                        className="px-2.5 py-1 bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-300 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50 cursor-pointer"
                                      >
                                        {activatingId === m.model_id ? 'Activating...' : 'Activate'}
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: INDIVIDUAL MODEL COMPARISON & DEEP DIVE */}
                {rightPanelTab === 'inspect' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-brand-400" />
                          Individual Model Comparison
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Select any model from your training history to inspect its learned parameters and compare feature weights.
                        </p>
                      </div>
                    </div>

                    {fittedModels.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-xl">
                        <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                        <p>No models fitted yet to inspect or compare.</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Model Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                              <span>Model A:</span>
                              {modelA?.is_active && (
                                <span className="text-[10px] text-brand-400 font-mono font-bold">* Active</span>
                              )}
                            </label>
                            <select
                              value={compareModelAId}
                              onChange={(e) => setCompareModelAId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500/50"
                            >
                              {fittedModels.map(m => (
                                <option key={m.model_id} value={m.model_id}>
                                  {m.name || m.model_type} ({m.model_id})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                              <span>Model B (Compare with):</span>
                              {modelB?.is_active && (
                                <span className="text-[10px] text-brand-400 font-mono font-bold">* Active</span>
                              )}
                            </label>
                            <select
                              value={compareModelBId}
                              onChange={(e) => setCompareModelBId(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500/50"
                            >
                              {fittedModels.map(m => (
                                <option key={m.model_id} value={m.model_id}>
                                  {m.name || m.model_type} ({m.model_id})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Comparative Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Model A Summary Card */}
                          {modelA && (
                            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white font-mono">{modelA.name}</span>
                                {!modelA.is_active && (
                                  <button
                                    onClick={() => handleActivateModel(modelA.model_id)}
                                    disabled={activatingId === modelA.model_id}
                                    className="px-2 py-0.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-[10px] font-bold"
                                  >
                                    Activate
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 bg-slate-900 rounded-lg">
                                  <div className="text-[10px] text-slate-400">Duration</div>
                                  <div className="font-mono text-brand-400 font-bold">{modelA.training_duration_ms} ms</div>
                                </div>
                                <div className="p-2 bg-slate-900 rounded-lg">
                                  <div className="text-[10px] text-slate-400">Family</div>
                                  <div className="font-mono text-slate-200 capitalize">{modelA.task_type}</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Model B Summary Card */}
                          {modelB && (
                            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white font-mono">{modelB.name}</span>
                                {!modelB.is_active && (
                                  <button
                                    onClick={() => handleActivateModel(modelB.model_id)}
                                    disabled={activatingId === modelB.model_id}
                                    className="px-2 py-0.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-[10px] font-bold"
                                  >
                                    Activate
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 bg-slate-900 rounded-lg">
                                  <div className="text-[10px] text-slate-400">Duration</div>
                                  <div className="font-mono text-brand-400 font-bold">{modelB.training_duration_ms} ms</div>
                                </div>
                                <div className="p-2 bg-slate-900 rounded-lg">
                                  <div className="text-[10px] text-slate-400">Family</div>
                                  <div className="font-mono text-slate-200 capitalize">{modelB.task_type}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Comparative Feature Importances / Weights */}
                        {modelA?.feature_importances && Object.keys(modelA.feature_importances).length > 0 && (
                          <div className="space-y-3 pt-2">
                            <h5 className="text-xs font-bold text-slate-300">Feature Importance / Weight Comparison</h5>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              {Object.entries(modelA.feature_importances)
                                .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                                .map(([feat, impA]) => {
                                  const impB = modelB?.feature_importances ? modelB.feature_importances[feat] : null;
                                  return (
                                    <div key={feat} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                                      <div className="flex justify-between text-slate-200">
                                        <span className="font-bold">{feat}</span>
                                        <div className="flex items-center gap-4">
                                          <span className="text-brand-400 font-bold">A: {Number(impA).toFixed(4)}</span>
                                          {impB !== null && impB !== undefined && (
                                            <span className="text-cyan-400 font-bold">B: {Number(impB).toFixed(4)}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  updateStepStatus('fitting', STEP_STATUSES.APPLIED);
                  goToStep('prediction');
                }}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-950/40 cursor-pointer"
              >
                <span>Proceed to 12. Model Prediction</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step11ModelFitting;
