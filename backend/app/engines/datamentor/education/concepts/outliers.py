"""Educational concepts specifically covering Outlier Detection, Metrics, and Treatments."""
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

OUTLIER_CONCEPTS = [
    EducationalConcept(
        concept_id="outlier",
        category="data_quality",
        title="Outliers (Extreme Values)",
        short_definition="An outlier is a data point that differs significantly from other observations in the same feature.",
        beginner_explanation=(
            "Imagine measuring the heights of adult humans in a room. Most people are between 5 and 6 feet tall. "
            "If an NBA center walks in who is 7'6\", or if someone accidentally recorded someone as 50 feet tall, "
            "those unusual points are called outliers. Crucially, some outliers are genuine rare events, while others are measurement errors."
        ),
        intermediate_explanation=(
            "In data distributions, outliers reside in the extreme tails (either very high or very low). "
            "They can exert disproportionate leverage on linear models, distort summary statistics like the mean and variance, "
            "and violate normality assumptions required by certain parametric statistical tests."
        ),
        technical_explanation=(
            "Formally, an observation $x_i$ is an outlier if its probability under an assumed generating distribution $P(X)$ "
            "is below a critical threshold $\\alpha$, or if its standardized distance (e.g., Mahalanobis or Studentized residual) "
            "exceeds a cutoff. Outliers may be univariate (extreme in a single feature) or multivariate (unusual combination across multiple features)."
        ),
        why_it_matters=(
            "Outliers can heavily bias calculations like the sample mean and standard deviation. "
            "In machine learning algorithms that minimize squared errors (like Ordinary Least Squares regression or K-Means clustering), "
            "a single extreme outlier can drastically tilt the decision boundary or cluster centroids."
        ),
        real_world_example=ConceptExample(
            title="House Prices in a Suburban Neighborhood",
            description="A dataset of 100 suburban home sales where typical prices range from $250k to $450k, but one historic luxury mansion sold for $5.2M.",
            table_headers=["House ID", "Bedrooms", "SqFt", "Sale Price"],
            table_rows=[
                ["#101", "3", "1,850", "$290,000"],
                ["#102", "4", "2,400", "$385,000"],
                ["#103", "3", "1,920", "$310,000"],
                ["#104", "8", "9,800", "$5,200,000 (Outlier)"]
            ],
            takeaway="The $5.2M sale raises the neighborhood average by over $48k, giving a misleading impression of typical home prices."
        ),
        ml_impact=(
            "Distance-based algorithms (KNN, SVM, K-Means) and squared-loss models (Linear/Ridge Regression, Neural Networks) "
            "are highly sensitive to outliers. Tree-based models (Random Forest, XGBoost) split on rank orders and are naturally robust to monotonic outlier scales."
        ),
        common_methods=[
            "Interquartile Range (IQR) rule",
            "Z-Score filtering (Standard deviations from mean)",
            "Modified Z-Score with MAD",
            "Winsorization / Capping"
        ],
        when_to_use="Always profile distributions for outliers before training distance-sensitive or linear algorithms.",
        when_not_to_use="Do not blindly delete outliers when detecting anomalies or fraud is the primary business goal.",
        common_mistakes=[
            "Assuming every outlier is an error that should be immediately deleted.",
            "Using mean-based Z-scores on severely skewed, non-normal distributions.",
            "Applying outlier removal to test sets or target variables without accounting for data leakage."
        ],
        interview_tip=(
            "When asked how you handle outliers, never say 'I delete them.' Explain that you first determine the cause: "
            "data error (fix/drop), measurement artifact (cap/transform), or legitimate natural variation (keep, use robust models)."
        ),
        related_concepts=["iqr", "zscore", "modified_zscore", "winsorization", "skewness", "standard_deviation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_outlier_01",
            question="Which of the following machine learning models is LEAST sensitive to extreme outliers in numerical input features?",
            options=[
                "Linear Regression",
                "K-Means Clustering",
                "Decision Tree / Random Forest",
                "K-Nearest Neighbors"
            ],
            correct_option_index=2,
            explanation="Decision trees evaluate split thresholds based on ordering rather than Euclidean distance or squared error sums, making them invariant to monotonic scaling and extreme outliers."
        )
    ),

    EducationalConcept(
        concept_id="iqr",
        category="statistics",
        title="Interquartile Range (IQR) Outlier Rule",
        short_definition="A non-parametric outlier detection method using the spread of the middle 50% of the data (Q3 - Q1).",
        beginner_explanation=(
            "Imagine lining up all your data from smallest to largest and dividing it into 4 equal quarters. "
            "The IQR is the distance between the 25% mark (Q1) and the 75% mark (Q3). "
            "Tukey's rule creates a fence: any point that falls more than 1.5 times the box width outside the middle 50% is flagged as an outlier."
        ),
        intermediate_explanation=(
            "The IQR method calculates $IQR = Q3 - Q1$. The lower boundary is $Q1 - 1.5 \\times IQR$ and the upper boundary is $Q3 + 1.5 \\times IQR$. "
            "Because quartiles depend on rank order rather than arithmetic sums, the IQR is resistant to extreme values (it has a 25% breakdown point)."
        ),
        technical_explanation=(
            "For a normal distribution $\\mathcal{N}(\\mu, \\sigma^2)$, $IQR \\approx 1.349 \\sigma$. "
            "The interval $[Q1 - 1.5 \\times IQR, Q3 + 1.5 \\times IQR]$ covers approximately $\\mu \\pm 2.698 \\sigma$, "
            "flagging approximately 0.7% of points in a Gaussian sample as potential outliers."
        ),
        why_it_matters=(
            "Unlike Z-score, the IQR method does not assume that data is normally distributed. "
            "It is the standard statistical engine behind Box-and-Whisker plots."
        ),
        real_world_example=ConceptExample(
            title="Customer Monthly Spending",
            description="Quarterly metrics for monthly retail spend: Q1 = $50, Q3 = $150, so IQR = $100.",
            table_headers=["Metric", "Formula", "Calculated Value"],
            table_rows=[
                ["Q1 (25th percentile)", "Order statistic", "$50.00"],
                ["Q3 (75th percentile)", "Order statistic", "$150.00"],
                ["IQR", "Q3 - Q1", "$100.00"],
                ["Lower Bound", "Q1 - 1.5 * IQR", "-$100.00 (clamped to 0)"],
                ["Upper Bound", "Q3 + 1.5 * IQR", "$300.00"]
            ],
            takeaway="Any customer spending more than $300 is identified as an outlier."
        ),
        ml_impact="Provides robust boundary thresholds for data truncation, Winsorization, or robust scaling.",
        common_methods=["pd.Series.quantile([0.25, 0.75])", "scipy.stats.iqr"],
        when_to_use="Recommended for skewed distributions, non-normal features, or when extreme values would distort the mean.",
        when_not_to_use="On extremely small datasets ($N < 5$) where percentiles cannot be reliably estimated.",
        common_mistakes=[
            "Using 1.5 as an unchangeable law rather than a configurable heuristic (3.0 is commonly used for extreme outliers).",
            "Assuming negative lower bounds are invalid without clamping to physical domain limits (like positive prices)."
        ],
        interview_tip="John Tukey introduced the 1.5x IQR multiplier as a pragmatic rule of thumb in Exploratory Data Analysis (EDA).",
        related_concepts=["outlier", "quartiles", "winsorization", "median"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_iqr_01",
            question="If Q1 is 20 and Q3 is 60 for an exam score distribution, what is the upper outlier threshold under Tukey's 1.5 * IQR rule?",
            options=["80", "100", "120", "150"],
            correct_option_index=2,
            explanation="IQR = Q3 - Q1 = 60 - 20 = 40. Upper bound = Q3 + (1.5 * IQR) = 60 + (1.5 * 40) = 60 + 60 = 120."
        )
    ),

    EducationalConcept(
        concept_id="zscore",
        category="statistics",
        title="Z-Score Outlier Detection",
        short_definition="A parametric method measuring how many standard deviations an observation lies from the sample mean.",
        beginner_explanation=(
            "The Z-Score tells you how typical or unusual a value is by asking: 'How many steps away from the average is this number?' "
            "If your score is close to 0, it's average. If it has a Z-score of +3 or -3, it is far out in the extremes."
        ),
        intermediate_explanation=(
            "Calculated as $Z = \\frac{x - \\mu}{\\sigma}$. In a standard normal distribution, about 68% of data falls within $\\pm 1\\sigma$, "
            "95% within $\\pm 2\\sigma$, and 99.7% within $\\pm 3\\sigma$. Observations with $|Z| > 3$ are traditionally flagged as outliers."
        ),
        technical_explanation=(
            "Z-Score assumes the underlying population follows a normal distribution $\\mathcal{N}(\\mu, \\sigma^2)$. "
            "A key vulnerability is the 'masking effect': extreme outliers inflate both $\\mu$ and $\\sigma$, "
            "which shrinks the computed Z-scores of other outliers and masks their detection."
        ),
        why_it_matters=(
            "Z-scores are fast to compute ($O(N)$) and provide standard probabilistic confidence when features are bell-shaped."
        ),
        real_world_example=ConceptExample(
            title="Warehouse Assembly Times",
            description="Mean assembly time is 40 seconds with a standard deviation of 5 seconds.",
            table_headers=["Worker Task", "Time (seconds)", "Z-Score", "Verdict"],
            table_rows=[
                ["Task A", "42s", "+0.40", "Normal"],
                ["Task B", "35s", "-1.00", "Normal"],
                ["Task C", "58s", "+3.60", "Outlier (|Z| > 3)"]
            ],
            takeaway="Task C took 58s, which is 3.6 standard deviations above average, indicating an unexpected bottleneck."
        ),
        ml_impact="Z-score standardization centers features at mean 0 and variance 1, helping gradient descent converge faster.",
        common_methods=["scipy.stats.zscore", "sklearn.preprocessing.StandardScaler"],
        when_to_use="When data is approximately bell-shaped (symmetric) with low initial skewness.",
        when_not_to_use="When data is strongly skewed or bimodal, where the mean and standard deviation lose representativeness.",
        common_mistakes=[
            "Applying Z-score to log-normal or exponential distributions without prior transformation.",
            "Dividing by zero when a feature has zero variance (constant column)."
        ],
        interview_tip="Highlight the empirical 68-95-99.7 rule (Chebyshev's inequality for arbitrary distributions) when discussing Z-scores.",
        related_concepts=["outlier", "standard_deviation", "modified_zscore", "iqr"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_zscore_01",
            question="What happens to Z-scores when an extremely large outlier is present in a small dataset?",
            options=[
                "The mean decreases and standard deviation becomes zero.",
                "The mean and standard deviation are inflated, reducing the Z-scores of other points.",
                "All other data points become outliers.",
                "Z-scores cannot be computed."
            ],
            correct_option_index=1,
            explanation="Extreme outliers inflate the sample mean and dramatically increase standard deviation, which reduces the relative Z-scores of other observations (masking effect)."
        )
    ),

    EducationalConcept(
        concept_id="modified_zscore",
        category="statistics",
        title="Modified Z-Score (Boris Iglewicz & David Hoaglin)",
        short_definition="A robust Z-score variant that uses the median and Median Absolute Deviation (MAD) instead of mean and standard deviation.",
        beginner_explanation=(
            "Standard Z-score gets fooled by extreme values because the average gets dragged toward the outliers. "
            "Modified Z-score solves this by using the median (which doesn't get dragged) and MAD (the median distance from the center). "
            "It gives a fair, uncorrupted score of how unusual a number is."
        ),
        intermediate_explanation=(
            "Formulated as $M_i = \\frac{0.6745 \\times (x_i - \\tilde{x})}{MAD}$, where $\\tilde{x}$ is the sample median and "
            "$MAD = \\text{median}(|x_i - \\tilde{x}|)$. The multiplier 0.6745 scales MAD to approximate the standard deviation for normal data. "
            "Iglewicz and Hoaglin recommend flagging points with $|M_i| > 3.5$ as outliers."
        ),
        technical_explanation=(
            "The estimator has a high 50% breakdown point, meaning up to half the sample can be contaminated before the estimate collapses. "
            "If more than 50% of the sample has identical values, $MAD = 0$, requiring special handling (like checking for non-median divergence)."
        ),
        why_it_matters=(
            "It provides the statistical rigor of a score-based threshold while remaining completely resistant to outlier masking."
        ),
        real_world_example=ConceptExample(
            title="App API Response Latency",
            description="Most API calls take ~20ms, but a server timeout spike caused a 30,000ms latency.",
            table_headers=["Observation", "Latency (ms)", "Standard Z", "Modified Z", "Detection"],
            table_rows=[
                ["Request 1", "21ms", "-0.32", "+0.15", "Normal"],
                ["Request 2", "20ms", "-0.32", "0.00", "Normal"],
                ["Request 3 (Spike)", "30,000ms", "+3.10", "+14,990.0", "Massive Outlier"]
            ],
            takeaway="Standard Z was deflated to barely 3.1 because the 30s spike distorted the standard deviation to ~9,000ms."
        ),
        ml_impact="Ideal for identifying outliers in training data before fitting sensitive estimators without biasing the scale.",
        common_methods=["0.6745 * (x - median) / median_abs_deviation(x)"],
        when_to_use="When datasets contain multiple severe outliers or heavy-tailed distributions where standard Z-score fails.",
        when_not_to_use="When over 50% of values are zero or identical, which yields MAD = 0.",
        common_mistakes=[
            "Forgetting to handle the zero-MAD edge case for integer/discrete counts.",
            "Assuming threshold 3.0 instead of the standard 3.5 recommended by Iglewicz and Hoaglin."
        ],
        interview_tip="Mentioning Modified Z-Score demonstrates deep knowledge of robust statistics over naive textbook methods.",
        related_concepts=["zscore", "outlier", "iqr", "median"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_modz_01",
            question="Why is 0.6745 used as a constant multiplier in the Modified Z-Score formula?",
            options=[
                "It equals the golden ratio.",
                "It scales the Median Absolute Deviation (MAD) to equal standard deviation for a normal distribution ($E[MAD] = 0.6745\\sigma$).",
                "It accounts for sample size degrees of freedom.",
                "It converts percentages into decimal fractions."
            ],
            correct_option_index=1,
            explanation="For a normal distribution, the 75th percentile is approximately $0.6745\\sigma$. Thus $MAD = 0.6745\\sigma$, making $1 / 1.4826 \\approx 0.6745$ the exact consistency factor."
        )
    ),

    EducationalConcept(
        concept_id="winsorization",
        category="data_quality",
        title="Winsorization (Outlier Capping)",
        short_definition="A transformation technique that caps extreme values at designated statistical percentiles rather than deleting them.",
        beginner_explanation=(
            "Instead of throwing away a row because a number is too high or low, Winsorization 'trims the extreme tips' "
            "by replacing values above the ceiling with the ceiling value, and values below the floor with the floor value. "
            "You keep the record while removing the extreme distorting force."
        ),
        intermediate_explanation=(
            "Named after Charles P. Winsor, this method replaces values beyond a threshold (such as the 1st and 99th percentiles, or Tukey's IQR bounds) "
            "with the corresponding boundary values. It preserves total sample size ($N$) while mitigating leverage and variance inflation."
        ),
        technical_explanation=(
            "For a random variable $X$ with lower bound $L$ and upper bound $U$, the Winsorized variable is $Y = \\min(\\max(X, L), U)$. "
            "This compresses the probability mass of the tails onto the boundary points $L$ and $U$, creating point masses at the bounds."
        ),
        why_it_matters=(
            "Dropping rows reduces sample size and can discard valuable information in other columns. "
            "Capping retains the row and indicates that the value was high/low without allowing extreme magnitudes to destabilize models."
        ),
        real_world_example=ConceptExample(
            title="Income Cap in Loan Underwriting",
            description="Upper IQR limit is $180,000. An applicant earning $950,000 has their income feature capped at $180,000.",
            table_headers=["Applicant", "Original Income", "Treatment", "Final Capped Income"],
            table_rows=[
                ["Applicant A", "$65,000", "None (Within bounds)", "$65,000"],
                ["Applicant B", "$140,000", "None (Within bounds)", "$140,000"],
                ["Applicant C", "$950,000", "Cap at Upper Bound", "$180,000"]
            ],
            takeaway="Applicant C's entire loan application (credit score, debt ratio) is kept, but their income cannot disproportionately bias the regression slope."
        ),
        ml_impact="Stabilizes parameter estimation in Linear Regression, Neural Networks, and Ridge/Lasso without sample loss.",
        common_methods=["scipy.stats.mstats.winsorize", "np.clip(df[col], lower, upper)"],
        when_to_use="When sample size is valuable and you cannot afford to drop rows, or when extreme values are valid but disproportionately large.",
        when_not_to_use="When the exact magnitude in the extreme tail is crucial (e.g., insurance claim maximums, high-net-worth portfolio valuation).",
        common_mistakes=[
            "Applying capping before splitting into train/test sets, which introduces data leakage.",
            "Capping too aggressively (e.g. 10th and 90th percentiles), which destroys valid variance."
        ],
        interview_tip="Contrast trimming (row deletion) with Winsorization (value capping): Trimming alters sample size; Winsorization preserves sample size but alters the distribution tail shape.",
        related_concepts=["outlier", "iqr", "zscore"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_winsor_01",
            question="What is the primary advantage of Winsorization (capping) over outlier deletion (trimming)?",
            options=[
                "It converts categorical variables into numerical values.",
                "It preserves all dataset rows and maintains sample size while reducing extreme variance.",
                "It automatically imputes missing values.",
                "It guarantees zero correlation between features."
            ],
            correct_option_index=1,
            explanation="Winsorization clips values to defined boundaries, keeping all rows in the dataset intact so information in other columns is not discarded."
        )
    ),

    EducationalConcept(
        concept_id="outlier_removal",
        category="data_quality",
        title="Outlier Removal (Trimming / Filtering)",
        short_definition="The process of excluding observations identified as erroneous or unrepresentative outliers from the working dataset.",
        beginner_explanation=(
            "Outlier removal means completely deleting the entire row that contains the bad number. "
            "This is appropriate when you know for sure that the data was corrupted (e.g., a person's age is typed as 999)."
        ),
        intermediate_explanation=(
            "Trimming drops all observations falling outside defined statistical thresholds. "
            "While it cleans the feature space, it reduces the sample size $N$ and can introduce selection bias if the outliers are not missing completely at random."
        ),
        technical_explanation=(
            "If the outlier generation mechanism is correlated with unobserved variables $Z$, trimming rows induces sample selection truncation, "
            "potentially biasing parameter estimates $\\hat{\\beta}$ in downstream regression models."
        ),
        why_it_matters=(
            "When data contains impossible measurement artifacts (negative ages, human body temperatures of 200°F), "
            "removing them eliminates corruption that would otherwise poison model training."
        ),
        real_world_example=ConceptExample(
            title="Sensor Temperature Telemetry",
            description="A thermometer records values in Celsius. Faulty electrical noise produces reading of 9999.0°C.",
            table_headers=["Sensor ID", "Timestamp", "Reading", "Action"],
            table_rows=[
                ["S-1", "12:00:00", "22.4°C", "Keep"],
                ["S-1", "12:00:01", "22.5°C", "Keep"],
                ["S-1", "12:00:02", "9999.0°C", "Delete Row (Hardware Fault)"]
            ],
            takeaway="9999.0°C is physically impossible and must be removed to avoid destroying the temperature prediction model."
        ),
        ml_impact="Eliminates extreme leverage points and prevents gradient explosion in training algorithms.",
        common_methods=["df = df[(df[col] >= lower) & (df[col] <= upper)]"],
        when_to_use="When extreme values are verified errors, corrupted sensor data, or completely out-of-scope anomalies.",
        when_not_to_use="When outliers represent real-world rare phenomena that the model needs to learn to predict.",
        common_mistakes=[
            "Deleting rows without checking if other columns in that row contained irreplaceable ground truth.",
            "Removing outliers from the validation or test set, which hides real-world model failure modes."
        ],
        interview_tip="Always distinguish between 'dirty data' (typos, sensor errors -> delete or impute) vs 'rare events' (super-spenders, fraud -> keep or cap).",
        related_concepts=["outlier", "winsorization", "iqr", "handling_outliers"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_trim_01",
            question="When is completely removing an outlier row justifiable?",
            options=[
                "Whenever an observation has a Z-score greater than 2.",
                "When the observation is verified to be a corrupted measurement error or impossible physical value.",
                "To artificially inflate the model's R-squared metric.",
                "Only when the dataset has over 1,000,000 rows."
            ],
            correct_option_index=1,
            explanation="Outlier deletion is justified when data points are verifiable corruptions or impossible values that do not reflect true population behavior."
        )
    ),

    EducationalConcept(
        concept_id="handling_outliers",
        category="data_quality",
        title="Handling Outliers: Strategic Decision Framework",
        short_definition="A systematic methodology to decide whether to remove, cap (Winsorize), flag, transform, or retain extreme observations based on their root cause and model type.",
        beginner_explanation=(
            "When you find an outlier, your first instinct might be: 'Delete it immediately!' "
            "That is one of the most common beginner mistakes. "
            "Handling outliers requires diagnosing why the number is strange: "
            "1. Is it a pure mistake? (e.g. Age = 999 or Salary = -$500) -> Remove or correct it. "
            "2. Is it a real person with extreme wealth? -> Cap it (Winsorize) so the model isn't distorted, but keep the person's other data! "
            "3. Is it a fraud attempt? -> Flag it with a 1/0 indicator column! "
            "4. Are you using Random Forest or XGBoost? -> You might not need to touch it at all!"
        ),
        intermediate_explanation=(
            "Handling outliers encompasses 5 primary treatment philosophies: "
            "(1) Trimming (Row Deletion): Drops observations. Effective for corrupted sensors, but permanently discards sample size and risks truncation bias. "
            "(2) Winsorization (Capping): Clamps values to percentile thresholds (e.g. 1st/99th or IQR bounds). Retains sample size while eliminating variance explosion. "
            "(3) Anomaly Indicator Flagging: Adds a boolean column (is_outlier = 1) while preserving raw numbers. Allows models to learn non-linear anomaly penalties. "
            "(4) Mathematical Transformation: Applying log, square root, or Yeo-Johnson transforms compresses heavy right tails smoothly without artificial clipping. "
            "(5) Model-Level Robustness: Switching to tree-based estimators (GBDT) or Huber loss / L1 loss that are inherently resistant to monotonic outlier scales."
        ),
        technical_explanation=(
            "Let dataset D = {(x_i, y_i)}_{i=1}^N. An outlier in feature j can be treated via: "
            "1. Trimming: D' = {i : L_j <= x_{i,j} <= U_j}, reducing sample size to N' < N. "
            "2. Winsorization: x'_{i,j} = min(max(x_{i,j}, L_j), U_j), inducing point masses at L_j and U_j. "
            "3. Flagging: augment feature space with d_{i,j} = I(x_{i,j} < L_j or x_{i,j} > U_j). "
            "4. Non-linear mapping: x'_{i,j} = log(1 + x_{i,j}), dampening tail leverage: d/dx log(x) = 1/x -> 0 as x -> infty. "
            "In linear regression y = X beta + epsilon, trimming reduces the leverage h_{ii} = x_i^T (X^T X)^{-1} x_i, "
            "preventing single observations from having Cook's distance D_i > 1."
        ),
        why_it_matters=(
            "Treating outliers incorrectly either pollutes models with catastrophic noise (if ignored in linear models) "
            "or throws away valuable rare-event predictive signal (if blindly removed in fraud/anomaly tasks)."
        ),
        real_world_example=ConceptExample(
            title="E-Commerce Transaction Analysis",
            description="A marketplace dataset contains order amounts: most are $15-$200, but there is one $0 order, one $25,000 order, and one -$50 order.",
            table_headers=["Transaction ID", "Amount", "Root Cause Diagnosis", "Recommended Handling"],
            table_rows=[
                ["TXN_01", "-$50.00", "Data-entry / system bug (negative price)", "Remove Row (Trimming)"],
                ["TXN_02", "$25,000.00", "Valid bulk wholesale purchase", "Cap at 99th percentile ($2,500) OR Flag as Wholesale"],
                ["TXN_03", "$75.00", "Normal typical consumer order", "Keep intact (No change)"],
                ["TXN_04", "$0.00", "Promotional free gift order", "Keep and add is_free_promo flag"]
            ],
            takeaway="Different outliers in the exact same column require different treatments based on their root cause."
        ),
        ml_impact=(
            "Linear models, SVMs, and K-Means benefit massively from capping or log-transforms. "
            "Tree models are unaffected by monotonic capping, but benefit from indicator flags on anomalies."
        ),
        common_methods=[
            "Capping: np.clip(df[col], lower, upper)",
            "Trimming: df.drop(index=outlier_indices)",
            "Flagging: df['is_outlier'] = outlier_mask.astype(int)",
            "Log Transform: np.log1p(df[col])"
        ],
        when_to_use="Whenever numerical features contain observations beyond 3 standard deviations or 1.5x IQR.",
        when_not_to_use="Do not apply treatment without first checking column distributions and downstream algorithm requirements.",
        common_mistakes=[
            "Blindly deleting all outliers, causing severe sample size reduction and survivor bias.",
            "Capping target variable y instead of predictor features X without adjusting regression interpretations.",
            "Treating outliers before train-test split, leaking global distribution bounds into the test set."
        ],
        interview_tip=(
            "The perfect interview answer for 'How do you handle outliers?': "
            "'1. Detect using IQR or Modified Z-Score. 2. Diagnose root cause (measurement error vs legitimate extreme event). "
            "3. If error, drop or correct. If legitimate, use Winsorization (capping) or log transform for linear models, "
            "or retain as-is using tree-based models like XGBoost. 4. Never remove without auditing sample loss.'"
        ),
        related_concepts=["outlier", "outlier_removal", "winsorization", "iqr", "zscore", "modified_zscore"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_handle_01",
            question="What is the recommended treatment for a legitimate, real-world extreme value in a dataset intended for Linear Regression?",
            options=[
                "Delete the entire row",
                "Winsorization (capping) or a log transformation, to retain the sample while stabilizing variance",
                "Replace the value with zero",
                "Ignore it because Linear Regression is immune to outliers"
            ],
            correct_option_index=1,
            explanation="Winsorization (capping) or logarithmic transformation preserves the observation and sample size while compressing the extreme tail to prevent variance explosion."
        )
    )
]
