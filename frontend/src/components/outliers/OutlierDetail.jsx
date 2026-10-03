import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  BarChart3, 
  Calculator, 
  Table, 
  BookOpen, 
  Scissors, 
  ArrowLeft, 
  RefreshCw, 
  Sparkles, 
  Info,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import Badge from '../common/Badge';
import OutlierVisualization from './OutlierVisualization';
import OutlierCalculation from './OutlierCalculation';
import OutlierRecords from './OutlierRecords';
import TreatmentSelector from './TreatmentSelector';
import OutlierLearningCard from './OutlierLearningCard';
import { getColumnOutlierDetail, previewOutlierTreatment, applyOutlierTreatment } from '../../services/outlierService';

export const OutlierDetail = ({ 
  datasetId, 
  column, 
  onBack, 
  onOperationSuccess 
}) => {
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visualize'); // 'visualize' | 'calc' | 'records' | 'treatment' | 'learn'
  
  // Detection controls
  const [selectedMethod, setSelectedMethod] = useState('iqr');
  const [multiplier, setMultiplier] = useState(1.5);
  const [threshold, setThreshold] = useState(3.0);

  // Treatment controls
  const [selectedTreatment, setSelectedTreatment] = useState('cap');
  const [customLower, setCustomLower] = useState(null);
  const [customUpper, setCustomUpper] = useState(null);

  // Preview / Apply modal state
  const [previewData, setPreviewData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchDetail = async (method = selectedMethod, mult = multiplier, thresh = threshold) => {
    setIsLoading(true);
    setErrorMessage(null);

    const isZScore = method === 'zscore';
    const isModZ = method === 'modified_zscore';
    const threshVal = (isZScore || isModZ) ? thresh : null;
    const multVal = method === 'iqr' ? mult : null;

    const res = await getColumnOutlierDetail(datasetId, column, method, multVal, threshVal);
    if (res.data) {
      setDetailData(res.data);
      setSelectedMethod(res.data.method);
      if (res.data.parameters?.multiplier) setMultiplier(res.data.parameters.multiplier);
      if (res.data.parameters?.threshold) setThreshold(res.data.parameters.threshold);
    } else {
      setErrorMessage(res.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [column, datasetId]);

  const handleMethodChange = (newMethod) => {
    setSelectedMethod(newMethod);
    let defaultThresh = threshold;
    if (newMethod === 'zscore') defaultThresh = 3.0;
    if (newMethod === 'modified_zscore') defaultThresh = 3.5;
    setThreshold(defaultThresh);
    fetchDetail(newMethod, multiplier, defaultThresh);
  };

  const handleApplyParameters = () => {
    fetchDetail(selectedMethod, multiplier, threshold);
  };

  const handleTriggerPreview = async () => {
    setIsSimulating(true);
    setErrorMessage(null);

    const params = selectedMethod === 'iqr' ? { multiplier } : { threshold };
    const payload = {
      column,
      detection_method: selectedMethod,
      parameters: params,
      treatment: selectedTreatment,
      custom_lower: customLower,
      custom_upper: customUpper
    };

    const res = await previewOutlierTreatment(datasetId, payload);
    if (res.data) {
      setPreviewData(res.data);
    } else {
      setErrorMessage(res.error);
    }
    setIsSimulating(false);
  };

  const handleConfirmApply = async () => {
    setIsApplying(true);
    setErrorMessage(null);

    const params = selectedMethod === 'iqr' ? { multiplier } : { threshold };
    const payload = {
      column,
      detection_method: selectedMethod,
      parameters: params,
      treatment: selectedTreatment,
      custom_lower: customLower,
      custom_upper: customUpper,
      confirmed: true
    };

    const res = await applyOutlierTreatment(datasetId, payload);
    if (res.data) {
      setPreviewData(null);
      if (onOperationSuccess) {
        onOperationSuccess(res.data);
      }
      fetchDetail();
    } else {
      setErrorMessage(res.error);
    }
    setIsApplying(false);
  };

  if (isLoading && !detailData) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-400" />
        <p className="text-xs">Computing statistical distribution and outlier boundaries for '{column}'...</p>
      </div>
    );
  }

  const {
    outlier_count = 0,
    outlier_percentage = 0,
    lower_bound = null,
    upper_bound = null,
    distribution = {},
    calculation = {},
    recommendation = {},
    outlier_records_sample = [],
    total_flagged_records = 0
  } = detailData || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation & Column Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
            title="Back to Outlier Summary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{column}</h2>
              <Badge variant="brand">{detailData?.data_type || 'numeric'}</Badge>
            </div>
            <p className="text-xs text-slate-400">Detailed Outlier Inspection & Treatment Studio</p>
          </div>
        </div>

        {/* Action / Status info */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
            <span className="text-slate-400">Detected Outliers:</span>
            <span className={`font-bold font-mono ${outlier_count > 0 ? 'text-rose-400' : 'text-brand-400'}`}>
              {outlier_count} ({outlier_percentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="underline text-rose-400">Dismiss</button>
        </div>
      )}

      {/* Recommended Method Banner */}
      {recommendation?.reason && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-brand-950/20 to-slate-900 border border-brand-500/30 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">System Recommendation: </span>
              <Badge variant="brand">{recommendation.recommended_method.toUpperCase()}</Badge>
            </div>
            <p className="text-slate-300 leading-relaxed">{recommendation.reason}</p>
          </div>
        </div>
      )}

      {/* Method & Parameter Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1">Detection Method:</span>
          {[
            { id: 'iqr', label: 'Tukey IQR', desc: 'Non-parametric (Middle 50%)' },
            { id: 'zscore', label: 'Z-Score', desc: 'Standard Normal (μ ± 3σ)' },
            { id: 'modified_zscore', label: 'Modified Z-Score', desc: 'Median & MAD Robust' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleMethodChange(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedMethod === m.id
                  ? 'bg-brand-500 text-slate-950 shadow-md shadow-brand-500/10'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Dynamic Parameter input */}
        <div className="flex items-center gap-3">
          {selectedMethod === 'iqr' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Multiplier:</label>
              <select
                value={multiplier}
                onChange={(e) => {
                  const m = parseFloat(e.target.value);
                  setMultiplier(m);
                  fetchDetail('iqr', m, threshold);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
              >
                <option value={1.5}>1.5 (Standard / Mild Outliers)</option>
                <option value={2.0}>2.0 (Conservative)</option>
                <option value={3.0}>3.0 (Extreme Outliers Only)</option>
              </select>
            </div>
          )}

          {(selectedMethod === 'zscore' || selectedMethod === 'modified_zscore') && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Threshold:</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value) || 3.0)}
                onBlur={handleApplyParameters}
                className="w-20 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
              />
              <button
                onClick={handleApplyParameters}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
              >
                Recalculate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'visualize', label: 'Visualization & Distribution', icon: BarChart3 },
          { id: 'calc', label: 'Show Calculation', icon: Calculator },
          { id: 'records', label: `Outlier Records (${total_flagged_records})`, icon: Table },
          { id: 'treatment', label: 'Treatment & Preview', icon: Scissors },
          { id: 'learn', label: 'Educational Deep-Dive', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-2 ${
                isActive
                  ? 'bg-brand-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'visualize' && (
          <OutlierVisualization
            distribution={distribution}
            lowerBound={lower_bound}
            upperBound={upper_bound}
            column={column}
          />
        )}

        {activeTab === 'calc' && (
          <OutlierCalculation
            calculation={calculation}
            column={column}
          />
        )}

        {activeTab === 'records' && (
          <OutlierRecords
            records={outlier_records_sample}
            column={column}
            totalFlagged={total_flagged_records}
          />
        )}

        {activeTab === 'treatment' && (
          <div className="space-y-6">
            <TreatmentSelector
              selectedTreatment={selectedTreatment}
              onSelectTreatment={(t) => {
                setSelectedTreatment(t);
                if (previewData && previewData.treatment !== t) {
                  setPreviewData(null);
                }
              }}
              lowerBound={lower_bound}
              upperBound={upper_bound}
              customLower={customLower}
              customUpper={customUpper}
              onChangeCustomLower={setCustomLower}
              onChangeCustomUpper={setCustomUpper}
              onTriggerPreview={handleTriggerPreview}
              isProcessing={isSimulating}
            />

            {previewData && (
              <OutlierPreview
                preview={previewData}
                onClose={() => setPreviewData(null)}
                onConfirmApply={handleConfirmApply}
                isApplying={isApplying}
                isInline={true}
              />
            )}
          </div>
        )}

        {activeTab === 'learn' && (
          <OutlierLearningCard
            conceptId={selectedMethod}
            column={column}
          />
        )}
      </div>
    </div>
  );
};

export default OutlierDetail;
