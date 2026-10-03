import React, { useState } from 'react';
import { 
  Scissors, 
  GraduationCap, 
  ChevronUp, 
  ChevronDown, 
  ShieldAlert, 
  CheckCircle2, 
  ShieldCheck, 
  Lightbulb,
  Layers,
  Sparkles,
  GitFork,
  PieChart
} from 'lucide-react';
import Badge from '../common/Badge';

export const TrainTestSplitLearningCard = ({ targetType = "classification" }) => {
  const [learningTier, setLearningTier] = useState('beginner'); // beginner | intermediate | technical
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState('train_test_split');

  const conceptData = {
    train_test_split: {
      category: "Fundamental Integrity",
      title: "Train-Test Split & Generalization",
      badge: "Golden Rule",
      beginner: "Imagine preparing for a final exam. If your teacher gives you the exact questions and answers the night before, you might score 100% simply by memorizing them. But that does not mean you actually learned the subject! In machine learning, the Training Set is your textbook and homework (what the model learns from), and the Testing Set is the final exam locked in a vault until the model has finished studying.",
      intermediate: "A standard machine learning workflow partitions data into two or three strictly isolated partitions: (1) Training Set (typically 70-80%) to estimate model parameters; (2) Testing Set (typically 20-30%) locked away solely for final unbiased performance estimation; (3) Validation Set (or Cross-Validation) for hyperparameter tuning. The cardinal sin of data science is Data Leakage — introducing information about the test partition during training or preprocessing.",
      technical: "Given empirical sample D = {(x_i, y_i)}_{i=1}^N ~ P(X, Y), we partition D into disjoint index sets I_train ∩ I_test = ∅ with |I_train| = N_train and |I_test| = N_test. The empirical risk minimizer f̂ = argmin_{f} (1/N_train) Σ_{i ∈ I_train} L(f(x_i), y_i) is evaluated via out-of-sample risk R_test(f̂) = (1/N_test) Σ_{j ∈ I_test} L(f̂(x_j), y_j). Under i.i.d. sampling assumptions, E[R_test] = R_true(f̂), providing an unbiased estimator of true generalization error.",
      whyItMatters: "Without an isolated test split, evaluation metrics only report training memorization (optimism bias). Models that look flawless on training data frequently collapse when deployed to real-world production users.",
      whenToUse: "Always! Every supervised machine learning task requires rigorous train/test partitioning prior to model fitting.",
      whenNotToUse: "Unsupervised clustering or exploratory profiling where no predictive target or inference generalization is evaluated.",
      mlImpact: "Guarantees unbiased generalization error estimation; completely eliminates evaluation optimism.",
      interviewTip: "How do you detect and prevent data leakage? Fit all transformers (scalers, encoders, imputers, selectors) strictly on X_train (`fit_transform`), and only call `transform()` on X_test. Use Scikit-Learn Pipeline objects to enforce this automatically."
    },
    stratified_sampling: {
      category: "Sampling Strategy",
      title: "Stratified Sampling (Preserving Class Balance)",
      badge: "Imbalance Protection",
      beginner: "Imagine a bag of 100 marbles: 90 are blue and 10 are gold. If you randomly grab 20 marbles with your eyes closed, you might accidentally grab 0 gold marbles! Your sample would completely miss the rare gold marbles. Stratified sampling acts like an observant organizer: it intentionally picks 18 blue and 2 gold marbles, so the 90/10 ratio is perfectly preserved in your sample.",
      intermediate: "In imbalanced classification problems (e.g. credit card fraud with 99.5% legitimate transactions and 0.5% fraud), naive random splitting can easily place all fraud cases into the training set and zero cases into the test set. Stratified train-test split (`stratify=y`) divides the dataset within each class stratum independently, guaranteeing identical class distributions across y_train and y_test.",
      technical: "Let target Y in {1, ..., C} with prior class proportions p_c = P(Y = c). Stratified sampling enforces the condition: N_train^{(c)} / N_train ≈ N_test^{(c)} / N_test ≈ p_c for all classes c, minimizing the sampling variance of empirical class error rates across folds.",
      whyItMatters: "Without stratification, test sets may contain too few minority class samples, rendering precision, recall, and ROC-AUC calculations statistically unreliable or completely undefined.",
      whenToUse: "Always for classification tasks, especially whenever class imbalance is present (<20% minority class).",
      whenNotToUse: "Continuous regression targets (where y is real-valued continuous numbers) or time-series forecasting (where chronological order must be preserved).",
      mlImpact: "Stabilizes cross-validation and test set evaluation variance for imbalanced datasets.",
      interviewTip: "When should you NOT use stratified random sampling? (1) Time series problems (use TimeSeriesSplit to avoid lookahead bias), (2) Grouped data like multiple scans per patient (use GroupKFold so patient scans stay in the same fold), and (3) Continuous regression targets."
    },
    data_leakage: {
      category: "Critical Trap",
      title: "Data Leakage: The Silent ML Killer",
      badge: "Zero Tolerance",
      beginner: "Imagine a chef competing in a mystery ingredient cooking competition. If an assistant secretly whispers what the secret ingredient is an hour before the competition starts, the chef can pre-plan the perfect recipe and look like a genius. In machine learning, Data Leakage occurs when future or test information 'leaks' into training. The model seems to perform with genius-level accuracy during development, but fails catastrophically when served to real users.",
      intermediate: "Data leakage typically occurs in two primary forms: (1) Target Leakage: Features contain information that would only be known after the target event occurs (e.g. including 'Account Cancellation Date' as a feature to predict 'Customer Churn'); (2) Train-Test Contamination: Preprocessing transformations (imputers, scalers, target encoders, PCA, feature selection) are computed over the combined dataset before splitting.",
      technical: "Let P(Y | X) be the true data-generating conditional distribution. Leakage induces a surrogate distribution P̃(Y | X, L) where conditioning on leakage variable L yields artificially high mutual information I(X; Y | L) >> I(X; Y). Because L is absent at production inference time t_prod, the deploy risk is governed by E_P[L(f(X), Y)] >> E_{P̃}[L(f(X, L), Y)], manifesting as severe post-deployment model collapse.",
      whyItMatters: "Data leakage is the #1 reason why machine learning models with 99% accuracy in research notebooks fail in production. It gives false confidence to leadership and engineers, leading to expensive and potentially dangerous real-world failures.",
      whenToUse: "Auditing every feature and preprocessing step throughout all 13 stages of the machine learning pipeline.",
      whenNotToUse: "Never acceptable in predictive modeling.",
      mlImpact: "Creates severely inflated validation scores that completely collapse in production environments.",
      interviewTip: "How do you identify target leakage in an enterprise project? Look for any feature with near-perfect correlation (e.g. >0.95) with the target, or a model that achieves unrealistically high accuracy (e.g. 99.9%) on the first iteration."
    },
    cross_validation: {
      category: "Resampling Evaluation",
      title: "Cross-Validation (K-Fold & Stratified)",
      badge: "Robust Evaluation",
      beginner: "Imagine auditioning singers for a musical. If you only listen to each singer perform once for 30 seconds, someone who had a great performance might just have gotten lucky, and someone who had a small voice crack might be an amazing singer who had a dry throat. To be fair, you have each singer perform 5 different songs on 5 different days. Cross-validation is like having 5 auditions: it tests the model multiple times on different slices of data to ensure consistent talent.",
      intermediate: "In K-Fold Cross-Validation, the training set is partitioned into K equal-sized folds. The model is trained on K-1 folds and validated on the remaining fold. This procedure repeats K times so that every single observation is used for validation exactly once. The K performance estimates are averaged to yield an overall metric along with standard deviation (error bars), providing a far more reliable indicator of model variance and stability than a single split.",
      technical: "Let partition D = ∪_{k=1}^K D_k with D_i ∩ D_j = ∅. For each fold k, model f̂^{(-k)} is trained on D \\ D_k. The cross-validation estimate is CV_{(K)} = (1/N) Σ_{k=1}^K Σ_{i ∈ D_k} L(f̂^{(-k)}(x_i), y_i). The variance of the CV estimator decomposes into the variance of individual fold estimates plus their pairwise covariance.",
      whyItMatters: "A single train/test split can be lucky or unlucky depending on random chance. K-Fold CV tests whether a model is robust and stable, or fragile and dependent on a specific data split.",
      whenToUse: "During model selection and hyperparameter tuning across candidate architectures.",
      whenNotToUse: "Extremely massive deep learning datasets (e.g. millions of images or billions of tokens) where training a model K times is cost-prohibitive (use a dedicated validation split instead).",
      mlImpact: "Dramatically reduces evaluation variance and provides error bars (confidence intervals) for algorithm comparison.",
      interviewTip: "What is the difference between K-Fold CV and Stratified K-Fold CV? K-Fold randomly splits data into K equal chunks regardless of class balance. Stratified K-Fold guarantees that each fold has the exact same target class distribution as the entire dataset."
    }
  };

  const curr = conceptData[selectedConcept];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 py-4 bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Educational Engine: Train-Test Split & Data Leakage
              </h3>
              <Badge variant="purple">{curr.badge}</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive pedagogical guidance on partitioning rigor, stratification, and leakage prevention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Learning Tier Selector */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs"
          >
            {['beginner', 'intermediate', 'technical'].map((tier) => (
              <button
                key={tier}
                onClick={() => setLearningTier(tier)}
                className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                  learningTier === tier
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <button className="text-slate-400 hover:text-slate-200 transition-colors p-1">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-5 animate-fadeIn">
          {/* Concept Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'train_test_split', label: 'Train-Test Partitioning', icon: Scissors },
              { id: 'stratified_sampling', label: 'Stratified Sampling', icon: GitFork },
              { id: 'data_leakage', label: 'Data Leakage Warning', icon: ShieldAlert },
              { id: 'cross_validation', label: 'K-Fold Cross-Validation', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedConcept === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedConcept(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Core Pedagogical Content Box */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                {curr.category} • {learningTier.toUpperCase()} PERSPECTIVE
              </span>
              <span className="text-xs text-slate-500 font-mono">Concept ID: {selectedConcept}</span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {curr[learningTier]}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800/90 space-y-1.5">
                <span className="text-[11px] font-bold text-brand-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" /> When to Apply
                </span>
                <p className="text-xs text-slate-300">{curr.whenToUse}</p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800/90 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5" /> When to Avoid
                </span>
                <p className="text-xs text-slate-300">{curr.whenNotToUse}</p>
              </div>
            </div>
          </div>

          {/* Data Leakage Warning Banner */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                Anti-Leakage Safeguard Active
              </h4>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Remember the golden rule of machine learning: <strong>Never fit scalers, encoders, imputers, or feature selectors on the test partition.</strong> 
                The test dataset must remain locked in vault storage until Step 12 & 13 to provide an untainted evaluation of true generalization ability.
              </p>
            </div>
          </div>

          {/* Interview Tip Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-purple-950/40 border border-purple-500/30 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <span>Industry Technical Interview Tip</span>
                <Badge variant="purple">Staff ML Question</Badge>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {curr.interviewTip}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainTestSplitLearningCard;
