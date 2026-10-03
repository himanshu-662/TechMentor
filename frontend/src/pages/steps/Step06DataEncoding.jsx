import React, { useState, useEffect } from 'react';
import { 
  Binary, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle,
  Table,
  Layers,
  Check,
  RefreshCw,
  Cpu,
  Info,
  ArrowUp,
  ArrowDown,
  Hash,
  Sliders,
  ShieldAlert,
  BarChart3,
  ChevronRight,
  Eye,
  Zap
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import Badge from '../../components/common/Badge';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';
import encodingService from '../../services/encodingService';

export const Step06DataEncoding = () => {
  const { activeDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();
  const datasetId = activeDataset?.dataset_id;

  // State
  const [summary, setSummary] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('one_hot');
  const [dropFirst, setDropFirst] = useState(false);
  const [frequencyMetric, setFrequencyMetric] = useState('frequency');
  const [groupRare, setGroupRare] = useState(false);
  const [rareThreshold, setRareThreshold] = useState(0.02);
  const [ordinalOrders, setOrdinalOrders] = useState({}); // { colName: ['Low', 'Med', 'High'] }

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeInspectCol, setActiveInspectCol] = useState(null);

  useEffect(() => {
    if (datasetId) {
      loadSummary();
    }
  }, [datasetId]);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    const res = await encodingService.getSummary(datasetId);
    if (res.error) {
      setError(res.error);
    } else {
      setSummary(res.data);
      if (res.data.columns?.length > 0) {
        const firstCol = res.data.columns[0];
        setSelectedColumns([firstCol.column]);
        setSelectedMethod(firstCol.recommended_method || 'one_hot');
        setActiveInspectCol(firstCol.column);

        // Initialize ordinal orders with detected order or default
        const initOrders = {};
        res.data.columns.forEach((c) => {
          if (c.detected_ordinal_order && c.detected_ordinal_order.length > 0) {
            initOrders[c.column] = [...c.detected_ordinal_order];
          } else if (c.all_categories && c.all_categories.length > 0) {
            initOrders[c.column] = [...c.all_categories];
          }
        });
        setOrdinalOrders(initOrders);
      }
    }
    setLoading(false);
  };

  const handleToggleColumn = (colName) => {
    setSelectedColumns((prev) => {
      const exists = prev.includes(colName);
      const next = exists ? prev.filter((c) => c !== colName) : [...prev, colName];
      if (!exists) {
        setActiveInspectCol(colName);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!summary?.columns) return;
    if (selectedColumns.length === summary.columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(summary.columns.map((c) => c.column));
    }
  };

  const handleMoveOrdinalItem = (colName, index, direction) => {
    const list = [...(ordinalOrders[colName] || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setOrdinalOrders((prev) => ({ ...prev, [colName]: list }));
  };

  const handleReverseOrdinal = (colName) => {
    const list = [...(ordinalOrders[colName] || [])].reverse();
    setOrdinalOrders((prev) => ({ ...prev, [colName]: list }));
  };

  const handleApplyDetectedOrder = (colName, detectedOrder) => {
    if (!detectedOrder) return;
    setOrdinalOrders((prev) => ({ ...prev, [colName]: [...detectedOrder] }));
  };

  const handlePreview = async () => {
    if (selectedColumns.length === 0) {
      setError('Please select at least one categorical column to encode.');
      return;
    }
    setError(null);
    setPreviewLoading(true);

    const payload = {
      columns: selectedColumns,
      method: selectedMethod,
      drop_first: dropFirst,
      frequency_metric: frequencyMetric,
      rare_category_threshold: groupRare ? rareThreshold : null,
      ordinal_mappings: selectedMethod === 'ordinal' ? ordinalOrders : null,
    };

    const res = await encodingService.previewEncoding(datasetId, payload);
    if (res.error) {
      setError(res.error);
    } else {
      setPreviewResult(res.data);
    }
    setPreviewLoading(false);
  };

  const handleApply = async () => {
    if (selectedColumns.length === 0) return;
    setApplying(true);
    setError(null);

    const payload = {
      columns: selectedColumns,
      method: selectedMethod,
      drop_first: dropFirst,
      frequency_metric: frequencyMetric,
      rare_category_threshold: groupRare ? rareThreshold : null,
      ordinal_mappings: selectedMethod === 'ordinal' ? ordinalOrders : null,
    };

    const res = await encodingService.applyEncoding(datasetId, payload);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccessMessage(res.data.message);
      updateStepStatus('encoding', STEP_STATUSES.APPLIED);
      updateStepStatus('scaling', STEP_STATUSES.AVAILABLE);
      setPreviewResult(null);
      await loadSummary();
    }
    setApplying(false);
  };

  const currentInspectColData = summary?.columns?.find((c) => c.column === activeInspectCol);

  const learnContent = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Categorical Data Encoding Masterclass</h3>
            <p className="text-xs text-slate-400">Step 06 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Machine learning algorithms operate strictly in Euclidean vector spaces. Raw text labels
          (e.g., <em>Gender</em>, <em>Customer Tier</em>, <em>City</em>) cannot be directly multiplied by weights.
          Converting them to numbers requires choosing the right mathematical representation to avoid inserting false assumptions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* One-Hot */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">One-Hot (OHE)</h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-950/80 text-brand-300 border border-brand-800">Nominal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Creates orthogonal binary indicator columns (0/1). Best for nominal data with low cardinality ($K \le 15$).
            </p>
            <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-500/20">
              <strong>Dummy Variable Trap:</strong> Set <code>drop_first=True</code> in linear regression to avoid collinearity with the intercept.
            </div>
          </div>

          {/* Ordinal */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Ordinal</h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800">Hierarchical</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maps ordered categories to integers (e.g. Low $\to$ 0, Med $\to$ 1, High $\to$ 2).
              Preserves natural monotonic structure without expanding dimensions.
            </p>
            <div className="text-[11px] text-purple-300 bg-purple-950/30 p-2 rounded border border-purple-500/20">
              <strong>Warning:</strong> Never let scikit-learn sort alphabetically! Explicitly define category order.
            </div>
          </div>

          {/* Frequency */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Frequency / Count</h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-800">High Cardinality</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Replaces categories with their dataset prevalence proportion. Ideal for variables with 50+ categories (ZIP codes, cities).
            </p>
            <div className="text-[11px] text-cyan-300 bg-cyan-950/30 p-2 rounded border border-cyan-500/20">
              <strong>Collision Tradeoff:</strong> Distinct categories with identical frequencies get the same number.
            </div>
          </div>

          {/* Label */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-400 uppercase tracking-wider">Label</h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-950/80 text-brand-300 border border-brand-800">Binary / Trees</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct mapping to $[0, 1, \dots, K-1]$. Optimal for binary variables ($K=2$) or classification target variable $y$.
            </p>
            <div className="text-[11px] text-brand-300 bg-brand-950/30 p-2 rounded border border-brand-500/20">
              <strong>Pitfall:</strong> Linear models assume category 2 is twice category 1.
            </div>
          </div>
        </div>

        {/* Dummy Variable Trap Deep Dive */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Deep Dive: The Dummy Variable Trap</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Consider a binary feature like <code>Gender</code> with values <code>Male</code> and <code>Female</code>.
            If you create both <code>gender_Male</code> and <code>gender_Female</code>, then for every row:
          </p>
          <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-center text-amber-300">
            gender_Male + gender_Female = 1 = Intercept (Constant)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The columns are linearly dependent. In Ordinary Least Squares (OLS) regression, the matrix $(X^T X)$ becomes
            singular (rank-deficient) and cannot be inverted without regularization!
            By setting <code className="text-amber-300">drop_first=True</code>, one reference category is dropped and absorbed into the intercept $\beta_0$.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <StepContainer
      stepId="encoding"
      title="06 Data Encoding"
      subtitle="Transform categorical attributes into mathematical numerical representations via One-Hot, Ordinal, Frequency, or Label encoding."
      icon={Binary}
      conceptId="one_hot_encoding"
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
            {/* Feedback Alerts */}
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
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow"
                >
                  <span>Proceed to 07. Feature Scaling</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Categorical Columns Selector (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Categorical Features ({summary?.total_categorical_columns || 0})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {summary?.columns?.length > 1 && (
                      <button
                        onClick={handleSelectAll}
                        className="text-[11px] text-brand-400 hover:text-brand-300 underline"
                      >
                        {selectedColumns.length === summary.columns.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                    <button 
                      onClick={loadSummary} 
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Refresh feature list"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {summary?.columns?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-brand-400 mx-auto" />
                    <div className="font-bold text-white">All Columns are Numeric!</div>
                    <p className="text-[11px] text-slate-500">
                      No categorical or text columns detected. You can proceed directly to feature scaling.
                    </p>
                    <button
                      onClick={() => goToStep('scaling')}
                      className="mt-2 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <span>Go to 07. Feature Scaling</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {summary?.columns?.map((col) => {
                      const isSelected = selectedColumns.includes(col.column);
                      const isInspecting = activeInspectCol === col.column;

                      return (
                        <div
                          key={col.column}
                          className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                            isSelected 
                              ? 'bg-brand-950/30 border-brand-500/60 shadow-sm' 
                              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                          } ${isInspecting ? 'ring-1 ring-brand-500/40' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div 
                              onClick={() => handleToggleColumn(col.column)}
                              className="flex items-center gap-2.5 cursor-pointer select-none"
                            >
                              <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] transition-colors ${
                                isSelected ? 'bg-brand-600 border-brand-500 text-white' : 'border-slate-700 bg-slate-900'
                              }`}>
                                {isSelected && <Check className="w-3 h-3" />}
                              </span>
                              <span className="text-xs font-bold font-mono text-white hover:text-brand-300">
                                {col.column}
                              </span>
                            </div>

                            <button
                              onClick={() => setActiveInspectCol(col.column)}
                              className={`p-1 rounded text-slate-400 hover:text-white ${isInspecting ? 'text-brand-400' : ''}`}
                              title="Inspect distribution"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {col.unique_count} distinct
                            </span>
                            {col.has_nulls && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                                {col.null_count} nulls
                              </span>
                            )}
                            <button
                              onClick={() => {
                                if (!isSelected) handleToggleColumn(col.column);
                                setSelectedMethod(col.recommended_method);
                              }}
                              className="px-1.5 py-0.5 rounded bg-brand-950/80 border border-brand-700/50 text-brand-300 hover:bg-brand-900/80 transition-colors"
                              title="Click to adopt recommended method"
                            >
                              Rec: <strong>{col.recommended_method}</strong>
                            </button>
                          </div>

                          {/* Category frequency preview pills */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {col.top_categories.slice(0, 4).map((cat, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-mono truncate max-w-[100px]">
                                {cat}
                              </span>
                            ))}
                            {col.unique_count > 4 && (
                              <span className="text-[10px] text-slate-500 self-center">
                                +{col.unique_count - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Column Cardinality Breakdown Drawer */}
                {currentInspectColData && (
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 font-mono">{currentInspectColData.column} Distribution</span>
                      <span className="text-[11px] text-slate-500">{currentInspectColData.unique_count} total categories</span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      {currentInspectColData.rationale}
                    </p>

                    {currentInspectColData.category_counts && Object.keys(currentInspectColData.category_counts).length > 0 && (
                      <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto pr-1">
                        {Object.entries(currentInspectColData.category_counts).map(([cat, count]) => {
                          const maxCount = Math.max(...Object.values(currentInspectColData.category_counts));
                          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                          return (
                            <div key={cat} className="space-y-0.5">
                              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                                <span className="truncate max-w-[150px]">{cat}</span>
                                <span className="text-slate-500">{count}</span>
                              </div>
                              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-brand-500 h-1.5 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Strategy Studio & Preview (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Method Selector & Strategy Configuration */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Binary className="w-4 h-4 text-purple-400" />
                      Select Encoding Strategy
                    </h3>
                    <span className="text-xs text-slate-400">
                      Applied to <strong className="text-white">{selectedColumns.length}</strong> selected column(s)
                    </span>
                  </div>

                  {/* 4 Strategy Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { 
                        id: 'one_hot', 
                        name: 'One-Hot (OHE)', 
                        badge: 'Nominal',
                        color: 'brand',
                        desc: 'Binary indicator per level. No artificial math ordering.' 
                      },
                      { 
                        id: 'ordinal', 
                        name: 'Ordinal', 
                        badge: 'Ranked',
                        color: 'purple',
                        desc: 'Meaningful integer sequence. Preserves natural ranks.' 
                      },
                      { 
                        id: 'frequency', 
                        name: 'Frequency', 
                        badge: 'High Card.',
                        color: 'cyan',
                        desc: 'Encodes category rarity % without expanding columns.' 
                      },
                      { 
                        id: 'label', 
                        name: 'Label', 
                        badge: 'Binary/Trees',
                        color: 'brand',
                        desc: '0, 1, 2... Fast integer mapping for binary or targets.' 
                      },
                    ].map((m) => {
                      const isActive = selectedMethod === m.id;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setSelectedMethod(m.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                            isActive
                              ? 'bg-purple-950/40 border-purple-500 text-white shadow-md ring-1 ring-purple-500/30'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white">{m.name}</span>
                              <span className="text-[9px] px-1 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                                {m.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">{m.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Strategy-Specific Parameters */}
                  {selectedMethod === 'one_hot' && (
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="dropFirst"
                          checked={dropFirst}
                          onChange={(e) => setDropFirst(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="space-y-1">
                          <label htmlFor="dropFirst" className="text-xs font-bold text-white cursor-pointer flex items-center gap-2">
                            <span>Drop First Category (<code>drop_first=True</code>)</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50">
                              Dummy Variable Trap Prevention
                            </span>
                          </label>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Recommended for unregularized linear models (Linear/Logistic Regression). Drops the first baseline level to eliminate perfect multicollinearity with the intercept.
                          </p>
                        </div>
                      </div>

                      {/* Rare category grouping */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="groupRare"
                          checked={groupRare}
                          onChange={(e) => setGroupRare(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer mt-0.5"
                        />
                        <div className="space-y-2 flex-1">
                          <label htmlFor="groupRare" className="text-xs font-bold text-white cursor-pointer">
                            Group Rare Categories into <code>"Other"</code>
                          </label>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Combines infrequent levels to prevent creating dozens of sparse, near-zero indicator columns.
                          </p>
                          {groupRare && (
                            <div className="flex items-center gap-3 pt-1">
                              <span className="text-[11px] text-slate-400 font-mono">Min Threshold:</span>
                              <input
                                type="range"
                                min="0.01"
                                max="0.10"
                                step="0.01"
                                value={rareThreshold}
                                onChange={(e) => setRareThreshold(parseFloat(e.target.value))}
                                className="w-32 accent-brand-500 cursor-pointer"
                              />
                              <span className="text-xs font-mono font-bold text-brand-400">
                                {(rareThreshold * 100).toFixed(0)}% frequency
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ordinal Category Ordering Studio */}
                  {selectedMethod === 'ordinal' && (
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-purple-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Interactive Category Hierarchy Studio
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Lowest Rank (0) → Highest Rank (N-1)
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Ordinal encoding requires correct mathematical ordering. Arrange pills from lowest level to highest level:
                      </p>

                      {selectedColumns.map((colName) => {
                        const colData = summary?.columns?.find((c) => c.column === colName);
                        const items = ordinalOrders[colName] || colData?.all_categories || [];
                        const detected = colData?.detected_ordinal_order;

                        return (
                          <div key={colName} className="p-3 bg-slate-900 rounded-xl border border-slate-800/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-brand-300">{colName}</span>
                              <div className="flex items-center gap-2">
                                {detected && (
                                  <button
                                    onClick={() => handleApplyDetectedOrder(colName, detected)}
                                    className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-[10px] text-purple-300 hover:bg-purple-900/60 flex items-center gap-1"
                                  >
                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                    <span>Use Detected Natural Order</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleReverseOrdinal(colName)}
                                  className="text-[10px] text-slate-400 hover:text-white underline"
                                >
                                  Reverse Order
                                </button>
                              </div>
                            </div>

                            {/* Reorderable Category Pills */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              {items.map((cat, idx) => (
                                <div
                                  key={cat}
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
                                >
                                  <span className="text-[10px] font-bold text-purple-400">#{idx}</span>
                                  <span className="truncate max-w-[120px]">{cat}</span>
                                  <div className="flex flex-col ml-1">
                                    <button
                                      disabled={idx === 0}
                                      onClick={() => handleMoveOrdinalItem(colName, idx, -1)}
                                      className="text-slate-500 hover:text-white disabled:opacity-20"
                                      title="Move up"
                                    >
                                      <ArrowUp className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      disabled={idx === items.length - 1}
                                      onClick={() => handleMoveOrdinalItem(colName, idx, 1)}
                                      className="text-slate-500 hover:text-white disabled:opacity-20"
                                      title="Move down"
                                    >
                                      <ArrowDown className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Frequency Encoding Options */}
                  {selectedMethod === 'frequency' && (
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        Frequency Metric
                      </h4>
                      <div className="grid grid-cols-2 gap-3 max-w-md">
                        <div
                          onClick={() => setFrequencyMetric('frequency')}
                          className={`p-3 rounded-xl border cursor-pointer text-xs space-y-1 ${
                            frequencyMetric === 'frequency'
                              ? 'bg-cyan-950/40 border-cyan-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="font-bold">Proportion [0.0 - 1.0]</div>
                          <div className="text-[10px] text-slate-500">Normalizes count by total dataset rows</div>
                        </div>

                        <div
                          onClick={() => setFrequencyMetric('count')}
                          className={`p-3 rounded-xl border cursor-pointer text-xs space-y-1 ${
                            frequencyMetric === 'count'
                              ? 'bg-cyan-950/40 border-cyan-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="font-bold">Raw Count (Integer)</div>
                          <div className="text-[10px] text-slate-500">Exact number of occurrences in column</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Label Encoding Notice */}
                  {selectedMethod === 'label' && (
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-brand-400 text-xs font-bold">
                        <Info className="w-4 h-4" />
                        <span>Label Encoding Guidance</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Label encoding directly replaces text with integers $[0, 1, \dots, K-1]$.
                        It is ideal for binary attributes (e.g. Yes/No) or target variables $y$.
                        If applied to multi-class inputs, tree models (Random Forest, XGBoost) can isolate values,
                        but linear and distance-based algorithms will incorrectly interpret the numbers as continuous scales.
                      </p>
                    </div>
                  )}

                  {/* Simulation & Apply Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={handlePreview}
                      disabled={previewLoading || selectedColumns.length === 0}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-40 shadow"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{previewLoading ? 'Running Simulation...' : 'Simulate Preview'}</span>
                    </button>

                    <button
                      onClick={handleApply}
                      disabled={applying || selectedColumns.length === 0}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-900/30 disabled:opacity-40"
                    >
                      <span>{applying ? 'Applying & Versioning...' : 'Apply Encoding & Snapshot'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Simulation Preview Card */}
                {previewResult && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <Table className="w-4 h-4 text-brand-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Simulation Output Studio
                        </h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-brand-400 bg-brand-950/40 px-2 py-0.5 rounded border border-brand-500/20">
                          {previewResult.before_columns_count} → {previewResult.after_columns_count} columns
                        </span>
                      </div>
                    </div>

                    {/* Metrics Banner */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Columns Delta</div>
                        <div className="text-base font-bold font-mono text-white mt-1">
                          +{previewResult.after_columns_count - previewResult.before_columns_count}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Matrix Sparsity</div>
                        <div className="text-base font-bold font-mono text-amber-400 mt-1">
                          {previewResult.sparsity_percentage}% 0s
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Memory Delta</div>
                        <div className="text-base font-bold font-mono text-cyan-400 mt-1">
                          {previewResult.memory_impact_kb >= 0 ? `+${previewResult.memory_impact_kb}` : previewResult.memory_impact_kb} KB
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Dummy Trap</div>
                        <div className={`text-base font-bold font-mono mt-1 ${
                          previewResult.dummy_variable_trap_risk ? 'text-amber-400' : 'text-brand-400'
                        }`}>
                          {previewResult.dummy_variable_trap_risk ? 'At Risk' : 'Safe'}
                        </div>
                      </div>
                    </div>

                    {/* Warnings */}
                    {previewResult.warnings?.length > 0 && (
                      <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5">
                        {previewResult.warnings.map((w, idx) => (
                          <div key={idx} className="text-xs text-amber-300 flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Category Mapping Details */}
                    {previewResult.category_mappings && Object.keys(previewResult.category_mappings).length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300">Feature Mappings Applied:</span>
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto max-h-32 text-xs font-mono text-slate-300">
                          {Object.entries(previewResult.category_mappings).map(([k, v]) => (
                            <div key={k} className="py-0.5">
                              <strong className="text-brand-400">{k}:</strong> {JSON.stringify(v)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Encoded Preview Table */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-300">Preview Rows (Before vs. Encoded):</span>
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-slate-800">
                            <tr>
                              <th className="py-2.5 px-3">#</th>
                              <th className="py-2.5 px-3 text-amber-300">Original Values</th>
                              <th className="py-2.5 px-3 text-brand-300">Encoded Numerical Representation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 text-slate-300">
                            {previewResult.sample_rows?.map((row) => (
                              <tr key={row.index} className="hover:bg-slate-900/40">
                                <td className="py-2.5 px-3 text-slate-500">{row.index}</td>
                                <td className="py-2.5 px-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(row.original_values || {}).map(([k, v]) => (
                                      <span key={k} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                        {k}: <strong className="text-white">{v !== null && v !== undefined ? String(v) : 'null'}</strong>
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(row.encoded_values || {}).map(([k, v]) => (
                                      <span key={k} className="px-1.5 py-0.5 rounded bg-brand-950/60 border border-brand-500/20 text-brand-300">
                                        {k}: <strong>{v !== null && v !== undefined ? String(v) : 'null'}</strong>
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Step Navigation */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <button
                onClick={() => goToStep('outliers')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                Back to 05 Outlier Treatment
              </button>

              <button
                onClick={() => goToStep('scaling')}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow"
              >
                <span>Proceed to 07. Feature Scaling</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step06DataEncoding;
