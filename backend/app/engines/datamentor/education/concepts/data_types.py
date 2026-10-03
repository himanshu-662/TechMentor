"""Data Types Educational Concepts."""
from typing import List
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

DATA_TYPES_CONCEPTS: List[EducationalConcept] = [
    EducationalConcept(
        concept_id="numerical_data",
        category="data_types",
        title="Numerical Data (Quantitative)",
        short_definition="Data expressed as numbers on which meaningful mathematical operations like addition, subtraction, and averaging can be performed.",
        beginner_explanation="Think of anything you can measure with a ruler, scale, or stopwatch. Your height, bank account balance, or car speed are all numerical values because doing math on them makes sense (e.g. $100 is twice as much as $50).",
        intermediate_explanation="Quantitative measurements divided into continuous (real-valued measurements like temperature or revenue) and discrete (integer counts like number of children or store visits).",
        technical_explanation="Variables taking values in a subset of $\\mathbb{R}$ or $\\mathbb{Z}$. They exhibit metric properties enabling standard Euclidean distance metrics $\\sqrt{\\sum (x_i - y_i)^2}$, scalar multiplication, and parametric moment estimation.",
        why_it_matters="Most machine learning algorithms are mathematical optimization solvers that operate exclusively on continuous vectors. Understanding their scale, distribution, and outliers dictates necessary scaling transformations.",
        real_world_example=ConceptExample(
            title="House Specifications",
            description="Numeric measurements of living space and bedroom count.",
            table_headers=["House_ID", "Price ($)", "Square_Feet", "Bedrooms"],
            table_rows=[
                ["H-1", "350000", "1800.5", "3"],
                ["H-2", "420000", "2250.0", "4"],
                ["H-3", "295000", "1420.0", "2"]
            ],
            takeaway="Price and Square_Feet are continuous numeric; Bedrooms is discrete count numeric."
        ),
        ml_impact="Distance-based algorithms (KNN, SVM, K-Means) and gradient descent are sensitive to numerical feature scaling. Unscaled numeric features cause large-magnitude columns to dominate model updates.",
        common_methods=["StandardScaler()", "MinMaxScaler()", "RobustScaler()", "np.log1p()"],
        when_to_use="When representing measurable amounts, counts, or continuous physical quantities.",
        when_not_to_use="Do not treat numeric codes that represent categories (like Region Code 1, 2, 3) as raw quantitative numbers.",
        common_mistakes=[
            "Failing to scale numeric features before training distance-sensitive algorithms like KNN or Ridge/Lasso regression.",
            "Ignoring severe skewness in numeric variables before fitting linear models."
        ],
        interview_tip="Why is feature scaling essential for Gradient Descent and KNN, but irrelevant for Decision Trees? Gradient descent step sizes and Euclidean distances depend directly on coordinate magnitudes; tree splits only depend on ordinal rank order.",
        related_concepts=["mean", "median", "standard_deviation", "data_type", "categorical_data"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_num_1",
            question="Which machine learning model is naturally invariant to monotonic feature scaling on numerical data?",
            options=[
                "K-Nearest Neighbors (KNN)",
                "Support Vector Machine with RBF Kernel",
                "Decision Tree Classifier",
                "Ridge Regression"
            ],
            correct_option_index=2,
            explanation="Decision trees evaluate split thresholds based purely on the ordering of values along an axis, making them invariant to monotonic scaling transformations."
        )
    ),
    EducationalConcept(
        concept_id="categorical_data",
        category="data_types",
        title="Categorical Data (Qualitative)",
        short_definition="Variables that take on values from a finite, distinct set of groups, labels, or classes.",
        beginner_explanation="Think of questions where you pick from a list of options: your favorite color (Red, Green, Blue), shirt size (Small, Medium, Large), or your city. Doing arithmetic like 'Red + Blue' doesn't produce a number.",
        intermediate_explanation="Qualitative variables divided into nominal categories (no intrinsic ordering, e.g. blood type or marital status) and ordinal categories (clear inherent hierarchy, e.g. customer ratings: Poor, Fair, Good, Excellent).",
        technical_explanation="Variables taking values in a discrete finite set $\\mathcal{C} = \\{c_1, c_2, \\dots, c_k\\}$. Nominal categories have no metric structure; ordinal categories preserve a partial order $c_i \\prec c_j$. Models require mapping to numerical coordinates via dummy encoding or embeddings.",
        why_it_matters="Machine learning equations cannot multiply a text string like 'Toyota' by a weight matrix. They must be encoded into numbers (One-Hot, Ordinal, or Target Encoding) without inventing false mathematical relationships.",
        real_world_example=ConceptExample(
            title="Customer Survey Feedback",
            description="Nominal and ordinal responses collected from app users.",
            table_headers=["User_ID", "Subscription_Tier (Ordinal)", "Operating_System (Nominal)"],
            table_rows=[
                ["U1", "Free", "iOS"],
                ["U2", "Premium", "Android"],
                ["U3", "Enterprise", "Windows"]
            ],
            takeaway="Subscription Tier has a natural rank order (Free < Premium < Enterprise); Operating System does not."
        ),
        ml_impact="Encoding nominal features with simple integer encoding (e.g., Red=1, Green=2, Blue=3) implies an artificial mathematical ranking (Blue > Red) that degrades linear and distance-based models.",
        common_methods=["OneHotEncoder()", "OrdinalEncoder()", "TargetEncoder()", "pd.get_dummies()"],
        when_to_use="When representing discrete groups, qualitative states, or grouped demographics.",
        when_not_to_use="Do not one-hot encode high-cardinality categorical variables with thousands of unique values (e.g., user IDs), as this causes massive sparse matrix explosion.",
        common_mistakes=[
            "Using Ordinal Encoding on nominal data with no natural hierarchy, deceiving linear models.",
            "One-hot encoding a column with 10,000 unique categories, exploding memory and causing the curse of dimensionality."
        ],
        interview_tip="How do you encode high-cardinality categorical features without exploding dimensionality? Discuss Target Encoding (with out-of-fold regularization), Frequency/Count Encoding, or Entity Embeddings.",
        related_concepts=["cardinality", "numerical_data", "data_type", "identifier"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_cat_1",
            question="What is the hazard of encoding nominal categories like ['Car', 'Bike', 'Bus'] as integers [1, 2, 3] for a linear regression model?",
            options=[
                "The integers consume too much GPU memory",
                "The model will erroneously assume that a Bus (3) is mathematically three times a Car (1)",
                "Linear regression cannot accept integer values",
                "The loss function will become non-convex"
            ],
            correct_option_index=1,
            explanation="Assigning arbitrary integer values to nominal categories forces the model to assume a linear rank order and equal spacing between unrelated concepts."
        )
    ),
    EducationalConcept(
        concept_id="datetime_data",
        category="data_types",
        title="Datetime Data (Temporal Variables)",
        short_definition="Data representing specific points in time, calendar dates, or time intervals.",
        beginner_explanation="Timestamps like '2024-03-15 08:30:00'. They tell you when something happened, and they follow calendar rules (hours, days of the week, holidays, and seasons).",
        intermediate_explanation="Temporal coordinates encoding year, month, day, hour, minute, second, and timezone offsets. Datetime variables capture seasonality, trends, and time-lapse intervals.",
        technical_explanation="A 64-bit integer timestamp representing Unix epoch nanoseconds (e.g. `datetime64[ns]`), preserving ISO 8601 representation. Machine learning models cannot consume raw timestamps directly; they require component feature engineering (cyclical transforms, lags, elapsed durations).",
        why_it_matters="Raw timestamps left as strings or linear numbers fail to capture cyclical patterns (e.g. 11:59 PM is close to 12:01 AM). Engineered date features unlock critical behavioral patterns like day-of-week trends and holiday spikes.",
        real_world_example=ConceptExample(
            title="Ride-Sharing Trip Timestamps",
            description="Pickup timestamps containing rich temporal signals for fare prediction.",
            table_headers=["Ride_ID", "Pickup_Timestamp", "Extracted_Hour", "Is_Weekend"],
            table_rows=[
                ["R-1", "2024-10-12 23:45:10", "23", "1 (Saturday)"],
                ["R-2", "2024-10-14 08:15:00", "8", "0 (Monday)"]
            ],
            takeaway="Extracting hour and weekend status reveals rush-hour and late-night demand patterns."
        ),
        ml_impact="Failure to properly split time-series data chronologically (e.g. using random train-test splitting instead of time-based splitting) causes massive forward-looking data leakage.",
        common_methods=["pd.to_datetime()", "dt.hour", "dt.dayofweek", "sin/cos cyclical encoding", "TimeSeriesSplit()"],
        when_to_use="When observations contain timestamps, event occurrences, or chronological measurements.",
        when_not_to_use="Do not pass raw unparsed date strings or raw Unix timestamps directly into regression or tree models without extracting meaningful temporal features.",
        common_mistakes=[
            "Using random cross-validation instead of temporal split (TimeSeriesSplit) for time-dependent data.",
            "Encoding hour of day as a simple integer 0 to 23, hiding the cyclical continuity between 23:59 and 00:01."
        ],
        interview_tip="How do you encode cyclical features like hour of the day or month of the year? Use sine and cosine trigonometric transformations: $\\sin(2\\pi \\cdot t / T)$ and $\\cos(2\\pi \\cdot t / T)$ to preserve continuity across boundaries.",
        related_concepts=["data_type", "numerical_data", "observation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_datetime_1",
            question="Why is standard random train-test split disastrous for time-series forecasting datasets?",
            options=[
                "Timestamps cannot be sliced with boolean indexing",
                "It leaks future information into the training set, causing lookahead bias",
                "Pandas cannot sort timestamps after splitting",
                "Decision trees crash when evaluating dates"
            ],
            correct_option_index=1,
            explanation="Random splitting samples future data points into the training fold, allowing the model to learn from future events to predict past events (lookahead bias)."
        )
    ),
    EducationalConcept(
        concept_id="identifier",
        category="data_types",
        title="Identifier (Primary Key / UUID)",
        short_definition="Unique codes, tags, or keys used solely to distinguish individual records, transactions, or users in a database.",
        beginner_explanation="Think of your Social Security Number, passport number, or order receipt code. It identifies who you are, but the number itself has zero connection to whether you like coffee or tea.",
        intermediate_explanation="Columns with near 100% uniqueness whose values serve exclusively as relational entity keys (e.g., customer_id, order_uuid, transaction_hash). They contain no generalizable predictive variance.",
        technical_explanation="A variable with cardinality ratio $\\frac{|\\mathcal{U}|}{n} \\approx 1.0$ exhibiting maximal entropy but zero conditional mutual information $I(X_j; Y) = 0$ with the target on unseen data distributions.",
        why_it_matters="If an identifier column is left inside the training features, flexible algorithms (like decision trees and gradient boosting) will latch onto these unique IDs, perfectly memorizing the training set while suffering 0% accuracy on new unseen data.",
        real_world_example=ConceptExample(
            title="Hospital Patient Records",
            description="The MRN (Medical Record Number) uniquely identifies the patient record but holds no clinical predictive power.",
            table_headers=["Patient_MRN", "Blood_Pressure", "Cholesterol", "Heart_Disease_Risk"],
            table_rows=[
                ["MRN-881924", "130/85", "210", "High"],
                ["MRN-449102", "115/75", "180", "Low"]
            ],
            takeaway="MRN-881924 is a unique administrative tag and must be excluded from feature vectors."
        ),
        ml_impact="Causes severe catastrophic overfitting. Decision trees will make high-depth splits on individual ID values, memorizing every training label.",
        common_methods=["df.drop(columns=['id'])", "df.set_index('id')", "nunique() / len(df) check"],
        when_to_use="Keep identifiers during data joining and relational merges, then remove them before model training.",
        when_not_to_use="Never include raw identifier columns in the training feature matrix $X$.",
        common_mistakes=[
            "Forgetting to drop auto-incrementing ID columns, leading to an overfitted model that simply predicts based on record creation time.",
            "Confusing high-cardinality categorical attributes (like zip code) with pure administrative identifiers."
        ],
        interview_tip="How do you identify identifier columns automatically in a dataset pipeline? Check if the column is non-numeric or integer, has uniqueness ratio $> 99\\%$, and does not conform to a known measurement format.",
        related_concepts=["cardinality", "feature", "categorical_data", "column"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_id_1",
            question="What will happen if a Decision Tree algorithm is trained with a unique Customer_ID feature present in the training set?",
            options=[
                "The tree will ignore the column because of its text format",
                "The tree will memorize individual customer IDs, achieving 100% training accuracy but failing completely on new customers",
                "The model will throw a singular matrix exception",
                "The training loss will fail to converge"
            ],
            correct_option_index=1,
            explanation="Because each ID uniquely identifies a row, a decision tree can isolate every training sample into pure leaves using ID splits, resulting in complete memorization and zero generalization."
        )
    )
]
