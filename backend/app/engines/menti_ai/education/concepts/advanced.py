"""Advanced Educational Concepts (Cardinality & Outlier)."""
from typing import List
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

ADVANCED_CONCEPTS: List[EducationalConcept] = [
    EducationalConcept(
        concept_id="cardinality",
        category="advanced",
        title="Cardinality (Number of Unique Values)",
        short_definition="The count of distinct or unique values contained within a categorical or discrete feature.",
        beginner_explanation="Think of a box of crayons. If your box has only Red, Green, and Blue, it has low cardinality (3 colors). If you have an artist box with 1,000 distinct shades, it has high cardinality (1,000 unique colors).",
        intermediate_explanation="Categorical features range from low cardinality (binary flags: Yes/No; days of week: 7) to high cardinality (zip codes: ~40,000; IP addresses: millions). High cardinality complicates encoding strategies.",
        technical_explanation="The size of the distinct value set $|\\text{supp}(X_j)| = |\\{x \\in X_j\\}|$. As $|\\text{supp}(X_j)| \\to n$, one-hot encoding results in extreme dimensional explosion $\\mathcal{O}(k)$ and ultra-sparse Gram matrices, triggering the curse of dimensionality.",
        why_it_matters="High-cardinality categorical variables cannot be naively one-hot encoded without crashing memory or causing severe overfitting in tree-based and linear models.",
        real_world_example=ConceptExample(
            title="Comparison of Low vs High Cardinality Columns",
            description="Comparing Gender vs Zip_Code in an insurance applicant dataset of 100,000 rows.",
            table_headers=["Feature", "Sample Values", "Unique Count (Cardinality)", "Feasible Encoding"],
            table_rows=[
                ["Gender", "Male, Female, Non-binary", "3", "One-Hot Encoding (3 columns)"],
                ["US_Zip_Code", "94103, 10001, 75001...", "28,500", "Target Encoding or Embeddings"]
            ],
            takeaway="One-hot encoding US_Zip_Code would create 28,500 new sparse columns, causing dimensional explosion."
        ),
        ml_impact="High cardinality causes decision trees to overfit to rare levels with near-zero sample sizes. One-hot encoding high-cardinality features drastically slows training.",
        common_methods=["df['col'].nunique()", "TargetEncoder()", "CatBoostEncoder()", "Frequency/Count Encoding"],
        when_to_use="When auditing categorical features to select the appropriate numerical encoding strategy.",
        when_not_to_use="Do not apply one-hot encoding if unique values exceed 20 to 50 distinct categories.",
        common_mistakes=[
            "Applying `pd.get_dummies()` to high-cardinality columns like user IDs or street addresses, exhausting RAM.",
            "Using Target Encoding without out-of-fold splitting, causing severe target leakage."
        ],
        interview_tip="How do you prevent overfitting when using Target Encoding on high-cardinality features? Apply K-Fold out-of-fold target encoding, add smoothing priors (m-estimate / Bayesian shrinkage), and inject Gaussian noise.",
        related_concepts=["categorical_data", "identifier", "feature", "data_quality"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_cardinality_1",
            question="Why is One-Hot Encoding unsuitable for a categorical column containing 15,000 unique city names?",
            options=[
                "Cities cannot be represented as strings in Python",
                "It expands the dataset by 15,000 sparse columns, causing massive memory bloat and the curse of dimensionality",
                "Machine learning algorithms can only process fewer than 100 total rows",
                "It violates the Central Limit Theorem"
            ],
            correct_option_index=1,
            explanation="Creating 15,000 new columns for each city inflates feature space enormously, leading to extreme sparsity, computational slowness, and overfitting."
        )
    ),
    EducationalConcept(
        concept_id="outlier",
        category="advanced",
        title="Outlier (Anomalous Observation)",
        short_definition="A data point that differs significantly and abnormally from the remaining observations in a dataset.",
        beginner_explanation="Imagine measuring the weight of house cats: 8 lbs, 9 lbs, 10 lbs, 11 lbs, and 500 lbs! That 500 lb entry is an outlier — it could be a typo or someone weighed a lion by mistake.",
        intermediate_explanation="An observation with an extreme residual from the central distribution. Can arise from measurement error, data corruption, or genuine rare high-impact real-world events.",
        technical_explanation="A point $x_i$ residing in a region of extremely low probability density $p(x_i) < \\epsilon$. Identified using parametric methods ($|z_i| = \\frac{|x_i - \\bar{x}|}{s} > 3$), non-parametric rank methods (Tukey's fences $[Q_1 - 1.5\\cdot\\text{IQR}, Q_3 + 1.5\\cdot\\text{IQR}]$), or multivariate distances (Mahalanobis distance $D_M(x) = \\sqrt{(x - \\mu)^T \\Sigma^{-1} (x - \\mu)}$).",
        why_it_matters="Outliers heavily distort parametric statistics (Mean, Variance, Covariance), drag linear regression lines, and mislead gradient descent.",
        real_world_example=ConceptExample(
            title="House Price Distribution with a Billionaire Mansion",
            description="Observing neighborhood property transaction prices.",
            table_headers=["Listing", "Price", "Classification"],
            table_rows=[
                ["House 1", "$280,000", "Normal"],
                ["House 2", "$310,000", "Normal"],
                ["House 3", "$295,000", "Normal"],
                ["House 4", "$340,000", "Normal"],
                ["Mega-Mansion", "$45,000,000", "Extreme Outlier"]
            ],
            takeaway="The mega-mansion pulls the average up to $9.2M, masking the reality of the $300k neighborhood."
        ),
        ml_impact="Linear models with squared loss $(y - \\hat{y})^2$ penalize large errors quadratically, giving a single outlier immense leverage over model weights.",
        common_methods=["IsolationForest()", "Tukey IQR Fence", "RobustScaler()", "np.clip() / Winsorization", "Huber Loss"],
        when_to_use="When auditing data distributions for corruption, sensor malfunction, or rare anomaly detection (e.g. fraud detection).",
        when_not_to_use="Do not blindly delete all outliers; in domains like fraud detection or cybersecurity, the outliers are the exact targets of interest.",
        common_mistakes=[
            "Automatically dropping all rows flagged as outliers without understanding their business origin.",
            "Applying Z-score outlier detection to heavily skewed, non-normal distributions."
        ],
        interview_tip="How do you handle outliers without discarding data rows? Use robust scaling (`RobustScaler`), winsorization/clipping (capping values at the 1st and 99th percentiles), or use Huber loss which switches from quadratic to linear penalty for large errors.",
        related_concepts=["iqr", "skewness", "mean", "median", "standard_deviation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_outlier_1",
            question="Why does ordinary least squares (OLS) linear regression give disproportionately high leverage to extreme outliers?",
            options=[
                "OLS minimizes squared errors $(y - \\hat{y})^2$, so an error of 100 incurs a penalty of 10,000, pulling the fitted line toward the outlier",
                "OLS only works when all numbers are between 0 and 1",
                "Outliers are converted to null values during regression",
                "Matrix inversion fails whenever any number is greater than 1,000"
            ],
            correct_option_index=0,
            explanation="The quadratic penalty in squared loss $(e^2)$ forces the regression line to bend heavily toward distant outliers to minimize their huge squared residual."
        )
    )
]
