"""Data Quality Educational Concepts."""
from typing import List
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

DATA_QUALITY_CONCEPTS: List[EducationalConcept] = [
    EducationalConcept(
        concept_id="missing_values",
        category="data_quality",
        title="Missing Values (Nulls / NaNs)",
        short_definition="The absence of recorded data values for specific variables in an observation.",
        beginner_explanation="Imagine taking a survey where someone skipped the question about their annual income. That empty blank space is a missing value. In Python, it is usually represented as NaN (Not a Number) or None.",
        intermediate_explanation="Data points that are unrecorded, corrupted, or not applicable. Missing data is classified into three statistical mechanisms: Missing Completely at Random (MCAR), Missing at Random (MAR), and Missing Not at Random (MNAR).",
        technical_explanation="Null entries violating the completeness assumption of the sample tensor $X$. For an observation $x_i$, $x_{ij} = \\text{NaN}$. Handling depends on whether $P(M | Y, X) = P(M)$ (MCAR), $P(M | Y, X) = P(M | X)$ (MAR), or $P(M | Y, X)$ depends on unobserved values (MNAR).",
        why_it_matters="Most machine learning libraries (including standard Scikit-Learn estimators like LinearRegression, SVM, and basic neural nets) crash immediately when encountering NaN values during training or inference.",
        real_world_example=ConceptExample(
            title="Classroom Test Scores with Skipped Fields",
            description="Student B did not provide their age during exam registration.",
            table_headers=["Student", "Age", "Score"],
            table_rows=[
                ["A", "20", "85"],
                ["B", "— (Missing)", "72"],
                ["C", "21", "91"]
            ],
            takeaway="Student B has a valid test score of 72, but their age is absent and must be addressed before mathematical modeling."
        ),
        ml_impact="NaN values prevent matrix dot-products and gradient computations. Naively dropping rows can discard valuable training data or introduce severe sampling bias if missingness is non-random.",
        common_methods=["SimpleImputer(strategy='median')", "SimpleImputer(strategy='mean')", "KNNImputer()", "df.dropna()", "IterativeImputer()"],
        when_to_use="When inspecting data completeness and deciding between row dropping, column removal, or statistical imputation.",
        when_not_to_use="Do not blindly impute values with mean or median if the missingness rate exceeds 70-80%; dropping the feature is often safer.",
        common_mistakes=[
            "Computing mean/median on the entire dataset before train-test splitting (causing data leakage).",
            "Imputing skewed numeric features with the mean instead of the median.",
            "Assuming missing values are always encoded as NaN, ignoring placeholder values like -999, '?', or 'Unknown'."
        ],
        interview_tip="How do MCAR, MAR, and MNAR differ? MCAR means missingness is pure noise; MAR means missingness depends on other observed features; MNAR means the probability of missingness depends on the unobserved value itself (e.g. high earners omitting income).",
        related_concepts=["mean", "median", "dataset", "data_quality", "imputation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_missing_1",
            question="Which statistical mechanism describes a scenario where wealthy individuals are systematically less likely to report their income on a survey?",
            options=[
                "Missing Completely at Random (MCAR)",
                "Missing at Random (MAR)",
                "Missing Not at Random (MNAR)",
                "Uniform Random Dropout (URD)"
            ],
            correct_option_index=2,
            explanation="When the missingness depends on the value of the missing variable itself (the high income), it is Missing Not at Random (MNAR), which introduces substantial bias if simply imputed."
        )
    ),
    EducationalConcept(
        concept_id="duplicate_records",
        category="data_quality",
        title="Duplicate Records",
        short_definition="Multiple rows in a dataset that contain identical or near-identical values across all or key identifying attributes.",
        beginner_explanation="Imagine an order form submitted twice by accident because someone clicked the 'Submit Order' button two times. You now have two identical rows for the exact same order.",
        intermediate_explanation="Redundant instances in the dataset resulting from repeated data extraction, pipeline retries, logging glitches, or merged sources without unique constraint deduplication.",
        technical_explanation="Rows $x_i, x_j$ such that $\\|x_i - x_j\\| = 0$ across all measured dimensions, or identical on a subset of candidate keys $\\mathcal{K}$. This artificially contracts variance estimates and inflates empirical likelihood weights.",
        why_it_matters="Duplicates artificially inflate the importance of specific data points. If a duplicate row ends up in both the training set and the test set, the model effectively memorizes the test answer, reporting falsely inflated accuracy.",
        real_world_example=ConceptExample(
            title="Duplicate Customer Registration Event",
            description="User Rahul is logged twice with identical details due to a frontend network retry.",
            table_headers=["ID", "Name", "Age", "City"],
            table_rows=[
                ["101", "Rahul", "22", "Seattle"],
                ["102", "Priya", "21", "Austin"],
                ["101", "Rahul", "22", "Seattle"]
            ],
            takeaway="Row 1 and Row 3 are complete duplicates. Keeping both biases customer counts and training data."
        ),
        ml_impact="Causes severe data leakage between cross-validation folds. If identical rows exist in both train and validation splits, validation metrics will be falsely optimistic.",
        common_methods=["df.duplicated()", "df.drop_duplicates(keep='first')", "df.drop_duplicates(subset=['id'])"],
        when_to_use="During initial data hygiene and deduplication before running train/test partitioning.",
        when_not_to_use="Do not drop rows that share attributes if they genuinely represent distinct events (e.g., identical repeated transactions by different users when timestamps or transaction IDs were omitted).",
        common_mistakes=[
            "Splitting into train and test sets before removing duplicate rows, causing hidden test leakage.",
            "Dropping duplicates based on all columns when a legitimate primary key indicates distinct transactions."
        ],
        interview_tip="How can duplicate rows cause data leakage in cross-validation? Identical observations partitioned into both train and validation splits allow the model to score high by memorization rather than generalization.",
        related_concepts=["row", "dataset", "data_quality", "observation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_dup_1",
            question="What is the primary danger of having identical duplicate rows in a machine learning workflow?",
            options=[
                "The training loss becomes mathematically undefined",
                "Data leakage across train/validation splits produces overly optimistic evaluation metrics",
                "Memory consumption is halved automatically",
                "Scikit-learn refuses to compile tree-based algorithms"
            ],
            correct_option_index=1,
            explanation="When identical rows are distributed between train and test splits, the test set ceases to be an independent holdout, creating false confidence in model performance."
        )
    ),
    EducationalConcept(
        concept_id="constant_features",
        category="data_quality",
        title="Constant Features (Zero-Variance Columns)",
        short_definition="Columns in a dataset that contain the exact same single value for 100% of the observations.",
        beginner_explanation="Imagine an entrance exam where every single applicant has 'Country of Residence: Earth'. Because everyone has the exact same value, knowing it gives you zero clue about who will pass or fail.",
        intermediate_explanation="A feature whose empirical variance $\\sigma^2 = 0$. Because it does not vary across samples, it provides zero mutual information with any target variable.",
        technical_explanation="A column vector $x_{\\cdot j}$ where $\\mathrm{Var}(x_{\\cdot j}) = 0$. For linear models, including a constant column alongside an intercept term causes exact multicollinearity and makes the Gram matrix $X^T X$ singular (non-invertible).",
        why_it_matters="Constant features consume memory, slow down computations, and can cause linear models and matrix inversions to fail due to singularity. They provide zero predictive power.",
        real_world_example=ConceptExample(
            title="Single-State Real Estate Listings",
            description="A dataset of apartment rentals where all listings are located in the state of California.",
            table_headers=["Apartment_ID", "Rent", "Bedrooms", "State"],
            table_rows=[
                ["A101", "$2,400", "2", "CA"],
                ["A102", "$1,850", "1", "CA"],
                ["A103", "$3,100", "3", "CA"]
            ],
            takeaway="The 'State' column provides zero variance and zero distinguishing power for predicting rent."
        ),
        ml_impact="Adds uninformative dimensions to feature space. Causes singular matrix errors during OLS regression and wastes computation in tree-based split calculations.",
        common_methods=["sklearn.feature_selection.VarianceThreshold(threshold=0.0)", "df.drop(columns=[col for col in df if df[col].nunique() <= 1])"],
        when_to_use="During automated feature screening to discard useless, zero-information columns.",
        when_not_to_use="Do not drop columns that are constant in a small batch or subset if they genuinely vary in the global population.",
        common_mistakes=[
            "Retaining constant features because of a belief that domain knowledge requires them.",
            "Failing to check for constant columns after filtering a dataset by a specific category."
        ],
        interview_tip="What happens to the OLS solution $(X^T X)^{-1} X^T y$ if a constant feature is included when an intercept column is already present? The matrix $X^T X$ becomes singular (determinant zero), making direct inversion impossible.",
        related_concepts=["near_constant_features", "variance", "feature", "column"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_constant_1",
            question="What is the variance of a feature that contains the value 42 across all 10,000 rows?",
            options=[
                "42",
                "1.0",
                "0.0",
                "Undefined"
            ],
            correct_option_index=2,
            explanation="Variance measures dispersion around the mean. When every value is 42, the mean is 42, and the squared deviation $(42 - 42)^2$ is 0 for every row."
        )
    ),
    EducationalConcept(
        concept_id="near_constant_features",
        category="data_quality",
        title="Near-Constant Features (Quasi-Constant Columns)",
        short_definition="Columns where almost all observations (e.g. >99%) share the same value, with only an extremely small number of exceptions.",
        beginner_explanation="Imagine a survey where 999 out of 1,000 people answered 'No' and only 1 person answered 'Yes'. Almost every row is identical, meaning the feature almost never changes.",
        intermediate_explanation="Features with extremely low variance or extreme class imbalance (e.g. 99.5% majority class ratio). They carry minimal predictive signal and risk severe overfitting.",
        technical_explanation="A feature $x_j$ where the frequency of the mode $f_{\\text{mode}} / n > 1 - \\epsilon$ (typically $\\epsilon \\le 0.01$). In cross-validation splits, the rare minority values may never appear in test folds, causing extreme generalization variance.",
        why_it_matters="Near-constant features can mislead algorithms into creating brittle split rules that overfit to 1 or 2 outlier records in the training set.",
        real_world_example=ConceptExample(
            title="Online Banking Security Flags",
            description="A security flag column where 9,990 out of 10,000 transactions are 'Normal'.",
            table_headers=["Transaction_ID", "Amount", "Flag_Code"],
            table_rows=[
                ["TX-1001", "$45.00", "0"],
                ["TX-1002", "$120.00", "0"],
                ["TX-1003", "$18.50", "0"],
                ["TX-9999", "$500.00", "1"]
            ],
            takeaway="Over 99.9% of transactions have Flag_Code 0. The rare 1 may cause a decision tree to split prematurely."
        ),
        ml_impact="Can cause models to learn spurious relationships or fail cross-validation stability checks when minority values fail to appear in test folds.",
        common_methods=["VarianceThreshold(threshold=0.01)", "df[col].value_counts(normalize=True)"],
        when_to_use="During automated feature hygiene to identify columns that provide almost no discriminative variance.",
        when_not_to_use="Do not drop near-constant features if the rare value represents a critical target-related event (e.g., rare disease biomarker or fraud indicator).",
        common_mistakes=[
            "Dropping rare event indicator flags without checking if they correlate 100% with a rare positive target label.",
            "Keeping hundreds of quasi-constant one-hot encoded dummy variables that inflate dimensionality without signal."
        ],
        interview_tip="How do you decide whether to drop a near-constant feature? Check its mutual information or correlation with the target. If it only correlates with random noise, drop it; if it acts as a strong indicator of a rare target class, preserve it.",
        related_concepts=["constant_features", "variance", "cardinality", "feature"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_near_constant_1",
            question="When should you NOT drop a feature that is 99.8% constant?",
            options=[
                "When the dataset has more than 100 columns",
                "When the 0.2% rare cases strongly correlate with a critical target event (such as rare fraud)",
                "When training a linear regression model",
                "When converting the data to CSV"
            ],
            correct_option_index=1,
            explanation="If the rare variation directly signals the target outcome (e.g., fraud flag or rare defect), it contains high information density and must be preserved."
        )
    )
]
