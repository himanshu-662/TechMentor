import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Lightbulb, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
  GraduationCap
} from 'lucide-react';
import Badge from '../common/Badge';

export const OutlierLearningCard = ({ conceptId = "handling_outliers", column = "" }) => {
  const [learningTier, setLearningTier] = useState('beginner'); // beginner | intermediate | technical
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeConcept, setActiveConcept] = useState(conceptId);

  // Sync if prop changes
  React.useEffect(() => {
    if (conceptId) {
      setActiveConcept(conceptId);
    }
  }, [conceptId]);

  const conceptData = {
    handling_outliers: {
      category: "Treatment Strategy",
      title: "How to Handle Outliers - The 5 Strategic Options",
      beginner: "When an outlier is detected, never immediately delete it! Handling outliers means choosing from 5 paths: (1) Keep them if they are genuine rare events, (2) Cap them (Winsorize) to protect averages without dropping rows, (3) Flag them with a 1/0 indicator column, (4) Transform them mathematically (Log/Power), or (5) Remove them only if they are proven corruptions.",
      intermediate: "Strategic decision framework: Linear and distance-based models (Linear Regression, KNN, SVM, K-Means) suffer extreme parameter distortion from leverage points and Cook's distance. Tree-based models (Random Forest, LightGBM, XGBoost) split on rank orders and naturally tolerate monotonic outliers. Choose Winsorization when preserving sample size N is critical; choose row removal only when observations are physically impossible or corrupt.",
      technical: "Formal treatment operator T(X): (1) Trimming: D' = {i : L <= x_i <= U}, reducing sample space and inducing truncation bias if non-MCAR; (2) Winsorization: x'_i = min(max(x_i, L), U), creating boundary point masses; (3) Indicator: d_i = I(x_i not in [L, U]); (4) Smooth mapping: f(x) = log(1 + x) dampening leverage d/dx log(x) = 1/x -> 0; (5) Robust loss: switching to Huber or Pseudo-Huber loss L_delta(r) instead of OLS L2 squared error.",
      whyItMatters: "Treating outliers incorrectly either pollutes models with catastrophic noise (if ignored in linear models) or throws away valuable rare-event predictive signal (if blindly removed in fraud/anomaly tasks).",
      whenToKeep: "When outliers represent genuine business events (high-net-worth investors, extreme weather events, rare diseases) or when using tree-based ensembles (XGBoost, Random Forest).",
      whenToTreat: "When using Ordinary Least Squares, Neural Networks, PCA, or K-Means clustering where extreme values exert high leverage.",
      mlImpact: "Stabilizes gradient descent steps, prevents exploding gradients, prevents regression line tilt, and maintains generalizability on unseen test data.",
      interviewTip: "The golden interview answer: '1. Detect (IQR / Mod-Z). 2. Diagnose root cause (glitch vs real event). 3. Treat (Winsorize/Flag for real events, Remove for verified errors). 4. Audit sample loss (never drop >3-5%).'"
    },
    outlier_removal: {
      category: "Treatment Strategy",
      title: "How to Remove Outliers (Trimming / Row Deletion)",
      beginner: "Outlier removal (trimming) means permanently deleting rows that fall outside the upper or lower fence. You should ONLY remove an outlier if it is an impossible measurement (like human age = 350 or negative price) or a verified hardware sensor glitch.",
      intermediate: "Trimming drops observations where x_i < L or x_i > U. The Danger Zone: sample truncation bias. If you drop more than 2% to 5% of your dataset, you risk throwing away critical natural variation and artificially underestimating real-world variance.",
      technical: "Truncated sample distribution: if x is truncated outside [L, U], the conditional probability density becomes f(x | L <= x <= U) = f(x) / (F(U) - F(L)). If the target variable y correlates with the truncated tail, standard OLS coefficient estimates suffer attenuation bias toward zero.",
      whyItMatters: "Eliminates poisoned data points that would corrupt models, but risks severe data loss and survivor bias if applied indiscriminately.",
      whenToKeep: "Never delete rows if the unusual values represent real customers, rare fraud attempts, or when your total dataset size is small.",
      whenToTreat: "Only safe to remove when: (1) Verified impossible value or hardware error, (2) Total dropped rows is < 3% of the dataset, (3) It does not deplete rare target classes in classification.",
      mlImpact: "Eliminates high-leverage Cook's distance points, but reduces effective sample size N and shrinks statistical degrees of freedom.",
      interviewTip: "Never say 'I drop outliers' in an interview. Explain that deletion is a last resort restricted to verified errors, and cite the 4-step safety audit checklist.",
      safetyChecklist: [
        "1. Root Cause Check: Is it an impossible physical value or typing error?",
        "2. Volume Audit: Are you dropping less than 3% - 5% of the total dataset?",
        "3. Target Balance Check: Does removing these rows inadvertently discard positive classes (e.g., fraud)?",
        "4. Audit Trail: Is the deletion fully documented with reproducibility in the pipeline?"
      ]
    },
    winsorization: {
      category: "Treatment Strategy",
      title: "Winsorization (Capping / Clamping)",
      beginner: "Winsorization is like putting a ceiling and a floor on your numbers. Instead of deleting someone whose income is $1,000,000, you cap their income at the upper fence (e.g. $200,000). You keep the person and all their other information in your dataset!",
      intermediate: "Named after biostatistician Charles P. Winsor. It replaces values below the lower cutoff with the lower cutoff, and values above the upper cutoff with the upper cutoff. This eliminates outlier leverage while keeping sample size N 100% intact.",
      technical: "Transformation Y = min(max(X, L), U). It shifts the tail probability mass into discrete spikes at L and U. It is the standard industrial remedy for linear regression features exhibiting fat tails.",
      whyItMatters: "Preserves rows and avoids sample power loss while strictly bounding maximum feature values.",
      whenToKeep: "When values are already within calculated bounds.",
      whenToTreat: "When you want to retain every row in your dataset for downstream training without allowing extreme tail values to skew linear regression slopes.",
      mlImpact: "Protects Linear Regression, Ridge, Lasso, and Neural Networks from extreme variance without sacrificing row counts.",
      interviewTip: "Contrast Trimming (removes rows, changes N) with Winsorization (modifies values, preserves N)."
    },
    flagging: {
      category: "Treatment Strategy",
      title: "Anomaly Indicator Flagging",
      beginner: "Flagging creates a new column with 1s and 0s: a 1 means 'this row had an unusual value', and a 0 means 'this row was normal'. The original numbers stay untouched!",
      intermediate: "Feature engineering strategy: adds an is_outlier binary feature while preserving original continuous values. Allows tree models to learn non-linear splits specifically triggered by the presence of an extreme value.",
      technical: "Augments feature space x -> [x, I(x not in [L, U])]. Provides orthogonal information to the estimator without loss of tail information or continuous differentiability.",
      whyItMatters: "In fraud detection, cybersecurity, and failure prediction, the fact that an outlier occurred is often the strongest predictive signal!",
      whenToKeep: "When the anomaly itself is what you want the machine learning model to learn from.",
      whenToTreat: "Use flagging whenever building fraud, cybersecurity, or rare-event prediction pipelines.",
      mlImpact: "Empowers Decision Trees, Random Forests, and Gradient Boosting models to isolate rare regimes with high precision.",
      interviewTip: "In fraud or churn modeling, suggest creating an anomaly flag feature rather than modifying or deleting the outlier."
    },
    outlier: {
      category: "Detection Concept",
      title: "What is an Outlier?",
      beginner: "An outlier is a data point that is unusually far away from the rest of the numbers in the group. For example, if most people in a neighborhood earn between $40k and $80k, but one billionaire lives there earning $50M, that $50M value is an outlier.",
      intermediate: "Observations that fall into the extreme tails of a distribution. Outliers exert high leverage in linear regressions, inflate variance and standard deviation, and can distort centroid calculations in distance-based clustering.",
      technical: "Formally defined as observations x_i where the standardized residual or deviation |x_i - mu| / sigma > theta, or x_i not in [Q1 - 1.5*IQR, Q3 + 1.5*IQR]. Outliers may be genuine observations from heavy-tailed distributions or corrupted noise artifacts.",
      whyItMatters: "Squared-loss models like Linear Regression and Neural Networks try to minimize squared errors, meaning extreme outliers pull the model's predictions disproportionately toward themselves.",
      whenToKeep: "When outliers represent genuine rare events (e.g., fraudulent credit card transactions, rare medical conditions) that the model needs to identify.",
      whenToTreat: "When outliers are physically impossible measurements, typological data entry mistakes, or sensor glitches.",
      mlImpact: "Tree-based models (Random Forest, XGBoost) split on rank thresholds and are robust to monotonic outliers. Linear models and Neural Networks are vulnerable.",
      interviewTip: "Never answer 'I delete outliers.' Always explain that you first diagnose the cause: data error (fix/delete), rare event (keep, use tree models), or heavy distribution (Winsorize/transform)."
    },
    iqr: {
      category: "Detection Concept",
      title: "Interquartile Range (IQR) Method",
      beginner: "Tukey's IQR method divides your data into 4 quarters. The middle 50% of your data lives between Q1 and Q3. The method sets up a fence 1.5 times the box width outside that middle box. Anything outside the fence is an outlier.",
      intermediate: "A non-parametric method defined as IQR = Q3 - Q1. Lower fence: Q1 - 1.5 * IQR, Upper fence: Q3 + 1.5 * IQR. Because it relies on percentiles (order statistics), it is not pulled by extreme values and works well on skewed data.",
      technical: "Possesses a 25% breakdown point. For a normal distribution N(mu, sigma^2), the interval [Q1 - 1.5*IQR, Q3 + 1.5*IQR] encompasses approximately mu +/- 2.698*sigma, flagging ~0.7% of points in standard Gaussian data.",
      whyItMatters: "Standard Z-scores fail when data is skewed because the mean gets dragged away. IQR uses the median and quartiles, making it reliable for real-world messy data.",
      whenToKeep: "When data is skewed and non-normal.",
      whenToTreat: "When defining clean trimming boundaries or capping limits for Winsorization.",
      mlImpact: "Provides robust scaling anchors (e.g. RobustScaler) that center features without distortion.",
      interviewTip: "Remember that 1.5 is a standard heuristic for mild outliers, while 3.0 * IQR is used for extreme outliers."
    },
    zscore: {
      category: "Detection Concept",
      title: "Standard Z-Score Method",
      beginner: "The Z-Score measures how many standard steps (standard deviations) a number is away from the average. If a number is more than 3 steps away, it is flagged as an outlier.",
      intermediate: "Calculated as Z = (x - mu) / sigma. Under the 68-95-99.7 empirical rule for normal distributions, 99.7% of points lie within +/- 3*sigma. Observations with |Z| > 3 are rare anomalies under normality.",
      technical: "Assumes X ~ N(mu, sigma^2). Vulnerable to the masking effect: severe outliers inflate both mu and sigma, which decreases the computed Z-scores of other outliers.",
      whyItMatters: "Fast O(N) computation with well-understood Gaussian confidence limits.",
      whenToKeep: "When the underlying feature is proven to be symmetric and bell-shaped.",
      whenToTreat: "Avoid using on heavily skewed or multi-modal features.",
      mlImpact: "Matches the normalization applied by StandardScaler.",
      interviewTip: "Mention Chebyshev's Inequality when discussing Z-scores on non-normal distributions (at least 1 - 1/k^2 of data lies within k*sigma for any distribution)."
    },
    modified_zscore: {
      category: "Detection Concept",
      title: "Modified Z-Score (Iglewicz & Hoaglin)",
      beginner: "Modified Z-Score is an improved Z-score that replaces the easily fooled average with the median, and replaces standard deviation with MAD (the median distance from the center).",
      intermediate: "Calculated as ModZ = 0.6745 * (x - median) / MAD. It resists extreme outlier masking and uses 3.5 as the standard threshold.",
      technical: "Has a maximal 50% breakdown point. The factor 0.6745 is the consistency factor derived from the inverse standard normal CDF at the 75th percentile (1 / 1.4826).",
      whyItMatters: "Provides the convenience of standard score filtering without being corrupted by multiple severe outliers.",
      whenToKeep: "Ideal when heavy tails exist but score-based ranking is preferred over raw quartile cuts.",
      whenToTreat: "Requires special fallback when MAD is 0 (discrete or highly repeated data).",
      mlImpact: "Provides reliable sample filtering before fitting linear models.",
      interviewTip: "Demonstrating knowledge of MAD and Modified Z-Score signals advanced statistical competence beyond introductory tutorials."
    }
  };

  const data = conceptData[activeConcept] || conceptData.handling_outliers;

  // Grouped concepts for easy navigation
  const treatmentConcepts = [
    { id: 'handling_outliers', label: 'Handling Outliers (5 Options)' },
    { id: 'outlier_removal', label: 'How to Remove Outliers' },
    { id: 'winsorization', label: 'Winsorization / Capping' },
    { id: 'flagging', label: 'Anomaly Flagging' }
  ];

  const detectionConcepts = [
    { id: 'outlier', label: 'What is an Outlier?' },
    { id: 'iqr', label: 'Tukey IQR Method' },
    { id: 'zscore', label: 'Z-Score Method' },
    { id: 'modified_zscore', label: 'Modified Z-Score' }
  ];

  return (
    <div className="rounded-xl p-5 bg-gradient-to-r from-slate-900 via-brand-950/20 to-slate-900 border border-brand-500/30 shadow-lg space-y-4">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{data.title}</h3>
              {column && <Badge variant="brand">{column}</Badge>}
              <Badge variant="purple">{data.category}</Badge>
            </div>
            <p className="text-[11px] text-slate-400">Pedagogical Concept & Strategic Decision Guide</p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-200">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          {/* Quick Concept Navigation Pills */}
          <div className="space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                🎯 Handling & Removal Concepts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {treatmentConcepts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConcept(c.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      activeConcept === c.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                🔍 Detection Concepts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {detectionConcepts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveConcept(c.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      activeConcept === c.id
                        ? 'bg-brand-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Crucial Warning Box */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">Core Product Rule: </span>
              An outlier is NOT automatically an error. Always verify whether unusual observations are legitimate rare events or genuine corruptions before deleting or modifying them.
            </div>
          </div>

          {/* 4-Step Safety Checklist for Outlier Removal */}
          {activeConcept === 'outlier_removal' && data.safetyChecklist && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 animate-fadeIn">
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Mandatory 4-Step Safety Audit Before Deleting Rows
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {data.safetyChecklist.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/70 border border-rose-500/20 text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Tier Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Explanation Tier:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['beginner', 'intermediate', 'technical'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setLearningTier(tier)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-all ${
                    learningTier === tier
                      ? 'bg-brand-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Tier Content */}
          <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            {data[learningTier]}
          </div>

          {/* Guidance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-brand-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> When Should I Keep Outliers?
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {data.whenToKeep}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-purple-400">
                <Cpu className="w-3.5 h-3.5" /> Machine Learning Impact
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {data.mlImpact}
              </p>
            </div>
          </div>

          {/* Interview Tip */}
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-200">Data Science Interview Tip: </span>
              {data.interviewTip}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlierLearningCard;
