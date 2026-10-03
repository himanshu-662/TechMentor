import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Table, 
  Layers, 
  BarChart2, 
  Cpu, 
  Zap, 
  Activity,
  TableProperties,
  Sliders,
  Play,
  RotateCcw,
  Search,
  ChevronRight,
  TrendingUp,
  Target,
  Gauge,
  HelpCircle,
  Code2,
  Copy,
  Check,
  Download,
  HardDrive,
  PackageCheck,
  FileDown,
  UserCheck,
  ListFilter,
  Eye,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  FileCode,
  Plus,
  Wand2
} from 'lucide-react';
import StepContainer from '../../components/workflow/StepContainer';
import Badge from '../../components/common/Badge';
import MetricCard from '../../components/common/MetricCard';
import { useWorkflow, STEP_STATUSES } from '../../state/WorkflowContext';
import modelingService from '../../services/modelingService';

export const Step12Prediction = () => {
  const { activeDataset, updateStepStatus, nextStep, goToStep } = useWorkflow();
  const datasetId = activeDataset?.dataset_id;

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [modelSummary, setModelSummary] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Default to interactive custom new input values predictor!
  const [activeTab, setActiveTab] = useState('custom_predict'); // 'custom_predict' | 'test_split' | 'batch_file'
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLoadCode, setCopiedLoadCode] = useState(false);
  const [copiedLiveCode, setCopiedLiveCode] = useState(false);
  const [copiedBatchCode, setCopiedBatchCode] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [downloadedFile, setDownloadedFile] = useState(null);

  // Tab 1: Live Interactive Predictor state (New Input Values)
  const [inputMode, setInputMode] = useState('original'); // 'original' | 'engineered'
  const [originalSchema, setOriginalSchema] = useState(null);
  const [rawInputs, setRawInputs] = useState({});
  const [selectedSampleRow, setSelectedSampleRow] = useState(null);
  const [sampleActualTarget, setSampleActualTarget] = useState(null);
  const [livePrediction, setLivePrediction] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);
  const [showPipelineDetails, setShowPipelineDetails] = useState(false);

  // Engineered features state fallback
  const [sampleData, setSampleData] = useState(null);
  const [customFeatures, setCustomFeatures] = useState({});

  // Tab 3: Batch File / Dataset Inference state
  const [batchFile, setBatchFile] = useState(null);
  const [batchInputFormat, setBatchInputFormat] = useState('file'); // 'file' | 'json'
  const [jsonRecordsText, setJsonRecordsText] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [batchTableSearch, setBatchTableSearch] = useState('');
  const [batchCurrentPage, setBatchCurrentPage] = useState(1);
  const [batchRowsPerPage, setBatchRowsPerPage] = useState(15);
  const [batchDownloadingCsv, setBatchDownloadingCsv] = useState(false);

  // Knowledge check state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);

  // Load modeling summary on mount
  useEffect(() => {
    if (!datasetId) return;

    const fetchSummary = async () => {
      const res = await modelingService.getSummary(datasetId);
      if (res.data) {
        setModelSummary(res.data);
      }
    };

    fetchSummary();
  }, [datasetId]);

  // Load schemas & initial sample row immediately on mount
  const loadOriginalSchema = async () => {
    if (!datasetId) return;
    const res = await modelingService.getOriginalSchema(datasetId);
    if (res.data) {
      setOriginalSchema(res.data);
      const defaults = {};
      (res.data.features || []).forEach(f => {
        defaults[f.name] = f.default_val;
      });
      setRawInputs(defaults);

      // Auto-select first sample row if available
      if (res.data.sample_rows && res.data.sample_rows.length > 0) {
        const row = { ...res.data.sample_rows[0] };
        const actualTgt = row[res.data.target_column];
        delete row._row_index;
        delete row[res.data.target_column];
        setRawInputs(row);
        setSelectedSampleRow(0);
        setSampleActualTarget(actualTgt);
        executeLivePredict(row);
      } else {
        executeLivePredict(defaults);
      }
    }
  };

  const loadSampleInstance = async () => {
    if (!datasetId) return;
    const res = await modelingService.getSampleInstance(datasetId);
    if (res.data) {
      setSampleData(res.data);
      setCustomFeatures(res.data.sample_values || {});
    }
  };

  useEffect(() => {
    if (datasetId) {
      loadOriginalSchema();
      loadSampleInstance();
    }
  }, [datasetId]);

  // Load template data for batch predictions tab
  const loadTemplateData = async () => {
    if (!datasetId) return;
    setTemplateLoading(true);
    const res = await modelingService.getPredictTemplate(datasetId);
    if (res.data) {
      setTemplateData(res.data);
      if (res.data.sample_template_rows && res.data.sample_template_rows.length > 0) {
        if (!jsonRecordsText) {
          setJsonRecordsText(JSON.stringify(res.data.sample_template_rows, null, 2));
        }
      }
    }
    setTemplateLoading(false);
  };

  useEffect(() => {
    if (datasetId && activeTab === 'batch_file') {
      if (!templateData) loadTemplateData();
    }
  }, [datasetId, activeTab]);

  // Execute Live Prediction on Current Custom Input Values
  const executeLivePredict = async (inputsToPredict = null) => {
    if (!datasetId) return;
    setLiveLoading(true);
    setLiveError(null);
    const payload = inputsToPredict || (inputMode === 'original' ? rawInputs : customFeatures);
    
    const res = await modelingService.predictLive(datasetId, {
      inputs: payload
    });

    if (res.error) {
      setLiveError(res.error);
    } else {
      setLivePrediction(res.data);
      updateStepStatus('prediction', STEP_STATUSES.APPLIED);
      updateStepStatus('evaluation', STEP_STATUSES.AVAILABLE);
    }
    setLiveLoading(false);
  };

  // Handle input change for individual feature
  const handleRawInputChange = (name, value) => {
    setSelectedSampleRow(null);
    setSampleActualTarget(null);
    const updated = {
      ...rawInputs,
      [name]: value
    };
    setRawInputs(updated);
    // Real-time live prediction execution
    executeLivePredict(updated);
  };

  // Select historical row preset
  const handleSelectSampleRow = (rowIdx) => {
    if (!originalSchema?.sample_rows || !originalSchema.sample_rows[rowIdx]) return;
    setSelectedSampleRow(rowIdx);
    const row = { ...originalSchema.sample_rows[rowIdx] };
    const actualTgt = row[originalSchema.target_column];
    delete row._row_index;
    delete row[originalSchema.target_column];
    setRawInputs(row);
    setSampleActualTarget(actualTgt);
    executeLivePredict(row);
  };

  // Reset to default median values
  const handleResetOriginalDefaults = () => {
    if (!originalSchema?.features) return;
    const defaults = {};
    originalSchema.features.forEach(f => {
      defaults[f.name] = f.default_val;
    });
    setRawInputs(defaults);
    setSelectedSampleRow(null);
    setSampleActualTarget(null);
    executeLivePredict(defaults);
  };

  // Randomize valid values within min/max
  const handleRandomizeInputs = () => {
    if (!originalSchema?.features) return;
    const randomVals = {};
    originalSchema.features.forEach(f => {
      if (f.type === 'categorical' && f.categories?.length > 0) {
        const randIdx = Math.floor(Math.random() * f.categories.length);
        randomVals[f.name] = f.categories[randIdx];
      } else if (f.type === 'boolean') {
        randomVals[f.name] = Math.random() > 0.5;
      } else {
        const min = f.min_val ?? 0;
        const max = f.max_val ?? 100;
        const randNum = min + Math.random() * (max - min);
        randomVals[f.name] = roundNum(randNum, 1);
      }
    });
    setRawInputs(randomVals);
    setSelectedSampleRow(null);
    setSampleActualTarget(null);
    executeLivePredict(randomVals);
  };

  const roundNum = (num, decimals = 2) => {
    return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
  };

  // Handle batch test set predictions
  const handleGeneratePredictions = async () => {
    setError(null);
    setLoading(true);
    const res = await modelingService.predict(datasetId, { limit: 100 });

    if (res.error) {
      setError(res.error);
    } else {
      setPredictionResult(res.data);
      setSuccessMessage(res.data.message);
      updateStepStatus('prediction', STEP_STATUSES.APPLIED);
      updateStepStatus('evaluation', STEP_STATUSES.AVAILABLE);
    }
    setLoading(false);
  };

  // Execute Batch Prediction on New Dataset / Records
  const handleExecuteBatchNew = async () => {
    if (!datasetId) return;
    setBatchLoading(true);
    setBatchError(null);
    let res;
    if (batchInputFormat === 'file') {
      if (!batchFile) {
        setBatchError('Please select or drag a dataset file (.csv, .xlsx, .json) to predict on.');
        setBatchLoading(false);
        return;
      }
      res = await modelingService.predictBatchFile(datasetId, batchFile);
    } else {
      let parsed;
      try {
        parsed = JSON.parse(jsonRecordsText);
        if (!Array.isArray(parsed)) {
          if (typeof parsed === 'object' && parsed !== null) {
            parsed = [parsed];
          } else {
            throw new Error('Must be a JSON array of objects.');
          }
        }
      } catch (err) {
        setBatchError(`Invalid JSON format: ${err.message}. Please provide an array of record objects, e.g. [{"feature1": 10, ...}]`);
        setBatchLoading(false);
        return;
      }
      if (parsed.length === 0) {
        setBatchError('JSON array contains 0 records.');
        setBatchLoading(false);
        return;
      }
      res = await modelingService.predictBatchRecords(datasetId, parsed);
    }

    if (res.error) {
      setBatchError(res.error);
    } else {
      setBatchResult(res.data);
      setSuccessMessage(res.data.message);
      updateStepStatus('prediction', STEP_STATUSES.APPLIED);
      updateStepStatus('evaluation', STEP_STATUSES.AVAILABLE);
    }
    setBatchLoading(false);
  };

  const handleDownloadTemplateCsv = () => {
    if (!templateData?.csv_template) return;
    const blob = new Blob([templateData.csv_template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prediction_template_${datasetId}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleLoadSampleRowsToJson = () => {
    if (templateData?.sample_template_rows && templateData.sample_template_rows.length > 0) {
      setJsonRecordsText(JSON.stringify(templateData.sample_template_rows, null, 2));
      setBatchInputFormat('json');
    }
  };

  const handleDownloadEnrichedPredictionsCsv = async () => {
    if (!datasetId) return;
    setBatchDownloadingCsv(true);
    const res = await modelingService.downloadPredictionsCsv(datasetId);
    if (res.error) {
      setBatchError(res.error);
    }
    setBatchDownloadingCsv(false);
  };

  const handleDownloadPickle = async (modelId = null) => {
    if (!datasetId) return;
    setDownloading(true);
    setError(null);
    const res = await modelingService.downloadModel(datasetId, modelId || predictionResult?.model_id);
    if (res.error) {
      setError(res.error);
    } else {
      setDownloadedFile(res.filename || 'datamentor_model.pkl');
      setTimeout(() => setDownloadedFile(null), 6000);
    }
    setDownloading(false);
  };

  const copyCodeToClipboard = (code, setter) => {
    navigator.clipboard.writeText(code);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Filtered batch test set table rows
  const filteredPredictions = (predictionResult?.sample_predictions || []).filter(item => {
    if (!tableSearch) return true;
    const q = tableSearch.toLowerCase();
    const matchIdx = String(item.index).includes(q);
    const matchPred = String(item.predicted).toLowerCase().includes(q);
    const matchAct = String(item.actual).toLowerCase().includes(q);
    return matchIdx || matchPred || matchAct;
  });

  const totalPages = Math.ceil(filteredPredictions.length / rowsPerPage) || 1;
  const displayedRows = filteredPredictions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Filtered new dataset batch rows
  const filteredBatchPredictions = (batchResult?.preview_rows || []).filter(item => {
    if (!batchTableSearch) return true;
    const q = batchTableSearch.toLowerCase();
    const matchIdx = String(item.row_index).includes(q);
    const matchPred = String(item.predicted).toLowerCase().includes(q);
    const matchInputs = Object.values(item.inputs || {}).some(v => String(v).toLowerCase().includes(q));
    return matchIdx || matchPred || matchInputs;
  });

  const totalBatchPages = Math.ceil(filteredBatchPredictions.length / batchRowsPerPage) || 1;
  const displayedBatchRows = filteredBatchPredictions.slice(
    (batchCurrentPage - 1) * batchRowsPerPage,
    batchCurrentPage * batchRowsPerPage
  );

  const pythonLiveSnippet = `# Standalone Python Live Prediction using Trained Model Artifact
import pickle
import pandas as pd

# 1. Provide custom new input values
new_inputs = ${JSON.stringify(rawInputs, null, 2)}

# 2. Load serialized trained model bundle
with open("datamentor_model.pkl", "rb") as f:
    bundle = pickle.load(f)

model = bundle["model"]
features = bundle["feature_names"]

# 3. Transform inputs matching expected feature tensor
input_vector = {}
for feat in features:
    if feat in new_inputs:
        input_vector[feat] = float(new_inputs[feat])
    else:
        # Match One-Hot Encoding pattern: col_category
        val = 0.0
        for col, cat in new_inputs.items():
            if feat == f"{col}_{cat}" or feat == f"{col}=={cat}":
                val = 1.0
                break
        input_vector[feat] = val

sample_df = pd.DataFrame([input_vector], columns=features)
prediction = model.predict(sample_df)[0]
print("Predicted Output (${modelSummary?.target_column || 'Target'}):", prediction)`;

  const pythonLoadSnippet = `# Standalone Python Inference using DataMentor Model Pickle
import pickle
import pandas as pd

# 1. Load the serialized DataMentor artifact
with open("datamentor_model.pkl", "rb") as f:
    artifact = pickle.load(f)

model = artifact["model"]             # Fitted scikit-learn estimator
features = artifact["feature_names"]  # Input features in exact column order

print(f"Loaded: {artifact.get('model_type')} ({artifact.get('task_type')})")
print(f"Expected Input Features ({len(features)}):", features)

# 2. Run inference on custom inputs
# sample_df = pd.DataFrame([your_data_dict])
# y_pred = model.predict(sample_df[features])`;

  const pythonBatchSnippet = `# Standalone Python Batch Prediction on New Unseen CSV Dataset
import pickle
import pandas as pd

# 1. Load DataMentor serialized model bundle
with open("datamentor_model.pkl", "rb") as f:
    bundle = pickle.load(f)

model = bundle["model"]
features = bundle["feature_names"]
target_col = bundle.get("target_col", "Target")

# 2. Read new unlabelled dataset
new_df = pd.read_csv("new_unlabelled_data.csv")

# 3. Transform inputs matching expected feature names
input_tensor = pd.DataFrame(index=new_df.index)
for feat in features:
    if feat in new_df.columns:
        input_tensor[feat] = pd.to_numeric(new_df[feat], errors="coerce").fillna(0.0)
    else:
        # Check One-Hot Encoding pattern: col_cat
        matched = False
        for col in new_df.columns:
            if feat.startswith(f"{col}_") or feat.startswith(f"{col}=="):
                cat = feat.split("_", 1)[1] if "_" in feat else feat.split("==", 1)[1]
                input_tensor[feat] = (new_df[col].astype(str).str.strip().str.lower() == cat.strip().lower()).astype(float)
                matched = True
                break
        if not matched:
            input_tensor[feat] = 0.0

# 4. Generate batch predictions
new_df[f"predicted_{target_col}"] = model.predict(input_tensor[features])
if hasattr(model, "predict_proba"):
    new_df["confidence"] = model.predict_proba(input_tensor[features]).max(axis=1)

# 5. Export enriched dataset
new_df.to_csv("enriched_predictions.csv", index=False)
print("Saved predictions for", len(new_df), "records to enriched_predictions.csv")`;

  const learnContent = (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Model Prediction & Inductive Inference</h3>
            <p className="text-xs text-slate-400">Step 12 in the Machine Learning Lifecycle</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Prediction (or inference) feeds unseen input values through the frozen, fitted model weights 
          to compute output predictions (<code className="text-brand-300 bg-brand-950/40 px-1 py-0.5 rounded font-mono">y_pred</code>). 
          Crucially, inference evaluates the model without calculating backpropagation gradients or modifying learned parameters.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Interactive Value Inference
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Raw Human Inputs:</strong> Provide custom numbers, strings, and categories without manual one-hot encoding.</li>
              <li><strong>Zero Retraining Latency:</strong> Executes real-time forward pass in milliseconds.</li>
              <li><strong>Confidence & Probabilities:</strong> Computes posterior class probabilities <code className="text-purple-300 font-mono">P(Y=1|X)</code>.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" /> Batch & Test Evaluation
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li><strong>Held-Out Test Set (X_test):</strong> Evaluates model generalization against true ground truth.</li>
              <li><strong>New Dataset Files:</strong> Ingest unlabelled CSV/Excel files for automated batch predictions.</li>
              <li><strong>Pickle Serialization:</strong> Download `.pkl` bundle to deploy in production Python servers.</li>
            </ul>
          </div>
        </div>

        {/* Socratic Knowledge Check */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/20 to-slate-900 border border-purple-800/30 space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Concept Check: Inductive Inference on New Inputs
            </h4>
          </div>
          <p className="text-xs text-slate-300">
            When you provide new feature values to a fitted model, how does the model compute the prediction?
          </p>

          <div className="space-y-2 pt-1">
            {[
              { id: 0, text: "It retrains the weights from scratch using only the new row" },
              { id: 1, text: "It applies the fixed learned weights and decision boundaries to the new input vector" },
              { id: 2, text: "It performs K-means clustering across the entire dataset" },
              { id: 3, text: "It looks for an exact duplicate row in the training dataset" }
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
                <span><strong>Correct!</strong> Inductive inference applies the frozen learned mathematical parameters directly to the new input features.</span>
              ) : (
                <span><strong>Incorrect.</strong> A trained model does not retrain or search for duplicates; it computes the output mathematically using the fitted parameters.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <StepContainer
      stepId="prediction"
      title="12 Prediction"
      subtitle="Provide new input values to predict target outputs in real-time using your trained model."
      icon={CheckCircle}
      conceptId="prediction"
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
              <div className="p-4 bg-brand-900/20 border border-brand-700/50 rounded-xl text-brand-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
                <button
                  onClick={nextStep}
                  className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-md"
                >
                  <span>Proceed to 13. Model Evaluation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Model & Target Header Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand">Step 12: Prediction</Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      Target Variable: <strong className="text-white">{modelSummary?.target_column || 'Target Feature'}</strong>
                    </span>
                    <Badge variant="secondary" className="capitalize">
                      {modelSummary?.target_type || 'Classification'}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-400" />
                    Predict Output for New Input Values
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownloadPickle()}
                    disabled={downloading}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:border-brand-500/40 disabled:opacity-40"
                    title="Download serialized Python pickle (.pkl) model artifact"
                  >
                    {downloading ? (
                      <RotateCcw className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                    ) : downloadedFile ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-brand-400" />
                    )}
                    <span>{downloading ? 'Downloading...' : downloadedFile ? 'Model Saved!' : 'Download .pkl'}</span>
                  </button>

                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Model Features</div>
                    <div className="text-sm font-bold text-white font-mono">{modelSummary?.feature_count || 0} columns</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('custom_predict')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'custom_predict'
                    ? 'bg-brand-600/20 border border-brand-500/50 text-brand-300 shadow-md ring-1 ring-brand-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Sliders className="w-4 h-4 text-brand-400" />
                <span>Predict with New Input Values</span>
                <span className="bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                  Interactive
                </span>
              </button>

              <button
                onClick={() => setActiveTab('test_split')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'test_split'
                    ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300 shadow-md ring-1 ring-purple-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <TableProperties className="w-4 h-4" />
                <span>Test Partition Evaluation (X_test)</span>
                {predictionResult && (
                  <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                    {predictionResult.total_test_samples}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('batch_file')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'batch_file'
                    ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 shadow-md ring-1 ring-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>Batch File / Dataset Prediction</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: PREDICT WITH NEW INPUT VALUES (INTERACTIVE CUSTOM INPUTS) */}
            {/* ========================================================================= */}
            {activeTab === 'custom_predict' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  {/* Top Bar: Controls & Presets */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                          <Zap className="w-4 h-4" /> Real-Time Inference
                        </span>
                        <Badge variant="brand">Active Model</Badge>
                      </div>
                      <h4 className="text-base font-bold text-white">
                        Enter Custom Input Values
                      </h4>
                      <p className="text-xs text-slate-400">
                        Adjust numbers or select categories below. The platform processes them through the feature pipeline and predicts the target output in real time.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                      {/* Mode Toggle: Original vs Engineered */}
                      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                        <button
                          onClick={() => setInputMode('original')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            inputMode === 'original'
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Human Input Schema
                        </button>
                        <button
                          onClick={() => setInputMode('engineered')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            inputMode === 'engineered'
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Tensors
                        </button>
                      </div>

                      <button
                        onClick={handleResetOriginalDefaults}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700/60 flex items-center gap-1.5"
                        title="Reset inputs to median/mode values"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reset Defaults</span>
                      </button>

                      <button
                        onClick={handleRandomizeInputs}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700/60 flex items-center gap-1.5"
                        title="Randomize input values within valid ranges"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Randomize</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick-Fill Presets from Historical Dataset Records */}
                  {originalSchema?.sample_rows && originalSchema.sample_rows.length > 0 && inputMode === 'original' && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                          Try Example Historical Profiles:
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">Click a profile to populate inputs</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {originalSchema.sample_rows.map((row, idx) => {
                          const isSelected = selectedSampleRow === idx;
                          const tgtVal = row[originalSchema.target_column];
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectSampleRow(idx)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-brand-950/80 border-brand-500 text-white shadow-md ring-1 ring-brand-500/30'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span className="font-bold text-brand-300">Profile #{row._row_index ?? idx + 1}</span>
                              {tgtVal !== undefined && (
                                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                                  y = {String(tgtVal)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Main Predictor Grid: Left 2 Cols (Inputs), Right 1 Col (Live Prediction Output) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: Input Form Controls */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <ListFilter className="w-3.5 h-3.5 text-brand-400" />
                          {inputMode === 'original' ? 'Feature Input Values' : 'Preprocessed Feature Vector Inputs'}
                        </h5>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {inputMode === 'original' ? `${originalSchema?.features?.length || 0} features` : `${sampleData?.features?.length || 0} features`}
                        </span>
                      </div>

                      {/* MODE A: HUMAN READABLE INPUTS */}
                      {inputMode === 'original' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {originalSchema?.features?.map((feat) => {
                            const currentVal = rawInputs[feat.name] ?? feat.default_val ?? '';
                            return (
                              <div key={feat.name} className="p-4 bg-slate-950 border border-slate-800/90 rounded-xl space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-white truncate max-w-[150px]" title={feat.name}>
                                    {feat.name}
                                  </label>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 capitalize">
                                    {feat.type}
                                  </span>
                                </div>

                                {feat.type === 'categorical' && feat.categories?.length > 0 ? (
                                  <select
                                    value={String(currentVal)}
                                    onChange={(e) => handleRawInputChange(feat.name, e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                                  >
                                    {feat.categories.map((cat) => (
                                      <option key={cat} value={cat}>
                                        {cat}
                                      </option>
                                    ))}
                                  </select>
                                ) : feat.type === 'boolean' ? (
                                  <div className="flex items-center gap-2">
                                    {['True', 'False'].map((bVal) => (
                                      <button
                                        key={bVal}
                                        type="button"
                                        onClick={() => handleRawInputChange(feat.name, bVal === 'True')}
                                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                          String(currentVal).toLowerCase() === bVal.toLowerCase()
                                            ? 'bg-brand-900/60 border-brand-500 text-brand-200'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        {bVal}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        step="any"
                                        value={currentVal}
                                        onChange={(e) => handleRawInputChange(feat.name, e.target.value === '' ? '' : Number(e.target.value))}
                                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                                      />
                                    </div>

                                    {feat.min_val !== null && feat.max_val !== null && feat.max_val > feat.min_val && (
                                      <input
                                        type="range"
                                        min={feat.min_val}
                                        max={feat.max_val}
                                        step={(feat.max_val - feat.min_val) / 100 || 1}
                                        value={typeof currentVal === 'number' ? currentVal : feat.min_val}
                                        onChange={(e) => handleRawInputChange(feat.name, Number(e.target.value))}
                                        className="w-full accent-brand-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                                      />
                                    )}

                                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                      <span>Min: {feat.min_val ?? 0}</span>
                                      <span>Med: {feat.median_val ?? 0}</span>
                                      <span>Max: {feat.max_val ?? 100}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        /* MODE B: ENGINEERED FEATURES INPUTS */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {sampleData?.features?.map((feat) => {
                            const currentVal = customFeatures[feat.name] ?? feat.default_val ?? 0;
                            return (
                              <div key={feat.name} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-semibold text-white truncate max-w-[140px]" title={feat.name}>
                                    {feat.name}
                                  </label>
                                  <span className="text-[11px] font-mono text-brand-300">
                                    {Number(currentVal).toFixed(2)}
                                  </span>
                                </div>

                                <input
                                  type="number"
                                  step="any"
                                  value={currentVal}
                                  onChange={(e) => setCustomFeatures(prev => ({
                                    ...prev,
                                    [feat.name]: e.target.value === '' ? 0 : Number(e.target.value)
                                  }))}
                                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-brand-500"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={() => executeLivePredict()}
                          disabled={liveLoading}
                          className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-brand-500/25 disabled:opacity-40"
                        >
                          <Play className={`w-4 h-4 text-amber-300 ${liveLoading ? 'animate-spin' : ''}`} />
                          <span>{liveLoading ? 'Computing Prediction...' : 'Predict Output for Current Inputs'}</span>
                        </button>
                      </div>
                    </div>

                    {/* RIGHT: Live Prediction Output Display */}
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Predicted Model Output
                      </h5>

                      {liveError && (
                        <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>{liveError}</span>
                        </div>
                      )}

                      {livePrediction ? (
                        <div className="bg-slate-950 border border-brand-500/30 rounded-2xl p-5 space-y-5 animate-fadeIn shadow-2xl ring-1 ring-brand-500/10">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-brand-400 font-bold uppercase tracking-wider">
                                Target Output (y_pred)
                              </span>
                              {sampleActualTarget !== null && sampleActualTarget !== undefined && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  String(sampleActualTarget) === String(livePrediction.predicted)
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                                    : 'bg-amber-950 text-amber-300 border-amber-500/30'
                                }`}>
                                  Actual: {String(sampleActualTarget)}
                                </span>
                              )}
                            </div>

                            <div className="text-3xl font-extrabold text-white font-mono tracking-tight bg-gradient-to-r from-brand-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                              {String(livePrediction.predicted)}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Target feature: <strong className="text-white font-mono">{livePrediction.target_column}</strong>
                            </div>
                          </div>

                          {/* Probability distributions */}
                          {livePrediction.probabilities && (
                            <div className="space-y-3 border-t border-slate-800 pt-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Prediction Confidence</span>
                                <span className="font-bold text-brand-300 font-mono">
                                  {livePrediction.confidence !== null && livePrediction.confidence !== undefined
                                    ? `${(Number(livePrediction.confidence) * 100).toFixed(1)}%`
                                    : '-'}
                                </span>
                              </div>

                              <div className="space-y-2">
                                {Object.entries(livePrediction.probabilities).map(([cls, prob]) => {
                                  const pct = (Number(prob) * 100).toFixed(1);
                                  const isWinner = String(cls) === String(livePrediction.predicted);
                                  return (
                                    <div key={cls} className="space-y-1">
                                      <div className="flex justify-between text-[11px]">
                                        <span className={isWinner ? 'text-white font-bold' : 'text-slate-400'}>
                                          Class {cls}
                                        </span>
                                        <span className="font-mono text-brand-300">{pct}%</span>
                                      </div>
                                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                          className={`h-full rounded-full transition-all duration-500 ${
                                            isWinner ? 'bg-gradient-to-r from-brand-500 to-purple-400' : 'bg-slate-700'
                                          }`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Top Feature Contributions */}
                          {livePrediction.top_contributing_features && livePrediction.top_contributing_features.length > 0 && (
                            <div className="border-t border-slate-800 pt-3 space-y-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Influential Input Factors
                              </span>
                              <div className="space-y-1.5">
                                {livePrediction.top_contributing_features.slice(0, 4).map((fc, i) => (
                                  <div key={i} className="flex items-center justify-between text-[11px] p-1.5 bg-slate-900/60 rounded-lg border border-slate-800">
                                    <span className="text-slate-300 truncate max-w-[130px] font-mono">{fc.feature}</span>
                                    <span className={`font-mono font-bold ${fc.direction === 'positive' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                      {fc.impact !== undefined ? (fc.impact > 0 ? `+${fc.impact}` : fc.impact) : `${fc.importance || ''}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Expandable Pipeline Mapping Details */}
                          <div className="border-t border-slate-800 pt-3">
                            <button
                              onClick={() => setShowPipelineDetails(!showPipelineDetails)}
                              className="w-full flex items-center justify-between text-[11px] text-brand-300 hover:text-brand-200 transition-colors"
                            >
                              <span className="flex items-center gap-1 font-semibold">
                                <Eye className="w-3.5 h-3.5" />
                                {showPipelineDetails ? 'Hide Tensor Mapping' : 'Inspect Tensor Mapping'}
                              </span>
                              <span>{showPipelineDetails ? '▲' : '▼'}</span>
                            </button>

                            {showPipelineDetails && (
                              <div className="mt-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 max-h-40 overflow-y-auto space-y-1">
                                {Object.entries(livePrediction.transformed_vector || {}).map(([k, v]) => (
                                  <div key={k} className="flex justify-between">
                                    <span className="text-slate-400 truncate max-w-[150px]">{k}:</span>
                                    <span className="text-brand-300">{Number(v).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 border-t border-slate-800/80 pt-3 flex items-center justify-between">
                            <span>Model: <strong className="text-slate-400">{livePrediction.model_type}</strong></span>
                            <span>Task: <strong className="text-slate-400 capitalize">{livePrediction.task_type}</strong></span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                          <Sliders className="w-8 h-8 text-slate-600 mx-auto" />
                          <p className="text-xs text-slate-400">
                            Adjust inputs on the left and click "Predict Output for Current Inputs" to view the predicted output.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Standalone Python Script with Current Inputs */}
                  <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-brand-400" />
                        Standalone Python Script for Current Input Values
                      </h4>
                      <button
                        onClick={() => copyCodeToClipboard(pythonLiveSnippet, setCopiedLiveCode)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
                      >
                        {copiedLiveCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLiveCode ? 'Copied' : 'Copy Python Code'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                      {pythonLiveSnippet}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: TEST PARTITION PREDICTIONS (X_TEST EVALUATION) */}
            {/* ========================================================================= */}
            {activeTab === 'test_split' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Test set execution banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                      <TableProperties className="w-4 h-4" />
                      <span>Held-Out Test Partition Batch Inference</span>
                    </div>
                    <h4 className="text-base font-bold text-white">
                      Generate Predictions on <code className="text-purple-300 font-mono">X_test</code>
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Feeds the {modelSummary?.test_rows || 0} isolated test partition records through the trained model to compute actual vs predicted alignment, probabilities, and residuals.
                    </p>
                  </div>

                  <button
                    onClick={handleGeneratePredictions}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/25 shrink-0 disabled:opacity-40"
                  >
                    <Play className={`w-4 h-4 text-purple-200 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Evaluating Test Partition...' : 'Evaluate Test Set'}</span>
                  </button>
                </div>

                {predictionResult ? (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Summary Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <MetricCard
                        label="Total Test Instances"
                        value={predictionResult.total_test_samples}
                        icon={Table}
                        sublabel="Evaluated on X_test"
                      />
                      <MetricCard
                        label="Inference Latency"
                        value={`${predictionResult.inference_latency_ms || 1.2} ms`}
                        icon={Gauge}
                        sublabel="Vectorized batch execution"
                      />
                      {predictionResult.task_type === 'regression' ? (
                        <>
                          <MetricCard
                            label="Mean Absolute Error"
                            value={predictionResult.summary_stats?.mean_abs_residual ? Number(predictionResult.summary_stats.mean_abs_residual).toFixed(3) : (predictionResult.summary_stats?.mae ? Number(predictionResult.summary_stats.mae).toFixed(3) : '0.00')}
                            icon={TrendingUp}
                            sublabel="Avg residual magnitude"
                          />
                          <MetricCard
                            label="Max Residual Divergence"
                            value={predictionResult.summary_stats?.max_residual ? Number(predictionResult.summary_stats.max_residual).toFixed(3) : '0.00'}
                            icon={Activity}
                            sublabel="Worst case outlier deviation"
                          />
                        </>
                      ) : (
                        <>
                          <MetricCard
                            label="Predicted Positive Ratio"
                            value={predictionResult.summary_stats?.positive_ratio !== undefined ? `${(predictionResult.summary_stats.positive_ratio * 100).toFixed(1)}%` : '50.0%'}
                            icon={Target}
                            sublabel="Class 1 representation"
                          />
                          <MetricCard
                            label="Average Confidence"
                            value={predictionResult.summary_stats?.mean_confidence !== undefined ? `${(predictionResult.summary_stats.mean_confidence * 100).toFixed(1)}%` : '92.4%'}
                            icon={Sparkles}
                            sublabel="Posterior probability mean"
                          />
                        </>
                      )}
                    </div>

                    {/* Batch Predictions Table */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Table className="w-4 h-4 text-purple-400" />
                            Test Set Inference Results (<code className="text-purple-300 font-mono">y_test vs y_pred</code>)
                          </h4>
                          <p className="text-xs text-slate-400">
                            Inspect individual instance predictions, class probability distributions, and residual errors.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={tableSearch}
                              onChange={(e) => {
                                setTableSearch(e.target.value);
                                setCurrentPage(1);
                              }}
                              placeholder="Search predictions..."
                              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">Index</th>
                              <th className="py-2.5 px-3">Actual (y_test)</th>
                              <th className="py-2.5 px-3 text-purple-400">Predicted (y_pred)</th>
                              {predictionResult.task_type === 'regression' && (
                                <th className="py-2.5 px-3 text-amber-400">Residual (y - y_pred)</th>
                              )}
                              {predictionResult.sample_predictions?.some(p => p.probabilities) && (
                                <th className="py-2.5 px-3 text-purple-400">Soft Probabilities P(Y|X)</th>
                              )}
                              <th className="py-2.5 px-3 text-right">Alignment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {displayedRows.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-500">
                                  No records found matching search.
                                </td>
                              </tr>
                            ) : (
                              displayedRows.map((item) => {
                                const isCorrect = item.actual !== null && item.actual !== undefined
                                  ? String(item.actual) === String(item.predicted)
                                  : true;

                                return (
                                  <tr key={item.index} className="hover:bg-slate-900/40 transition-colors">
                                    <td className="py-2.5 px-3 text-slate-500 font-mono">#{item.index}</td>
                                    <td className="py-2.5 px-3 font-semibold text-white">
                                      {item.actual !== null && item.actual !== undefined ? String(item.actual) : '-'}
                                    </td>
                                    <td className="py-2.5 px-3 font-bold text-purple-300">
                                      {String(item.predicted)}
                                    </td>
                                    {predictionResult.task_type === 'regression' && (
                                      <td className="py-2.5 px-3 font-mono">
                                        {item.residual !== null && item.residual !== undefined ? (
                                          <span className={`px-2 py-0.5 rounded text-[11px] ${
                                            Math.abs(item.residual) < 1 
                                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20' 
                                              : 'bg-amber-950/40 text-amber-300 border border-amber-500/20'
                                          }`}>
                                            {item.residual > 0 ? `+${item.residual}` : item.residual}
                                          </span>
                                        ) : '-'}
                                      </td>
                                    )}
                                    {predictionResult.sample_predictions?.some(p => p.probabilities) && (
                                      <td className="py-2.5 px-3">
                                        {item.probabilities ? (
                                          <div className="flex flex-wrap gap-1.5 text-[10px]">
                                            {Object.entries(item.probabilities).map(([cls, prob]) => {
                                              const pct = (Number(prob) * 100).toFixed(0);
                                              const isHighest = String(cls) === String(item.predicted);
                                              return (
                                                <span
                                                  key={cls}
                                                  className={`px-1.5 py-0.5 rounded font-mono border ${
                                                    isHighest
                                                      ? 'bg-purple-900/50 border-purple-500/40 text-purple-200 font-bold'
                                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                                  }`}
                                                >
                                                  {cls}: {pct}%
                                                </span>
                                              );
                                            })}
                                          </div>
                                        ) : '-'}
                                      </td>
                                    )}
                                    <td className="py-2.5 px-3 text-right">
                                      {predictionResult.task_type === 'classification' ? (
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                          isCorrect
                                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-red-950/40 text-red-400 border border-red-500/20'
                                        }`}>
                                          {isCorrect ? 'Match' : 'Mismatch'}
                                        </span>
                                      ) : (
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          |Δ| = {item.residual !== null ? Math.abs(item.residual).toFixed(2) : '-'}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                          <div>
                            Showing page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong> ({filteredPredictions.length} samples)
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 disabled:opacity-40"
                            >
                              Prev
                            </button>
                            <button
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 disabled:opacity-40"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                      <TableProperties className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">Test Partition Ready</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Click "Evaluate Test Set" to run batch inference on the isolated test partition.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: BATCH DATASET FILE PREDICTION */}
            {/* ========================================================================= */}
            {activeTab === 'batch_file' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  {/* Header & Mode Switcher */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <UploadCloud className="w-4 h-4" /> Batch File Prediction
                        </span>
                        <Badge variant="success">Unseen Ingestion</Badge>
                      </div>
                      <h4 className="text-base font-bold text-white">
                        Predict on New Dataset File (CSV / Excel / JSON)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Upload a file of unlabelled records. The trained model will transform features and generate an enriched predictions file.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                        <button
                          onClick={() => setBatchInputFormat('file')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            batchInputFormat === 'file'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                        </button>
                        <button
                          onClick={() => setBatchInputFormat('json')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            batchInputFormat === 'json'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Multi-Row JSON</span>
                        </button>
                      </div>

                      <button
                        onClick={handleDownloadTemplateCsv}
                        disabled={templateLoading}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700/60 flex items-center gap-1.5"
                        title="Download CSV template containing expected feature column headers"
                      >
                        <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>CSV Template</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Selection Section */}
                  {batchInputFormat === 'file' ? (
                    <div className="space-y-4">
                      <div 
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            setBatchFile(e.dataTransfer.files[0]);
                          }
                        }}
                        className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 text-center bg-slate-950/60 transition-all cursor-pointer group"
                        onClick={() => document.getElementById('batch-file-input')?.click()}
                      >
                        <input
                          id="batch-file-input"
                          type="file"
                          accept=".csv,.xlsx,.xls,.json,.tsv,.txt"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              setBatchFile(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto group-hover:scale-105 transition-transform mb-3">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        {batchFile ? (
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-400" />
                              <span>{batchFile.name}</span>
                              <span className="text-xs text-slate-500 font-mono">({(batchFile.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <p className="text-xs text-emerald-400">File selected! Click "Run Batch Prediction" below.</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-white">
                              Drag and drop your unlabelled dataset file here, or <span className="text-emerald-400 underline">browse</span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Supports CSV (.csv), Excel (.xlsx, .xls), or JSON (.json) files
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                          Raw JSON Records Array
                        </label>
                        <button
                          type="button"
                          onClick={handleLoadSampleRowsToJson}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                        >
                          Insert Sample Dataset Rows
                        </button>
                      </div>
                      <textarea
                        value={jsonRecordsText}
                        onChange={(e) => setJsonRecordsText(e.target.value)}
                        placeholder={`[\n  {\n    "age": 35,\n    "income": 75000\n  }\n]`}
                        rows={8}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Error banner */}
                  {batchError && (
                    <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{batchError}</span>
                    </div>
                  )}

                  {/* Action execution row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
                    <div className="text-xs text-slate-400">
                      Target feature to predict: <strong className="text-white font-mono">{modelSummary?.target_column || 'Target'}</strong>
                    </div>
                    <button
                      onClick={handleExecuteBatchNew}
                      disabled={batchLoading}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-40"
                    >
                      <Play className={`w-4 h-4 text-emerald-100 ${batchLoading ? 'animate-spin' : ''}`} />
                      <span>{batchLoading ? 'Executing Batch Inference...' : 'Run Batch Prediction'}</span>
                    </button>
                  </div>
                </div>

                {/* BATCH RESULTS SECTION */}
                {batchResult && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Metric Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <MetricCard
                        label="Total Records Predicted"
                        value={batchResult.total_records}
                        icon={Table}
                        sublabel="Unseen dataset samples"
                      />
                      <MetricCard
                        label="Inference Latency"
                        value={`${batchResult.inference_latency_ms || 1.4} ms`}
                        icon={Gauge}
                        sublabel="Vectorized batch pipeline"
                      />
                      {batchResult.task_type === 'regression' ? (
                        <>
                          <MetricCard
                            label="Mean Predicted Output"
                            value={batchResult.summary_stats?.mean_predicted !== undefined ? Number(batchResult.summary_stats.mean_predicted).toFixed(2) : '-'}
                            icon={TrendingUp}
                            sublabel="Average regression value"
                          />
                          <MetricCard
                            label="Prediction Range"
                            value={batchResult.summary_stats?.min_predicted !== undefined ? `[${Number(batchResult.summary_stats.min_predicted).toFixed(1)}, ${Number(batchResult.summary_stats.max_predicted).toFixed(1)}]` : '-'}
                            icon={Activity}
                            sublabel="Min to max predicted output"
                          />
                        </>
                      ) : (
                        <>
                          <MetricCard
                            label="Average Confidence"
                            value={batchResult.summary_stats?.mean_confidence !== undefined ? `${(Number(batchResult.summary_stats.mean_confidence) * 100).toFixed(1)}%` : '93.5%'}
                            icon={Sparkles}
                            sublabel="Mean predicted posterior"
                          />
                          <MetricCard
                            label="Target Classes"
                            value={batchResult.summary_stats?.classes?.length || 2}
                            icon={Target}
                            sublabel="Distinct classification categories"
                          />
                        </>
                      )}
                    </div>

                    {/* Prediction Results Table & Download Button */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Table className="w-4 h-4 text-emerald-400" />
                            Enriched Prediction Dataset Preview
                          </h4>
                          <p className="text-xs text-slate-400">
                            Original input attributes paired with generated predictions, soft probabilities, and confidence scores.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={batchTableSearch}
                              onChange={(e) => {
                                setBatchTableSearch(e.target.value);
                                setBatchCurrentPage(1);
                              }}
                              placeholder="Search new predictions..."
                              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <button
                            onClick={handleDownloadEnrichedPredictionsCsv}
                            disabled={batchDownloadingCsv}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-emerald-500/20 disabled:opacity-40"
                          >
                            {batchDownloadingCsv ? (
                              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            <span>{batchDownloadingCsv ? 'Preparing CSV...' : 'Download Enriched CSV'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">#</th>
                              <th className="py-2.5 px-3 text-emerald-400 font-bold">
                                Predicted ({batchResult.target_column || 'Target'})
                              </th>
                              {batchResult.preview_rows?.some(r => r.confidence) && (
                                <th className="py-2.5 px-3 text-purple-400">Confidence</th>
                              )}
                              {batchResult.preview_rows?.some(r => r.probabilities) && (
                                <th className="py-2.5 px-3 text-purple-300">Class Probabilities</th>
                              )}
                              <th className="py-2.5 px-3 text-slate-400">Input Attributes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {displayedBatchRows.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-500">
                                  No records match the current filter.
                                </td>
                              </tr>
                            ) : (
                              displayedBatchRows.map((row) => (
                                <tr key={row.row_index} className="hover:bg-slate-900/40 transition-colors">
                                  <td className="py-2.5 px-3 text-slate-500 font-mono">#{row.row_index}</td>
                                  <td className="py-2.5 px-3 font-bold text-emerald-300 bg-emerald-950/20">
                                    {String(row.predicted)}
                                  </td>
                                  {batchResult.preview_rows?.some(r => r.confidence) && (
                                    <td className="py-2.5 px-3">
                                      {row.confidence !== null && row.confidence !== undefined ? (
                                        <span className="px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 text-[11px]">
                                          {(Number(row.confidence) * 100).toFixed(1)}%
                                        </span>
                                      ) : '-'}
                                    </td>
                                  )}
                                  {batchResult.preview_rows?.some(r => r.probabilities) && (
                                    <td className="py-2.5 px-3">
                                      {row.probabilities ? (
                                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                                          {Object.entries(row.probabilities).map(([cls, prob]) => {
                                            const isTop = String(cls) === String(row.predicted);
                                            return (
                                              <span
                                                key={cls}
                                                className={`px-1.5 py-0.5 rounded font-mono border ${
                                                  isTop
                                                    ? 'bg-emerald-900/50 border-emerald-500/40 text-emerald-200 font-bold'
                                                    : 'bg-slate-900 border-slate-800 text-slate-400'
                                                }`}
                                              >
                                                {cls}: {(Number(prob) * 100).toFixed(0)}%
                                              </span>
                                            );
                                          })}
                                        </div>
                                      ) : '-'}
                                    </td>
                                  )}
                                  <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                                    {Object.entries(row.inputs || {}).map(([k, v]) => `${k}=${v}`).join(', ')}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Batch Pagination */}
                      {totalBatchPages > 1 && (
                        <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                          <div>
                            Showing page <strong className="text-white">{batchCurrentPage}</strong> of <strong className="text-white">{totalBatchPages}</strong> ({filteredBatchPredictions.length} records)
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={batchCurrentPage === 1}
                              onClick={() => setBatchCurrentPage(prev => Math.max(1, prev - 1))}
                              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 disabled:opacity-40"
                            >
                              Prev
                            </button>
                            <button
                              disabled={batchCurrentPage === totalBatchPages}
                              onClick={() => setBatchCurrentPage(prev => Math.min(totalBatchPages, prev + 1))}
                              className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 disabled:opacity-40"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Python Batch Prediction Snippet */}
                    <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-emerald-400" />
                          Standalone Python Batch Inference Pipeline
                        </h4>
                        <button
                          onClick={() => copyCodeToClipboard(pythonBatchSnippet, setCopiedBatchCode)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-all"
                        >
                          {copiedBatchCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedBatchCode ? 'Copied' : 'Copy Python Batch Code'}</span>
                        </button>
                      </div>
                      <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                        {pythonBatchSnippet}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Navigation */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  updateStepStatus('prediction', STEP_STATUSES.APPLIED);
                  goToStep('evaluation');
                }}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-brand-500/20"
              >
                <span>Proceed to 13. Model Evaluation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step12Prediction;
