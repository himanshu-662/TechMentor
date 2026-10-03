"""Data Fundamentals Educational Concepts."""
from typing import List
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

DATA_FUNDAMENTALS_CONCEPTS: List[EducationalConcept] = [
    EducationalConcept(
        concept_id="dataset",
        category="data_fundamentals",
        title="Dataset",
        short_definition="A structured collection of data organized into rows and columns, typically representing real-world entities and their attributes.",
        beginner_explanation="Think of a dataset like an organized digital spreadsheet or binder. Every page or table holds information about a specific topic, like a roster of students where everyone's details are kept in neat grids.",
        intermediate_explanation="In data science, a tabular dataset is a two-dimensional matrix $X$ of dimensions $n \\times p$, where $n$ represents sample observations and $p$ represents measurement variables or attributes.",
        technical_explanation="A structured relational or array-based data construct represented in memory as a contiguous block or columnar store (e.g. Pandas DataFrame, Apache Arrow table), facilitating vector-matrix linear algebra operations.",
        why_it_matters="A clean, well-formed dataset is the foundational prerequisite for all statistical inference, visual exploration, and machine learning model training.",
        real_world_example=ConceptExample(
            title="E-commerce Customer Roster",
            description="A table recording customer IDs, ages, signup dates, and purchase totals.",
            table_headers=["customer_id", "age", "signup_date", "total_spend"],
            table_rows=[
                ["C001", "29", "2023-01-15", "$145.20"],
                ["C002", "42", "2023-02-01", "$890.50"],
                ["C003", "35", "2023-03-10", "$54.00"]
            ],
            takeaway="All rows share identical column definitions, providing consistency across all records."
        ),
        ml_impact="Machine learning algorithms require uniformly shaped matrices. Structural corruption, inconsistent delimiters, or jagged arrays cause immediate pipeline failure.",
        common_methods=["pandas.read_csv()", "pandas.read_excel()", "polars.read_csv()", "sql.connect()"],
        when_to_use="When gathering empirical measurements or historical records for analytical modeling.",
        when_not_to_use="Do not force highly unstructured multi-modal streams (like raw video feeds) into flat tabular datasets without prior feature extraction.",
        common_mistakes=[
            "Assuming all CSV files have standard UTF-8 encoding and comma delimiters.",
            "Modifying the original raw dataset directly instead of keeping an immutable raw copy."
        ],
        interview_tip="Interviewers often ask how you handle datasets larger than memory. Discuss chunking, memory-mapped files, and columnar formats like Parquet.",
        related_concepts=["row", "column", "observation", "feature", "data_type"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_dataset_1",
            question="What are the standard dimensions of a 2D tabular dataset containing 500 records and 12 attributes?",
            options=[
                "12 rows by 500 columns",
                "500 rows by 12 columns",
                "500 rows by 500 columns",
                "12 rows by 12 columns"
            ],
            correct_option_index=1,
            explanation="Tabular datasets conventionally represent observations (records) as rows (500) and attributes as columns (12)."
        )
    ),
    EducationalConcept(
        concept_id="row",
        category="data_fundamentals",
        title="Row (Record)",
        short_definition="A single horizontal entry in a dataset representing all measured properties of one specific entity or occurrence.",
        beginner_explanation="A row is like a single ID card or medical chart for one individual patient. Everything written across that row belongs exclusively to that person.",
        intermediate_explanation="Each row constitutes an individual instance or record in the sample space, encapsulating a vector of attribute values across all features.",
        technical_explanation="A 1D vector $x_i = [x_{i1}, x_{i2}, \\dots, x_{ip}]^T$ representing a single coordinate in $p$-dimensional feature space $\\mathbb{R}^p$.",
        why_it_matters="Rows determine sample size ($n$). More high-quality rows generally provide greater statistical power and allow models to generalize better.",
        real_world_example=ConceptExample(
            title="Single Patient Record",
            description="One horizontal slice of a hospital admissions dataset.",
            table_headers=["patient_id", "heart_rate", "systolic_bp", "admitted"],
            table_rows=[
                ["P-9801", "72", "120", "No"]
            ],
            takeaway="All values across this single row characterize patient P-9801 at the time of observation."
        ),
        ml_impact="Models compute loss gradients over batches of rows. Dropping or duplicating rows alters the empirical sample distribution.",
        common_methods=["df.iloc[i]", "df.iterrows()", "df.drop_duplicates()", "df.dropna(axis=0)"],
        when_to_use="When analyzing, filtering, or scoring individual transactions or entities.",
        when_not_to_use="Do not iterate row-by-row using Python loops (`for row in df`) for computations; always leverage vectorized operations.",
        common_mistakes=[
            "Treating consecutive rows as independent when working with time-series or repeated measures.",
            "Iterating through DataFrame rows with for-loops instead of vectorized operations."
        ],
        interview_tip="Why is vectorization faster than iterating through rows in Pandas? (Pandas vectorization utilizes underlying C arrays and SIMD instructions).",
        related_concepts=["dataset", "observation", "column", "duplicate_records"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_row_1",
            question="Why should you avoid iterating over DataFrame rows using a standard Python `for` loop?",
            options=[
                "Python does not support row indexing",
                "Row loops bypass vectorization and run dramatically slower in Python than in compiled C",
                "Looping over rows permanently deletes data from the DataFrame",
                "Rows can only be accessed using SQL queries"
            ],
            correct_option_index=1,
            explanation="Vectorized Pandas operations execute compiled C-level code and SIMD instructions, which can be orders of magnitude faster than iterating in Python bytecode."
        )
    ),
    EducationalConcept(
        concept_id="column",
        category="data_fundamentals",
        title="Column (Field)",
        short_definition="A vertical grouping in a dataset containing values for a single specific measurement or attribute across all records.",
        beginner_explanation="A column is like a single question on a survey (such as 'What is your age?'). Every person's answer to that question is stacked vertically under that column heading.",
        intermediate_explanation="A homogeneous series of data points representing a specific variable. In tabular processing, columns define the dimensionality of the dataset.",
        technical_explanation="A contiguous 1D array or Series of uniform primitive data type (e.g. int64, float64, categorical) sharing a memory buffer and statistical properties.",
        why_it_matters="Data transformations, type casting, scaling, and missing-value imputations are performed on a per-column basis.",
        real_world_example=ConceptExample(
            title="House Pricing Attributes",
            description="The 'Square_Feet' column collects one specific dimension for multiple houses.",
            table_headers=["House_ID", "Square_Feet", "Neighborhood"],
            table_rows=[
                ["H1", "1450", "Northside"],
                ["H2", "2100", "Downtown"],
                ["H3", "1820", "West End"]
            ],
            takeaway="The Square_Feet column holds the same physical metric across all houses."
        ),
        ml_impact="Each column typically corresponds to an input feature or label. High numbers of columns increase the curse of dimensionality.",
        common_methods=["df['column_name']", "df.dtypes", "df.describe()", "df.drop(columns=[...])"],
        when_to_use="When inspecting univariate distribution, statistical properties, or applying column-wise transformations.",
        when_not_to_use="Do not mix multiple heterogeneous concepts into a single column (e.g., storing 'City, State' as one unparsed text string).",
        common_mistakes=[
            "Mixing numbers and text strings in the same column, forcing Pandas into an inefficient `object` dtype.",
            "Forgetting to drop redundant or leaked columns before training a model."
        ],
        interview_tip="Explain columnar storage (e.g. Parquet) vs row-based storage (CSV). Columnar stores drastically accelerate analytical queries that select only subsets of columns.",
        related_concepts=["dataset", "row", "feature", "data_type", "constant_features"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_column_1",
            question="What is the consequence of placing a text string like 'N/A' into a numeric column in Pandas?",
            options=[
                "Pandas automatically converts 'N/A' into a float 0.0",
                "Pandas will cast the entire column into an `object` dtype, disabling numeric calculations",
                "The column will be deleted automatically",
                "The DataFrame will throw a syntax error and refuse to load"
            ],
            correct_option_index=1,
            explanation="A single string entry in an otherwise numeric column forces Pandas to assign the `object` data type, breaking numeric computations like mean and standard deviation."
        )
    ),
    EducationalConcept(
        concept_id="feature",
        category="data_fundamentals",
        title="Feature (Independent Variable)",
        short_definition="An individual measurable property or characteristic of a phenomenon being observed, used as an input to predict a target outcome.",
        beginner_explanation="Features are the clues or hints you give to an algorithm. For example, if you want an AI to guess house prices, features are the clues like number of bedrooms, square footage, and location.",
        intermediate_explanation="An explanatory or independent variable (often denoted as $X$) fed into a machine learning model to estimate an outcome or target variable ($y$).",
        technical_explanation="A coordinate axis in the $p$-dimensional input space $\\mathcal{X} \\subseteq \\mathbb{R}^p$. Feature engineering maps raw inputs into informative representations $\\phi(x)$.",
        why_it_matters="Model performance is strictly bounded by feature quality. Informative, low-noise features enable simpler models to achieve superior accuracy.",
        real_world_example=ConceptExample(
            title="Loan Approval Prediction",
            description="Features used by a credit scoring algorithm to evaluate a borrower.",
            table_headers=["Credit_Score", "Annual_Income", "Debt_To_Income", "Loan_Approved (Target)"],
            table_rows=[
                ["720", "$85,000", "0.22", "Yes"],
                ["580", "$32,000", "0.65", "No"]
            ],
            takeaway="Credit_Score, Annual_Income, and Debt_To_Income are input features; Loan_Approved is the target."
        ),
        ml_impact="Irrelevant, noisy, or collinear features degrade generalization, increase variance, and slow down training time.",
        common_methods=["sklearn.feature_selection", "StandardScaler()", "OneHotEncoder()", "PCA()"],
        when_to_use="When identifying which measurable signals correlate meaningfully with the target.",
        when_not_to_use="Do not include identifier keys, post-event signals (data leakage), or constant values as features.",
        common_mistakes=[
            "Data leakage: using a feature that is only created after the event being predicted has already happened.",
            "Believing that feeding more features always improves model performance."
        ],
        interview_tip="What is data leakage in feature engineering? Give an example: including 'cancellation_date' when predicting whether a subscriber will churn.",
        related_concepts=["column", "target", "observation", "identifier", "cardinality"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_feature_1",
            question="Which of the following represents a classic case of feature data leakage?",
            options=[
                "Including the customer's account age measured at signup",
                "Including 'refund_amount' when predicting whether a purchase will be returned",
                "Including customer zip code",
                "Normalizing numerical features with standard scaling"
            ],
            correct_option_index=1,
            explanation="'refund_amount' is only determined after a purchase has already been returned. Including it allows the model to cheat during training, failing on new live data."
        )
    ),
    EducationalConcept(
        concept_id="target",
        category="data_fundamentals",
        title="Target (Dependent Variable / Label)",
        short_definition="The outcome or variable that a supervised machine learning model is trained to predict.",
        beginner_explanation="The target is the answer on the back of the flashcard. It is the exact question you want your AI to answer, such as 'Will this patient get sick: Yes or No?'.",
        intermediate_explanation="The ground-truth dependent variable ($y$) in supervised learning. It can be categorical (for classification) or continuous (for regression).",
        technical_explanation="The response variable $y \\in \\mathcal{Y}$. The supervised learning objective seeks a hypothesis function $f: \\mathcal{X} \\to \\mathcal{Y}$ that minimizes expected empirical risk $\\mathbb{E}[L(f(X), Y)]$.",
        why_it_matters="Without a well-defined target variable, supervised learning cannot take place. Label quality, distribution, and balance dictate model objective functions.",
        real_world_example=ConceptExample(
            title="Spam Filtering",
            description="The target specifies whether an email is spam or legitimate.",
            table_headers=["email_subject", "sender_reputation", "is_spam (Target)"],
            table_rows=[
                ["Claim your million dollar prize!", "0.02", "1 (Spam)"],
                ["Project status update meeting", "0.98", "0 (Not Spam)"]
            ],
            takeaway="'is_spam' is the ground-truth label the classifier strives to predict for incoming emails."
        ),
        ml_impact="Severe target class imbalance requires specialized loss weighting, focal loss, or sampling techniques (SMOTE). Noisy target labels place a ceiling on model performance.",
        common_methods=["train_test_split(X, y)", "LabelEncoder()", "class_weight='balanced'", "SMOTE"],
        when_to_use="Whenever formulating a supervised machine learning problem (regression or classification).",
        when_not_to_use="Do not specify a target variable when performing unsupervised learning tasks like clustering or anomaly detection.",
        common_mistakes=[
            "Leaving the target variable inside the feature matrix $X$ during model training.",
            "Evaluating imbalanced classification targets using raw accuracy instead of PR-AUC, F1-score, or ROC-AUC."
        ],
        interview_tip="How do you handle severe class imbalance in a target variable? Discuss evaluation metric selection (PR-AUC over ROC-AUC), stratified splitting, cost-sensitive learning, and threshold tuning.",
        related_concepts=["feature", "dataset", "observation", "data_type"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_target_1",
            question="Why is accuracy a misleading evaluation metric when predicting a target with 99% negative and 1% positive cases?",
            options=[
                "Accuracy is only usable on regression problems",
                "A naive model predicting 'Negative' 100% of the time achieves 99% accuracy while detecting zero positive cases",
                "Accuracy calculation requires dividing by zero on imbalanced datasets",
                "Scikit-learn refuses to calculate accuracy for binary targets"
            ],
            correct_option_index=1,
            explanation="A model that predicts the majority class for every instance will achieve 99% accuracy while having zero recall on the class of interest."
        )
    ),
    EducationalConcept(
        concept_id="observation",
        category="data_fundamentals",
        title="Observation (Instance / Sample)",
        short_definition="A concrete realization or measurement taken from a single subject, experimental trial, or entity in the real world.",
        beginner_explanation="An observation is one single measurement event. For instance, stepping on a scale at 8:00 AM and recording your weight is one observation.",
        intermediate_explanation="A single data point sampled from an underlying population distribution. In machine learning, observations form the training, validation, and test splits.",
        technical_explanation="A realization $\\omega_i \\sim \\mathcal{D}$ drawn from probability distribution $\\mathcal{D}$. Statistical inference relies on the assumption of independent and identically distributed (i.i.d.) observations.",
        why_it_matters="Violations of sample independence (e.g. repeated observations from the same patient across splits) lead to overly optimistic validation metrics that collapse in production.",
        real_world_example=ConceptExample(
            title="Weather Station Telemetry",
            description="Measurements recorded by a sensor at a specific timestamp.",
            table_headers=["Station_ID", "Timestamp", "Temperature_C", "Humidity_Pct"],
            table_rows=[
                ["WS-01", "2024-06-01 12:00:00", "28.4", "65%"]
            ],
            takeaway="This specific reading at 12:00 constitutes one distinct sensor observation."
        ),
        ml_impact="Observations must be split into train and test sets using appropriate grouping (e.g. GroupKFold) if multiple observations belong to the same entity.",
        common_methods=["sklearn.model_selection.GroupKFold", "train_test_split", "StratifiedKFold"],
        when_to_use="When assessing sample independence, statistical sampling validity, and grouping criteria.",
        when_not_to_use="Do not treat longitudinal or time-series observations as independent random samples.",
        common_mistakes=[
            "Randomly shuffling and splitting observations that contain grouped entities, causing data leakage between train and test sets.",
            "Confusing an observation with an entire dataset."
        ],
        interview_tip="Explain why standard K-Fold cross-validation fails on grouped patient observations. (Random splitting places visits from the same patient into both train and test folds, memorizing patient-specific patterns).",
        related_concepts=["row", "dataset", "feature", "target"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_observation_1",
            question="If a dataset contains 5 hospital visits for each of 100 patients, which splitting strategy must be used to validate model generalization to new patients?",
            options=[
                "Random Train-Test Split",
                "Group K-Fold split grouped by Patient ID",
                "K-Means clustering split",
                "Sort by visit date and take the first 50 rows"
            ],
            correct_option_index=1,
            explanation="GroupKFold ensures that all observations for any given patient reside strictly in either the train set or test set, preventing patient-specific leakage."
        )
    ),
    EducationalConcept(
        concept_id="data_type",
        category="data_fundamentals",
        title="Data Type (dtype)",
        short_definition="The classification of data items that tells the computer what type of value it holds and what mathematical or logical operations can be performed on it.",
        beginner_explanation="Just like in real life where you can add numbers together ($5 + 5 = 10$) but you can't subtract a word from a color, data types tell the computer what rules apply to each piece of information.",
        intermediate_explanation="The internal computational format assigned to a column (e.g., int64, float32, bool, datetime64, category, object), dictating memory footprint and allowed operations.",
        technical_explanation="The specification of bit allocation and algebraic structure for memory words (e.g. IEEE 754 floating point vs two's complement integer), determining numerical precision and vector register suitability.",
        why_it_matters="Incorrect data types cause subtle bugs (e.g. string concatenation `'10' + '20' = '1020'` instead of arithmetic addition `30`), massive memory bloat, and failed pipeline stages.",
        real_world_example=ConceptExample(
            title="Zip Code Data Type Confusion",
            description="Storing postal codes as numbers drops leading zeros.",
            table_headers=["Customer", "Zip_as_Integer", "Zip_as_String"],
            table_rows=[
                ["Boston Citizen", "2138", "'02138'"],
                ["Trenton Citizen", "8608", "'08608'"]
            ],
            takeaway="Zip codes must be stored as categorical strings; treating them as integers truncates essential leading zeros."
        ),
        ml_impact="ML algorithms require numerical dtypes (int, float). Categorical and string dtypes must be properly encoded before model ingestion.",
        common_methods=["df.dtypes", "df.astype()", "pd.to_numeric()", "pd.to_datetime()"],
        when_to_use="During the initial data audit to verify that dates, numbers, and categories are stored in their native representations.",
        when_not_to_use="Do not leave columns as generic `object` dtype when they can be represented as specific types like category or datetime.",
        common_mistakes=[
            "Leaving postal codes or phone numbers as integers, corrupting values with leading zeros.",
            "Using default float64 and int64 for massive datasets instead of downcasting to float32 or int16."
        ],
        interview_tip="How do you reduce the memory usage of a large Pandas DataFrame? Downcast numeric types (e.g. float64 to float32), convert low-cardinality strings to `category`, and parse timestamps.",
        related_concepts=["numerical_data", "categorical_data", "datetime_data", "identifier", "column"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_datatype_1",
            question="What happens when a zip code like '01234' is parsed as a standard 64-bit integer?",
            options=[
                "It retains its exact text representation",
                "The leading zero is stripped, corrupting the code to '1234'",
                "Pandas throws an unrecoverable fatal error",
                "The integer is automatically converted to hexadecimal"
            ],
            correct_option_index=1,
            explanation="Integers have no concept of leading zeros; mathematically 01234 equals 1234. Identifiers like zip codes must always be stored as string/categorical types."
        )
    )
]
