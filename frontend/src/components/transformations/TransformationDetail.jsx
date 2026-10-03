import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  Sparkles, 
  BookOpen, 
  Sliders, 
  Sigma, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Play
} from 'lucide-react';
import Badge from '../common/Badge';
import RecommendationCard from './RecommendationCard';
import FormulaCard from './FormulaCard';
import DistributionComparison from './DistributionComparison';
import TransformationSelector from './TransformationSelector';
import TransformationPreview from './TransformationPreview';
import { 
  getColumnTransformationDetail, 
  previewTransformation, 
  applyTransformation 
} from '../../services/transformationService';

export const TransformationDetail = ({
  datasetId,
  column,
  onBack,
  onOperationSuccess
}) => {
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Transformation Configuration State
  const [selectedMethod, setSelectedMethod] = useState('standard');
  const [featureRange, setFeatureRange] = useState({ min: 0.0, max: 1.0 });
  
  // Preview & Modal State
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  // Pedagogical Tier
  const [learningTier, setLearningTier] = useState('beginner'); // 'beginner', 'intermediate', 'technical'

  const fetchDetail = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await getColumnTransformationDetail(datasetId, column);
    if (res.data) {
      setDetailData(res.data);
      if (res.data.recommendation?.recommended_method) {
        setSelectedMethod(res.data.recommendation.recommended_method);
      }
    } else {
      setErrorMessage(res.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [datasetId, column]);

  const handleSimulatePreview = async () => {
    setIsPreviewing(true);
    setErrorMessage(null);

    const payload = {
      column: column,
      method: selectedMethod,
      feature_range_min: featureRange.min,
      feature_range_max: featureRange.max
    };

    const res = await previewTransformation(datasetId, payload);
    if (res.data) {
      setPreviewData(res.data);
    } else {
      setErrorMessage(res.error);
    }
    setIsPreviewing(false);
  };

  const handleApply = async (applyPayload) => {
    setIsApplying(true);
    setErrorMessage(null);

    const payload = {
      ...applyPayload,
      feature_range_min: featureRange.min,
      feature_range_max: featureRange.max
    };

    const res = await applyTransformation(datasetId, payload);
    if (res.data) {
      setPreviewData(null);
      if (onOperationSuccess) {
        onOperationSuccess(res.data);
      }
    } else {
      setErrorMessage(res.error);
    }
    setIsApplying(false);
  };

  if (isLoading && !detailData) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-400" />
        <p className="text-xs">Analyzing statistical distributions and calculating scaling formulas...</p>
      </div>
    );
  }

  const metrics = detailData?.current_distribution;

  const CONCEPT_EXPLANATIONS = {
    beginner: {
      title: "Why do we scale or transform numbers?",
      text: "Different features in real life are measured in completely different units—like dollars ($50,000) vs age (25 years). If we don't scale them, algorithms might think dollars are 2,000 times more important simply because the numbers are bigger! Scaling puts all features onto a fair, comparable playing field."
    },
    intermediate: {
      title: "Optimization & Variance Stabilization",
      text: "Distance-based algorithms (KNN, SVM, K-Means) and gradient descent optimizers require features to have comparable magnitudes to prevent elongated, slow-converging cost function contours. Power transformations also stabilize heteroscedasticity and align skewed distributions with Gaussian assumptions."
    },
    technical: {
      title: "Hessian Conditioning & Regularization Isotropicity",
      text: "When feature scales vary widely, the condition number κ(X^T X) is large, leading to severe Hessian eigenvalue disparity and zig-zagging gradient descent trajectories. In L1/L2 regularized loss functions (J(θ) = L + λ||θ||_p), penalty terms are isotropic, disproportionately shrinking small-magnitude feature weights unless standardized."
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Back to Summary"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Feature Transformation Studio</h2>
              <Badge variant="brand">Column: {column}</Badge>
              <Badge variant="purple">{detailData?.data_type}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect current distribution moments, evaluate recommendations, and simulate transformations
            </p>
          </div>
        </div>

        <button
          onClick={fetchDetail}
          className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors self-start sm:self-auto"
          title="Refresh Analysis"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="underline text-rose-400">Dismiss</button>
        </div>
      )}

      {/* 3-Tier Educational Principle Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/20 border border-brand-500/30 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wide">
            <BookOpen className="w-4 h-4" />
            <span>Educational Concept: {CONCEPT_EXPLANATIONS[learningTier].title}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setLearningTier('beginner')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                learningTier === 'beginner' ? 'bg-brand-500/20 text-brand-300 font-bold' : 'text-slate-400'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setLearningTier('intermediate')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                learningTier === 'intermediate' ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400'
              }`}
            >
              Intermediate
            </button>
            <button
              onClick={() => setLearningTier('technical')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                learningTier === 'technical' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-400'
              }`}
            >
              Technical
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {CONCEPT_EXPLANATIONS[learningTier].text}
        </p>
      </div>

      {/* Recommendation Card */}
      <RecommendationCard
        recommendation={detailData?.recommendation}
        onSelectMethod={(m) => setSelectedMethod(m)}
      />

      {/* Method Selector & Range Controls */}
      <TransformationSelector
        selectedMethod={selectedMethod}
        onSelectMethod={setSelectedMethod}
        featureRange={featureRange}
        onChangeFeatureRange={setFeatureRange}
        metrics={metrics}
        supportedMethods={detailData?.supported_methods || []}
        onPreview={handleSimulatePreview}
        isPreviewing={isPreviewing}
      />

      {/* Live Formula & Calculation Breakdown */}
      <FormulaCard
        calculation={detailData?.calculation_breakdown}
        method={selectedMethod}
      />

      {/* Raw Current Distribution Overlay */}
      {metrics && (
        <DistributionComparison
          before={metrics}
          after={null}
        />
      )}

      {/* Non-Destructive Simulation Modal */}
      {previewData && (
        <TransformationPreview
          previewData={previewData}
          onClose={() => setPreviewData(null)}
          onApply={handleApply}
          isApplying={isApplying}
        />
      )}
    </div>
  );
};

export default TransformationDetail;
