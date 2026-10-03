import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Brain,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  BarChart3,
  Layers,
  Database,
  FileSpreadsheet,
  Flame,
  Binary,
  Sliders,
  Minimize2,
  CheckSquare,
  Scissors,
  Cpu,
  PlayCircle,
  Award,
  BookOpen,
  MessageSquareCode,
  Lock,
  RotateCcw,
  Eye,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Terminal,
  Compass,
  GraduationCap,
  Sparkle,
  Code2,
  TrendingUp,
  LineChart,
  HelpCircle,
  ExternalLink,
  Github,
  Play,
  Menu,
  X,
  Laptop,
  CheckCheck,
  Bot
} from 'lucide-react';
import Badge from '../components/common/Badge';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const LandingPage = ({ onLaunchStudio, onNavigate }) => {
  // Navigation & Scroll State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Interactive Sandbox State
  const [activeDemoTab, setActiveDemoTab] = useState('scaling');
  const [skewValue, setSkewValue] = useState(2.4);
  const [selectedTransform, setSelectedTransform] = useState('log1p');
  const [sampleScaleValue, setSampleScaleValue] = useState(128.5);
  
  // Outlier Sandbox State
  const [outlierMultiplier, setOutlierMultiplier] = useState(1.5);
  const [selectedOutlierMethod, setSelectedOutlierMethod] = useState('iqr');
  const [selectedOutlierStrategy, setSelectedOutlierStrategy] = useState('winsorize');

  // 7-Pillars Sandbox State
  const [selectedPillarOperation, setSelectedPillarOperation] = useState('imputation');

  // What-If Live Predict State
  const [predictAge, setPredictAge] = useState(29);
  const [predictFare, setPredictFare] = useState(65);
  const [predictPclass, setPredictPclass] = useState(1);
  const [predictFamilySize, setPredictFamilySize] = useState(1);

  // AI Mentor & FAQ State
  const [selectedQuestion, setSelectedQuestion] = useState('leakage');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [hoveredStep, setHoveredStep] = useState(null);

  // Track Window Scroll for Back-To-Top Button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth Scroll Helper
  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 85;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 13 Pipeline Stages Definition
  const PIPELINE_STAGES = [
    {
      step: '01',
      id: 'collection',
      name: 'Data Collection',
      category: 'Ingestion',
      icon: Database,
      badge: 'Multi-Format',
      summary: 'Secure ingestion of CSV, XLSX, XLS files with UTF-8/Latin-1 fallback & 50MB safety bounds.',
      formula: 'SHA-256(D_raw) → Immutable Storage Vault',
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400'
    },
    {
      step: '02',
      id: 'loading',
      name: 'Typed Data Loading',
      category: 'Ingestion',
      icon: FileSpreadsheet,
      badge: 'Zero-Copy',
      summary: 'Instant parsing into typed DataFrames with schema deduction and null profiling.',
      formula: 'D_df ← DataFrame(X, dtypes)',
      color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400'
    },
    {
      step: '03',
      id: 'eda',
      name: 'EDA & Statistical Profiling',
      category: 'Exploratory',
      icon: BarChart3,
      badge: 'Moment Analysis',
      summary: 'Skewness, kurtosis, IQR, correlation matrices, and distribution shape diagnostics.',
      formula: 'Skew = [n / ((n-1)(n-2))] Σ ((x_i - x̄) / s)³',
      color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400'
    },
    {
      step: '04',
      id: 'cleaning',
      name: 'Data Cleaning & Imputation',
      category: 'Quality',
      icon: Sparkles,
      badge: 'Versioned Undo',
      summary: 'Deterministic median, mean, mode imputation with step-by-step arithmetic proof.',
      formula: 'Median = X_[(n+1)/2] (L1 central moment)',
      color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400'
    },
    {
      step: '05',
      id: 'outliers',
      name: 'Outlier Detection & Treatment',
      category: 'Quality',
      icon: Flame,
      badge: '3 Algorithms',
      summary: 'IQR Tukey fences, parametric Z-Score, and Modified Z-Score with MAD fallback.',
      formula: '[Q1 - 1.5 · IQR, Q3 + 1.5 · IQR]',
      color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-400'
    },
    {
      step: '06',
      id: 'encoding',
      name: 'Categorical Encoding',
      category: 'Transforms',
      icon: Binary,
      badge: 'Collision Safe',
      summary: 'One-Hot encoding, Label ordinal mapping, and Frequency count representations.',
      formula: 'x_{i, c} = 1_{x_i = c}, ∀ c ∈ C',
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400'
    },
    {
      step: '07',
      id: 'scaling',
      name: 'Feature Scaling & Transforms',
      category: 'Transforms',
      icon: Sliders,
      badge: '6 Mathematical Methods',
      summary: 'StandardScaler, MinMaxScaler, RobustScaler, Log1p, Yeo-Johnson, and Box-Cox.',
      formula: 'z = (x - μ) / σ,  x_robust = (x - med) / IQR',
      color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-400'
    },
    {
      step: '08',
      id: 'dimensionality',
      name: 'Dimensionality Reduction',
      category: 'Reduction',
      icon: Minimize2,
      badge: 'Variance Scree',
      summary: 'PCA Principal Component Analysis with cumulative variance ratio and scree plots.',
      formula: 'X = U Σ Vᵀ,  Σ λ_i / Tr(C) ≥ 0.95',
      color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-400'
    },
    {
      step: '09',
      id: 'feature_selection',
      name: 'Feature Selection & Ranking',
      category: 'Selection',
      icon: CheckSquare,
      badge: 'Leakage Guarded',
      summary: 'SelectKBest with ANOVA F-value and Mutual Information scoring.',
      formula: 'F = MS_between / MS_within,  I(X; Y)',
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400'
    },
    {
      step: '10',
      id: 'split',
      name: 'Train-Test Partitioning',
      category: 'Pipeline',
      icon: Scissors,
      badge: 'Stratified',
      summary: 'Class-balanced stratification and chronological split preventing target contamination.',
      formula: 'D = D_train ∪ D_test,  D_train ∩ D_test = ∅',
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400'
    },
    {
      step: '11',
      id: 'fitting',
      name: 'Model Fitting & Weights',
      category: 'Modeling',
      icon: Cpu,
      badge: 'Real Weights',
      summary: 'Train Classification & Regression algorithms with real loss curves and weights.',
      formula: 'β̂ = (XᵀX)⁻¹ Xᵀy,  L(θ) = -Σ y log(p)',
      color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400'
    },
    {
      step: '12',
      id: 'prediction',
      name: 'Live What-If Prediction',
      category: 'Inference',
      icon: PlayCircle,
      badge: 'Interactive Sliders',
      summary: 'Real-time inference on new sample vectors with feature impact direction breakdown.',
      formula: 'ŷ = f_θ(x_new),  Conf = max_k P(Y=k|x)',
      color: 'from-brand-500/20 to-emerald-500/20 border-brand-500/30 text-brand-400'
    },
    {
      step: '13',
      id: 'evaluation',
      name: 'Model Evaluation & Residuals',
      category: 'Evaluation',
      icon: Award,
      badge: 'Full Diagnostics',
      summary: 'Confusion matrices, ROC-AUC curves, RMSE, MAE, R², and residual error histograms.',
      formula: 'R² = 1 - (SS_res / SS_tot),  RMSE = √MSE',
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-400'
    }
  ];

  // 7 Pillars of Explainability Data
  const PILLAR_AUDIT_DATA = {
    imputation: {
      title: 'Missing Value Imputation on Column "Age"',
      badge: 'L1 Median Estimator',
      feature: 'Age (Continuous, Skewed)',
      code: `# Impute missing Age values using dataset median
from sklearn.impute import SimpleImputer
imputer = SimpleImputer(strategy='median')
df['Age'] = imputer.fit_transform(df[['Age']])`,
      pillars: [
        { num: '01', name: 'What Happened?', text: 'Imputed 177 missing numerical Age values using dataset median (28.0 years).' },
        { num: '02', name: 'Why Did It Happen?', text: 'Age exhibited 19.8% missing entries, exceeding the 5.0% clean baseline threshold.' },
        { num: '03', name: 'Which Technique?', text: 'Median Imputation: z = sorted(X)[N/2]. L1 central tendency estimator.' },
        { num: '04', name: 'Why Selected?', text: 'Right-skewed distribution (+1.8 skew) would cause mean imputation to bias towards outliers.' },
        { num: '05', name: 'What Changed?', text: 'Missing count 177 → 0. Standard deviation adjusted from 14.52 to 13.00 (-10.4%).' },
        { num: '06', name: 'Alternatives?', text: 'Dropping rows would discard 19.8% of training observations. KNN imputation adds O(N²) overhead.' },
        { num: '07', name: 'When To Use?', text: 'Use for moderately skewed numerical features (|skew| > 1.0) with missing ratio < 35%.' }
      ]
    },
    scaling: {
      title: 'Power Transformation on Column "Fare"',
      badge: 'Log1p Variance Compression',
      feature: 'Fare (Continuous, Heavy Tail)',
      code: `# Non-linear Log1p transformation for right-skewed feature
import numpy as np
df['Fare_log1p'] = np.log1p(np.maximum(0, df['Fare']))
# Skewness reduced from +4.78 to +0.39`,
      pillars: [
        { num: '01', name: 'What Happened?', text: 'Applied Log1p non-linear transformation: x\' = ln(1 + x) across all 891 records.' },
        { num: '02', name: 'Why Did It Happen?', text: 'Extreme positive skewness (+4.78) with heavy right tail (max fare: $512.33 vs median: $14.45).' },
        { num: '03', name: 'Which Technique?', text: 'Logarithmic Transformation (Log1p) with non-negative domain boundary check (x ≥ 0).' },
        { num: '04', name: 'Why Selected?', text: 'StandardScaler cannot reshape distribution curves; Log1p compresses variance non-linearly.' },
        { num: '05', name: 'What Changed?', text: 'Skewness reduced from +4.78 to +0.39 (91.8% reduction toward Gaussian normality).' },
        { num: '06', name: 'Alternatives?', text: 'Box-Cox requires strict x > 0; Yeo-Johnson supports negative values; RobustScaler keeps skew.' },
        { num: '07', name: 'When To Use?', text: 'Recommended for monetary features, counts, and right-skewed variables before linear/logistic models.' }
      ]
    },
    outliers: {
      title: 'Winsorization (Capping) on Feature "Income"',
      badge: 'Tukey Boundary Clamping',
      feature: 'Income / Fare (Continuous Extremes)',
      code: `# Winsorization boundary clamping to Tukey IQR fences
import numpy as np
Q1, Q3 = df['Fare'].quantile(0.25), df['Fare'].quantile(0.75)
IQR = Q3 - Q1
lower_fence, upper_fence = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
df['Fare_capped'] = np.clip(df['Fare'], lower_fence, upper_fence)`,
      pillars: [
        { num: '01', name: 'What Happened?', text: 'Capped 38 outlier records to upper Tukey fence ($65.63k) and lower fence ($0.0k).' },
        { num: '02', name: 'Why Did It Happen?', text: 'IQR detection flagged 4.2% extreme values beyond Q3 + 1.5·IQR causing gradient instability.' },
        { num: '03', name: 'Which Technique?', text: 'Winsorization: x_capped = clip(x, Q1 - 1.5·IQR, Q3 + 1.5·IQR).' },
        { num: '04', name: 'Why Selected?', text: 'Retains valid domain entities (executive compensation) without destroying statistical power.' },
        { num: '05', name: 'What Changed?', text: 'Max value clipped from $512.33k to $65.63k. Row count preserved 100% (891/891 rows).' },
        { num: '06', name: 'Alternatives?', text: 'Row deletion would lose 38 rows and risk sample bias. Keeping raw values causes regression distortion.' },
        { num: '07', name: 'When To Use?', text: 'Ideal when anomalies are genuine real-world extremes rather than data entry measurement errors.' }
      ]
    },
    pca: {
      title: 'PCA Subspace Reduction (10 Features → 3 Components)',
      badge: 'Orthogonal SVD Decomposition',
      feature: 'Sensor Matrix (Multicollinear)',
      code: `# Orthogonal Singular Value Decomposition (SVD)
from sklearn.decomposition import PCA
pca = PCA(n_components=3)
X_pca = pca.fit_transform(X_scaled)
# 96.4% cumulative explained variance ratio`,
      pillars: [
        { num: '01', name: 'What Happened?', text: 'Projected 10 scaled features onto top 3 orthogonal Principal Components.' },
        { num: '02', name: 'Why Did It Happen?', text: 'High multicollinearity (variance inflation factor > 10.0) between correlated sensor metrics.' },
        { num: '03', name: 'Which Technique?', text: 'Singular Value Decomposition (SVD) on Covariance Matrix: X = U Σ Vᵀ.' },
        { num: '04', name: 'Why Selected?', text: 'Captures 96.4% of total dataset variance while reducing dimensionality by 70%.' },
        { num: '05', name: 'What Changed?', text: 'Tensor width reduced from 10 to 3 features; pairwise feature correlation reduced to exactly 0.0.' },
        { num: '06', name: 'Alternatives?', text: 'SelectKBest drops features entirely; LDA is supervised; t-SNE is non-deterministic.' },
        { num: '07', name: 'When To Use?', text: 'Use for high-dimensional numerical tables suffering from the Curse of Dimensionality.' }
      ]
    }
  };

  // Interactive AI Mentor Q&A Showcase
  const MENTOR_QUESTIONS = {
    leakage: {
      question: 'How does DataMentor prevent data leakage during scaling and imputation?',
      badge: 'DataMentor Guard',
      answer: `Data leakage occurs when information from outside the training dataset is used to create the model. In DataMentor, all transformation parameters (like mean μ, standard deviation σ, median, and frequency encodings) are strictly calculated on the training set (X_train) only, and then applied to test vectors without re-computing moments. This guarantees 100% leak-free evaluation.`,
      code: `# Correct Leak-Free Pipeline Execution in DataMentor
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train) # Computes mu, sigma on TRAIN only
X_test_scaled = scaler.transform(X_test)       # Applies fitted mu, sigma to TEST`
    },
    skewness: {
      question: 'Why does the engine recommend Log1p or Yeo-Johnson over StandardScaler for skewed data?',
      badge: 'Mathematical Principle',
      answer: `StandardScaler linearly centers and divides by standard deviation (z = (x - μ)/σ). However, linear scaling does not change the shape or skewness of the distribution! For models assuming normal distributions (linear regression, neural nets), power transforms like Log1p(x) = ln(1+x) or Yeo-Johnson(λ) compress the long right-tail and stabilize variance.`,
      code: `# Log1p Transformation on Skewed Features
# Reduces positive skewness (> 1.0) into symmetric bell curve
X_trans = np.log1p(np.maximum(0, X_raw))`
    },
    outliers: {
      question: 'When should I Winsorize (Cap) outliers rather than drop them?',
      badge: 'Domain Decision',
      answer: `Dropping outliers reduces sample size and can discard valid real-world extremes (e.g., high-net-worth customers or rare fraud events). Winsorization clamps extreme values to statistical fences (Q1 - 1.5 * IQR and Q3 + 1.5 * IQR), preserving the observation while preventing gradient explosion in regression and distance-based classifiers.`,
      code: `# Winsorization Boundary Clamping in DataMentor
lower_fence = Q1 - 1.5 * IQR
upper_fence = Q3 + 1.5 * IQR
X_capped = np.clip(X_raw, lower_fence, upper_fence)`
    }
  };

  // Reset simulator to baseline configuration
  const resetSandbox = () => {
    setSkewValue(2.4);
    setSelectedTransform('log1p');
    setSampleScaleValue(128.5);
    setOutlierMultiplier(1.5);
    setSelectedOutlierMethod('iqr');
    setSelectedOutlierStrategy('winsorize');
    setSelectedPillarOperation('imputation');
    setPredictAge(29);
    setPredictFare(65);
    setPredictPclass(1);
    setPredictFamilySize(1);
  };

  // Live Predicted Probability & Feature Force Calculations
  const pclassScore = predictPclass === 1 ? 1.45 : predictPclass === 2 ? 0.35 : -1.10;
  const ageScore = -0.038 * (predictAge - 28);
  const fareScore = 0.012 * Math.min(200, predictFare - 32);
  const famScore = predictFamilySize >= 2 && predictFamilySize <= 4 ? 0.55 : predictFamilySize > 4 ? -0.75 : -0.25;
  const baseLogit = -0.15;
  const totalLogit = baseLogit + pclassScore + ageScore + fareScore + famScore;
  const calculatedProb = Math.min(0.99, Math.max(0.01, 1 / (1 + Math.exp(-totalLogit))));

  // FAQ list
  const FAQS = [
    {
      q: 'What is TechMentor and how is it structured?',
      a: 'TechMentor is a first-principles AI and engineering suite comprising specialized tools: DataMentor for 13-stage explainable data preprocessing & ML modeling, AIMentor for deterministic RAG pipelines & vector retrieval, and Menti.ai for interactive Socratic AI mentoring. More specialized tools (like CodeMentor and VisionMentor) will join the ecosystem in upcoming releases.'
    },
    {
      q: 'How is DataMentor different from black-box AutoML platforms?',
      a: 'AutoML platforms like DataRobot or Auto-Sklearn test hundreds of models behind the scenes, outputting a model without teaching you why certain transformations were made. DataMentor is a learning-first studio: it deterministically guides you through all 13 standard data science phases, providing step-by-step arithmetic derivations, visual distribution deltas, and the 7 Explainability Pillars for every single decision.'
    },
    {
      q: 'Does Menti.ai or TechMentor ever fabricate or hallucinate numbers?',
      a: 'Never. TechMentor tools operate on a strict Zero-Fabrication Rule. All summary metrics, moments (mean, median, standard deviation, skewness, quartiles), and Menti.ai assistant responses are calculated directly from your actual dataset in memory using deterministic Python and NumPy/SciPy math.'
    },
    {
      q: 'What is AIMentor and when will it be available?',
      a: 'AIMentor is our upcoming RAG (Retrieval-Augmented Generation) pipeline studio within TechMentor. It enables developers and learners to build, inspect, and benchmark grounded knowledge retrieval systems using dual vector + hybrid BM25 search, Reciprocal Rank Fusion (RRF), chunk visualizers, and context relevance scoring.'
    },
    {
      q: 'Is my raw dataset safe from accidental overwrite?',
      a: 'Yes! Your raw original dataset is stored immutably in a dedicated directory with SHA-256 cryptographic verification. Every transformation in DataMentor creates an isolated snapshot version (v1, v2, v3...), and you can rollback to any previous version with a single click.'
    },
    {
      q: 'Can I use this for university coursework, interview prep, or production projects?',
      a: 'TechMentor is designed precisely for that. It bridges theoretical textbook formulas with hands-on practical application. You can inspect 3-tier learning depth (Beginner analogies, Intermediate practice, Technical formulas), test yourself with quizzes in the Learning Hub, and export clean Python code.'
    },
    {
      q: 'What file formats and dataset sizes are supported in DataMentor?',
      a: 'We support CSV, Excel XLSX, and legacy XLS files up to 50MB with automated character encoding detection (UTF-8, Latin-1) and delimiter parsing.'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white font-sans antialiased overflow-x-hidden relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-brand-500/15 via-purple-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[30%] -left-60 w-[600px] h-[600px] bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[60%] -right-60 w-[600px] h-[600px] bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="datamentor" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Glowing Announcement Pill */}
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-brand-500/25 text-xs text-slate-300 shadow-sm mb-6 backdrop-blur hover:border-brand-500/50 transition-colors cursor-pointer group"
          onClick={() => scrollToSection('suite')}
        >
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          <span className="font-semibold text-white">TechMentor Suite</span>
          <span className="text-slate-600">•</span>
          <span className="text-brand-400 font-medium">DataMentor &bull; AIMentor &bull; Menti.ai</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Grand Headline with Creative & Motivating Typography */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto">
          Don’t just train models.{' '}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            Master the science behind them.
          </span>
        </h1>

        {/* Crisp, Motivating Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Step inside the black box. <strong className="text-slate-200 font-semibold">TechMentor</strong> powers your journey with first-principles engineering tools: <span className="text-brand-300 font-semibold">DataMentor</span> for transparent data preprocessing & ML, <span className="text-blue-400 font-semibold">AIMentor</span> for grounded RAG pipelines, and <span className="text-purple-400 font-semibold">Menti.ai</span> for Socratic AI tutoring.
        </p>

        {/* Streamlined Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onLaunchStudio}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-300 hover:from-brand-300 hover:to-teal-200 text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Launch DataMentor Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => scrollToSection('interactive-demo')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 backdrop-blur"
          >
            <Play className="w-3.5 h-3.5 text-brand-400 fill-brand-400/20" />
            <span>Live Interactive Sandbox</span>
          </button>

          {onNavigate && (
            <button
              onClick={() => onNavigate('chatbot')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 hover:text-white font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Ask Menti.ai</span>
            </button>
          )}
        </div>

        {/* SECTION: TechMentor Product Ecosystem Suite Cards */}
        <div id="suite" className="mt-14 max-w-6xl mx-auto text-left">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-400">TechMentor Ecosystem</span>
              <h3 className="text-lg font-bold text-white">Integrated AI & Data Engineering Tools</h3>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">First-Principles Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tool 1: DataMentor */}
            <div 
              onClick={onLaunchStudio}
              className="p-5 rounded-2xl bg-slate-900/80 border border-brand-500/30 hover:border-brand-500/70 transition-all cursor-pointer group shadow-lg hover:shadow-brand-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                    ● ACTIVE
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                  DataMentor
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Data Preprocessing & 13-Stage ML</p>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  Deterministic 13-step machine learning pipeline with mathematical proofs, Tukey fences, feature scalers, and What-If live inference.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-brand-400 group-hover:text-brand-300">
                <span>Launch Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 2: GenAIMentor RAG */}
            <div 
              onClick={() => onNavigate ? onNavigate('genaimentor') : scrollToSection('ai-mentor')}
              className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/70 transition-all cursor-pointer group shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
                    ✦ COMING SOON
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  AIMentor
                </h4>
                <p className="text-xs text-blue-300/80 font-mono mt-0.5">RAG & Generative AI Pipelines</p>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  Dual-vector + hybrid BM25 search engine with Reciprocal Rank Fusion (RRF), semantic chunk visualizers, and context grounding audits.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                <span>Explore AIMentor (Coming Soon)</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Tool 3: Menti.ai (Single-colour #9333EA Theme) */}
            <div 
              onClick={() => onNavigate ? onNavigate('chatbot') : scrollToSection('ai-mentor')}
              className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/30 hover:border-purple-500/70 transition-all cursor-pointer group shadow-lg hover:shadow-purple-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                    ● ACTIVE
                  </span>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  Menti.ai
                </h4>
                <p className="text-xs text-purple-300/80 font-mono mt-0.5">Pedagogical Socratic Chatbot</p>
                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  Conversational AI mentor directly hooked into your dataset's in-memory moments. Step-by-step mathematical proofs with zero hallucination.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                <span>Chat with Menti.ai</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Premium Floating IDE/Pipeline Preview Window */}
        <div className="mt-12 max-w-4xl mx-auto rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-2xl shadow-black/80 overflow-hidden text-left backdrop-blur-xl">
          {/* Mock Window Header */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-brand-400" /> datamentor_audit_session_v1.py
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Verified Deterministic
              </span>
            </div>
          </div>

          {/* Window Content Split */}
          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Input Moment */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>01. Input Moment</span>
                <span className="text-rose-400 font-bold font-mono">+2.4 Skew</span>
              </div>
              <div className="h-12 flex items-end gap-1 mb-2 bg-slate-950 rounded p-1.5 border border-slate-850">
                {[90, 72, 48, 30, 18, 10, 6, 4, 3, 2, 1, 1].map((h, i) => (
                  <div key={i} className="flex-1 bg-rose-500/70 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Fare: μ=$32.20, σ=$49.69, max=$512
              </div>
            </div>

            {/* Box 2: Mathematical Derivation */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-brand-500/30">
              <div className="text-[11px] font-mono text-brand-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>02. Exact Transformation</span>
                <span className="text-brand-300 font-mono">Log1p</span>
              </div>
              <div className="bg-slate-950 rounded p-2 text-xs font-mono text-slate-200 mb-2 border border-slate-850 space-y-1">
                <div className="text-brand-400 font-semibold">x' = ln(1 + x)</div>
                <div className="text-slate-400 text-[11px]">x' = ln(1 + 128.5) = 4.86</div>
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                ✓ Variance compressed by 96.2%
              </div>
            </div>

            {/* Box 3: 7-Pillar Transparency */}
            <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>03. Pillar 04 Rationale</span>
                  <span className="text-teal-400 font-mono font-bold">100% Audit</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  "StandardScaler preserves underlying skewness; Log1p normalizes heavy right tails."
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-brand-400" /> Zero Hallucination Guarantee
              </div>
            </div>
          </div>
        </div>

        {/* Minimalist Trust Strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-400" /> DataMentor (13 Stages)
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Deterministic Math
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" /> AIMentor Grounded RAG
          </span>
          <span className="flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-purple-400" /> Menti.ai Socratic Tutor
          </span>
        </div>
      </section>

      {/* SECTION: Features & Core Architecture */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="brand" className="mb-3">Architectural Pillars</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Built from First Principles for Complete Clarity
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Every layer of TechMentor and DataMentor is engineered to protect data integrity and empower your understanding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center mb-4">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Immutable Snapshot Rollback</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your raw dataset is sealed with SHA-256 cryptographic verification. Every cleaning or transformation operation creates an isolated version snapshot (v1, v2...) that you can undo instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Zero <code className="text-xs bg-slate-800 px-1 py-0.5 rounded font-mono text-cyan-300">eval()</code> Safe Execution</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Unlike insecure tools that dynamically evaluate string code, all feature engineering and transformations use strict deterministic dispatchers with zero arbitrary script execution.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">3-Tier Learning Depth</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Explore concepts at your preferred level: Beginner intuitive analogies, Intermediate practical data science workflows, or Technical mathematical derivations and edge cases.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4">
              <LineChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Non-Destructive Simulation</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Preview before/after distribution shifts, quantile deltas, and sample rows in memory before applying changes permanently to your working DataFrame.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">10+ Feature Engineering Patterns</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Generate mathematical interactions, division-guarded ratios, trigonometric cyclical encodings, timestamp durations, and group summary aggregations.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Contextual RAG Tutor</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              An AI tutor that queries your dataset's exact moments and fitted model parameters to answer specific questions with 0% fabrication and verified Python code.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Interactive Feature Simulator */}
      <section id="interactive-demo" className="py-20 bg-slate-900/40 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Live Interactive Sandbox
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Experience Explainable ML in Real Time
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base">
              Interact directly with our deterministic transformation algorithms, adjust parameters in real-time, and inspect mathematically verified derivations.
            </p>
          </div>

          {/* Interactive Demo Container */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-5xl mx-auto">
            {/* Simulator Top Nav Bar */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">DataMentor_Sim_Engine v2.4</span>
              </div>

              {/* Tab Selector & Reset */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setActiveDemoTab('scaling')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'scaling'
                        ? 'bg-brand-500 text-slate-950 font-bold shadow-lg shadow-brand-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Feature Scaling</span>
                  </button>
                  <button
                    onClick={() => setActiveDemoTab('outliers')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'outliers'
                        ? 'bg-brand-500 text-slate-950 font-bold shadow-lg shadow-brand-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Outlier Detection</span>
                  </button>
                  <button
                    onClick={() => setActiveDemoTab('predict')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'predict'
                        ? 'bg-brand-500 text-slate-950 font-bold shadow-lg shadow-brand-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>What-If Prediction</span>
                  </button>
                  <button
                    onClick={() => setActiveDemoTab('explain')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      activeDemoTab === 'explain'
                        ? 'bg-brand-500 text-slate-950 font-bold shadow-lg shadow-brand-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>7-Pillar Audit</span>
                  </button>
                </div>

                <button
                  onClick={resetSandbox}
                  title="Reset Simulator to Default Parameters"
                  className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-brand-400 hover:border-brand-500/30 transition-all text-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset</span>
                </button>
              </div>
            </div>

            {/* Simulator Interactive Body */}
            <div className="p-6 md:p-8">
              {/* TAB 1: SCALING */}
              {activeDemoTab === 'scaling' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Controls Column */}
                    <div className="space-y-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-brand-400" /> Transformation Controls
                        </h4>
                        <span className="text-[10px] font-mono text-brand-400/80 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                          Step 08 Engine
                        </span>
                      </div>

                      {/* Skewness Slider */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-300 font-medium">Feature Skewness:</span>
                          <span className="text-brand-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            +{skewValue.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="4.0"
                          step="0.1"
                          value={skewValue}
                          onChange={(e) => setSkewValue(parseFloat(e.target.value))}
                          className="w-full accent-brand-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-mono">
                          <span className={skewValue < 0.8 ? 'text-brand-400 font-bold' : ''}>Symmetric (0.1)</span>
                          <span className={skewValue >= 0.8 && skewValue <= 1.8 ? 'text-brand-400 font-bold' : ''}>Moderate (1.0)</span>
                          <span className={skewValue > 1.8 ? 'text-rose-400 font-bold' : ''}>Heavy Tail (4.0)</span>
                        </div>
                      </div>

                      {/* Sample Value Input / Presets */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-300 font-medium">Test Value (x):</span>
                          <span className="text-emerald-400 font-mono font-bold">${sampleScaleValue.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[12.50, 65.00, 128.50, 512.33].map((val) => (
                            <button
                              key={val}
                              onClick={() => setSampleScaleValue(val)}
                              className={`py-1 rounded text-[11px] font-mono transition-all border ${
                                sampleScaleValue === val
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              ${val < 100 ? val.toFixed(0) : val.toFixed(0)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Selected Algorithm */}
                      <div>
                        <label className="text-xs text-slate-300 font-medium block mb-1.5">Transformation Algorithm:</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'log1p', name: 'Log1p', formula: 'ln(1 + x)', desc: 'Compresses right skew' },
                            { id: 'standard', name: 'StandardScaler', formula: '(x - μ) / σ', desc: 'Centers μ=0, σ=1' },
                            { id: 'robust', name: 'RobustScaler', formula: '(x - med) / IQR', desc: 'Median & IQR centered' },
                            { id: 'yeo', name: 'Yeo-Johnson', formula: 'Power MLE (λ)', desc: 'Box-Cox power normal' }
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setSelectedTransform(t.id)}
                              className={`p-2.5 rounded-lg text-left border text-xs transition-all ${
                                selectedTransform === t.id
                                  ? 'bg-brand-500/15 border-brand-500 text-white font-semibold ring-1 ring-brand-500/40'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-semibold text-slate-200">{t.name}</span>
                                {selectedTransform === t.id && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                                )}
                              </div>
                              <div className="text-[10px] font-mono text-brand-400/90">{t.formula}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recommendation Callout */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-brand-500/20 text-xs">
                        <span className="text-brand-400 font-semibold flex items-center gap-1 mb-1">
                          <Sparkles className="w-3.5 h-3.5" /> Deterministic Recommendation:
                        </span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {skewValue > 1.5
                            ? 'Heavy right skew detected (> 1.5). Log1p or Yeo-Johnson power transforms compress extreme variance into an optimal Gaussian bell curve.'
                            : skewValue > 0.8
                            ? 'Moderate skewness. RobustScaler or Log1p recommended depending on whether outliers represent legitimate domain signals.'
                            : 'Near symmetric distribution. StandardScaler is optimal for gradient-based optimization and Euclidean distances.'}
                        </p>
                      </div>
                    </div>

                    {/* Live SVG Visualizer Column */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Raw Distribution Card */}
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-300">Raw Feature Distribution</span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-400 font-mono border border-rose-500/20">
                              Skew: +{skewValue.toFixed(1)}
                            </span>
                          </div>

                          {/* Raw Histogram Visualization */}
                          <div className="h-32 w-full bg-slate-950 rounded-lg p-2.5 flex items-end justify-between gap-1 border border-slate-850">
                            {Array.from({ length: 12 }, (_, idx) => {
                              const decay = Math.exp(- (idx * 0.45) / (skewValue * 0.38 + 0.12));
                              const height = Math.min(95, Math.max(6, Math.round(decay * 94)));
                              return (
                                <div
                                  key={idx}
                                  className="w-full bg-rose-500/65 rounded-t transition-all duration-300 hover:bg-rose-400 cursor-pointer"
                                  style={{ height: `${height}%` }}
                                  title={`Bin #${idx + 1}: ${Math.round(height * 4.2)} samples`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono px-1">
                            <span>$0 (Min)</span>
                            <span className="text-slate-300">Med: $14.45</span>
                            <span className="text-rose-400">Max: $512.33</span>
                          </div>
                        </div>

                        {/* Transformed Distribution Card */}
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-brand-500/30 flex flex-col justify-between shadow-lg shadow-brand-500/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-brand-300">
                              Transformed ({selectedTransform.toUpperCase()})
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/15 text-brand-400 font-mono border border-brand-500/20">
                              Norm Skew: +{selectedTransform === 'log1p' || selectedTransform === 'yeo' ? (skewValue * 0.12).toFixed(2) : (skewValue * 0.92).toFixed(2)}
                            </span>
                          </div>

                          {/* Transformed Histogram Visualization */}
                          <div className="h-32 w-full bg-slate-950 rounded-lg p-2.5 flex items-end justify-between gap-1 border border-slate-850">
                            {(() => {
                              let bins = [];
                              if (selectedTransform === 'log1p') {
                                bins = [8, 22, 50, 78, 96, 100, 92, 70, 42, 20, 9, 4];
                              } else if (selectedTransform === 'yeo') {
                                bins = [6, 18, 45, 82, 100, 98, 88, 64, 38, 16, 7, 3];
                              } else if (selectedTransform === 'standard') {
                                bins = Array.from({ length: 12 }, (_, i) => {
                                  const decay = Math.exp(- (i * 0.45) / (skewValue * 0.38 + 0.12));
                                  return Math.min(95, Math.max(6, Math.round(decay * 88)));
                                });
                              } else {
                                bins = Array.from({ length: 12 }, (_, i) => {
                                  const decay = Math.exp(- (i * 0.45) / (skewValue * 0.38 + 0.12));
                                  return Math.min(95, Math.max(6, Math.round(decay * 84)));
                                });
                              }
                              return bins.map((h, idx) => (
                                <div
                                  key={idx}
                                  className="w-full bg-brand-400/80 rounded-t transition-all duration-300 hover:bg-brand-300 cursor-pointer"
                                  style={{ height: `${h}%` }}
                                  title={`Normalized Bin #${idx + 1}: ${Math.round(h * 4.2)} samples`}
                                />
                              ));
                            })()}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-brand-400/90 mt-2 font-mono px-1">
                            {selectedTransform === 'log1p' ? (
                              <>
                                <span>0.00</span>
                                <span>Med: 2.74</span>
                                <span>Max: 6.24</span>
                              </>
                            ) : selectedTransform === 'standard' ? (
                              <>
                                <span>-0.65σ</span>
                                <span>μ = 0.00</span>
                                <span>+9.66σ</span>
                              </>
                            ) : selectedTransform === 'robust' ? (
                              <>
                                <span>-0.63</span>
                                <span>Med = 0.00</span>
                                <span>+21.56</span>
                              </>
                            ) : (
                              <>
                                <span>-0.42</span>
                                <span>Peak: 2.10</span>
                                <span>Max: 4.88</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Live Step-by-Step Derivation Box */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5 text-brand-400" /> Step-by-Step Mathematical Derivation
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">Sample x = ${sampleScaleValue.toFixed(2)}</span>
                        </div>
                        <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1.5 border border-slate-850">
                          {selectedTransform === 'log1p' && (
                            <>
                              <div className="text-brand-400 font-semibold">1. Formula: x' = ln(1 + x)</div>
                              <div className="text-slate-400">
                                2. Substitution: x' = ln(1 + {sampleScaleValue.toFixed(2)}) = ln({(1 + sampleScaleValue).toFixed(2)})
                              </div>
                              <div className="text-emerald-400 font-bold">
                                3. Result: x' = {Math.log1p(sampleScaleValue).toFixed(4)} (Variance compressed by {((1 - Math.log1p(sampleScaleValue) / sampleScaleValue) * 100).toFixed(1)}%)
                              </div>
                            </>
                          )}
                          {selectedTransform === 'standard' && (
                            <>
                              <div className="text-brand-400 font-semibold">1. Formula: z = (x - μ) / σ</div>
                              <div className="text-slate-400">
                                2. Moments: μ = 32.20, σ = 49.69  →  z = ({sampleScaleValue.toFixed(2)} - 32.20) / 49.69
                              </div>
                              <div className="text-emerald-400 font-bold">
                                3. Result: z = {((sampleScaleValue - 32.20) / 49.69).toFixed(3)} (Unit variance standardized, shape preserved)
                              </div>
                            </>
                          )}
                          {selectedTransform === 'robust' && (
                            <>
                              <div className="text-brand-400 font-semibold">1. Formula: x' = (x - median) / IQR</div>
                              <div className="text-slate-400">
                                2. Quantiles: Median = 14.45, IQR = Q3 - Q1 = 31.00 - 7.91 = 23.09
                              </div>
                              <div className="text-emerald-400 font-bold">
                                3. Result: x' = ({sampleScaleValue.toFixed(2)} - 14.45) / 23.09 = {((sampleScaleValue - 14.45) / 23.09).toFixed(3)} (Outlier resistant)
                              </div>
                            </>
                          )}
                          {selectedTransform === 'yeo' && (
                            <>
                              <div className="text-brand-400 font-semibold">1. Formula: Ψ(λ, x) = ((x + 1)^λ - 1) / λ for x ≥ 0</div>
                              <div className="text-slate-400">
                                2. Estimated Optimal λ = -0.12 (via MLE Profile Log-Likelihood)
                              </div>
                              <div className="text-emerald-400 font-bold">
                                3. Result: x' = (({(sampleScaleValue + 1).toFixed(2)})^(-0.12) - 1) / -0.12 = {((Math.pow(sampleScaleValue + 1, -0.12) - 1) / -0.12).toFixed(3)} (Gaussian Bell)
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: OUTLIERS */}
              {activeDemoTab === 'outliers' && (
                <div className="space-y-6">
                  {(() => {
                    // Dynamic calculation based on method & multiplier
                    let lowerFence = '0.00';
                    let upperFence = '65.63';
                    let flaggedCount = 38;
                    let formulaStr = `[Q1 - ${outlierMultiplier}·IQR, Q3 + ${outlierMultiplier}·IQR]`;

                    if (selectedOutlierMethod === 'iqr') {
                      const q1 = 7.91;
                      const q3 = 31.00;
                      const iqr = 23.09;
                      lowerFence = Math.max(0, q1 - outlierMultiplier * iqr).toFixed(2);
                      upperFence = (q3 + outlierMultiplier * iqr).toFixed(2);
                      flaggedCount = outlierMultiplier <= 1.0 ? 64 : outlierMultiplier <= 1.5 ? 38 : outlierMultiplier <= 2.0 ? 24 : 11;
                      formulaStr = `[Q1 - ${outlierMultiplier}·IQR, Q3 + ${outlierMultiplier}·IQR]`;
                    } else if (selectedOutlierMethod === 'zscore') {
                      const mu = 32.20;
                      const sigma = 49.69;
                      lowerFence = Math.max(0, mu - outlierMultiplier * sigma).toFixed(2);
                      upperFence = (mu + outlierMultiplier * sigma).toFixed(2);
                      flaggedCount = outlierMultiplier <= 1.0 ? 78 : outlierMultiplier <= 1.5 ? 52 : outlierMultiplier <= 2.0 ? 32 : outlierMultiplier <= 2.5 ? 21 : 14;
                      formulaStr = `[μ - ${outlierMultiplier}σ, μ + ${outlierMultiplier}σ]`;
                    } else {
                      // modz (MAD)
                      const med = 14.45;
                      const mad = 9.70;
                      const factor = 1.4826;
                      lowerFence = Math.max(0, med - outlierMultiplier * factor * mad).toFixed(2);
                      upperFence = (med + outlierMultiplier * factor * mad).toFixed(2);
                      flaggedCount = outlierMultiplier <= 1.0 ? 82 : outlierMultiplier <= 1.5 ? 58 : outlierMultiplier <= 2.0 ? 41 : outlierMultiplier <= 2.5 ? 28 : 16;
                      formulaStr = `[Med - ${outlierMultiplier}·MAD*, Med + ${outlierMultiplier}·MAD*]`;
                    }

                    const upperFenceNum = parseFloat(upperFence);
                    const upperFencePct = Math.min(84, Math.max(54, 48 + (upperFenceNum - 31) * 0.35));

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Settings Column */}
                        <div className="space-y-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-rose-400" /> Outlier Settings
                          </h4>

                          <div>
                            <label className="text-xs text-slate-300 font-medium block mb-1.5">Detection Algorithm:</label>
                            <div className="space-y-2">
                              {[
                                { id: 'iqr', name: "Tukey's IQR Rule", desc: 'Quartile dispersion fences (Robust)' },
                                { id: 'zscore', name: 'Z-Score (k·σ)', desc: 'Parametric mean & standard dev' },
                                { id: 'modz', name: 'Modified Z-Score', desc: 'Median Absolute Deviation (MAD)' }
                              ].map((m) => (
                                <button
                                  key={m.id}
                                  onClick={() => setSelectedOutlierMethod(m.id)}
                                  className={`w-full p-2.5 rounded-lg text-left border text-xs transition-all ${
                                    selectedOutlierMethod === m.id
                                      ? 'bg-rose-500/15 border-rose-500 text-white font-semibold ring-1 ring-rose-500/40'
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-200">{m.name}</span>
                                    {selectedOutlierMethod === m.id && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-slate-300 font-medium">Multiplier Threshold (k):</span>
                              <span className="text-rose-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                {outlierMultiplier.toFixed(1)}x
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1.0"
                              max="3.0"
                              step="0.5"
                              value={outlierMultiplier}
                              onChange={(e) => setOutlierMultiplier(parseFloat(e.target.value))}
                              className="w-full accent-rose-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                              <span>Strict (1.0x)</span>
                              <span>Standard (1.5x)</span>
                              <span>Relaxed (3.0x)</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs font-mono space-y-1">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Fence Range:</span>
                            <div className="text-rose-400 font-bold">{formulaStr}</div>
                            <div className="text-slate-300 text-[11px]">${lowerFence} → ${upperFence}</div>
                          </div>
                        </div>

                        {/* Visualizer Column */}
                        <div className="lg:col-span-2 space-y-4">
                          {/* Box and Whisker Visualizer */}
                          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <span className="text-xs font-semibold text-slate-300 block">Box & Whisker Distribution Fences</span>
                                <span className="text-[10px] text-slate-400">Feature: "Fare" (N = 891 records)</span>
                              </div>
                              <span className="text-xs font-mono text-rose-400 bg-rose-500/15 px-2.5 py-1 rounded border border-rose-500/30">
                                {flaggedCount} Anomaly Rows ({((flaggedCount / 891) * 100).toFixed(1)}%)
                              </span>
                            </div>

                            {/* Interactive SVG / CSS Boxplot */}
                            <div className="h-28 w-full bg-slate-950 rounded-lg px-4 relative flex items-center border border-slate-850 overflow-hidden">
                              {/* Axis Line */}
                              <div className="absolute left-[5%] right-[5%] h-0.5 bg-slate-800" />

                              {/* Min whisker */}
                              <div className="absolute left-[5%] w-0.5 h-10 bg-slate-500" />
                              <div className="absolute left-[5%] w-[15%] h-0.5 bg-slate-500" />

                              {/* Box (Q1 20% to Q3 48%) */}
                              <div className="absolute left-[20%] w-[28%] h-14 bg-brand-500/20 border-2 border-brand-400 rounded flex items-center justify-center shadow-lg shadow-brand-500/10">
                                {/* Median Line (at 32%) */}
                                <div className="absolute left-[42%] w-0.5 h-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" title="Median: $14.45" />
                              </div>

                              {/* Max whisker to Q3 */}
                              <div className="absolute left-[48%] w-[6%] h-0.5 bg-slate-500" />

                              {/* Upper Fence Boundary Line */}
                              <div
                                className="absolute w-0.5 h-16 border-r-2 border-dashed border-rose-400 transition-all duration-500 z-10"
                                style={{ left: `${upperFencePct}%` }}
                                title={`Upper Fence: $${upperFence}`}
                              >
                                <span className="absolute -top-3 left-1 text-[9px] font-mono text-rose-400 whitespace-nowrap bg-slate-950 px-1 rounded border border-rose-500/30">
                                  Fence: ${upperFence}
                                </span>
                              </div>

                              {/* 4 Sample Outlier Dots */}
                              {[
                                { val: 75.0, rawPos: 68 },
                                { val: 150.0, rawPos: 78 },
                                { val: 263.0, rawPos: 88 },
                                { val: 512.33, rawPos: 96 }
                              ].map((dot, idx) => {
                                const isWinsorized = selectedOutlierStrategy === 'winsorize';
                                const isRemoved = selectedOutlierStrategy === 'remove';
                                const dotPos = isWinsorized ? upperFencePct : dot.rawPos;

                                return (
                                  <div
                                    key={idx}
                                    className={`absolute w-3 h-3 rounded-full border transition-all duration-500 flex items-center justify-center ${
                                      isRemoved
                                        ? 'bg-slate-800 border-rose-500/40 opacity-20 scale-75'
                                        : isWinsorized
                                        ? 'bg-emerald-400 border-white shadow-[0_0_10px_rgba(52,211,153,0.8)] scale-110'
                                        : 'bg-rose-500 border-white animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                                    }`}
                                    style={{ left: `${dotPos}%` }}
                                    title={`Outlier: $${dot.val} (${selectedOutlierStrategy === 'winsorize' ? `Capped to $${upperFence}` : selectedOutlierStrategy === 'remove' ? 'Dropped' : 'Raw Outlier'})`}
                                  />
                                );
                              })}
                            </div>

                            {/* Coordinate Axis Labels */}
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-3 px-1">
                              <span>Min: $0.00</span>
                              <span>Q1: $7.91</span>
                              <span className="text-amber-400 font-semibold">Median: $14.45</span>
                              <span>Q3: $31.00</span>
                              <span className="text-rose-400 font-bold">Upper Fence: ${upperFence}</span>
                            </div>
                          </div>

                          {/* Treatment Strategy Selector */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              onClick={() => setSelectedOutlierStrategy('keep')}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                selectedOutlierStrategy === 'keep'
                                  ? 'bg-slate-900 border-slate-400 text-white font-semibold ring-1 ring-slate-400/40'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-200">1. Strategy: Keep</span>
                                {selectedOutlierStrategy === 'keep' && <Check className="w-3.5 h-3.5 text-slate-300" />}
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                Retains legitimate domain extremes. Rows preserved: 891/891.
                              </p>
                            </button>

                            <button
                              onClick={() => setSelectedOutlierStrategy('winsorize')}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                selectedOutlierStrategy === 'winsorize'
                                  ? 'bg-brand-500/15 border-brand-400 text-white font-semibold ring-1 ring-brand-400/40 shadow-lg shadow-brand-500/10'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-brand-300">2. Winsorize (Cap)</span>
                                {selectedOutlierStrategy === 'winsorize' && <Check className="w-3.5 h-3.5 text-brand-400" />}
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                Clamps extreme values to boundary fence (${upperFence}). 0 rows lost.
                              </p>
                            </button>

                            <button
                              onClick={() => setSelectedOutlierStrategy('remove')}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                selectedOutlierStrategy === 'remove'
                                  ? 'bg-rose-500/15 border-rose-400 text-white font-semibold ring-1 ring-rose-400/40 shadow-lg shadow-rose-500/10'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-rose-300">3. Filter & Remove</span>
                                {selectedOutlierStrategy === 'remove' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed">
                                Drops {flaggedCount} flagged rows safely ({891 - flaggedCount} rows remaining).
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 3: WHAT-IF PREDICTION */}
              {activeDemoTab === 'predict' && (
                <div className="space-y-6">
                  {/* Preset Scenario Selector */}
                  <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800/80">
                    <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-brand-400" /> 1-Click Scenarios:
                    </span>
                    {[
                      { name: '👑 1st Class VIP', pclass: 1, age: 36, fare: 180, fam: 2 },
                      { name: '🎒 3rd Class Solo', pclass: 3, age: 22, fare: 8, fam: 1 },
                      { name: '👨‍👩‍👧 2nd Class Family', pclass: 2, age: 29, fare: 35, fam: 4 },
                      { name: '👵 1st Class Senior', pclass: 1, age: 62, fare: 120, fam: 1 }
                    ].map((sc) => (
                      <button
                        key={sc.name}
                        onClick={() => {
                          setPredictPclass(sc.pclass);
                          setPredictAge(sc.age);
                          setPredictFare(sc.fare);
                          setPredictFamilySize(sc.fam);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 text-xs text-slate-300 font-medium transition-all"
                      >
                        {sc.name}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sliders Input Panel */}
                    <div className="lg:col-span-6 space-y-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-brand-400" /> Interactive Feature Inputs
                      </h4>

                      {/* Pclass */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                          <span>Passenger Class (Pclass):</span>
                          <span className="text-brand-400 font-bold font-mono">
                            Class {predictPclass} {predictPclass === 1 ? '(VIP Suite)' : predictPclass === 2 ? '(Standard)' : '(Economy)'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3].map((cls) => (
                            <button
                              key={cls}
                              onClick={() => setPredictPclass(cls)}
                              className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                                predictPclass === cls
                                  ? 'bg-brand-500/20 border-brand-500 text-brand-300 ring-1 ring-brand-500/40 shadow-md'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              Class {cls}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Age */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                          <span>Passenger Age:</span>
                          <span className="text-brand-400 font-bold font-mono">
                            {predictAge} yrs{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({predictAge < 18 ? 'Child' : predictAge < 35 ? 'Young Adult' : predictAge < 55 ? 'Adult' : 'Senior'})
                            </span>
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="80"
                          value={predictAge}
                          onChange={(e) => setPredictAge(parseInt(e.target.value))}
                          className="w-full accent-brand-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                          <span>1 yr</span>
                          <span>28 yrs (Median)</span>
                          <span>80 yrs</span>
                        </div>
                      </div>

                      {/* Fare */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                          <span>Ticket Fare:</span>
                          <span className="text-brand-400 font-bold font-mono">
                            ${predictFare}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({predictFare < 20 ? 'Budget' : predictFare < 60 ? 'Standard' : predictFare < 150 ? 'Business' : 'First Class VIP'})
                            </span>
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="300"
                          value={predictFare}
                          onChange={(e) => setPredictFare(parseInt(e.target.value))}
                          className="w-full accent-brand-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                          <span>$5 (Min)</span>
                          <span>$32 (Mean)</span>
                          <span>$300 (VIP)</span>
                        </div>
                      </div>

                      {/* Family Size */}
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                          <span>Family Size on Board:</span>
                          <span className="text-brand-400 font-bold font-mono">
                            {predictFamilySize} member{predictFamilySize > 1 ? 's' : ''}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({predictFamilySize === 1 ? 'Solo' : predictFamilySize <= 4 ? 'Small Family' : 'Large Group'})
                            </span>
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={predictFamilySize}
                          onChange={(e) => setPredictFamilySize(parseInt(e.target.value))}
                          className="w-full accent-brand-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                          <span>1 (Solo)</span>
                          <span>4 (Family)</span>
                          <span>8 (Large)</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Output & Confidence Gauge */}
                    <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                      <div className="p-5 rounded-xl bg-slate-900/90 border border-brand-500/30 shadow-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-brand-400" /> Logistic Inference Output
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                              calculatedProb >= 0.5
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/10'
                            }`}
                          >
                            {calculatedProb >= 0.5 ? 'Predicted: Survived (1)' : 'Predicted: Not Survived (0)'}
                          </span>
                        </div>

                        {/* Probability Score & Meter */}
                        <div>
                          <div className="flex justify-between items-baseline mb-1.5">
                            <span className="text-xs font-medium text-slate-300">Survival Probability:</span>
                            <span
                              className={`font-mono text-2xl font-black ${
                                calculatedProb >= 0.6
                                  ? 'text-emerald-400'
                                  : calculatedProb >= 0.4
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {(calculatedProb * 100).toFixed(1)}%
                            </span>
                          </div>

                          <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
                            {/* 50% Threshold marker */}
                            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-600 z-10" title="Decision Threshold (50%)" />
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                calculatedProb >= 0.6
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                                  : calculatedProb >= 0.4
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                  : 'bg-gradient-to-r from-rose-500 to-red-400'
                              }`}
                              style={{ width: `${calculatedProb * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                            <span>0% (Not Survived)</span>
                            <span className="text-slate-300">50% Threshold</span>
                            <span>100% (Survived)</span>
                          </div>
                        </div>

                        {/* SHAP Feature Force Decomposition */}
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs space-y-2">
                          <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                            Feature Force Breakdown (SHAP Logit Push):
                          </span>

                          <div className="space-y-1.5 font-mono text-[11px]">
                            {/* Pclass force */}
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">• Class {predictPclass} status</span>
                              <span className={pclassScore >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {pclassScore >= 0 ? `+${pclassScore.toFixed(2)}` : pclassScore.toFixed(2)} Logit
                              </span>
                            </div>

                            {/* Age force */}
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">• Age ({predictAge} yrs)</span>
                              <span className={ageScore >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {ageScore >= 0 ? `+${ageScore.toFixed(2)}` : ageScore.toFixed(2)} Logit
                              </span>
                            </div>

                            {/* Fare force */}
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">• Fare (${predictFare})</span>
                              <span className={fareScore >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {fareScore >= 0 ? `+${fareScore.toFixed(2)}` : fareScore.toFixed(2)} Logit
                              </span>
                            </div>

                            {/* Family force */}
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">• Family ({predictFamilySize} on board)</span>
                              <span className={famScore >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {famScore >= 0 ? `+${famScore.toFixed(2)}` : famScore.toFixed(2)} Logit
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Total Logit z = {totalLogit.toFixed(2)}</span>
                            <span className="text-brand-400">p = 1 / (1 + e^-z)</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Step 12 Inference Engine
                        </span>
                        <button onClick={onLaunchStudio} className="text-brand-400 font-bold hover:underline flex items-center gap-1">
                          Test on Your Dataset →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: 7-PILLAR AUDIT */}
              {activeDemoTab === 'explain' && (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'imputation', label: '1. Missing Imputation (Age)' },
                      { id: 'scaling', label: '2. Log1p Power Scaling (Fare)' },
                      { id: 'outliers', label: '3. Winsorization Capping (Income)' },
                      { id: 'pca', label: '4. PCA Decomposition (Sensors)' }
                    ].map((op) => (
                      <button
                        key={op.id}
                        onClick={() => setSelectedPillarOperation(op.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          selectedPillarOperation === op.id
                            ? 'bg-brand-500/20 text-brand-300 border-brand-500/50 shadow-md ring-1 ring-brand-500/30'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {op.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5 rounded-xl bg-slate-900 border border-brand-500/30 shadow-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-sm border border-brand-500/30">
                          7P
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{PILLAR_AUDIT_DATA[selectedPillarOperation].title}</h4>
                          <p className="text-xs text-slate-400">Target: {PILLAR_AUDIT_DATA[selectedPillarOperation].feature}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          {PILLAR_AUDIT_DATA[selectedPillarOperation].badge}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          100% Deterministic
                        </span>
                      </div>
                    </div>

                    {/* 7 Pillars Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {PILLAR_AUDIT_DATA[selectedPillarOperation].pillars.map((p) => (
                        <div
                          key={p.num}
                          className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-brand-500/40 transition-all duration-200"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-brand-400 font-bold bg-brand-500/10 px-1.5 py-0.5 rounded text-[10px] border border-brand-500/20">
                              {p.num}
                            </span>
                            <span className="font-semibold text-slate-200">{p.name}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{p.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Scikit-Learn Executable Snippet */}
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-brand-400" /> Executable Python Code
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Scikit-Learn / NumPy Pipeline</span>
                      </div>
                      <pre className="p-3 rounded-lg bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto border border-slate-850">
                        <code>{PILLAR_AUDIT_DATA[selectedPillarOperation].code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: The 7 Explainability Pillars */}
      <section id="pillars" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="brand" className="mb-3">Our Core Doctrine</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            "Automate the Work, But Explain the Learning."
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg leading-relaxed">
            Every button you click in DataMentor answers the 7 foundational questions of data science explainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLAR_AUDIT_DATA.imputation.pillars.slice(0, 6).map((pillar) => (
            <div
              key={pillar.num}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-brand-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-brand-400/40 group-hover:text-brand-400 transition-colors">
                    {pillar.num}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 font-mono">
                    Pillar {pillar.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                  {pillar.name}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {pillar.text}
                </p>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-850 text-[11px] text-slate-300 font-mono">
                <span className="text-brand-400 block text-[10px] uppercase font-bold mb-0.5">Audited & Verified:</span>
                100% Deterministic Scikit-Learn / Pandas derivation
              </div>
            </div>
          ))}

          {/* 7th Wide Pillar */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 border border-brand-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xl font-bold text-brand-400">07. When Should You Use This?</span>
                <Badge variant="brand">Industry Guidelines</Badge>
              </div>
              <h3 className="text-xl font-bold text-white">Interview-Ready & Production Grounded Standards</h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                We equip you with the practical heuristics used by senior machine learning engineers at top tech companies—so you always know when a technique adds genuine value and when it risks data leakage or overfitting.
              </p>
            </div>
            <button
              onClick={onLaunchStudio}
              className="shrink-0 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand-500/20"
            >
              Start Learning in Studio →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: 13-Stage Machine Learning Pipeline Interactive Roadmap */}
      <section id="pipeline" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="brand" className="mb-3">End-to-End Workflow</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              The 13-Stage Machine Learning Pipeline
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Explore all 13 deterministic stages. Click any stage to launch directly into that workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PIPELINE_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  onClick={() => onNavigate ? onNavigate(stage.id) : onLaunchStudio()}
                  onMouseEnter={() => setHoveredStep(stage.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                  className={`p-5 rounded-2xl bg-slate-950 border transition-all duration-300 cursor-pointer flex flex-col justify-between group hover:-translate-y-1 ${
                    hoveredStep === stage.id ? 'border-brand-400 shadow-xl shadow-brand-500/10' : 'border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl bg-slate-900 border flex items-center justify-center ${stage.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-400">Step {stage.step}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-slate-300 font-mono border border-slate-800">
                        {stage.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                      {stage.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {stage.summary}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-855 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                      {stage.formula}
                    </span>
                    <span className="text-xs font-semibold text-brand-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Capstone Card: Fills the remaining 2 columns on lg (and 1 column on md) perfectly */}
            <div
              onClick={onLaunchStudio}
              className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-brand-950/60 via-slate-900 to-slate-950 border border-brand-500/40 hover:border-brand-400/80 transition-all duration-300 cursor-pointer shadow-xl shadow-brand-500/5 hover:shadow-brand-500/15 flex flex-col md:flex-row items-center justify-between gap-6 group hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-2 relative z-10 max-w-lg">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    Capstone Workflow
                  </span>
                  <span className="text-xs text-slate-400 font-mono">End-to-End Pipeline</span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                  Execute All 13 Stages on Your Dataset
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  From raw ingestion and cryptographic verification to live What-If inference and residual diagnostics — learn with 100% mathematical explainability.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 0% Data Leakage
                  </span>
                  <span className="flex items-center gap-1 text-brand-400">
                    <Sparkles className="w-3.5 h-3.5" /> 7-Pillar Rationale
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <RotateCcw className="w-3.5 h-3.5" /> Single-Click Rollback
                  </span>
                </div>
              </div>

              <div className="shrink-0 relative z-10 w-full md:w-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); onLaunchStudio(); }}
                  className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-300 hover:from-brand-300 hover:to-teal-200 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 group-hover:scale-105"
                >
                  <span>Open Full Studio</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: AI Data Mentor (Menti.ai Socratic Tutor) */}
      <section id="ai-mentor" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <Badge variant="purple">Menti.ai Socratic Tutor</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              An AI Data Science Tutor That Truly Understands Your Dataset
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Unlike disconnected generic chatbots, <strong className="text-purple-300 font-semibold">Menti.ai</strong> connects directly with your active dataset’s in-memory moments, null percentages, and Scikit-Learn model artifacts.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Zero Fabrication Guarantee</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Calculations and statistical claims are proven from memory, never hallucinated.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Structured Pedagogical Outputs</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Direct answers, mathematical definitions, practical guidance, and code snippets.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate ? onNavigate('chatbot') : onLaunchStudio()}
                className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xl shadow-purple-600/30 inline-flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bot className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Launch Menti.ai Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Interactive AI Mentor Mockup Card */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-950/20 p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Menti.ai Socratic Console</h4>
                  <p className="text-[11px] text-slate-400">Context: Active Titanic Dataset (891 rows, 12 columns)</p>
                </div>
              </div>
              <Badge variant="purple">Grounded Context</Badge>
            </div>

            {/* Prompt Selector Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedQuestion('leakage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedQuestion === 'leakage' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Data Leakage Guard
              </button>
              <button
                onClick={() => setSelectedQuestion('skewness')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedQuestion === 'skewness' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Skewness & Power Transforms
              </button>
              <button
                onClick={() => setSelectedQuestion('outliers')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedQuestion === 'outliers' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Winsorization vs Dropping
              </button>
            </div>

            {/* Mentor Output Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 text-purple-400" />
                  {MENTOR_QUESTIONS[selectedQuestion].question}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-300 font-mono">
                  {MENTOR_QUESTIONS[selectedQuestion].badge}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {MENTOR_QUESTIONS[selectedQuestion].answer}
              </p>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-850 font-mono text-[11px] text-brand-300 overflow-x-auto whitespace-pre">
                {MENTOR_QUESTIONS[selectedQuestion].code}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Comparison Matrix */}
      <section id="comparison" className="py-24 bg-slate-900/30 border-y border-slate-800/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="brand" className="mb-3">Feature Comparison</Badge>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Practitioners Choose TechMentor
            </h2>
            <p className="text-slate-400 mt-4 text-base sm:text-lg">
              Compare how TechMentor's integrated suite redefines data science & AI preparation against black-box AutoML tools and generic notebooks.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="p-4 sm:p-5 font-bold text-slate-300">Capability</th>
                  <th className="p-4 sm:p-5 font-bold text-brand-400 bg-brand-500/10 border-x border-brand-500/20">
                    TechMentor Suite 🧠✨
                  </th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Black-Box AutoML</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-400">Generic Jupyter Notebooks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">7-Pillar Explainability Rationale</td>
                  <td className="p-4 sm:p-5 font-bold text-brand-400 bg-brand-500/10 border-x border-brand-500/20">
                    ✅ Guaranteed for Every Step
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Hidden Black-Box</td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Manual documentation</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Step-by-Step Arithmetic Math Derivations</td>
                  <td className="p-4 sm:p-5 font-bold text-brand-400 bg-brand-500/10 border-x border-brand-500/20">
                    ✅ Live Real Dataset Numbers
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ None</td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Requires custom code</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">SHA-256 Immutability & Snapshot Rollback</td>
                  <td className="p-4 sm:p-5 font-bold text-brand-400 bg-brand-500/10 border-x border-brand-500/20">
                    ✅ Single-Click Instant Undo
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">⚠️ Varies</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Accidental cell mutation</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">3-Tier Learning Depth (Beginner to Technical)</td>
                  <td className="p-4 sm:p-5 font-bold text-brand-400 bg-brand-500/10 border-x border-brand-500/20">
                    ✅ 37+ Concepts Built-in
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ No educational layer</td>
                  <td className="p-4 sm:p-5 text-slate-400">❌ External Google search</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Menti.ai Grounded Context Tutor</td>
                  <td className="p-4 sm:p-5 font-bold text-brand-400 bg-brand-500/10 border-x border-brand-500/20">
                    ✅ Grounded in Dataset Moments
                  </td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ None</td>
                  <td className="p-4 sm:p-5 text-amber-400">⚠️ Generic LLM hallucination</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-semibold text-white">Security & Code Execution Safety</td>
                  <td className="p-4 sm:p-5 font-bold text-brand-400 bg-brand-500/10 border-x border-brand-500/20">
                    ✅ Zero eval(), Strict Dispatchers
                  </td>
                  <td className="p-4 sm:p-5 text-slate-400">⚠️ Proprietary cloud</td>
                  <td className="p-4 sm:p-5 text-rose-400">❌ Vulnerable to script injection</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION: FAQ Accordion */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">Got Questions?</Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 mt-4 text-base sm:text-lg">
            Everything you need to know about TechMentor, DataMentor, AIMentor, and Menti.ai.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all duration-200 hover:border-slate-700"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-white text-base sm:text-lg"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-brand-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-855 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: Grand Footer CTA */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-emerald-950 border border-brand-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-brand-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Master Explainable AI & Data Science?
            </h2>
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
              Launch TechMentor right now. Load your dataset into DataMentor or chat with Menti.ai with zero setup.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onLaunchStudio}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-400 via-brand-500 to-emerald-600 hover:from-brand-300 hover:to-emerald-500 text-slate-950 font-bold text-base shadow-xl shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <span>Launch DataMentor Studio Now</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onNavigate ? onNavigate('chatbot') : onLaunchStudio()}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
              >
                <Bot className="w-5 h-5 text-purple-300" />
                <span>Open Menti.ai Workspace</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-24 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-brand-500 border border-slate-700 hover:border-brand-400 text-slate-300 hover:text-slate-950 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
          title="Scroll Back to Top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default LandingPage;
