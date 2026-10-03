import React, { useState, useEffect } from 'react';
import { 
  GitCommit, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Table, 
  Layers, 
  Activity, 
  RefreshCw,
  TrendingDown,
  Cpu,
  Info,
  Sliders,
  BookOpen,
  Eye,
  ShieldAlert
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import Badge from '../../components/common/Badge';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';
import dimensionalityService from '../../services/dimensionalityService';
import { getDatasetById } from '../../services/datasetService';
import ScreePlotVisualizer from '../../components/dimensionality/ScreePlotVisualizer';
import ComponentLoadingsTable from '../../components/dimensionality/ComponentLoadingsTable';
import DimensionalityLearningCard from '../../components/dimensionality/DimensionalityLearningCard';

export const Step08Dimensionality = () => {
  const { activeDataset, setActiveDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();
  const datasetId = activeDataset?.dataset_id;

  const [summary, setSummary] = useState(null);
  const [method, setMethod] = useState('pca');
  const [nComponents, setNComponents] = useState(2);
  const [targetColumn, setTargetColumn] = useState('');
  const [scaleFirst, setScaleFirst] = useState(true);
  
  const [activeTab, setActiveTab] = useState('scree'); // 'scree' | 'loadings' | 'coordinates' | 'learn'
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
    const res = await dimensionalityService.getSummary(datasetId);
    if (res.error) {
      setError(res.error);
    } else {
      setSummary(res.data);
      if (res.data.potential_target_columns?.length > 0) {
        setTargetColumn(res.data.potential_target_columns[0]);
      }
      const maxComp = Math.min(res.data.numeric_feature_count || 2, 5);
      setNComponents(Math.max(2, Math.min(2, maxComp)));
    }
    setLoading(false);
  };

  const handlePreview = async () => {
    setError(null);
    setLoading(true);
    const res = await dimensionalityService.previewDimensionality(datasetId, {
      method,
      n_components: parseInt(nComponents, 10),
      target_column: method === 'lda' ? targetColumn : undefined,
      scale_first: scaleFirst
    });

    if (res.error) {
      setError(res.error);
    } else {
      setPreviewResult(res.data);
      if (activeTab === 'learn') {
        setActiveTab('scree');
      }
    }
    setLoading(false);
  };

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    const res = await dimensionalityService.applyDimensionality(datasetId, {
      method,
      n_components: parseInt(nComponents, 10),
      target_column: method === 'lda' ? targetColumn : undefined,
      scale_first: scaleFirst
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(res.data.message);
      updateStepStatus('dimensionality', STEP_STATUSES.APPLIED);
      updateStepStatus('feature_selection', STEP_STATUSES.AVAILABLE);
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
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Mastering Dimensionality Reduction</h3>
            <p className="text-xs text-slate-400">Step 08 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          High-dimensional datasets suffer from the <em>Curse of Dimensionality</em>: exponential volume expansion where data points become sparse and Euclidean distance metrics lose discriminative power. 
          Dimensionality reduction projects high-dimensional matrices onto lower-dimensional orthogonal subspaces while preserving maximal variance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">PCA (Principal Components)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unsupervised orthogonal projection. Finds directions of maximal variance using covariance matrix eigendecomposition.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">LDA (Linear Discriminants)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supervised projection. Maximizes the ratio of between-class variance to within-class variance for optimal class separation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Truncated SVD</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Factorizes matrix X = U Σ V^T without centering. Ideal for large sparse matrices (TF-IDF bag-of-words text matrices).
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const maxPossibleComponents = summary?.numeric_feature_count || 10;

  return (
    <StepContainer
      stepId="dimensionality"
      title="08 Dimensionality Reduction"
      subtitle="Compress high-dimensional feature spaces into orthogonal principal subspaces via PCA, LDA, or Truncated SVD."
      icon={GitCommit}
      conceptId="pca"
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
                  onClick={() => goToStep('feature_selection')}
                  className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  <span>Go to 09. Feature Selection</span>
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
                    Subspace Configuration
                  </h3>
                  <Badge variant="brand">{summary?.numeric_feature_count || 0} Numeric</Badge>
                </div>

                {/* Algorithm Technique Buttons */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-semibold">Algorithm Technique</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'pca', name: 'PCA', tag: 'Unsupervised' },
                      { id: 'lda', name: 'LDA', tag: 'Supervised' },
                      { id: 'svd', name: 'SVD', tag: 'Sparse' }
                    ].map((alg) => (
                      <button
                        key={alg.id}
                        type="button"
                        onClick={() => {
                          setMethod(alg.id);
                          if (previewResult) setPreviewResult(null);
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                          method === alg.id
                            ? 'bg-brand-600 border-brand-500 text-white shadow-md'
                            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-xs font-bold">{alg.name}</div>
                        <div className="text-[9px] opacity-75">{alg.tag}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Supervised Target Column for LDA */}
                {method === 'lda' && (
                  <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-brand-500/30 animate-fadeIn">
                    <label className="text-xs text-brand-300 font-semibold flex items-center gap-1.5">
                      Target Class Column (Required for LDA):
                    </label>
                    <select
                      value={targetColumn}
                      onChange={(e) => setTargetColumn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      {summary?.potential_target_columns?.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400">
                      LDA extracts at most C - 1 components (where C is the number of distinct target classes).
                    </p>
                  </div>
                )}

                {/* Target Components Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Target Components (k):</span>
                    <span className="text-brand-400 font-mono font-bold">{nComponents} of {maxPossibleComponents}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={Math.max(2, maxPossibleComponents)}
                    value={nComponents}
                    onChange={(e) => setNComponents(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 comp</span>
                    <span>{maxPossibleComponents} max features</span>
                  </div>
                </div>

                {/* Scale First Checkbox */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={scaleFirst}
                      onChange={(e) => setScaleFirst(e.target.checked)}
                      className="accent-brand-500 rounded"
                    />
                    <span className="font-semibold">Standardize Features First (Recommended)</span>
                  </label>
                  <p className="text-[10px] text-slate-400 pl-5">
                    Subtracts mean and scales to unit variance so high-magnitude features do not dominate principal axes.
                  </p>
                </div>

                {/* Dimension Metadata */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div>Input Dimensions: <strong className="text-white">{summary?.numeric_feature_count || 0} features</strong></div>
                  <div>Projected Space: <strong className="text-brand-400">{nComponents} {method.toUpperCase()} components</strong></div>
                  <div>Dimension Reduction: <strong className="text-purple-400">
                    {summary?.numeric_feature_count ? ((1 - (nComponents / summary.numeric_feature_count)) * 100).toFixed(0) : 0}% compression
                  </strong></div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handlePreview}
                    disabled={loading || maxPossibleComponents < 2}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{loading ? 'Calculating Subspace...' : 'Simulate Subspace'}</span>
                  </button>

                  <button
                    onClick={handleApply}
                    disabled={applying || maxPossibleComponents < 2}
                    className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-40"
                  >
                    <span>{applying ? 'Applying Subspace...' : 'Apply Dimensionality Reduction'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Visualization & Deep-Dive Studio */}
              <div className="lg:col-span-2 space-y-4">
                {/* View Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                  {[
                    { id: 'scree', label: 'Scree Plot & Variance', icon: Activity },
                    { id: 'loadings', label: 'Feature Loadings Matrix', icon: Table },
                    { id: 'coordinates', label: 'Projected Coordinates', icon: Eye },
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
                  {activeTab === 'scree' && (
                    <ScreePlotVisualizer
                      screeData={previewResult?.scree_plot_data}
                      totalVariance={previewResult?.total_variance_explained || 0}
                      method={method}
                    />
                  )}

                  {activeTab === 'loadings' && (
                    <ComponentLoadingsTable
                      loadings={previewResult?.component_loadings}
                      componentNames={previewResult?.new_component_names || []}
                    />
                  )}

                  {activeTab === 'coordinates' && (
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-brand-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Projected Component Coordinates (Sample)
                          </h4>
                        </div>
                        {previewResult && (
                          <Badge variant="brand">
                            {previewResult.sample_rows?.length || 0} Rows Sampled
                          </Badge>
                        )}
                      </div>

                      {previewResult ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                          <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
                              <tr>
                                <th className="py-2.5 px-3">Row Index</th>
                                {previewResult.new_component_names?.map((cName) => (
                                  <th key={cName} className="py-2.5 px-3 text-brand-400 font-bold">{cName}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                              {previewResult.sample_rows?.map((row) => (
                                <tr key={row.index} className="hover:bg-slate-900/40">
                                  <td className="py-2 px-3 text-slate-500 font-bold">#{row.index}</td>
                                  {previewResult.new_component_names?.map((cName) => (
                                    <td key={cName} className="py-2 px-3">
                                      {row.components?.[cName] !== undefined ? row.components[cName].toFixed(4) : '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                          Simulate subspace to inspect generated principal coordinates.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'learn' && (
                    <DimensionalityLearningCard activeMethod={method} />
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Proceed Navigation */}
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  updateStepStatus('dimensionality', STEP_STATUSES.APPLIED);
                  goToStep('feature_selection');
                }}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <span>Proceed to 09. Feature Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step08Dimensionality;
