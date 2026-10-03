import React from 'react';
import {
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Layers,
  Database,
  FileSpreadsheet,
  Flame,
  Binary,
  Sliders,
  CheckSquare,
  Scissors,
  Cpu,
  PlayCircle,
  Award,
  BookOpen,
  LineChart,
  Bot
} from 'lucide-react';
import Badge from '../components/common/Badge';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const FeaturesPage = ({ onNavigate, onLaunchStudio }) => {
  const PIPELINE_FEATURES = [
    {
      step: '01',
      id: 'collection',
      name: 'Data Collection & Ingestion',
      category: 'Ingestion',
      icon: Database,
      badge: 'Multi-Format Vault',
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
      description: 'Upload CSV, XLSX, or select curated benchmark datasets (Titanic, Housing, Iris, Wine, Customer Churn). Includes automatic encoding detection (UTF-8, Latin-1) and immutable SHA-256 vault sealing.',
      capabilities: [
        'Automatic delimiter parsing (comma, tab, semicolon, pipe)',
        'SHA-256 cryptographic verification of raw files',
        'Built-in machine learning benchmark repositories',
        'Zero file overwriting with immutable snapshot trees'
      ]
    },
    {
      step: '02',
      id: 'loading',
      name: 'Schema & Type Inference',
      category: 'Validation',
      icon: FileSpreadsheet,
      badge: 'Schema Guard',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      description: 'Heuristic column classification differentiating continuous numerical, discrete count, ordinal ranked, nominal categorical, boolean, and datetime formats.',
      capabilities: [
        'High-cardinality ID column detection',
        'Automatic datetime format extraction',
        'Memory footprint and tensor width profiling',
        'Missingness ratio estimation across all dimensions'
      ]
    },
    {
      step: '03',
      id: 'eda',
      name: 'Exploratory Data Analysis (EDA)',
      category: 'Profiling',
      icon: LineChart,
      badge: 'Moment Analysis',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: 'Interactive statistical profiling computing distribution moments: mean (μ), median, standard deviation (σ), variance (σ²), Pearson skewness (γ₁), kurtosis (γ₂), and Spearman/Pearson correlation heatmaps.',
      capabilities: [
        'Interactive SVG distribution histograms',
        'Pairwise feature correlation heatmaps',
        'Quartile boxplot dispersion visualizers',
        'Target variable distribution profiling'
      ]
    },
    {
      step: '04',
      id: 'cleaning',
      name: 'Data Cleaning & Imputation',
      category: 'Sanitization',
      icon: ShieldCheck,
      badge: 'L1/L2 Imputation',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Treat missing values using deterministic mathematical estimators: Mean (L2 loss), Median (L1 L1 loss), Mode (nominal frequency), or Constant with full 7-pillar rationale.',
      capabilities: [
        'Whitespace stripping & case normalization',
        'Duplicate row detection & purge',
        'Missing value statistical imputation (Mean/Median/Mode)',
        'Zero-eval() safe execution dispatchers'
      ]
    },
    {
      step: '05',
      id: 'outliers',
      name: 'Outlier Detection & Treatment',
      category: 'Diagnostics',
      icon: Flame,
      badge: 'Tukey & Z-Score',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'Flag anomalies via non-parametric Tukey IQR fences [Q1 - 1.5·IQR, Q3 + 1.5·IQR], parametric Gaussian 3-sigma Z-scores, or Modified Z-Score (MAD). Choose Keep, Winsorize (Cap), or Drop.',
      capabilities: [
        'Interactive Tukey fence visualizer with slider thresholds',
        'Winsorization boundary clamping preventing gradient explosion',
        'Variance stabilization delta metrics',
        'Before vs after distribution comparison'
      ]
    },
    {
      step: '06',
      id: 'encoding',
      name: 'Categorical Data Encoding',
      category: 'Encoding',
      icon: Binary,
      badge: 'Dummy Trap Guarded',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      description: 'Convert string categories into numerical tensors using One-Hot Encoding (with drop-first multicollinearity defense), Ordinal rank mapping, Frequency count encoding, or Target mean encoding.',
      capabilities: [
        'One-Hot Encoding with multicollinearity guard',
        'Ordinal rank encoder with custom ordering',
        'Frequency/Count distribution encoding',
        'High-cardinality target encoding'
      ]
    },
    {
      step: '07',
      id: 'scaling',
      name: 'Feature Scaling & Normalization',
      category: 'Scaling',
      icon: Sliders,
      badge: 'Power Scalers',
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      description: 'Standardize features using StandardScaler (z = (x - μ)/σ), MinMaxScaler ([0, 1]), RobustScaler (median & IQR), or power transforms: Log1p (ln(1+x)), Box-Cox, and Yeo-Johnson.',
      capabilities: [
        'StandardScaler zero-mean unit variance transform',
        'RobustScaler median-centered outlier resistance',
        'Log1p & Yeo-Johnson right-tail skewness compression',
        'Step-by-step arithmetic substitution derivation'
      ]
    },
    {
      step: '08',
      id: 'dimensionality',
      name: 'Dimensionality Reduction (PCA)',
      category: 'Compression',
      icon: Layers,
      badge: 'SVD Decomposition',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      description: 'Decompose multicollinear feature matrices using Principal Component Analysis (PCA) via Singular Value Decomposition (SVD on Covariance Matrix: X = U Σ Vᵀ).',
      capabilities: [
        'Scree plot cumulative explained variance ratios',
        'Kaiser-Guttman eigenvalue > 1.0 threshold rule',
        'Orthogonal principal component rotation',
        'Curse of dimensionality mitigation'
      ]
    },
    {
      step: '09',
      id: 'feature_selection',
      name: 'Feature Selection & Ranking',
      category: 'Selection',
      icon: CheckSquare,
      badge: 'Leakage Guarded',
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      description: 'Score and rank features using ANOVA F-value (F = MS_between / MS_within), Mutual Information entropy scoring (I(X; Y)), and Variance Inflation Factor (VIF) collinearity filters.',
      capabilities: [
        'SelectKBest top feature selector',
        'ANOVA F-test for continuous vs categorical targets',
        'Mutual Information non-linear dependency ranker',
        'Variance Inflation Factor (VIF) collinearity removal'
      ]
    },
    {
      step: '10',
      id: 'split',
      name: 'Train-Test Partitioning',
      category: 'Partitioning',
      icon: Scissors,
      badge: 'Stratified',
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      description: 'Partition datasets with class-balanced stratification (Stratified K-Fold logic) or chronological time-series splitting. Transformation estimators are strictly isolated to prevent data contamination.',
      capabilities: [
        'Class-proportional stratified partitioning',
        'Strict training set estimator fitting',
        'Random seed reproducibility guarantee',
        'Zero test-set distribution leakage'
      ]
    },
    {
      step: '11',
      id: 'fitting',
      name: 'Model Fitting & Weight Inspection',
      category: 'Modeling',
      icon: Cpu,
      badge: 'Real Weights',
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      description: 'Train Classification and Regression models: Logistic Regression, Decision Trees, Random Forest, Gradient Boosting, Ridge, and Lasso. Inspect real coefficients (β) and feature importance vectors.',
      capabilities: [
        'Deterministic Scikit-Learn model training',
        'Real loss curves & convergence checks',
        'Linear regression coefficient (β̂ = (XᵀX)⁻¹Xᵀy) weights',
        'Tree-based Gini impurity & entropy gain rankings'
      ]
    },
    {
      step: '12',
      id: 'prediction',
      name: 'Live What-If Prediction Engine',
      category: 'Inference',
      icon: PlayCircle,
      badge: 'Interactive Sliders',
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
      description: 'Test live simulated inference on custom feature vectors. Move interactive sliders to observe real-time logit sigmoid probability shifts and directional feature force breakdowns.',
      capabilities: [
        'Real-time logistic sigmoid probability gauge (σ(z))',
        'SHAP-style directional feature contribution forces',
        '1-click preset testing scenarios',
        'Decision boundary threshold tuning'
      ]
    },
    {
      step: '13',
      id: 'evaluation',
      name: 'Evaluation Diagnostics & Export',
      category: 'Evaluation',
      icon: Award,
      badge: 'Full Diagnostics',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'Comprehensive diagnostic suite: Confusion matrix (TP, FP, TN, FN), ROC-AUC curves, Precision-Recall, F1-score, RMSE, MAE, R², and residual error histograms. Export clean standalone Python code.',
      capabilities: [
        'Full classification confusion matrix & AUC metrics',
        'Residual error distribution & homoscedasticity check',
        'One-click Python Scikit-Learn script export',
        'Clean CSV dataset artifact downloads'
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden relative selection:bg-brand-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-brand-500/15 via-purple-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-60 w-[600px] h-[600px] bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[65%] -right-60 w-[600px] h-[600px] bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="datamentor" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-xs text-brand-400 font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" /> TechMentor Suite &bull; DataMentor Deep Dive
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
          The Complete{' '}
          <span className="bg-gradient-to-r from-brand-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            13-Stage DataMentor Pipeline
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          From cryptographic file ingestion to What-If model inference and residual diagnostics — discover the deterministic algorithms and mathematical foundations behind every DataMentor module.
        </p>
      </section>

      {/* 13 Stage Feature Cards */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-8">
          {PIPELINE_FEATURES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                className="p-6 md:p-8 rounded-3xl bg-slate-950 border border-slate-800/90 hover:border-brand-500/40 transition-all duration-300 shadow-xl"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Title & Overview */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stage.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">Step {stage.step}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-400 uppercase font-mono">{stage.category}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mt-0.5">{stage.name}</h3>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {stage.description}
                    </p>

                    <button
                      onClick={() => onNavigate ? onNavigate(stage.id) : onLaunchStudio()}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      <span>Launch Step {stage.step} Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right Column: Capabilities Box */}
                  <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-brand-400" /> Core Deterministic Capabilities
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {stage.capabilities.map((cap, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Global Call to Action */}
      <section className="py-20 relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-slate-950 border border-brand-500/30 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to Build Your Pipeline?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
            Experience all 13 stages with live derivations, instant rollback, and contextual AI mentoring.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onLaunchStudio}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate && onNavigate('about')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs sm:text-sm transition-all"
            >
              Read Our Mission
            </button>
          </div>
        </div>
      </section>

      {/* Unified Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default FeaturesPage;
