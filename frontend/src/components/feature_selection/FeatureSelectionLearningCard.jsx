import React, { useState } from 'react';
import { 
  GraduationCap, 
  ChevronUp, 
  ChevronDown, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  Lightbulb,
  Filter,
  Layers,
  Sparkles,
  BarChart2
} from 'lucide-react';
import Badge from '../common/Badge';

export const FeatureSelectionLearningCard = ({ activeScorer = "f_classif" }) => {
  const [learningTier, setLearningTier] = useState('beginner'); // beginner | intermediate | technical
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState('feature_selection');

  const conceptData = {
    feature_selection: {
      category: "Fundamental Strategy",
      title: "Feature Selection: Filter, Wrapper & Embedded",
      badge: "Overview",
      beginner: "Imagine packing a backpack for a mountain hike. If you pack every single item in your house, your backpack will be too heavy and you will collapse from exhaustion. You must choose only the essentials — water, map, boots — and leave the frying pan and sofa behind. In machine learning, feeding 100 features into a model often hurts performance because many features are useless noise or duplicates. Feature selection picks only the most predictive original columns so your model is fast, accurate, and easy to explain.",
      intermediate: "Feature selection differs fundamentally from Dimensionality Reduction (PCA): PCA creates new synthetic linear combinations of features, losing raw interpretability. Feature selection preserves original features, maintaining direct business and domain interpretability. There are 3 primary taxonomy families: (1) Filter Methods (SelectKBest, ANOVA, Mutual Info) - fast and model-agnostic; (2) Wrapper Methods (RFE, Stepwise) - model-guided and computationally heavy; (3) Embedded Methods (Lasso L1 penalty, Tree feature importance) - optimized during model fitting.",
      technical: "Given design matrix X in R^{N x p} and target y in R^N, feature selection seeks a subset S subset of {1, ..., p} with |S| = k << p minimizing empirical prediction risk min_w E[L(f(X_S; w), y)]. Filter methods score features via marginal statistics S(X_j, y). Embedded L1 regularization solves min_w (1/2N)||y - Xw||_2^2 + lambda ||w||_1, exploiting the non-differentiable L1 diamond geometry at the coordinate axes to produce exact sparsity (w_j = 0 for irrelevant features).",
      whyItMatters: "Eliminating irrelevant, redundant, and noisy features prevents overfitting, reduces computational training time, simplifies model interpretability for regulatory compliance, and improves generalizability on test data.",
      whenToUse: "When datasets have many features (p > 15), when raw feature interpretability is required, or when noise columns cause overfitting.",
      whenNotToUse: "When you have very few features (p < 5) that are all known domain essentials.",
      mlImpact: "Significantly reduces model variance (preventing overfitting) and speeds up inference latency.",
      interviewTip: "Always explain the 3 families: Filter (fast, model-agnostic), Wrapper (accurate, slow, model-dependent), and Embedded (Lasso/Trees, optimized during training)."
    },
    select_k_best: {
      category: "Filter Algorithm",
      title: "SelectKBest Univariate Selection",
      badge: "Top K Features",
      beginner: "SelectKBest is like a talent audition for your dataset's columns. You decide in advance how many winners you want (K). Each column steps up and is given an audition score measuring how well it predicts the target. SelectKBest ranks the audition scores from highest to lowest and keeps only the top K winners.",
      intermediate: "SelectKBest computes a statistical test score S(X_j, y) for each feature j independently (univariate testing). Features are sorted in descending order of score, and the top K features are retained. Because each feature is evaluated independently, SelectKBest cannot detect multivariate interaction effects (two features that are uninformative alone but powerful together), but it runs in O(p) time and scales to massive datasets.",
      technical: "Given candidate feature matrix X in R^{N x p}, SelectKBest applies a user-selected scoring function: s_j = g(X_{*, j}, y). Let π be the permutation of indices sorting s descendingly: s_{π(1)} >= s_{π(2)} >= ... >= s_{π(p)}. The selected subset is S = {π(1), ..., π(K)}. The output design matrix is X_S in R^{N x K}.",
      whyItMatters: "Provides an ultra-fast, robust baseline for feature reduction before feeding data into complex downstream estimators.",
      whenToUse: "When you want a fast, model-agnostic feature filter to eliminate low-signal features before modeling.",
      whenNotToUse: "When features exhibit complex non-linear XOR interactions that require multivariate tree selection or RFE.",
      mlImpact: "Prevents model overfitting and simplifies linear and logistic decision boundaries.",
      interviewTip: "Highlight that SelectKBest is univariate (evaluates features one by one), meaning it is fast (O(p)) but blind to multi-feature synergies."
    },
    f_score: {
      category: "Parametric Scoring",
      title: "ANOVA F-Test (f_classif / f_regression)",
      badge: "Linear Association",
      beginner: "The F-Score asks a simple question: 'Are the target groups noticeably separated by this feature?' For example, if you measure customer income across Churned vs Retained customers: If the average income of churned customers ($30k) is far away from retained customers ($90k), and everyone inside each group is tightly clustered, the F-score is huge! If the group averages overlap completely, the F-score is close to zero.",
      intermediate: "In classification (f_classif), the one-way ANOVA F-statistic tests whether the means of several groups are equal: F = MS_Between / MS_Within. In regression (f_regression), it computes the correlation coefficient r and converts it into an F-statistic: F = (r^2 / (1 - r^2)) * (N - 2). High F-scores indicate strong linear dependency with low p-values.",
      technical: "Under the null hypothesis H0: μ_1 = μ_2 = ... = μ_C, assuming Gaussian errors with homoscedastic variance σ^2: F = [Σ N_c (x̄_c - x̄)^2 / (C - 1)] / [Σ Σ (x_ci - x̄_c)^2 / (N - C)] ~ F(C - 1, N - C). A small p-value (p < 0.05) rejects H0, confirming statistically significant between-group divergence.",
      whyItMatters: "Provides an exact statistical significance test with formal p-values, identifying linear drivers of the target.",
      whenToUse: "When features are continuous, normally distributed, and expected to have linear or monotonic relationships with the target.",
      whenNotToUse: "When relationships are non-linear (e.g. U-shaped or sinusoidal curves) where F-score can be 0 despite strong dependency.",
      mlImpact: "Fastest linear feature filter; ideal for Linear/Logistic Regression and Linear SVMs.",
      interviewTip: "F-Score is parametric and assumes linear relationships. For non-linear curves (like quadratic or periodic patterns), ANOVA F-test fails and Mutual Information is required."
    },
    mutual_information: {
      category: "Information Theory",
      title: "Mutual Information (Information Gain)",
      badge: "Non-Linear Patterns",
      beginner: "Mutual Information measures: 'How much does knowing feature X reduce our uncertainty about target Y?' Unlike simple correlation, Mutual Information can catch ANY kind of pattern — zig-zags, curves, circles, or waves! If knowing X tells you nothing about Y, Mutual Information is 0. If knowing X completely reveals Y, Mutual Information is very high.",
      intermediate: "Based on Shannon entropy H(X), Mutual Information is defined as: I(X; Y) = H(Y) - H(Y | X) = Σ Σ P(x, y) log [P(x, y) / (P(x)P(y))]. Because it evaluates the Kullback-Leibler divergence between the joint distribution P(X, Y) and the product of marginals P(X)P(Y), it equals zero if and only if X and Y are strictly statistically independent. It captures non-linear relationships effortlessly.",
      technical: "For continuous random variables, I(X; Y) = ∬ p(x, y) log [p(x, y) / (p(x)p(y))] dx dy. Scikit-learn implements the Kraskov-Stögbauer-Grassberger (KSG) non-parametric k-nearest neighbors entropy estimator, approximating continuous mutual information without requiring manual histogram binning. Mutual information is non-negative (I >= 0), symmetric (I(X; Y) = I(Y; X)), and invariant under smooth invertible coordinate transformations.",
      whyItMatters: "Captures complex, non-linear dependencies (quadratic, exponential, sinusoidal) that linear correlation metrics (Pearson, ANOVA) completely miss.",
      whenToUse: "When relationships between features and target are suspected to be non-linear, multi-modal, or complex.",
      whenNotToUse: "On massive datasets with strict millisecond latency constraints, as KNN entropy estimation (O(N log N)) is slower than O(N) ANOVA.",
      mlImpact: "Ideal feature filter before fitting non-linear models like Random Forests, Gradient Boosted Trees (XGBoost), and Neural Networks.",
      interviewTip: "Key distinction: Pearson and ANOVA F-score measure only linear relationships. Mutual Information measures ANY functional dependence (linear or non-linear) using Shannon entropy."
    }
  };

  const data = conceptData[selectedConcept] || conceptData.feature_selection;

  const conceptList = [
    { id: 'feature_selection', label: 'Feature Selection Philosophy' },
    { id: 'select_k_best', label: 'SelectKBest Method' },
    { id: 'f_score', label: 'ANOVA F-Test (Linear)' },
    { id: 'mutual_information', label: 'Mutual Information (Non-Linear)' }
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
              <Badge variant="purple">{data.category}</Badge>
              <Badge variant="brand">{data.badge}</Badge>
            </div>
            <p className="text-[11px] text-slate-400">Step 09 Mathematical Foundations & Ranking Heuristics</p>
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
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Explore Concepts:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {conceptList.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConcept(c.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      selectedConcept === c.id
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

          {/* Target Leakage Warning */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">Data Leakage Alert: </span>
              In production pipelines, feature selection MUST be fitted strictly on the training partition (or within cross-validation folds). Never calculate target correlation across the entire dataset before splitting, or test label signals will leak into feature rankings!
            </div>
          </div>

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
                <CheckCircle2 className="w-3.5 h-3.5" /> When Should I Use This?
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {data.whenToUse}
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

export default FeatureSelectionLearningCard;
