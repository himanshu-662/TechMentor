"""Educational concepts for Step 06: Data Encoding."""
from typing import List
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

ENCODING_CONCEPTS: List[EducationalConcept] = [
    EducationalConcept(
        concept_id="one_hot_encoding",
        category="data_types",
        title="One-Hot Encoding (OHE)",
        short_definition="Converts categorical variables into binary indicator columns (0 or 1), creating a separate orthogonal column for each distinct category level.",
        beginner_explanation=(
            "Imagine a column called 'Color' with 'Red', 'Green', and 'Blue'. "
            "A computer cannot do math on words. If we assign Red=1, Green=2, Blue=3, "
            "an algorithm might think Blue is greater than Green, or Green is the average of Red and Blue! "
            "To prevent this false ordering, One-Hot Encoding creates 3 separate columns: Color_Red, "
            "Color_Green, and Color_Blue. For each row, exactly one column gets a 1, and the others get 0."
        ),
        intermediate_explanation=(
            "One-Hot Encoding expands a single nominal variable with K distinct levels into K orthogonal binary "
            "indicator vectors. Each level is represented as a basis vector in K-dimensional space. "
            "While this removes any artificial ordinal bias, it increases dataset dimensionality. "
            "When training unregularized linear models with an intercept, including all K columns causes exact multicollinearity "
            "(the dummy variable trap), so K - 1 columns should be used instead by setting drop_first=True."
        ),
        technical_explanation=(
            "Given a categorical feature X taking values in {c_1, c_2, ..., c_K}, One-Hot Encoding defines "
            "indicator functions: 1_{X = c_k} for each k in {1, ..., K}. "
            "Because the columns sum to 1 identically (the constant intercept vector), the design matrix X has rank "
            "strictly less than its column count, making X^T X non-invertible without regularization or dropping a reference baseline."
        ),
        why_it_matters=(
            "Categorical data is ubiquitous in real-world tabular machine learning. Using One-Hot Encoding ensures "
            "that linear models, neural networks, and distance-based algorithms (KNN, SVM) interpret distinct "
            "categories as equidistant rather than ordered numbers."
        ),
        real_world_example=ConceptExample(
            title="Customer Device Type Encoding",
            description="A marketing dataset tracking visitor device types: 'Mobile', 'Desktop', 'Tablet'.",
            table_headers=["Customer", "Device (Raw)", "device_Desktop", "device_Mobile", "device_Tablet"],
            table_rows=[
                ["User_101", "Mobile", "0", "1", "0"],
                ["User_102", "Desktop", "1", "0", "0"],
                ["User_103", "Tablet", "0", "0", "1"]
            ],
            takeaway="Each category gets an independent binary axis, preventing the model from assuming Tablet (3) > Desktop (1)."
        ),
        ml_impact=(
            "Enables linear models, SVMs, and neural networks to learn distinct parameter weights for each category. "
            "However, features with high cardinality (50+ categories) cause dimensional explosion and sparse feature matrices."
        ),
        common_methods=[
            "scikit-learn OneHotEncoder(sparse_output=False, drop='first')",
            "pandas pd.get_dummies(df, columns=['col'], drop_first=True)"
        ],
        when_to_use=(
            "Nominal categorical variables where categories have NO natural ranking (e.g. country, gender, browser), "
            "and cardinality is low to moderate (K <= 15)."
        ),
        when_not_to_use=(
            "High-cardinality features (e.g., postal codes, user IDs with 50+ categories) due to dimensional explosion. "
            "Also avoid on ordinal features that possess a natural mathematical hierarchy."
        ),
        common_mistakes=[
            "Forgetting drop_first=True when training unregularized Linear/Logistic Regression, triggering the Dummy Variable Trap.",
            "Encoding high-cardinality features like 5,000 ZIP codes, expanding the dataset into thousands of sparse columns.",
            "Fitting the OneHotEncoder on the entire dataset instead of strictly on the training partition (data leakage)."
        ],
        interview_tip=(
            "In machine learning interviews, highlight that linear models require drop_first=True to avoid collinearity with the intercept, "
            "whereas tree-based models (Random Forest, XGBoost) are immune to the dummy trap and can split on any binary branch."
        ),
        related_concepts=["categorical_data", "dummy_variable_trap", "label_encoding", "ordinal_encoding", "frequency_encoding"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_one_hot_1",
            question="Why should you set drop_first=True when one-hot encoding for Linear Regression?",
            options=[
                "To speed up training by reducing data size",
                "To prevent exact multicollinearity (the dummy variable trap) with the model intercept",
                "Because scikit-learn cannot fit more than 10 columns",
                "To make the feature non-linear"
            ],
            correct_option_index=1,
            explanation="The sum of all K dummy columns equals 1, perfectly replicating the constant intercept and causing a singular, non-invertible matrix."
        )
    ),

    EducationalConcept(
        concept_id="label_encoding",
        category="data_types",
        title="Label Encoding",
        short_definition="Maps each distinct category to an integer from 0 to K-1 in arbitrary or alphabetical order.",
        beginner_explanation=(
            "Label encoding assigns an integer number to each category. For example: Apple -> 0, "
            "Banana -> 1, Cherry -> 2. It is very simple and does not create any new columns. "
            "However, be careful! The computer might think Cherry (2) is 'greater' or 'worth more' than Apple (0)."
        ),
        intermediate_explanation=(
            "Label Encoding replaces text labels with sequential integers [0, 1, ..., K-1]. "
            "It is best suited for binary categorical variables (K = 2) or for target variables in classification tasks. "
            "When applied to multi-class nominal predictor features in linear, distance-based, or neural network models, "
            "it introduces a fictitious monotonic ordering that distorts model parameters."
        ),
        technical_explanation=(
            "Label encoding defines a bijection f: C -> {0, 1, ..., K-1}. "
            "For a linear model y = beta * f(X), the model assumes equal step differences: beta*(2 - 1) = beta*(1 - 0). "
            "In tree models, a single split can isolate integer ranges, but deep trees may be required to isolate specific non-adjacent levels."
        ),
        why_it_matters=(
            "Target labels in classification problems must be integers (0, 1, ...). Furthermore, binary features "
            "(e.g., Yes/No, Male/Female) are most efficiently stored and processed as 0 and 1."
        ),
        real_world_example=ConceptExample(
            title="Loan Approval Target Encoding",
            description="Binary loan approval status converted for a classification model.",
            table_headers=["Application ID", "Approved (Raw)", "Approved (Label Encoded)"],
            table_rows=[
                ["APP_001", "Yes", "1"],
                ["APP_002", "No", "0"],
                ["APP_003", "Yes", "1"]
            ],
            takeaway="Binary categories map cleanly to 0 and 1 without introducing any artificial ordering distortion."
        ),
        ml_impact=(
            "Essential for binary flags and classification target labels. "
            "For multi-class inputs, it causes severe errors in linear/distance models but can be tolerated by tree algorithms."
        ),
        common_methods=[
            "scikit-learn LabelEncoder()",
            "pandas factorize() or Series.map({'No': 0, 'Yes': 1})"
        ],
        when_to_use="Binary categorical variables with exactly 2 distinct levels, or encoding the classification target variable y.",
        when_not_to_use="Nominal predictor features with 3 or more levels in linear regression, logistic regression, SVMs, or neural networks.",
        common_mistakes=[
            "Using LabelEncoder on multi-class input features for linear models, forcing false mathematical hierarchy.",
            "Fitting LabelEncoder separately on train and test sets, resulting in conflicting integer assignments."
        ],
        interview_tip=(
            "LabelEncoder is designed for 1D target variables y. For 2D feature matrices, use OrdinalEncoder or OneHotEncoder."
        ),
        related_concepts=["categorical_data", "one_hot_encoding", "ordinal_encoding", "frequency_encoding"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_label_1",
            question="When is Label Encoding safe to use on input features for Linear Regression?",
            options=[
                "When there are 10 or more categories",
                "Only when the categorical feature is strictly binary (exactly 2 levels)",
                "Always, because numbers are numbers",
                "Never under any circumstances"
            ],
            correct_option_index=1,
            explanation="With 2 levels (e.g. Yes/No -> 1/0), the distance is just 1 unit, acting like a single dummy indicator column without distortion."
        )
    ),

    EducationalConcept(
        concept_id="ordinal_encoding",
        category="data_types",
        title="Ordinal Encoding",
        short_definition="Encodes categorical features possessing an inherent natural hierarchy into meaningful sequential integers reflecting their domain rank.",
        beginner_explanation=(
            "Some categories have a clear rank: for example, shirt sizes ('S', 'M', 'L', 'XL') "
            "or education levels ('High School', 'Bachelor', 'Master', 'PhD'). "
            "Ordinal encoding maps these categories to numbers in that exact meaningful sequence: "
            "S=0, M=1, L=2, XL=3. Unlike One-Hot, this preserves natural ordering without adding extra columns."
        ),
        intermediate_explanation=(
            "Ordinal Encoding maps categorical values to integers according to a user-defined or inherent hierarchy. "
            "Because the distances between successive ranks are treated as equal (e.g., 2 - 1 = 1 - 0), "
            "it is critical that the assigned order accurately reflects domain logic. "
            "If categories are sorted alphabetically rather than by their true hierarchy, the monotonic relationship is corrupted."
        ),
        technical_explanation=(
            "Given an ordered set C with strict hierarchy c_1 < c_2 < ... < c_K, ordinal encoding assigns "
            "phi(c_k) = k - 1. This assumes that E[Y | X = c_k] is monotonic in k. "
            "For linear models, it imposes an assumption of equal incremental effect per rank step."
        ),
        why_it_matters=(
            "Preserving natural rank structure allows machine learning algorithms to learn directional trends "
            "(e.g., higher education -> higher income) efficiently with a single numerical feature, saving memory and avoiding dimensional explosion."
        ),
        real_world_example=ConceptExample(
            title="Customer Loyalty Tier Encoding",
            description="Ranking customers by their loyalty tier status.",
            table_headers=["Customer", "Tier (Raw)", "Tier (Ordinal Encoded)", "Domain Meaning"],
            table_rows=[
                ["Cust_1", "Bronze", "0", "Base level"],
                ["Cust_2", "Silver", "1", "Intermediate perk"],
                ["Cust_3", "Gold", "2", "High loyalty"],
                ["Cust_4", "Platinum", "3", "VIP tier"]
            ],
            takeaway="Ordinal encoding captures the monotonic progression from Bronze to Platinum in a single compact numeric column."
        ),
        ml_impact=(
            "Enables models to capture monotonic effects with 1 column instead of K-1 columns, reducing variance and overfitting."
        ),
        common_methods=[
            "scikit-learn OrdinalEncoder(categories=[ordered_list], handle_unknown='use_encoded_value', unknown_value=-1)"
        ],
        when_to_use="Features with true semantic hierarchy (e.g. Low/Med/High, Bronze/Silver/Gold, Education Levels, Likert survey scales).",
        when_not_to_use="Nominal features without any rank (e.g. City, Color, Department) - use One-Hot or Frequency encoding.",
        common_mistakes=[
            "Letting scikit-learn sort alphabetically, turning 'High' (0) < 'Low' (1) < 'Medium' (2).",
            "Failing to configure handle_unknown='use_encoded_value' for unseen test categories."
        ],
        interview_tip=(
            "Always emphasize that OrdinalEncoder must be given an explicit list of categories via categories=[ordered_list]; "
            "never rely on default alphabetical sorting for true ordinal data."
        ),
        related_concepts=["categorical_data", "one_hot_encoding", "label_encoding", "frequency_encoding"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_ordinal_1",
            question="What happens if you use scikit-learn OrdinalEncoder on ['Low', 'Med', 'High'] without specifying categories?",
            options=[
                "It raises an error",
                "It defaults to alphabetical order: High=0, Low=1, Med=2, corrupting the true semantic order",
                "It automatically guesses the correct hierarchy",
                "It converts them to One-Hot columns"
            ],
            correct_option_index=1,
            explanation="scikit-learn sorts categories alphabetically by default, turning 'High' into 0, 'Low' into 1, and 'Med' into 2!"
        )
    ),

    EducationalConcept(
        concept_id="frequency_encoding",
        category="data_types",
        title="Frequency (Count) Encoding",
        short_definition="A high-cardinality encoding technique that replaces each category level with its frequency or proportion of occurrence in the dataset.",
        beginner_explanation=(
            "When a category has hundreds of different values (like cities or zip codes), One-Hot Encoding would "
            "create hundreds of columns and overwhelm the computer. "
            "Frequency encoding simply counts how common each value is! "
            "If 'New York' appears 1,000 times (20% of data) and 'Omaha' appears 50 times (1% of data), "
            "we replace 'New York' with 0.20 and 'Omaha' with 0.01. "
            "The model immediately knows which categories are common and which are rare."
        ),
        intermediate_explanation=(
            "Frequency encoding maps each level c_k to P(X = c_k) = Count(c_k) / N. "
            "It captures category popularity and prevalence with zero increase in feature dimensionality. "
            "It is especially potent for gradient boosted decision trees (GBDT) on high-cardinality features. "
            "A potential drawback is collision: two distinct categories with identical frequencies receive the exact same encoded value."
        ),
        technical_explanation=(
            "Let n_k = sum_{i=1}^N 1_{X_i = c_k}. The frequency mapping is f(c_k) = n_k / N. "
            "To prevent data leakage, category frequency counts must be computed exclusively on the training split D_train. "
            "Unseen test categories default to 0 frequency or 1/(N + |C|) with Laplace smoothing."
        ),
        why_it_matters=(
            "Provides a compact, continuous numerical representation for high-cardinality nominal variables where "
            "One-Hot Encoding is computationally prohibitive and Label Encoding would introduce arbitrary ordering."
        ),
        real_world_example=ConceptExample(
            title="E-commerce Shipping City Encoding",
            description="A retail dataset with 800 distinct delivery cities.",
            table_headers=["Order ID", "City (Raw)", "Frequency Count", "Encoded Proportion"],
            table_rows=[
                ["ORD_1", "New York", "4,500", "0.225"],
                ["ORD_2", "Los Angeles", "3,200", "0.160"],
                ["ORD_3", "SmallTown", "20", "0.001"]
            ],
            takeaway="All 800 cities are represented in a single continuous feature reflecting urban vs rural order volume."
        ),
        ml_impact=(
            "Dramatically reduces memory footprint and computational complexity in tree-based algorithms on high-cardinality features."
        ),
        common_methods=[
            "df[col].map(df[col].value_counts(normalize=True))",
            "category_encoders.CountEncoder()"
        ],
        when_to_use="High-cardinality categorical features (ZIP codes, merchant IDs, city names) in tree-based algorithms.",
        when_not_to_use="Low-cardinality features (Gender, Binary flags) or when distinct categories share identical frequencies.",
        common_mistakes=[
            "Calculating frequencies on combined train and test sets, causing distribution data leakage.",
            "Ignoring frequency collision where two totally unrelated categories share the same frequency."
        ],
        interview_tip=(
            "Mention frequency encoding for Kaggle tabular competitions when handling features with 100+ categories. "
            "Pair it with target encoding for maximum predictive signal."
        ),
        related_concepts=["categorical_data", "one_hot_encoding", "label_encoding", "data_leakage"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_freq_1",
            question="What is the primary risk/tradeoff of Frequency Encoding?",
            options=[
                "It increases dataset column count drastically",
                "Frequency collision: two distinct categories with equal frequencies receive identical encoded values",
                "It can only be used on binary features",
                "It causes non-invertible matrix errors"
            ],
            correct_option_index=1,
            explanation="If 'Biology' and 'Chemistry' both appear 45 times, frequency encoding assigns both the same number, making them indistinguishable."
        )
    ),

    EducationalConcept(
        concept_id="dummy_variable_trap",
        category="statistics",
        title="The Dummy Variable Trap",
        short_definition="A scenario of perfect multicollinearity occurring when all K binary dummy columns of a categorical variable are included alongside a constant intercept in a linear regression model.",
        beginner_explanation=(
            "Suppose we have a 'Gender' column with 'Male' and 'Female'. "
            "If we create two columns: is_male and is_female, notice that is_male + is_female ALWAYS equals 1! "
            "If a person is not male, they must be female. The second column gives zero new information. "
            "If you give both columns to a linear regression model that already has an intercept (constant 1), "
            "the math gets confused because two columns add up to the third column. This is the Dummy Variable Trap!"
        ),
        intermediate_explanation=(
            "The Dummy Variable Trap occurs when dummy variables are mutually exclusive and collectively exhaustive. "
            "In an unregularized linear model y = beta_0 + beta_1*D_1 + ... + beta_K*D_K, "
            "because sum(D_k) = 1, there exists an exact linear combination between the predictors and the intercept beta_0. "
            "This makes the feature matrix X singular (rank deficient), causing (X^T X)^(-1) to fail or produce wildly unstable coefficients. "
            "The solution is to drop one category (drop_first=True), which serves as the reference benchmark."
        ),
        technical_explanation=(
            "In matrix terms, let 1 be the N x 1 column vector of ones (the intercept). "
            "For a K-level category, the design matrix has dummy columns D_1, ..., D_K. "
            "By definition, sum_{k=1}^K D_k = 1. Therefore, the columns of X are linearly dependent: "
            "1 - sum_{k=1}^K D_k = 0. The matrix X^T X has determinant zero and is non-invertible. "
            "Dropping one reference column D_1 restores full column rank: X has K - 1 dummy columns, "
            "and each coefficient beta_k represents the expected change in Y relative to the omitted baseline category D_1."
        ),
        why_it_matters=(
            "Understanding the dummy variable trap is a staple of statistical modeling and machine learning interviews. "
            "It explains why OLS coefficients explode and why L2 regularization (Ridge) can bypass the trap while unregularized OLS cannot."
        ),
        real_world_example=ConceptExample(
            title="Linear Regression on Housing Location",
            description="Predicting home prices using 3 locations: 'Urban', 'Suburban', 'Rural'.",
            table_headers=["Home", "Intercept (b0)", "Urban (D1)", "Suburban (D2)", "Rural (D3)", "Sum of Dummies"],
            table_rows=[
                ["House_A", "1", "1", "0", "0", "1 = Intercept"],
                ["House_B", "1", "0", "1", "0", "1 = Intercept"],
                ["House_C", "1", "0", "0", "1", "1 = Intercept"]
            ],
            takeaway="D1 + D2 + D3 is identical to the Intercept column. Dropping Rural makes Rural the baseline reference."
        ),
        ml_impact=(
            "Unregularized Ordinary Least Squares (OLS) fails or generates astronomically large positive and negative cancelling coefficients."
        ),
        common_methods=[
            "OneHotEncoder(drop='first')",
            "pd.get_dummies(df, drop_first=True)"
        ],
        when_to_use="Always drop one dummy column (drop_first=True) when fitting unregularized Linear/Logistic Regression with an intercept.",
        when_not_to_use="Tree-based algorithms (Decision Trees, Random Forests) which do not invert matrices and benefit from all binary splits.",
        common_mistakes=[
            "Dropping a dummy category when training Tree models, forcing the tree to test K-1 negative conditions to detect the omitted category.",
            "Misinterpreting regression coefficients after dropping a category (coefficients are relative to the omitted baseline, not absolute)."
        ],
        interview_tip=(
            "If asked: 'Can Ridge regression handle all K dummy variables without drop_first?' "
            "Answer: Yes! Ridge adds lambda * I to X^T X, guaranteeing positive definiteness and invertibility."
        ),
        related_concepts=["one_hot_encoding", "multicollinearity", "linear_regression", "categorical_data"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_dummy_trap_1",
            question="Why does Ordinary Least Squares fail when all K dummy columns are included with an intercept?",
            options=[
                "Because of overfitting on small data",
                "Because the dummy columns sum to 1, creating exact linear dependence with the intercept column and making (X^T X) non-invertible",
                "Because Python cannot store binary numbers",
                "Because gradient descent diverges on zeros"
            ],
            correct_option_index=1,
            explanation="Exact multicollinearity makes the design matrix rank-deficient, so the normal equation (X^T X)^(-1) has no unique solution."
        )
    )
]
