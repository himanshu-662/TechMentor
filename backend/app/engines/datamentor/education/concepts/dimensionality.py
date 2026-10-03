"""Educational concepts specifically covering Dimensionality Reduction (PCA, LDA, SVD, Scree Plot)."""
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

DIMENSIONALITY_CONCEPTS = [
    EducationalConcept(
        concept_id="curse_of_dimensionality",
        category="statistics",
        title="The Curse of Dimensionality",
        short_definition="The exponential increase in mathematical volume and data sparsity that occurs when adding features to a dataset.",
        beginner_explanation=(
            "Imagine searching for a lost coin on a 10-meter sidewalk (1 dimension) — you can search it quickly. "
            "Now imagine searching for it across a 10x10 meter field (2 dimensions, 100 sq meters) — it takes much longer. "
            "Now imagine searching inside a 10x10x10 meter room (3 dimensions, 1,000 cubic meters). "
            "In machine learning, when you have 100 or 1,000 columns (dimensions), the space becomes so unfathomably vast and empty "
            "that all your data points end up isolated in empty space, and machine learning models struggle to find real patterns."
        ),
        intermediate_explanation=(
            "As dimensionality $D$ increases, the volume of the space grows exponentially ($V \\propto r^D$). "
            "Consequently, sample density drops to near zero unless the number of observations $N$ increases exponentially. "
            "Furthermore, distance metrics concentrate: the ratio $\\frac{d_{max} - d_{min}}{d_{min}} \\to 0$, "
            "meaning Euclidean distance loses its discriminative power and all points appear equally distant from each other."
        ),
        technical_explanation=(
            "Under independent identically distributed coordinates $X \\in \\mathbb{R}^D$, as $D \\to \\infty$, "
            "the pairwise Euclidean distance distribution concentrates around its expected value: "
            "$\\lim_{D \\to \\infty} \\text{Var}\\left(\\frac{\\|X_i - X_j\\|_2}{\\mathbb{E}[\\|X_i - X_j\\|_2]}\\right) = 0$. "
            "This severely degrades distance-dependent estimators (KNN, SVM, K-Means) and causes linear models to overfit "
            "due to ill-conditioned Gram matrices $X^T X$ when $D \\gg N$."
        ),
        why_it_matters=(
            "Dimensionality reduction compresses large feature spaces onto lower-dimensional orthogonal subspaces, "
            "removing multicollinearity, speeding up training times, and mitigating overfitting while preserving the essential variance."
        ),
        real_world_example=ConceptExample(
            title="Genomic Microarray Expression",
            description="A cancer diagnostic dataset measuring 20,000 gene expression levels across only 150 patient biopsies.",
            table_headers=["Metric", "Raw Feature Space", "After PCA Subspace"],
            table_rows=[
                ["Dimensions (p)", "20,000 genes", "10 Principal Components"],
                ["Sample Size (N)", "150 patients", "150 patients"],
                ["p / N Ratio", "133.3 (Severe Overfit Risk)", "0.067 (Well-Conditioned)"],
                ["Model Risk", "Gram matrix non-invertible", "Stable parameters, 88% variance retained"]
            ],
            takeaway="Compressing 20,000 correlated gene signals into 10 orthogonal components allows standard classifiers to generalize without overfitting."
        ),
        ml_impact="Protects distance-based models (KNN, K-Means) and regularizes high-dimensional regressions ($p > n$).",
        common_methods=["Principal Component Analysis (PCA)", "Truncated SVD", "Linear Discriminant Analysis (LDA)", "t-SNE / UMAP (for visualization)"],
        when_to_use="When datasets have hundreds of correlated numerical features, severe multicollinearity, or high computational training latency.",
        when_not_to_use="When you have few features ($p < 10$) or when direct individual feature interpretability (e.g., in medical/legal compliance) is mandatory.",
        common_mistakes=[
            "Applying PCA without standardizing features first (variables with large numeric scales dominate variance).",
            "Confusing feature selection (choosing a subset of original features) with dimensionality reduction (creating new synthetic linear combinations).",
            "Using PCA blindly on nonlinear manifolds where manifold learning (t-SNE/UMAP/Kernel PCA) is required."
        ],
        interview_tip="Explain the distance concentration phenomenon: as dimensions increase, the contrast between the nearest and farthest neighbor vanishes.",
        related_concepts=["pca", "svd", "lda", "scree_plot", "standardization"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_curse_dim_01",
            question="Why does Euclidean distance become ineffective in very high-dimensional feature spaces?",
            options=[
                "Because distances become negative.",
                "Because the ratio of the difference between maximum and minimum distance to the minimum distance approaches zero (distance concentration).",
                "Because standard deviation becomes undefined.",
                "Because Euclidean distance only works on 2D datasets."
            ],
            correct_option_index=1,
            explanation="In high dimensions, the distance between any two random points concentrates around the mean distance, making all points appear equidistant."
        )
    ),

    EducationalConcept(
        concept_id="pca",
        category="statistics",
        title="Principal Component Analysis (PCA)",
        short_definition="An unsupervised linear dimensionality reduction technique that projects features onto orthogonal axes of maximal variance.",
        beginner_explanation=(
            "Imagine taking a 2D photograph of a 3D sculpture. From some angles, the sculpture looks flat and details are lost. "
            "From the best angle, you capture the widest spread and greatest depth of the sculpture. "
            "PCA mathematically finds that 'best angle' for your data: it creates new hybrid features (called Principal Components) "
            "where Component 1 captures the greatest possible variation, Component 2 captures the next greatest variation, and so on."
        ),
        intermediate_explanation=(
            "PCA computes the eigenvectors and eigenvalues of the feature covariance matrix $\\Sigma = \\frac{1}{N} X^T X$. "
            "The eigenvectors define the directions of the principal axes (orthogonal hyperplanes), while the eigenvalues $\\lambda_k$ "
            "quantify the variance explained along each axis. Because the components are orthogonal, PCA completely eliminates multicollinearity."
        ),
        technical_explanation=(
            "Given standardized data matrix $X \\in \\mathbb{R}^{N \\times p}$ with $\\mathbb{E}[X] = 0$: "
            "The first principal component loading vector $w_1$ solves $\\max_{\\|w\\|_2 = 1} w^T X^T X w$. "
            "Spectral decomposition yields $X^T X = V \\Lambda V^T$, where $V = [v_1, \\dots, v_p]$ is the orthonormal matrix of eigenvectors "
            "and $\\Lambda = \\text{diag}(\\lambda_1, \\dots, \\lambda_p)$ with $\\lambda_1 \\ge \\lambda_2 \\ge \\dots \\ge \\lambda_p \\ge 0$. "
            "The projected coordinates (scores) are given by $Z = X V_k$, retaining $\\sum_{i=1}^k \\lambda_i / \\sum_{j=1}^p \\lambda_j$ of total variance."
        ),
        why_it_matters=(
            "PCA allows you to reduce hundreds of features down to a handful of uncorrelated components while retaining 80% to 95% of the information."
        ),
        real_world_example=ConceptExample(
            title="Customer Financial Profile Compression",
            description="A retail bank measures 8 correlated credit variables: Credit Card Balance, Auto Loan Balance, Mortgage Balance, Overdraft Count, etc.",
            table_headers=["Component", "Explained Variance", "Cumulative Variance", "Primary Underlying Meaning"],
            table_rows=[
                ["PC_1", "54.2%", "54.2%", "Overall Debt Volume (all balances load positively)"],
                ["PC_2", "26.1%", "80.3%", "Revolving vs Installment Leverage contrast"],
                ["PC_3", "9.4%", "89.7%", "Short-term liquidity stress"],
                ["PC_4 to PC_8", "10.3% total", "100.0%", "Idiosyncratic noise & redundant collinearity"]
            ],
            takeaway="Using just the first 2 components preserves over 80% of customer variance while reducing feature count from 8 to 2."
        ),
        ml_impact="Eliminates multicollinearity for Ordinary Least Squares regression, prevents matrix singularity, and speeds up training.",
        common_methods=["sklearn.decomposition.PCA", "scipy.linalg.eigh", "numpy.linalg.svd"],
        when_to_use="When input features are continuous, highly correlated, and when unconstrained unsupervised variance preservation is desired.",
        when_not_to_use="When target class labels are available and class separability is the primary goal (use LDA instead), or on non-linear manifolds.",
        common_mistakes=[
            "Failing to standardize features first (StandardScaler) — unscaled columns dominate eigenvalues.",
            "Fitting PCA on the entire dataset instead of training set only (causing data leakage).",
            "Treating principal components as directly interpretable original features."
        ],
        interview_tip="Always mention: 1. Features must be standardized ($z$-score). 2. Principal components are mutually orthogonal (covariance = 0). 3. It maximizes variance, not class separation.",
        related_concepts=["curse_of_dimensionality", "scree_plot", "svd", "lda", "standardization"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_pca_01",
            question="Why MUST features be scaled (standardized) before applying PCA?",
            options=[
                "Because PCA cannot run on negative numbers.",
                "Because features with larger numerical scales will artificially dominate the variance and bias the principal axes.",
                "Because PCA requires all numbers to be integers.",
                "Because standardization converts non-linear relationships into linear ones."
            ],
            correct_option_index=1,
            explanation="PCA maximizes variance. If one feature is measured in thousands (e.g. Salary) and another in single digits (e.g. Number of Children), the high-scale feature will account for nearly 100% of variance solely due to its units."
        )
    ),

    EducationalConcept(
        concept_id="lda",
        category="statistics",
        title="Linear Discriminant Analysis (LDA)",
        short_definition="A supervised dimensionality reduction technique that finds projection axes maximizing class separability.",
        beginner_explanation=(
            "While PCA is 'blind' to what you are trying to predict (it only looks for the biggest spread of points), "
            "LDA is 'guided' by your target labels. Imagine you have red and blue balls scattered on a table. "
            "PCA will tilt the table to show the widest spread of all balls combined, even if red and blue get mixed together. "
            "LDA specifically tilts the table so that red balls fall to one side and blue balls fall to the other side!"
        ),
        intermediate_explanation=(
            "LDA is a supervised projection method governed by Fisher's linear criterion: "
            "it maximizes the between-class scatter matrix $S_B$ while minimizing the within-class scatter matrix $S_W$. "
            "The objective function is $J(w) = \\frac{w^T S_B w}{w^T S_W w}$. "
            "For a classification task with $C$ classes, LDA can generate at most $C - 1$ discriminant components."
        ),
        technical_explanation=(
            "Let $S_W = \\sum_{c=1}^C \\sum_{x \\in D_c} (x - \\mu_c)(x - \\mu_c)^T$ and $S_B = \\sum_{c=1}^C N_c (\\mu_c - \\mu)(\\mu_c - \\mu)^T$. "
            "The optimal projection matrix $W$ corresponds to the eigenvectors of $S_W^{-1} S_B$. "
            "Because $S_B$ is the sum of $C$ rank-1 matrices of which only $C-1$ are linearly independent, "
            "$\\text{rank}(S_B) \\le C - 1$. Hence, the maximum number of components is $\\min(p, C - 1)$."
        ),
        why_it_matters=(
            "When dimensionality reduction is performed prior to classification, LDA yields projections that directly preserve class separation, "
            "whereas PCA might discard low-variance directions that happen to contain the critical class boundary."
        ),
        real_world_example=ConceptExample(
            title="Medical Diagnosis (Healthy vs Benign vs Malignant)",
            description="30 cellular morphometry features for 3 diagnosis classes ($C = 3$).",
            table_headers=["Method", "Max Components", "Optimization Goal", "Downstream Accuracy"],
            table_rows=[
                ["PCA", "30", "Total feature variance", "82.4% (some classes overlap in PC1/PC2)"],
                ["LDA", "2 (C - 1)", "Between-class separation", "94.8% (clear clusters for all 3 diagnoses)"]
            ],
            takeaway="Because $C=3$, LDA compresses 30 features into exactly 2 linear discriminants ($C-1$) that visually and mathematically separate the 3 diagnostic classes."
        ),
        ml_impact="Produces optimal 1D or 2D feature embeddings for linear classification algorithms.",
        common_methods=["sklearn.discriminant_analysis.LinearDiscriminantAnalysis"],
        when_to_use="When you have a categorical target variable and want to compress features while maximizing classification accuracy.",
        when_not_to_use="When target classes are absent (unsupervised data) or when $N < p$ causes $S_W$ to become singular (requires regularized LDA).",
        common_mistakes=[
            "Trying to extract more components than $C - 1$ (e.g., expecting 5 components for binary classification where only 1 is possible).",
            "Assuming LDA is unsupervised like PCA.",
            "Violating the assumption that classes have approximately equal covariance matrices."
        ],
        interview_tip="Key distinction: PCA is unsupervised (maximizes overall variance); LDA is supervised (maximizes between-class variance relative to within-class variance). Max LDA components is $C - 1$.",
        related_concepts=["pca", "curse_of_dimensionality", "classification"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_lda_01",
            question="In a classification problem with 4 distinct classes and 50 continuous features, what is the maximum number of components LDA can produce?",
            options=["50", "4", "3", "1"],
            correct_option_index=2,
            explanation="The rank of the between-class scatter matrix $S_B$ is at most $C - 1$. For 4 classes, $C - 1 = 4 - 1 = 3$ maximum components."
        )
    ),

    EducationalConcept(
        concept_id="svd",
        category="statistics",
        title="Truncated Singular Value Decomposition (SVD)",
        short_definition="A matrix factorization technique that decomposes a matrix into singular vectors without requiring mean-centering.",
        beginner_explanation=(
            "Truncated SVD is like PCA's cousin that works efficiently on massive, sparse spreadsheets (spreadsheets filled mostly with zeros). "
            "In natural language processing, when analyzing word counts in articles, 99% of words in the dictionary are not in any given article. "
            "If you centered that data like PCA does, all those zeros would turn into negative numbers and blow up computer memory. "
            "SVD factorization compresses the data without needing to center it."
        ),
        intermediate_explanation=(
            "SVD factorizes any real matrix $X \\in \\mathbb{R}^{N \\times p}$ into $X = U \\Sigma V^T$, where $U$ and $V$ are orthogonal matrices "
            "and $\\Sigma$ is a diagonal matrix containing non-negative singular values $\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge 0$. "
            "Truncated SVD retains only the top $k$ singular values, creating the best rank-$k$ approximation to $X$ under the Frobenius norm (Eckart-Young theorem)."
        ),
        technical_explanation=(
            "By the Eckart-Young-Mirsky theorem, the truncated decomposition $X_k = U_k \\Sigma_k V_k^T$ minimizes $\\|X - X_k\\|_F$ and $\\|X - X_k\\|_2$ "
            "over all matrices of rank $\\le k$. When $X$ is mean-centered, Truncated SVD is mathematically equivalent to PCA ($X^T X = V \\Sigma^2 V^T$). "
            "However, Truncated SVD can be directly evaluated on `scipy.sparse.csr_matrix` instances without densification."
        ),
        why_it_matters=(
            "Foundational for Latent Semantic Analysis (LSA) in NLP, recommendation systems (collaborative filtering), and sparse document-term indexing."
        ),
        real_world_example=ConceptExample(
            title="Book Topic Modeling via Document-Term Matrix",
            description="A library dataset of 10,000 articles and 50,000 unique vocabulary words (99.8% sparse).",
            table_headers=["Method", "Memory Footprint", "Sparse Matrix Preserved", "Feasibility"],
            table_rows=[
                ["Standard PCA", "> 4.0 GB RAM", "No (centering creates dense matrix)", "Crashes on modest hardware"],
                ["Truncated SVD (k=50)", "12 MB RAM", "Yes (operates directly on CSR sparse format)", "Fast convergence in 1.2s"]
            ],
            takeaway="Truncated SVD extracts 50 latent semantic topics without converting the sparse zero matrix into dense RAM-heavy memory."
        ),
        ml_impact="Powers Latent Semantic Indexing (LSI) in NLP and matrix factorization in Recommender Systems.",
        common_methods=["sklearn.decomposition.TruncatedSVD", "scipy.sparse.linalg.svds"],
        when_to_use="When working with high-dimensional sparse matrices (TF-IDF, Bag-of-Words, user-item interaction matrices).",
        when_not_to_use="When dense continuous data is present and strict probabilistic variance centering (PCA) is preferred.",
        common_mistakes=[
            "Assuming Truncated SVD and PCA are identical when data has non-zero column means.",
            "Failing to normalize document lengths before SVD in text tasks."
        ],
        interview_tip="Explain that PCA is simply SVD applied to a mean-centered data matrix. SVD is preferred for sparse data because mean-centering destroys sparsity.",
        related_concepts=["pca", "curse_of_dimensionality", "scree_plot"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_svd_01",
            question="Why is Truncated SVD preferred over standard PCA for text TF-IDF matrices?",
            options=[
                "Because SVD only works on text.",
                "Because standard PCA subtracts the mean, which turns sparse zeros into non-zero numbers and causes massive memory explosion.",
                "Because SVD produces categorical outputs.",
                "Because SVD does not use linear algebra."
            ],
            correct_option_index=1,
            explanation="Mean centering turns sparse matrices (which only store non-zero values) into 100% dense matrices, consuming gigabytes of memory. Truncated SVD factorizes sparse matrices directly without centering."
        )
    ),

    EducationalConcept(
        concept_id="scree_plot",
        category="statistics",
        title="Scree Plot & Explained Variance Ratio",
        short_definition="A diagnostic diagnostic line/bar chart displaying eigenvalues or explained variance ratios across principal components.",
        beginner_explanation=(
            "When PCA gives you 10 or 20 components, how many should you actually keep? 2? 5? All of them? "
            "A Scree Plot is a chart that shows how much information (variance) each component captures. "
            "You look for the 'elbow' — the point where the curve flattens out like the rubble at the base of a cliff (called 'scree' in geology). "
            "You keep the components before the elbow and discard the flat tail."
        ),
        intermediate_explanation=(
            "The scree plot graphs component index $k$ against its eigenvalue $\\lambda_k$ or explained variance ratio $\\frac{\\lambda_k}{\\sum \\lambda_j}$. "
            "Two established heuristics determine the cutoff: "
            "1. The Elbow Criterion (Cattell, 1966): select components before the sharp downward slope levels off. "
            "2. Cumulative Variance Benchmark: retain enough components to achieve 80% to 95% total variance."
        ),
        technical_explanation=(
            "In standardized PCA, the average eigenvalue is 1.0 (since $\\sum_{j=1}^p \\lambda_j = p$). "
            "Kaiser's Criterion (1960) dictates retaining components with eigenvalues $\\lambda_k > 1.0$, "
            "meaning the component explains more variance than a single original standardized feature. "
            "Parallel Analysis provides a more robust statistical test by comparing sample eigenvalues to eigenvalues generated from random noise."
        ),
        why_it_matters=(
            "Prevents arbitrary guesswork when selecting the optimal number of dimensions $k$, balancing information preservation against model simplicity."
        ),
        real_world_example=ConceptExample(
            title="Selecting Components for Housing Features",
            description="10 original housing attributes analyzed via PCA.",
            table_headers=["Component", "Eigenvalue (λ)", "Variance %", "Cumulative %", "Decision"],
            table_rows=[
                ["PC_1", "4.25", "42.5%", "42.5%", "Keep (λ > 1, steep slope)"],
                ["PC_2", "2.61", "26.1%", "68.6%", "Keep (λ > 1)"],
                ["PC_3", "1.42", "14.2%", "82.8%", "Keep (Cumulative > 80% & λ > 1)"],
                ["PC_4 (Elbow)", "0.62", "6.2%", "89.0%", "Discard (λ < 1, curve flattens)"],
                ["PC_5 to PC_10", "< 0.40 each", "< 4% each", "100.0%", "Discard (noise)"]
            ],
            takeaway="Selecting $k=3$ components satisfies Kaiser's criterion ($\\lambda > 1$) and captures 82.8% of variance while eliminating 70% of feature dimensions."
        ),
        ml_impact="Identifies the minimal viable subspace dimension $k$ that avoids underfitting while pruning noise dimensions.",
        common_methods=["matplotlib.pyplot.plot(np.cumsum(pca.explained_variance_ratio_))", "scree_plot"],
        when_to_use="Always inspect a scree plot when performing PCA to empirically determine the optimal number of components.",
        when_not_to_use="When external constraints strictly require a specific $k$ (e.g. $k=2$ or $k=3$ for 2D/3D visualization).",
        common_mistakes=[
            "Keeping too few components (e.g. only 2 components when they only explain 30% of total variance).",
            "Keeping components past the elbow point that represent measurement noise rather than structural signal."
        ],
        interview_tip="Mention both Cattell's Elbow Rule, Kaiser's Criterion (eigenvalue > 1 for standardized data), and the 80-90% cumulative variance threshold.",
        related_concepts=["pca", "curse_of_dimensionality", "svd"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_scree_01",
            question="According to Kaiser's Criterion, which components should be retained in a standardized PCA?",
            options=[
                "Only components with negative eigenvalues.",
                "Components with eigenvalues greater than 1.0.",
                "Only the first component.",
                "All components with variance less than 5%."
            ],
            correct_option_index=1,
            explanation="For standardized features, the average variance per feature is 1.0. Kaiser's criterion retains components with eigenvalues > 1.0 because they capture more information than an individual original feature."
        )
    )
]
