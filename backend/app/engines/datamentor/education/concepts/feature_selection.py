"""Educational concepts specifically covering Feature Selection (Filter, Wrapper, Embedded, ANOVA F-test, Mutual Information)."""
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

FEATURE_SELECTION_CONCEPTS = [
    EducationalConcept(
        concept_id="feature_selection",
        category="statistics",
        title="Feature Selection: Filter, Wrapper & Embedded",
        short_definition="The process of selecting a subset of the most relevant original features to use in model construction.",
        beginner_explanation=(
            "Imagine packing a backpack for a mountain hike. If you pack every single item in your house, your backpack will be too heavy "
            "and you will collapse from exhaustion. You must choose only the essentials — water, map, boots — and leave the frying pan and sofa behind. "
            "In machine learning, feeding 100 features into a model often hurts performance because many features are useless noise or duplicates. "
            "Feature selection picks only the most predictive original columns so your model is fast, accurate, and easy to explain."
        ),
        intermediate_explanation=(
            "Feature selection differs fundamentally from Dimensionality Reduction (PCA): "
            "PCA creates new synthetic linear combinations of features, losing raw interpretability. "
            "Feature selection preserves original features, maintaining direct business and domain interpretability. "
            "There are 3 primary taxonomy families: "
            "1. Filter Methods: Evaluate individual statistical correlation/association with the target independently of models (e.g. SelectKBest, ANOVA F-test, Mutual Info). Fast, $O(p)$. "
            "2. Wrapper Methods: Use a predictive model to search the combinatorial feature space (e.g. Recursive Feature Elimination / RFE, Forward/Backward Stepwise). Accurate but computationally intensive, $O(2^p)$ or $O(p^2)$. "
            "3. Embedded Methods: Selection occurs natively during model optimization (e.g. Lasso L1 shrinkage driving coefficients to zero, Tree split Gini importance)."
        ),
        technical_explanation=(
            "Given feature matrix $X \\in \\mathbb{R}^{N \\times p}$ and target $y \\in \\mathbb{R}^N$, feature selection seeks a subset $S \\subset \\{1, \\dots, p\\}$ "
            "with $|S| = k \\ll p$ minimizing empirical prediction risk $\\min_w \\mathbb{E}[\\mathcal{L}(f(X_S; w), y)]$. "
            "Filter methods score features via marginal statistics $S(X_j, y)$. "
            "Embedded $L_1$ regularization solves $\\min_w \\frac{1}{2N} \\|y - Xw\\|_2^2 + \\lambda \\|w\\|_1$, exploiting the non-differentiable $L_1$ diamond geometry "
            "at the coordinate axes to produce exact sparsity ($w_j = 0$ for irrelevant features)."
        ),
        why_it_matters=(
            "Eliminating irrelevant, redundant, and noisy features prevents overfitting, reduces computational training time, "
            "simplifies model interpretability for regulatory compliance, and improves generalizability on test data."
        ),
        real_world_example=ConceptExample(
            title="Loan Default Prediction",
            description="A bank dataset with 45 features including Income, Debt Ratio, Credit Score, but also User IP Address, Device Screen Width, and Favorite Color.",
            table_headers=["Feature Candidate", "ANOVA F-Score", "Decision", "Business Rationale"],
            table_rows=[
                ["Debt-to-Income Ratio", "142.8", "Keep (Rank 1)", "Strong direct causal association with insolvency risk"],
                ["Credit Bureau Score", "118.4", "Keep (Rank 2)", "High historical predictive power across peer cohorts"],
                ["Applicant Age", "34.2", "Keep (Rank 3)", "Moderate demographic stability indicator"],
                ["Device Screen Width", "0.04", "Drop", "Spurious noise, zero statistical association with solvency"],
                ["Favorite Color", "0.01", "Drop", "Pure random variation that would cause model overfitting"]
            ],
            takeaway="Filtering the top 3 informative features improves model test accuracy from 76% to 84% by removing noise columns."
        ),
        ml_impact="Significantly reduces model variance (preventing overfitting) and speeds up inference latency.",
        common_methods=["SelectKBest", "SelectPercentile", "VarianceThreshold", "Recursive Feature Elimination (RFE)", "Lasso (L1 Regularization)"],
        when_to_use="When datasets have many features ($p > 20$), when raw feature interpretability is required, or when noise columns cause overfitting.",
        when_not_to_use="When you have very few features ($p < 5$) that are all known domain essentials.",
        common_mistakes=[
            "Performing feature selection on the entire dataset before train/test splitting (causing severe target leakage!).",
            "Using ANOVA F-test on complex non-linear relationships (use Mutual Information instead).",
            "Dropping redundant features that are weak individually but powerful in multivariate combinations."
        ],
        interview_tip="Always explain the 3 families: Filter (fast, model-agnostic), Wrapper (accurate, slow, model-dependent), and Embedded (Lasso/Trees, optimized during training).",
        related_concepts=["select_k_best", "f_score", "mutual_information", "curse_of_dimensionality", "data_leakage"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_fs_01",
            question="What is the primary difference between Feature Selection and Dimensionality Reduction (like PCA)?",
            options=[
                "Feature selection only works on images.",
                "Feature selection retains original raw columns intact (preserving interpretability), while PCA creates new synthetic linear combinations.",
                "PCA cannot reduce the number of columns.",
                "Feature selection requires deep learning."
            ],
            correct_option_index=1,
            explanation="Feature selection discards unimportant columns while keeping original features untouched for direct interpretability. PCA transforms features into new blended orthogonal components."
        )
    ),

    EducationalConcept(
        concept_id="select_k_best",
        category="statistics",
        title="SelectKBest Univariate Feature Selection",
        short_definition="A univariate filter algorithm that scores each feature against the target and retains the top K highest-scoring features.",
        beginner_explanation=(
            "SelectKBest is like a talent audition for your dataset's columns. "
            "You decide in advance how many winners you want (K). Each column steps up and is given an audition score "
            "measuring how well it predicts the target. SelectKBest ranks the audition scores from highest to lowest and keeps only the top K winners."
        ),
        intermediate_explanation=(
            "SelectKBest computes a statistical test score $S(X_j, y)$ for each feature $j$ independently (univariate testing). "
            "Features are sorted in descending order of score, and the top $K$ features are retained. "
            "Because each feature is evaluated independently, SelectKBest cannot detect multivariate interaction effects "
            "(two features that are uninformative alone but powerful together), but it runs in $O(p)$ time and scales to massive datasets."
        ),
        technical_explanation=(
            "Given candidate feature matrix $X \\in \\mathbb{R}^{N \\times p}$, SelectKBest applies a user-selected scoring function: "
            "$s_j = g(X_{*, j}, y)$ for $j \\in \\{1, \\dots, p\\}$. Let $\\pi$ be the permutation of indices sorting $s$ descendingly: $s_{\\pi(1)} \\ge s_{\\pi(2)} \\ge \\dots \\ge s_{\\pi(p)}$. "
            "The selected subset is $S = \\{\\pi(1), \\dots, \\pi(K)\\}$. The output design matrix is $X_S \\in \\mathbb{R}^{N \\times K}$."
        ),
        why_it_matters=(
            "Provides an ultra-fast, robust baseline for feature reduction before feeding data into complex downstream estimators."
        ),
        real_world_example=ConceptExample(
            title="E-Commerce Churn Prediction",
            description="30 behavioral features scored against customer churn (Yes/No). User sets $K=4$.",
            table_headers=["Rank", "Feature Name", "Scoring Metric", "Test Score", "Status"],
            table_rows=[
                ["#1", "Days Since Last Order", "ANOVA F-Score", "214.5", "Selected (Top K)"],
                ["#2", "Support Ticket Count", "ANOVA F-Score", "182.1", "Selected (Top K)"],
                ["#3", "Total Spend 90d", "ANOVA F-Score", "96.4", "Selected (Top K)"],
                ["#4", "Login Frequency", "ANOVA F-Score", "74.8", "Selected (Top K)"],
                ["#5", "Newsletter Open Rate", "ANOVA F-Score", "12.3", "Removed (Below K cutoff)"],
                ["#6", "Zip Code Prefix", "ANOVA F-Score", "1.1", "Removed (Below K cutoff)"]
            ],
            takeaway="SelectKBest cleanly filters out the 26 weaker features and isolates the 4 primary drivers of churn."
        ),
        ml_impact="Prevents model overfitting and simplifies linear and logistic decision boundaries.",
        common_methods=["sklearn.feature_selection.SelectKBest", "SelectPercentile"],
        when_to_use="When you want a fast, model-agnostic feature filter to eliminate low-signal features before modeling.",
        when_not_to_use="When features exhibit complex non-linear XOR interactions that require multivariate tree selection or RFE.",
        common_mistakes=[
            "Choosing an arbitrary $K$ without checking validation curves or cross-validated performance.",
            "Using a classification scoring function (f_classif) on a continuous numerical target variable."
        ],
        interview_tip="Highlight that SelectKBest is univariate (evaluates features one by one), meaning it is fast ($O(p)$) but blind to multi-feature synergies.",
        related_concepts=["feature_selection", "f_score", "mutual_information"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_skb_01",
            question="What is the main limitation of univariate SelectKBest compared to tree-based feature selection?",
            options=[
                "SelectKBest cannot handle numbers.",
                "SelectKBest evaluates each feature in isolation and cannot detect interactions between combinations of features.",
                "SelectKBest always deletes the target column.",
                "SelectKBest requires neural networks."
            ],
            correct_option_index=1,
            explanation="Univariate scoring evaluates each feature independently. If two features only become informative when combined (like length and width for area, or XOR logic), univariate methods may score them low."
        )
    ),

    EducationalConcept(
        concept_id="f_score",
        category="statistics",
        title="ANOVA F-Test Scoring (f_classif / f_regression)",
        short_definition="A parametric hypothesis test scoring linear association by comparing between-group variance against within-group variance.",
        beginner_explanation=(
            "The F-Score asks a simple question: 'Are the target groups noticeably separated by this feature?' "
            "For example, if you measure customer income across Churned vs Retained customers: "
            "If the average income of churned customers ($30k) is far away from retained customers ($90k), and everyone inside each group is tightly clustered, "
            "the F-score is huge! If the group averages overlap completely, the F-score is close to zero."
        ),
        intermediate_explanation=(
            "In classification (`f_classif`), the one-way ANOVA F-statistic tests whether the means of several groups are equal: "
            "$F = \\frac{\\text{Between-Group Mean Square}}{\\text{Within-Group Mean Square}} = \\frac{MS_B}{MS_W}$. "
            "In regression (`f_regression`), it computes the correlation coefficient $r = \\frac{\\text{Cov}(x, y)}{\\sigma_x \\sigma_y}$ "
            "and converts it into an F-statistic: $F = \\frac{r^2}{1 - r^2} \\times (N - 2)$. "
            "High F-scores indicate strong linear dependency with low $p$-values."
        ),
        technical_explanation=(
            "Under the null hypothesis $H_0: \\mu_1 = \\mu_2 = \\dots = \\mu_C$, assuming Gaussian errors with homoscedastic variance $\\sigma^2$: "
            "$F = \\frac{\\sum_{c=1}^C N_c (\\bar{x}_c - \\bar{x})^2 / (C - 1)}{\\sum_{c=1}^C \\sum_{i=1}^{N_c} (x_{ci} - \\bar{x}_c)^2 / (N - C)} \\sim \\mathcal{F}(C - 1, N - C)$. "
            "A small $p$-value ($p < 0.05$) rejects $H_0$, confirming statistically significant between-group divergence."
        ),
        why_it_matters=(
            "Provides an exact statistical significance test with formal $p$-values, identifying linear drivers of the target."
        ),
        real_world_example=ConceptExample(
            title="Blood Pressure Across Clinical Trial Drug Doses",
            description="Comparing systolic blood pressure reduction across 3 dosage groups (Placebo, 10mg, 50mg).",
            table_headers=["Metric", "Calculation", "Observed Value", "Significance"],
            table_rows=[
                ["Between-Group Variance (MSB)", "Variance across drug group means", "842.6", "Substantial divergence"],
                ["Within-Group Variance (MSW)", "Variance within each patient cohort", "18.4", "Tight patient consistency"],
                ["F-Statistic", "MSB / MSW = 842.6 / 18.4", "45.79", "Extremely high signal"],
                ["p-Value", "P(F > 45.79)", "1.2 x 10^-8", "Reject H0: Dosage strongly affects blood pressure"]
            ],
            takeaway="An F-statistic of 45.79 with p < 0.0001 proves that drug dosage is a vital predictive feature."
        ),
        ml_impact="Fastest linear feature filter; ideal for Linear/Logistic Regression and Linear SVMs.",
        common_methods=["sklearn.feature_selection.f_classif", "sklearn.feature_selection.f_regression", "scipy.stats.f_oneway"],
        when_to_use="When features are continuous, normally distributed, and expected to have linear or monotonic relationships with the target.",
        when_not_to_use="When relationships are non-linear (e.g. U-shaped or sinusoidal curves) where F-score can be 0 despite strong dependency.",
        common_mistakes=[
            "Assuming an F-test can detect non-linear curves (e.g. $y = x^2$ symmetric around 0 has zero correlation and near-zero F-score).",
            "Ignoring severe heteroscedasticity or heavy-tailed non-Gaussian noise."
        ],
        interview_tip="F-Score is parametric and assumes linear relationships. For non-linear curves (like quadratic or periodic patterns), ANOVA F-test fails and Mutual Information is required.",
        related_concepts=["feature_selection", "select_k_best", "mutual_information"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_fscore_01",
            question="If a feature has a perfect non-linear parabolic relationship with the target (y = x^2, centered at 0), what will an ANOVA F-test / linear correlation score show?",
            options=[
                "An extremely high F-score.",
                "A near-zero F-score because the linear correlation between x and y is zero.",
                "An undefined error.",
                "A negative F-score."
            ],
            correct_option_index=1,
            explanation="Linear correlation and ANOVA F-tests measure linear dependency. For a symmetric parabola y = x^2, the positive and negative halves cancel out, resulting in near-zero linear correlation despite perfect non-linear predictability."
        )
    ),

    EducationalConcept(
        concept_id="mutual_information",
        category="statistics",
        title="Mutual Information (Information Gain)",
        short_definition="A non-parametric information-theoretic metric quantifying the amount of information obtained about one variable through observing another.",
        beginner_explanation=(
            "Mutual Information measures: 'How much does knowing feature X reduce our uncertainty about target Y?' "
            "Unlike simple correlation, Mutual Information can catch ANY kind of pattern — zig-zags, curves, circles, or waves! "
            "If knowing X tells you nothing about Y, Mutual Information is 0. If knowing X completely reveals Y, Mutual Information is very high."
        ),
        intermediate_explanation=(
            "Based on Shannon entropy $H(X)$, Mutual Information is defined as: "
            "$I(X; Y) = H(Y) - H(Y | X) = \\sum_{x \\in X} \\sum_{y \\in Y} P(x, y) \\log \\frac{P(x, y)}{P(x) P(y)}$. "
            "Because it evaluates the Kullback-Leibler divergence between the joint distribution $P(X, Y)$ and the product of marginals $P(X)P(Y)$, "
            "it equals zero if and only if $X$ and $Y$ are strictly statistically independent. It captures non-linear relationships effortlessly."
        ),
        technical_explanation=(
            "For continuous random variables, $I(X; Y) = \\iint p(x, y) \\log \\frac{p(x, y)}{p(x) p(y)} dx dy$. "
            "Scikit-learn implements the Kraskov-Stögbauer-Grassberger (KSG) non-parametric k-nearest neighbors entropy estimator, "
            "approximating continuous mutual information without requiring manual histogram binning. "
            "Mutual information is non-negative ($I(X; Y) \\ge 0$), symmetric ($I(X; Y) = I(Y; X)$), and invariant under smooth invertible coordinate transformations."
        ),
        why_it_matters=(
            "Captures complex, non-linear dependencies (quadratic, exponential, sinusoidal) that linear correlation metrics (Pearson, ANOVA) completely miss."
        ),
        real_world_example=ConceptExample(
            title="Engine Temperature vs Power Efficiency",
            description="Efficiency peaks at 90°C (normal operating temperature) and drops at both freezing (0°C) and overheating (140°C) — a classic inverted U-curve.",
            table_headers=["Metric", "Calculated Score", "Interpretation"],
            table_rows=[
                ["Pearson Correlation (r)", "-0.04", "Misleadingly implies zero relationship because slopes cancel out"],
                ["ANOVA F-Score", "0.82 (p=0.45)", "Fails to reject null hypothesis; indicates no linear signal"],
                ["Mutual Information", "0.68 nats", "Correctly identifies strong non-linear predictability"]
            ],
            takeaway="Mutual Information captures the inverted U-curve relationship that linear metrics failed to detect."
        ),
        ml_impact="Ideal feature filter before fitting non-linear models like Random Forests, Gradient Boosted Trees (XGBoost), and Neural Networks.",
        common_methods=["sklearn.feature_selection.mutual_info_classif", "sklearn.feature_selection.mutual_info_regression"],
        when_to_use="When relationships between features and target are suspected to be non-linear, multi-modal, or complex.",
        when_not_to_use="On massive datasets with strict millisecond latency constraints, as KNN entropy estimation ($O(N \\log N)$) is slower than $O(N)$ ANOVA.",
        common_mistakes=[
            "Assuming Mutual Information values are bounded between 0 and 1 (for continuous variables, differential mutual information can exceed 1).",
            "Setting random seed inconsistently (KSG estimator uses small random jitter to break ties)."
        ],
        interview_tip="Key distinction: Pearson and ANOVA F-score measure only linear relationships. Mutual Information measures ANY functional dependence (linear or non-linear) using Shannon entropy.",
        related_concepts=["feature_selection", "select_k_best", "f_score"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_mi_01",
            question="When is Mutual Information preferred over an ANOVA F-test for feature selection?",
            options=[
                "When features are strictly linear.",
                "When the relationship between the feature and target is non-linear (e.g. U-shaped or complex curve).",
                "Only when all numbers are negative.",
                "When computational speed is the only priority."
            ],
            correct_option_index=1,
            explanation="Mutual Information relies on entropy divergence and can detect any statistical dependence, including non-linear and periodic curves where linear ANOVA fails."
        )
    )
]
