import React, { useState } from 'react';
import { 
  GraduationCap, 
  ChevronUp, 
  ChevronDown, 
  ShieldAlert, 
  CheckCircle2, 
  Cpu, 
  Lightbulb,
  AlertTriangle,
  GitCommit,
  Layers,
  Sparkles
} from 'lucide-react';
import Badge from '../common/Badge';

export const DimensionalityLearningCard = ({ activeMethod = "pca" }) => {
  const [learningTier, setLearningTier] = useState('beginner'); // beginner | intermediate | technical
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState(activeMethod || 'pca');

  React.useEffect(() => {
    if (activeMethod) {
      setSelectedConcept(activeMethod);
    }
  }, [activeMethod]);

  const conceptData = {
    pca: {
      category: "Unsupervised Subspace",
      title: "Principal Component Analysis (PCA)",
      badge: "Maximal Variance",
      beginner: "Imagine taking a 2D photograph of a 3D sculpture. From some angles, the sculpture looks flat and details are lost. From the best angle, you capture the widest spread and greatest depth. PCA mathematically finds that 'best angle' for your data: it creates new hybrid features (called Principal Components) where Component 1 captures the greatest possible variation, Component 2 captures the next greatest variation, and so on.",
      intermediate: "PCA computes the eigenvectors and eigenvalues of the feature covariance matrix Σ = (1/N) * X^T * X. The eigenvectors define the directions of the principal axes (orthogonal hyperplanes), while the eigenvalues λ_k quantify the variance explained along each axis. Because the components are orthogonal, PCA completely eliminates multicollinearity.",
      technical: "Given standardized data matrix X in R^{N x p} with E[X] = 0: The first principal component loading vector w_1 solves max_{||w||_2 = 1} w^T X^T X w. Spectral decomposition yields X^T X = V Λ V^T, where V is the orthonormal matrix of eigenvectors and Λ = diag(λ_1, ..., λ_p). The projected coordinates (scores) are given by Z = X * V_k, retaining Σ_{i=1}^k λ_i / Σ_{j=1}^p λ_j of total variance.",
      whyItMatters: "PCA compresses hundreds of features down to a handful of uncorrelated components while retaining 80% to 95% of the information, eliminating multicollinearity and reducing training latency.",
      whenToUse: "When input features are continuous, highly correlated, and when unconstrained unsupervised variance preservation is desired.",
      whenNotToUse: "When target class labels are available and class separability is the primary goal (use LDA instead), or on non-linear manifolds.",
      mlImpact: "Prevents Ordinary Least Squares matrix singularity, eliminates multicollinearity, and accelerates gradient descent.",
      interviewTip: "Always mention: 1. Features must be standardized (StandardScaler) first! 2. Principal components are mutually orthogonal. 3. PCA maximizes variance, NOT class separation."
    },
    lda: {
      category: "Supervised Subspace",
      title: "Linear Discriminant Analysis (LDA)",
      badge: "Class Separation",
      beginner: "While PCA is 'blind' to what you are trying to predict (it only looks for the biggest spread of points), LDA is 'guided' by your target labels. Imagine you have red and blue balls scattered on a table. PCA will tilt the table to show the widest spread of all balls combined, even if red and blue get mixed together. LDA specifically tilts the table so that red balls fall to one side and blue balls fall to the other side!",
      intermediate: "LDA is a supervised projection method governed by Fisher's linear criterion: it maximizes between-class scatter S_B while minimizing within-class scatter S_W. The objective function is J(w) = (w^T * S_B * w) / (w^T * S_W * w). For a classification task with C classes, LDA can generate at most C - 1 discriminant components.",
      technical: "Let S_W = Σ_c Σ_{x in D_c} (x - μ_c)(x - μ_c)^T and S_B = Σ_c N_c (μ_c - μ)(μ_c - μ)^T. The optimal projection matrix W corresponds to the eigenvectors of S_W^{-1} * S_B. Because S_B is the sum of C rank-1 matrices of which only C-1 are linearly independent, rank(S_B) <= C - 1. Hence, the maximum number of components is min(p, C - 1).",
      whyItMatters: "When dimensionality reduction is performed prior to classification, LDA yields projections that directly preserve class separation, whereas PCA might discard low-variance directions that happen to contain the critical class boundary.",
      whenToUse: "When you have a categorical target variable and want to compress features while maximizing classification accuracy.",
      whenNotToUse: "When target classes are absent (unsupervised data) or when N < p causes S_W to become singular (requires regularized LDA).",
      mlImpact: "Produces optimal 1D or 2D feature embeddings for linear classification algorithms like Logistic Regression and Linear SVM.",
      interviewTip: "Remember the golden rule: The maximum number of components LDA can extract is C - 1 (where C is the number of target classes). For binary classification (C=2), LDA produces exactly 1 component!"
    },
    svd: {
      category: "Matrix Factorization",
      title: "Truncated SVD (Singular Value Decomposition)",
      badge: "Sparse Data Friendly",
      beginner: "Truncated SVD is like PCA's cousin that works efficiently on massive, sparse spreadsheets (spreadsheets filled mostly with zeros). In natural language processing, when analyzing word counts in articles, 99% of words in the dictionary are not in any given article. If you centered that data like PCA does, all those zeros would turn into negative numbers and blow up computer memory. SVD compresses the data without needing to center it.",
      intermediate: "SVD factorizes any real matrix X in R^{N x p} into X = U * Σ * V^T, where U and V are orthogonal matrices and Σ is a diagonal matrix containing non-negative singular values σ_1 >= σ_2 >= ... >= 0. Truncated SVD retains only the top k singular values, creating the best rank-k approximation to X under the Frobenius norm (Eckart-Young theorem).",
      technical: "By the Eckart-Young-Mirsky theorem, the truncated decomposition X_k = U_k * Σ_k * V_k^T minimizes ||X - X_k||_F and ||X - X_k||_2 over all matrices of rank <= k. When X is mean-centered, Truncated SVD is mathematically equivalent to PCA (X^T * X = V * Σ^2 * V^T). However, Truncated SVD can be directly evaluated on scipy.sparse matrices without densification.",
      whyItMatters: "Foundational for Latent Semantic Analysis (LSA) in NLP, recommendation systems (collaborative filtering), and sparse document-term indexing.",
      whenToUse: "When working with high-dimensional sparse matrices (TF-IDF, Bag-of-Words, user-item interaction matrices).",
      whenNotToUse: "When dense continuous data is present and strict probabilistic variance centering (PCA) is preferred.",
      mlImpact: "Powers Latent Semantic Indexing (LSI) in NLP and matrix factorization in Recommender Systems without memory exhaustion.",
      interviewTip: "Explain that PCA is simply SVD applied to a mean-centered data matrix. SVD is preferred for sparse data because mean-centering destroys sparsity."
    },
    curse_of_dimensionality: {
      category: "Fundamental Theory",
      title: "The Curse of Dimensionality",
      badge: "Volume Expansion",
      beginner: "Imagine searching for a lost coin on a 10-meter sidewalk (1 dimension) — you can search it quickly. Now imagine searching for it across a 10x10 meter field (2 dimensions, 100 sq meters). Now imagine a 10x10x10 meter room (3 dimensions, 1,000 cubic meters). When you have 100 or 1,000 columns (dimensions), the space becomes so vast and empty that all your data points end up isolated, and models struggle to find real patterns.",
      intermediate: "As dimensionality D increases, the volume of the space grows exponentially. Consequently, sample density drops to near zero unless the number of observations N increases exponentially. Furthermore, distance metrics concentrate: the ratio (d_max - d_min) / d_min -> 0, meaning Euclidean distance loses its discriminative power and all points appear equally distant.",
      technical: "Under i.i.d. coordinates X in R^D, as D -> infty, the pairwise Euclidean distance distribution concentrates around its expected value: lim_{D -> infty} Var(||X_i - X_j||_2 / E[||X_i - X_j||_2]) = 0. This degrades distance-dependent estimators (KNN, SVM, K-Means) and causes linear models to overfit due to ill-conditioned Gram matrices X^T X when D >> N.",
      whyItMatters: "Dimensionality reduction compresses large feature spaces onto lower-dimensional orthogonal subspaces, removing multicollinearity, speeding up training times, and mitigating overfitting while preserving essential variance.",
      whenToUse: "Whenever p > 15 or when severe multicollinearity and high computational latency occur.",
      whenNotToUse: "When features are few (p < 5) and already uncorrelated.",
      mlImpact: "Protects distance-based models (KNN, K-Means) and regularizes high-dimensional regressions (p > n).",
      interviewTip: "Explain the distance concentration phenomenon: as dimensions increase, the contrast between the nearest and farthest neighbor vanishes."
    },
    scree_plot: {
      category: "Diagnostic Tool",
      title: "Scree Plot & Kaiser's Criterion",
      badge: "Subspace Selection",
      beginner: "When PCA gives you 10 or 20 components, how many should you keep? A Scree Plot is a chart that shows how much information (variance) each component captures. You look for the 'elbow' — the point where the curve flattens out like the rubble at the base of a cliff (called 'scree' in geology). You keep the components before the elbow and discard the flat tail.",
      intermediate: "The scree plot graphs component index k against its eigenvalue λ_k or explained variance ratio. Two established heuristics determine the cutoff: 1. The Elbow Criterion (Cattell, 1966): select components before the sharp downward slope levels off. 2. Cumulative Variance Benchmark: retain enough components to achieve 80% to 90% total variance.",
      technical: "In standardized PCA, the average eigenvalue is 1.0 (since Σ λ_j = p). Kaiser's Criterion (1960) dictates retaining components with eigenvalues λ_k > 1.0, meaning the component explains more variance than a single original standardized feature. Parallel Analysis provides an even more robust test by comparing sample eigenvalues to random noise eigenvalues.",
      whyItMatters: "Prevents arbitrary guesswork when selecting the optimal number of dimensions k, balancing information preservation against model simplicity.",
      whenToUse: "Always inspect a scree plot when performing PCA to empirically determine the optimal number of components.",
      whenNotToUse: "When external constraints strictly require a specific k (e.g. k=2 for 2D scatter plots).",
      mlImpact: "Identifies the minimal viable subspace dimension k that avoids underfitting while pruning noise dimensions.",
      interviewTip: "Mention both Cattell's Elbow Rule, Kaiser's Criterion (eigenvalue > 1 for standardized data), and the 80-90% cumulative variance threshold."
    }
  };

  const data = conceptData[selectedConcept] || conceptData.pca;

  const conceptList = [
    { id: 'pca', label: 'PCA (Principal Components)' },
    { id: 'lda', label: 'LDA (Linear Discriminants)' },
    { id: 'svd', label: 'Truncated SVD' },
    { id: 'scree_plot', label: 'Scree Plot & Kaiser Rule' },
    { id: 'curse_of_dimensionality', label: 'Curse of Dimensionality' }
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
            <p className="text-[11px] text-slate-400">Step 08 Mathematical Foundations & Decision Framework</p>
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
                <GitCommit className="w-3.5 h-3.5" /> Explore Concepts:
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

          {/* Mandatory Standardization Warning */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-200">Mandatory Rule: </span>
              PCA is scale-sensitive! Features with large scales (e.g. Annual Income in $100k) will artificially dominate eigenvalues over smaller scale features (e.g. Age in years). Always standardize data (mean = 0, std = 1) before PCA.
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

export default DimensionalityLearningCard;
