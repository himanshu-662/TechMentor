import React, { useState } from 'react';
import { 
  PlayCircle, 
  GraduationCap, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Cpu, 
  Lightbulb, 
  Sparkles, 
  GitBranch, 
  Sliders, 
  Scale, 
  Target 
} from 'lucide-react';
import Badge from '../common/Badge';

export const ModelFittingLearningCard = ({ taskType = "classification", selectedModel = "linear" }) => {
  const [learningTier, setLearningTier] = useState('beginner'); // beginner | intermediate | technical
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState('model_fitting');

  const conceptData = {
    model_fitting: {
      category: "Optimization Engine",
      title: "Model Fitting: Loss Minimization",
      badge: "Core Learning",
      beginner: "Imagine learning how to shoot basketball free throws. On your first attempt, you shoot too far to the left. You notice your error, adjust your elbow angle and release force, and shoot again. After 100 practice shots, your muscle memory has found the exact optimal angle that consistently makes the basket. In machine learning, Model Fitting is that exact practice session: the algorithm makes a prediction, measures how wrong it was using a mathematical scoreboard (loss function), and updates its internal knobs (weights) until errors are as small as possible.",
      intermediate: "Model fitting is formal empirical risk minimization over isolated training data (X_train, y_train). Different algorithm families embody distinct inductive biases: (1) Linear/Logistic Regression assumes target depends linearly on features; solves convex loss via closed-form OLS or gradient descent; (2) Decision Trees perform non-parametric recursive binary splitting using greedy impurity minimization (Gini, Entropy, or MSE reduction); (3) Random Forests train an ensemble of B decorrelated randomized decision trees on bootstrap samples to dramatically suppress variance without increasing bias.",
      technical: "Given hypothesis space F with parameter vector θ in Θ, empirical risk minimization solves: θ̂ = argmin_θ (1/N_train) Σ_{i=1}^{N_train} L(f(x_i; θ), y_i) + Ω(θ), where L is a convex surrogate loss (e.g. Squared Loss (1/2)(y - ŷ)^2 for regression, Cross-Entropy -Σ y_k log(p̂_k) for classification), and Ω(θ) represents regularization penalty (L1 Lasso or L2 Ridge). Optimization utilizes analytic normals, coordinate descent, L-BFGS, or gradient descent.",
      whyItMatters: "Fitting is the core computational engine where raw mathematical representations transform into predictive intelligence. Choosing the right architecture, loss function, and regularization hyperparameters directly controls model capacity and prevents severe overfitting.",
      whenToUse: "Always during Step 11 after completing strict Train/Test partitioning in Step 10.",
      whenNotToUse: "Do not fit models on un-split datasets or datasets with raw unencoded text and categorical columns.",
      mlImpact: "Directly determines parameter values, convergence speed, memory footprint, and inductive representation capacity.",
      interviewTip: "How does Random Forest reduce overfitting compared to a single Decision Tree? Each tree in the forest is trained on a bootstrap sample (bagging) and selects from a random subset of features at each split (max_features). This decorrelates the trees, so when their predictions are averaged, variance drops substantially while bias remains nearly unchanged."
    },
    hyperparameters: {
      category: "Architectural Tuning",
      title: "Hyperparameters vs Model Parameters",
      badge: "Control Knobs",
      beginner: "Imagine baking bread. The ingredients that transform into bread (flour, yeast, water) are like Model Parameters: they undergo a chemical change during the process. The oven temperature and timer you set before baking are Hyperparameters: you decide them beforehand to control the baking environment. If your temperature is set too low, the dough stays raw (underfitting). If set too high, the crust burns black (overfitting).",
      intermediate: "Parameters (like regression weights w_j or tree split thresholds) are learned automatically from training data via loss minimization. Hyperparameters (like tree max_depth, n_estimators, learning rate, or regularization penalty C) cannot be learned via direct training loss minimization, because setting max_depth = infinity or regularization = 0 will always minimize training loss while destroying out-of-sample generalization.",
      technical: "Let empirical risk minimizer be θ*(λ) = argmin_θ R_train(θ; λ). Hyperparameter optimization constitutes a bi-level optimization problem: λ* = argmin_{λ in Λ} R_val(θ*(λ)), where validation loss R_val evaluates generalization over held-out folds.",
      whyItMatters: "Hyperparameter choice governs model capacity and regularization. Incorrect settings lead directly to catastrophic overfitting or severe underfitting.",
      whenToUse: "During algorithm configuration in Step 11 to tune complexity constraints.",
      whenNotToUse: "Do not tune hyperparameters on the testing dataset (causes subtle data leakage).",
      mlImpact: "Regulates the hypothesis search space, controlling the bias-variance tradeoff.",
      interviewTip: "How do you explain the difference between a parameter and a hyperparameter? Parameters are learned by the algorithm from data during model.fit() (e.g. weights w, bias b). Hyperparameters are architectural constraints set by the engineer prior to training (e.g. n_estimators, max_depth, learning rate)."
    },
    bias_variance_tradeoff: {
      category: "Generalization Theory",
      title: "The Bias-Variance Tradeoff",
      badge: "Inductive Bias",
      beginner: "Imagine an archer shooting arrows at a target: (1) High Bias (Underfitting): The archer is wearing a blindfold. Every arrow hits the wrong spot in the exact same corner. The shots are consistent, but systematically wrong; (2) High Variance (Overfitting): The archer has no blindfold, but their hand shakes uncontrollably. One arrow hits top-left, another hits bottom-right. The average might be near the bullseye, but individual shots scatter wildly; (3) Sweet Spot: A steady archer whose arrows cluster tightly inside the bullseye.",
      intermediate: "Total expected test error decomposes mathematically into three distinct components: Expected Error = Bias^2 + Variance + Irreducible Noise. As model complexity increases, Bias decreases (the model can represent intricate non-linear decision boundaries) while Variance increases (the model becomes overly sensitive to small random fluctuations in the training sample). The goal of Step 11 model fitting is to identify the optimal complexity sweet spot that minimizes total generalization error.",
      technical: "For true function Y = f(X) + ε with E[ε] = 0 and Var(ε) = σ^2, the expected mean squared error of estimator f̂(X) at point x_0 decomposes as: E[(Y - f̂(x_0))^2] = (E[f̂(x_0)] - f(x_0))^2 (Bias^2) + E[(f̂(x_0) - E[f̂(x_0)])^2] (Variance) + σ^2 (Irreducible Noise). Ridge/Lasso shrink weights to inject minor bias in exchange for massive variance reduction.",
      whyItMatters: "Every architectural choice (linear vs tree vs ensemble) and hyperparameter setting directly navigates this fundamental dilemma. Understanding it prevents building fragile models that memorize training noise.",
      whenToUse: "When diagnosing training convergence and tuning complexity constraints in Step 11.",
      whenNotToUse: "N/A; applies ubiquitously to all supervised learning.",
      mlImpact: "Governs generalization across all predictive machine learning paradigms.",
      interviewTip: "How do you mathematically write the bias-variance decomposition? MSE = Bias^2 + Variance + σ^2. Mention that irreducible noise σ^2 is the absolute lower bound on error caused by unmeasured variables or measurement noise."
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
                Educational Engine: Model Fitting & Inductive Bias
              </h3>
              <Badge variant="purple">{curr.badge}</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive pedagogical guidance on optimization, hyperparameter control, and bias-variance tradeoff
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
              { id: 'model_fitting', label: 'Loss Minimization (Fit)', icon: Cpu },
              { id: 'hyperparameters', label: 'Hyperparameters vs Parameters', icon: Sliders },
              { id: 'bias_variance_tradeoff', label: 'Bias-Variance Tradeoff', icon: Scale },
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

          {/* Model Family Inductive Bias Note */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                Active Architecture Bias: {selectedModel.toUpperCase()}
              </h4>
              <p className="text-xs text-purple-300/80 leading-relaxed">
                {selectedModel === 'linear' && 'Linear models assume monotonic additive relationships. Fast, convex optimization, zero risk of runaway variance on small feature counts.'}
                {selectedModel === 'tree' && 'Decision Trees form orthogonal step functions. Non-linear, highly interpretable, but prone to high variance unless pruned with max_depth.'}
                {selectedModel === 'forest' && 'Random Forest combines bagging with random subspace selection, reducing single-tree variance exponentially as n_estimators scales.'}
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

export default ModelFittingLearningCard;
