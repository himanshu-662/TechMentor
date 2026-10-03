"""Educational concepts covering Feature Engineering, Interactions, Ratios, Datetimes, and Feature Leakage."""
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

FEATURE_ENGINEERING_CONCEPTS = [
    EducationalConcept(
        concept_id="feature_engineering",
        category="advanced",
        title="Feature Engineering",
        short_definition="Feature engineering is the process of using domain knowledge and mathematical transformations to create new predictive signals from raw dataset columns.",
        beginner_explanation=(
            "Imagine you are given the length and width of different plots of land. While length and width are useful, "
            "what buyers truly care about is total *Area* (Length × Width). Creating the 'Area' column from length and width "
            "is feature engineering! You give the algorithm the exact insight it needs in a simple, direct form."
        ),
        intermediate_explanation=(
            "Feature engineering exposes non-linear relationships, domain interactions, and temporal cycles to linear models "
            "and tree ensembles. Thoughtfully engineered features often provide far higher predictive accuracy improvements than model hyperparameter tuning."
        ),
        technical_explanation=(
            "Formally, feature engineering maps the input space $\\mathcal{X} \\subset \\mathbb{R}^d$ to a higher-dimensional representation "
            "$\\phi(X) \\in \\mathbb{R}^k$ where target relationships $y = f(X)$ become more linearly or piecewise separable. "
            "It bridges inductive bias gaps in classical algorithms without requiring deep representation learning."
        ),
        why_it_matters=(
            "Algorithms only know what your features show them. If critical domain metrics (like debt-to-income ratio or customer tenure) "
            "are hidden inside separate columns, models must spend capacity approximating complex interactions that you can compute deterministically in milliseconds."
        ),
        real_world_example=ConceptExample(
            title="Loan Default Prediction: Income and Loan Amount",
            description="Raw features provide Annual Income ($60,000) and Total Debt ($30,000).",
            table_headers=["Customer", "Annual Income ($)", "Total Debt ($)", "Engineered Debt-to-Income Ratio"],
            table_rows=[
                ["Applicant A", "$120,000", "$30,000", "0.25 (Low Risk)"],
                ["Applicant B", "$40,000", "$30,000", "0.75 (High Risk)"]
            ],
            takeaway="The ratio immediately isolates borrower credit risk much better than either individual dollar amount alone."
        ),
        ml_impact="Simplifies hypothesis spaces, increases linear and logistic regression capacity, and accelerates tree ensemble training.",
        common_methods=[
            "Ratios and Proportions",
            "Interaction Cross Products",
            "Date/Time Component Decomposition",
            "Grouped Summary Aggregations",
            "Discretization and Binning",
            "Frequency and Text Statistics"
        ],
        when_to_use="Whenever domain logic dictates that combinations of features (e.g. speed = distance / time) reflect real-world mechanisms.",
        when_not_to_use="When creating hundreds of uncurated polynomial cross-products that cause the curse of dimensionality and overfitting.",
        common_mistakes=[
            "Creating features using test set data (Feature Leakage).",
            "Generating thousands of noisy interaction terms without domain validation.",
            "Failing to handle division by zero in ratio features."
        ],
        interview_tip="Quote Andrew Ng: 'Coming up with features is difficult, time-consuming, requires expert knowledge. Applied machine learning is basically feature engineering.'",
        related_concepts=["mathematical_features", "interaction_features", "ratio_features", "datetime_features", "feature_leakage"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_fe_01",
            question="What is the primary objective of Feature Engineering?",
            options=[
                "To reduce the number of rows in the dataset",
                "To highlight meaningful domain patterns and simplify relationships for machine learning algorithms",
                "To encrypt sensitive customer data",
                "To replace all missing values automatically"
            ],
            correct_option_index=1,
            explanation="Feature engineering constructs new informative columns that make underlying relationships easier for algorithms to learn."
        )
    ),

    EducationalConcept(
        concept_id="mathematical_features",
        category="advanced",
        title="Mathematical Transformations & Arithmetic Features",
        short_definition="Arithmetic feature generation combines one or more numerical columns using mathematical operators (addition, subtraction, multiplication, powers, logarithms).",
        beginner_explanation=(
            "If your dataset has 'Product Price' and 'Quantity Purchased', multiplying them together creates 'Total Cost'. "
            "If it has 'Total Revenue' and 'Total Expenses', subtracting expenses gives 'Net Profit'. These are arithmetic features."
        ),
        intermediate_explanation=(
            "Mathematical operations create direct representations of physical and financial formulas. "
            "Linear models cannot learn that $y \\propto x_1 \\cdot x_2$ unless you explicitly supply the product feature $x_1 \\cdot x_2$."
        ),
        technical_explanation=(
            "Given numerical features $X_i, X_j$, mathematical features apply binary operators $g(X_i, X_j) = X_i \\circ X_j$ "
            "where $\\circ \\in \\{+, -, \\times, \\div\\}$, or unary non-linear mappings $h(X_i) = X_i^2, \\sqrt{X_i}, \\log(1 + X_i)$. "
            "This expands the functional basis of linear hypothesis spaces."
        ),
        why_it_matters=(
            "Models without polynomial or interactive features are strictly additive. Creating arithmetic features allows simple, fast, interpretable linear models to capture non-linear domain dynamics."
        ),
        real_world_example=ConceptExample(
            title="Retail Superstore Profit Calculation",
            description="Calculating profit from Sales, Discount, and Unit Cost.",
            table_headers=["Item", "Sales ($)", "Cost ($)", "Engineered Gross Margin ($)"],
            table_rows=[
                ["Laptop", "$1,200", "$900", "$300 (25% margin)"],
                ["Cable", "$20", "$5", "$15 (75% margin)"]
            ],
            takeaway="Gross margin (Sales - Cost) isolates product profitability directly."
        ),
        ml_impact="Enables linear models to learn multiplicative, differential, and power relationships.",
        common_methods=["Addition / Subtraction", "Multiplication", "Power / Square Root", "Logarithmic Transformation"],
        when_to_use="When standard domain formulas combine features into meaningful totals, differences, or margins.",
        when_not_to_use="Arbitrary random math operations without domain justification.",
        common_mistakes=[
            "Executing unsafe string evaluations (like eval()).",
            "Dividing by zero without fallback imputation."
        ],
        interview_tip="Always justify mathematical features with domain logic (e.g. 'I created BMI because Weight / Height^2 is medically correlated with cardiovascular risk').",
        related_concepts=["feature_engineering", "ratio_features", "interaction_features"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_math_01",
            question="Why is a product feature (Price × Quantity) necessary for Linear Regression?",
            options=[
                "Linear regression cannot multiply two independent features internally; its hypothesis is strictly additive (w1*x1 + w2*x2).",
                "Linear regression only accepts integer inputs.",
                "It prevents duplicate row errors.",
                "It normalizes the mean to zero."
            ],
            correct_option_index=0,
            explanation="Linear regression calculates $\\sum w_i x_i$. It cannot learn multiplicative interactions unless the product term is explicitly provided as a feature."
        )
    ),

    EducationalConcept(
        concept_id="interaction_features",
        category="advanced",
        title="Interaction Features",
        short_definition="An interaction feature captures the combined synergistic effect of two or more features when the impact of one feature depends on the level of another.",
        beginner_explanation=(
            "Think of caffeine and sleep deprivation. Having a cup of coffee when you are fully rested has a mild effect. "
            "Having a cup of coffee when you are exhausted has a massive effect! The combined effect is an *interaction*."
        ),
        intermediate_explanation=(
            "In statistical modeling, an interaction occurs when the effect of feature $A$ on target $Y$ varies depending on the value of feature $B$. "
            "Cross-product terms $A \\times B$ explicitly capture this synergy."
        ),
        technical_explanation=(
            "In regression, the model $Y = \\beta_0 + \\beta_1 X_1 + \\beta_2 X_2 + \\beta_3 (X_1 X_2) + \\epsilon$ models $\\frac{\\partial Y}{\\partial X_1} = \\beta_1 + \\beta_3 X_2$, "
            "meaning the marginal effect of $X_1$ is a linear function of $X_2$."
        ),
        why_it_matters=(
            "Linear models cannot capture synergistic or antagonistic dependencies between variables without interaction terms."
        ),
        real_world_example=ConceptExample(
            title="Real Estate: House Size vs Neighborhood Quality Index",
            description="Adding 500 sq ft in a luxury neighborhood adds $400k in value, while adding 500 sq ft in an industrial zone adds $50k.",
            table_headers=["House", "SqFt", "Neighborhood Score (1-10)", "Interaction (SqFt × Score)"],
            table_rows=[
                ["House #1", "2,000", "9 (Luxury)", "18,000 (Very High Value)"],
                ["House #2", "2,000", "3 (Industrial)", "6,000 (Modest Value)"]
            ],
            takeaway="The interaction term allows the model to scale the value of square footage based on location quality."
        ),
        ml_impact="Significantly boosts linear model and shallow decision tree performance on interdependent domains.",
        common_methods=["Pairwise Multiplication ($X_1 \\times X_2$)", "Categorical × Numerical Interactions"],
        when_to_use="When real-world domain intuition suggests that two features amplify or dampen each other's effects.",
        when_not_to_use="Generating all $O(N^2)$ pairwise combinations on wide datasets (causes feature explosion and overfitting).",
        common_mistakes=[
            "Blindly creating all polynomial interactions on datasets with 100+ columns.",
            "Forgetting to scale interaction terms before regularized linear regression."
        ],
        interview_tip="Explain how feature explosion ($N(N-1)/2$ combinations) leads to the curse of dimensionality and requires careful feature selection.",
        related_concepts=["mathematical_features", "ratio_features", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_interact_01",
            question="If a dataset has 50 numerical features, how many pairwise interaction features (A × B) would be generated if all were created?",
            options=[
                "100",
                "1,225",
                "2,500",
                "50"
            ],
            correct_option_index=1,
            explanation="The number of unique 2-way combinations is $50 \\times 49 / 2 = 1,225$, illustrating the risk of feature explosion."
        )
    ),

    EducationalConcept(
        concept_id="ratio_features",
        category="advanced",
        title="Ratio Features & Proportions",
        short_definition="A ratio feature divides one numerical column by another to measure relative scale, rate, density, or proportion.",
        beginner_explanation=(
            "Comparing a company with $10M in revenue and 1,000 employees to a company with $2M in revenue and 5 employees is tricky. "
            "Calculating 'Revenue per Employee' ($10k vs $400k) immediately reveals that the smaller company is vastly more productive!"
        ),
        intermediate_explanation=(
            "Ratios normalize absolute measurements against scale or capacity (e.g. debt-to-income, cost-per-click, goals-per-game). "
            "They allow fair comparison across entities of vastly different sizes."
        ),
        technical_explanation=(
            "Let $R = X_1 / X_2$. Ratios linearize hyperbolic relationships and remove size scale invariance. "
            "Special care must be taken with the denominator $X_2$: as $X_2 \\to 0$, $R \\to \\pm \\infty$. Zero and near-zero values require deterministic imputation."
        ),
        why_it_matters=(
            "Absolute values often correlate with entity size rather than underlying quality or efficiency. Ratios isolate performance density."
        ),
        real_world_example=ConceptExample(
            title="Hospital Efficiency: Beds vs Staff",
            description="Comparing hospital resource allocations.",
            table_headers=["Hospital", "Patient Admissions", "Total Staff", "Patients per Staff Ratio"],
            table_rows=[
                ["Metro General", "12,000", "3,000", "4.0 (Well Staffed)"],
                ["County Health", "5,000", "500", "10.0 (Understaffed)"]
            ],
            takeaway="Ratios normalize operational load regardless of total hospital size."
        ),
        ml_impact="Improves tree and linear model generalization by removing raw scale confounding.",
        common_methods=["Per-unit ratios (e.g. Sales / Area)", "Percentage of Total (e.g. Rent / Income)"],
        when_to_use="When evaluating rates, efficiency, density, or proportion against a base denominator.",
        when_not_to_use="When the denominator frequently contains exact zeros with no natural replacement.",
        common_mistakes=[
            "Failing to handle division by zero (creating Inf values that crash scikit-learn models).",
            "Dividing by numbers very close to zero, producing erratic extreme outliers."
        ],
        interview_tip="Always highlight division-by-zero mitigation strategies: e.g. $X_1 / (X_2 + \\epsilon)$ or setting zero-denominator ratios to 0/NaN with an indicator flag.",
        related_concepts=["mathematical_features", "interaction_features", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_ratio_01",
            question="What is the most critical edge case to protect against when engineering ratio features?",
            options=[
                "String capitalization",
                "Division by zero producing Infinite (+Inf / -Inf) values",
                "Negative column indices",
                "Excessive decimal precision"
            ],
            correct_option_index=1,
            explanation="When the denominator is zero, floating-point division produces `inf` or errors, which corrupt model training unless safely handled."
        )
    ),

    EducationalConcept(
        concept_id="datetime_features",
        category="advanced",
        title="Date & Time Feature Decomposition",
        short_definition="Date and time feature extraction decomposes raw timestamps into structured temporal components (year, month, day, weekday, hour).",
        beginner_explanation=(
            "A raw timestamp like '2026-10-01 14:30:00' is hard for an algorithm to understand. "
            "Breaking it down into 'Thursday', 'October', 'Hour: 14 (2 PM)', and 'Autumn' helps models spot patterns like weekend rushes or holiday sales."
        ),
        intermediate_explanation=(
            "Machine learning algorithms cannot naturally parse timestamp strings or Unix epoch integers for human temporal rhythms. "
            "Decomposing dates extracts seasonality, day-of-week behavioral differences, and time-of-day dynamics."
        ),
        technical_explanation=(
            "Given timestamp $t \\in \\mathcal{T}$, decomposition maps $t \\mapsto (y, m, d, w, h, q) \\in \\mathbb{N}^6$ where "
            "$w = \\text{dayofweek}(t) \\in \\{0,\\dots,6\\}$ and $q = \\text{quarter}(t) \\in \\{1,2,3,4\\}$. "
            "This converts non-stationary time indices into stationary cyclical features."
        ),
        why_it_matters=(
            "Human behavior is profoundly governed by calendars and clocks (business hours vs night, weekdays vs weekends, quarterly fiscal periods)."
        ),
        real_world_example=ConceptExample(
            title="E-Commerce Taxi Ride Demand",
            description="Predicting taxi fare surges based on ride pickup timestamps.",
            table_headers=["Timestamp", "Extracted Day of Week", "Extracted Hour", "Extracted Is_Weekend"],
            table_rows=[
                ["2026-10-02 23:45:00", "Friday (4)", "23 (11 PM)", "1 (Weekend Night Surge)"],
                ["2026-10-05 08:15:00", "Monday (0)", "8 (8 AM)", "0 (Morning Commute Surge)"]
            ],
            takeaway="Temporal components expose distinct passenger behaviors."
        ),
        ml_impact="Allows tree and linear models to learn seasonal patterns and calendar effects directly.",
        common_methods=["Year, Month, Day", "Day of Week (0=Mon, 6=Sun)", "Hour, Minute", "Is_Weekend Indicator"],
        when_to_use="In any dataset containing dates, timestamps, transaction logs, or sensor events.",
        when_not_to_use="When the date is purely an arbitrary record ID without historical significance.",
        common_mistakes=[
            "Treating month (1-12) or hour (0-23) purely as linear numbers without considering cyclical boundaries (e.g. 23:59 is 1 minute away from 00:00).",
            "Leaving raw datetime strings as unparsed object columns."
        ],
        interview_tip="Mention extracting both discrete calendar components (day of week, month) and cyclical sine/cosine encodings for periodic continuity.",
        related_concepts=["cyclical_encoding", "date_difference", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_date_01",
            question="Why are raw timestamp strings (e.g. '2026-05-12 14:30:00') ineffective when fed directly to scikit-learn models?",
            options=[
                "They are treated as high-cardinality unique text strings rather than chronological numerical concepts.",
                "FastAPI rejects timestamp columns.",
                "They exceed 64-bit integer limits.",
                "They automatically cause division by zero."
            ],
            correct_option_index=0,
            explanation="Unparsed timestamps are treated as unique arbitrary strings. Decomposing them into day, month, and hour exposes actionable seasonal signals."
        )
    ),

    EducationalConcept(
        concept_id="cyclical_encoding",
        category="advanced",
        title="Cyclical Feature Encoding (Sine & Cosine)",
        short_definition="Cyclical encoding maps periodic features (like 24 hours of a day or 12 months of a year) onto a 2D circle using sine and cosine transformations.",
        beginner_explanation=(
            "On a standard clock, 11:59 PM (hour 23) and 12:01 AM (hour 0) are only two minutes apart! "
            "But to a computer looking at plain numbers, 23 and 0 look as far apart as possible. "
            "Cyclical encoding bends time into a circle so 23 and 0 sit right next to each other."
        ),
        intermediate_explanation=(
            "Using $\\sin(2\\pi \\cdot x / T)$ and $\\cos(2\\pi \\cdot x / T)$ (where $T$ is the period, like 24 for hours or 12 for months), "
            "periodic features are converted into 2 continuous Cartesian coordinates that preserve true cyclical proximity."
        ),
        technical_explanation=(
            "Let $t \\in [0, T)$. The mapping $\\phi(t) = (\\sin(2\\pi t / T), \\cos(2\\pi t / T))$ embeds the 1D interval with periodic boundary conditions "
            "$0 \\equiv T$ into the unit circle $S^1 \\subset \\mathbb{R}^2$. The Euclidean distance $\\|\\phi(t_1) - \\phi(t_2)\\|$ matches the circular chordal distance."
        ),
        why_it_matters=(
            "Without cyclical encoding, linear models and neural networks assume hour 23 and hour 0 have maximum distance, distorting midnight predictions."
        ),
        real_world_example=ConceptExample(
            title="Electricity Consumption Modeling across Midnight",
            description="Hourly power demand where 23:00 and 01:00 share similar nocturnal patterns.",
            table_headers=["Hour", "Raw Hour Distance to 00:00", "sin(2π*h/24)", "cos(2π*h/24)"],
            table_rows=[
                ["23:00 (11 PM)", "23 hours away (Misleading)", "-0.2588", "+0.9659"],
                ["00:00 (Midnight)", "0 hours away", "0.0000", "+1.0000"],
                ["01:00 (1 AM)", "1 hour away", "+0.2588", "+0.9659"]
            ],
            takeaway="Both 23:00 and 01:00 are symmetrically close to 00:00 in sine/cosine space."
        ),
        ml_impact="Critical for Neural Networks, Linear Regression, and Distance-based algorithms modeling periodic time series.",
        common_methods=["Sine and Cosine pairs: $\\sin(2\\pi h/24), \\cos(2\\pi h/24)$"],
        when_to_use="When time features (hour, day of week, day of year, month, angle) repeat cyclically and are fed into distance or gradient models.",
        when_not_to_use="When downstream models are deep tree ensembles that can split non-linearly, or when periodic continuity is irrelevant.",
        common_mistakes=[
            "Using only the sine transform without cosine (sine alone cannot distinguish between morning and evening symmetric angles).",
            "Setting the incorrect period $T$ (e.g. dividing day of week by 6 instead of 7)."
        ],
        interview_tip="Always explain why both sine AND cosine are needed: sine alone has identical values at angle $\\theta$ and $\\pi - \\theta$ (e.g. 3 AM and 9 AM). The cosine coordinate breaks the symmetry.",
        related_concepts=["datetime_features", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_cyclical_01",
            question="Why must you generate BOTH a sine and a cosine feature when cyclically encoding hours of the day?",
            options=[
                "To satisfy GPU memory alignment",
                "Because a single trigonometric wave is symmetric (e.g. sin has the same value at 6 AM and 6 PM), requiring cosine to uniquely identify the position on the 24-hour circle",
                "Because cosine removes missing values",
                "To make the feature strictly positive"
            ],
            correct_option_index=1,
            explanation="A single sine function produces identical values at multiple times of day (e.g. $\\sin(30^\\circ) = \\sin(150^\\circ)$). The 2D pair $(\\sin, \\cos)$ provides a unique point on the circle."
        )
    ),

    EducationalConcept(
        concept_id="date_difference",
        category="advanced",
        title="Date Differences & Elapsed Durations",
        short_definition="Date difference feature engineering computes the elapsed time duration (in days, hours, or minutes) between two chronological timestamps.",
        beginner_explanation=(
            "If a dataset lists when a customer placed an order and when the package was delivered, subtracting the two dates gives 'Delivery Time in Days'. "
            "Delivery duration is much more useful for predicting customer satisfaction than the two raw dates alone."
        ),
        intermediate_explanation=(
            "Date differences convert static calendar timestamps into dynamic operational velocities, latencies, customer tenures, or response times."
        ),
        technical_explanation=(
            "Given two datetime series $T_1, T_2$, the duration $\\Delta t = (T_2 - T_1) / \\text{TimeUnit}$ calculates elapsed duration. "
            "Negative durations ($\\Delta t < 0$) indicate data quality anomalies (e.g., event recorded before initiation)."
        ),
        why_it_matters=(
            "Durations directly measure speed, customer lifecycle duration, processing efficiency, and age."
        ),
        real_world_example=ConceptExample(
            title="Insurance Claim Settlement Latency",
            description="Evaluating claim turnaround time.",
            table_headers=["Claim ID", "Filing Date", "Approval Date", "Elapsed Duration (Days)"],
            table_rows=[
                ["#C-101", "2026-01-10", "2026-01-12", "2.0 days (Fast Approval)"],
                ["#C-102", "2026-01-10", "2026-02-24", "45.0 days (Escalated Audit)"]
            ],
            takeaway="Elapsed duration directly captures operational friction."
        ),
        ml_impact="Provides direct latency and tenure signals for churn, fraud, and satisfaction models.",
        common_methods=["Duration in Days", "Duration in Hours", "Duration in Minutes"],
        when_to_use="Whenever pairs of timestamps represent the start and completion of a process.",
        when_not_to_use="When dates are unrelated or chronological ordering is meaningless.",
        common_mistakes=[
            "Not checking for negative durations caused by data logging inconsistencies.",
            "Using inconsistent units (e.g. mixing hours and days)."
        ],
        interview_tip="Emphasize that duration features turn non-stationary calendar dates into stationary numerical features suitable for time-series cross validation.",
        related_concepts=["datetime_features", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_datediff_01",
            question="What data quality issue is immediately revealed if a Date Difference feature produces negative values (e.g. Delivery Date - Order Date = -3 days)?",
            options=[
                "Feature leakage",
                "Chronological inconsistency or corrupt timestamp logging",
                "Overfitting",
                "Zero variance"
            ],
            correct_option_index=1,
            explanation="A negative duration between an initiation and completion event indicates timestamps were swapped, logged in different timezones, or recorded erroneously."
        )
    ),

    EducationalConcept(
        concept_id="aggregation_features",
        category="advanced",
        title="Grouped Summary Aggregations",
        short_definition="Grouped aggregations compute group-level statistics (mean, sum, count, std, min, max) of a numerical column partitioned by a categorical entity.",
        beginner_explanation=(
            "If you know how much money a customer spent today, that is helpful. But if you also know that their average spending over the past year is $20, "
            "a $500 purchase suddenly looks like a massive anomaly! Group aggregations give your model historical and group-level context."
        ),
        intermediate_explanation=(
            "Grouped aggregations calculate features like `customer_avg_spend`, `merchant_tx_count`, or `zipcode_median_income` by partitioning "
            "rows using an entity identifier (`groupby`) and broadcasting summary statistics back to individual rows."
        ),
        technical_explanation=(
            "Let $G$ be a grouping variable and $X$ be a numerical feature. The aggregation operator computes $S_g = \\text{agg}(\\{x_i : g_i = g\\})$. "
            "CRITICAL REQUIREMENT: To prevent target and temporal leakage, aggregations must be computed out-of-fold or strictly on historical data."
        ),
        why_it_matters=(
            "Single-row features lack context. Entity-level aggregations provide models with comparative baselines (e.g., is this transaction 5x higher than this user's typical spend?)."
        ),
        real_world_example=ConceptExample(
            title="Credit Card Fraud Detection",
            description="Comparing transaction amount to the user's historical mean spending.",
            table_headers=["Transaction ID", "User ID", "Current Amount ($)", "User Historical Mean ($)", "Spend Ratio vs Mean"],
            table_rows=[
                ["#TX-901", "User_44", "$25.00", "$28.00", "0.89x (Normal)"],
                ["#TX-902", "User_44", "$1,450.00", "$28.00", "51.78x (Severe Fraud Alert)"]
            ],
            takeaway="The ratio between the current transaction and user mean spend immediately surfaces the anomaly."
        ),
        ml_impact="One of the highest-impact feature engineering techniques in tabular competitive machine learning (Kaggle).",
        common_methods=["Groupby Mean / Median", "Groupby Sum", "Groupby Standard Deviation", "Groupby Count"],
        when_to_use="When entities (customers, products, locations) have repeated observations across time.",
        when_not_to_use="When grouping keys have unique 1-to-1 cardinality (e.g. primary keys where count is always 1).",
        common_mistakes=[
            "Computing aggregations over the entire dataset including test rows (Severe Feature Leakage).",
            "Grouping on columns with near-unique IDs that memorize training rows."
        ],
        interview_tip="Highlight how out-of-fold (OOF) target encoding and historical rolling window aggregations prevent feature leakage.",
        related_concepts=["feature_leakage", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_agg_01",
            question="Why is computing customer average spending across the entire combined dataset (train + test) considered a critical mistake?",
            options=[
                "It takes too much CPU memory.",
                "It causes Data Leakage because future test set transactions are used to calculate training features.",
                "It changes categorical data into text.",
                "It forces all features to be integers."
            ],
            correct_option_index=1,
            explanation="Aggregating across both train and test sets leaks test information into training features, resulting in overly optimistic validation scores that fail in production."
        )
    ),

    EducationalConcept(
        concept_id="feature_binning",
        category="advanced",
        title="Numerical Binning & Discretization",
        short_definition="Binning converts continuous numerical values into discrete categorical intervals (e.g. converting Age into 'Child', 'Adult', 'Senior').",
        beginner_explanation=(
            "Instead of looking at exact ages like 21, 22, 23, binning groups people into buckets like '18-25: College Age'. "
            "It simplifies continuous numbers into broad, easy-to-interpret categories."
        ),
        intermediate_explanation=(
            "Binning can be equal-width (dividing the range into $k$ equal slices) or custom-threshold based on domain knowledge (e.g. tax brackets). "
            "It helps linear models capture non-linear step functions without requiring complex polynomials."
        ),
        technical_explanation=(
            "Given continuous variable $X \\in [a, b]$, discretization maps $X \\mapsto B \\in \\{1,\\dots,k\\}$ based on cut points $c_0 < c_1 < \\dots < c_k$. "
            "Trade-off: Binning introduces non-linear step modeling but discards intra-bin variance and statistical power."
        ),
        why_it_matters=(
            "Useful in credit risk scorecards (FICO), regulatory reporting, and situations where non-linear thresholds exist (e.g. legal voting age at 18)."
        ),
        real_world_example=ConceptExample(
            title="Income Tax Bracket Discretization",
            description="Mapping continuous annual income into tax brackets.",
            table_headers=["Employee", "Annual Income ($)", "Discretized Bracket"],
            table_rows=[
                ["Alice", "$35,000", "Tier 1: Up to $45k"],
                ["Bob", "$85,000", "Tier 2: $45k to $95k"],
                ["Charlie", "$210,000", "Tier 3: $95k+"]
            ],
            takeaway="Binning aligns raw numbers with real-world institutional policy thresholds."
        ),
        ml_impact="Allows linear models to fit step functions; reduces sensitivity to small noisy fluctuations.",
        common_methods=["Equal-width binning", "Custom domain threshold binning", "Quantile binning"],
        when_to_use="When domain thresholds are legally or clinically defined (e.g. blood pressure categories: Normal, Prehypertension, Stage 1).",
        when_not_to_use="When subtle continuous gradations are predictive (binning discards fine-grained information).",
        common_mistakes=[
            "Using too few bins (causing extreme information loss) or too many bins (causing sparsity).",
            "Binning continuous features blindly before feeding into tree models (which already split continuously)."
        ],
        interview_tip="Explain that tree models naturally find optimal bin cut-offs, so manual binning is primarily beneficial for linear scorecards and business interpretability.",
        related_concepts=["indicator_features", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_bin_01",
            question="What is the primary drawback of binning a continuous numerical feature?",
            options=[
                "It increases the number of rows.",
                "It discards continuous variance and fine-grained information within each bin.",
                "It causes division by zero errors.",
                "It converts text into numbers."
            ],
            correct_option_index=1,
            explanation="Binning treats all values within an interval as identical (e.g., age 18 and age 29 in the '18-29' bucket), permanently losing fine-grained variation."
        )
    ),

    EducationalConcept(
        concept_id="indicator_features",
        category="advanced",
        title="Boolean Indicator & Threshold Flags",
        short_definition="Boolean indicator features create binary 0/1 flags based on whether a condition or logical threshold is met.",
        beginner_explanation=(
            "An indicator feature acts like a simple Yes/No switch: 'Is this customer over 65?', 'Is account balance negative?', or 'Is order total above $100?'. "
            "It gives the model a clear green or red signal."
        ),
        intermediate_explanation=(
            "Indicator features isolate critical binary regime changes, policy cut-offs, or special zero-inflation conditions (e.g., `has_prior_default = (defaults > 0)`)."
        ),
        technical_explanation=(
            "Let $I = \\mathbb{I}(X \\bowtie c)$ where $\\bowtie \\in \\{>, <, \\ge, \\le, ==, \\neq\\}$. "
            "This creates a step basis function $\\mathbb{I}(X > c)$ that models discontinuous jump points in target expectations."
        ),
        why_it_matters=(
            "Helps models immediately identify boundary triggers (e.g., overdraft fees triggered when balance $< 0$)."
        ),
        real_world_example=ConceptExample(
            title="E-Commerce Free Shipping Threshold",
            description="Orders $\ge \$50$ qualify for free shipping, drastically altering checkout conversion.",
            table_headers=["Order ID", "Cart Value ($)", "Engineered Flag: Is_Free_Shipping_Eligible"],
            table_rows=[
                ["#401", "$42.50", "0 (False - Customer may abandon cart)"],
                ["#402", "$58.00", "1 (True - High conversion likelihood)"]
            ],
            takeaway="The binary threshold flag directly isolates the behavioral incentive."
        ),
        ml_impact="Simplifies decision paths for linear and logistic regression models.",
        common_methods=["Threshold comparisons ($X > c$)", "Zero-inflation flags ($X == 0$)", "Missingness indicators ($X \\text{ is null}$)"],
        when_to_use="When a known sharp business or physical threshold dramatically alters outcomes.",
        when_not_to_use="When thresholding discards necessary magnitude information without retaining the original feature.",
        common_mistakes=[
            "Deleting the original continuous column after creating the boolean flag (keep both).",
            "Creating flags with 99.9% all-True or all-False values (near-zero variance)."
        ],
        interview_tip="Mention creating missingness indicator flags (`is_missing`) alongside median imputation so models can learn if data absence was informative (MNAR).",
        related_concepts=["feature_binning", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_flag_01",
            question="Why should you retain the original continuous column after creating a threshold flag (e.g. `is_high_income = income > 100000`)?",
            options=[
                "To maintain the exact continuous magnitude while providing the model with a direct threshold signal",
                "To double the size of the database",
                "Because Python requires duplicate columns",
                "To force neural networks to use float32"
            ],
            correct_option_index=0,
            explanation="Keeping both allows the model to utilize the linear continuous gradient while simultaneously having a direct step indicator for the threshold."
        )
    ),

    EducationalConcept(
        concept_id="frequency_features",
        category="advanced",
        title="Frequency & Count Encoding",
        short_definition="Frequency encoding replaces categorical levels with their occurrence count or percentage proportion in the dataset.",
        beginner_explanation=(
            "If you have a 'City' column with 500 different cities, One-Hot Encoding would create 500 messy new columns! "
            "Frequency encoding replaces 'New York' with 5,000 (how common it is) and 'Smalltown' with 12. It tells the model how popular each category is."
        ),
        intermediate_explanation=(
            "Frequency encoding converts high-cardinality categorical variables into a single informative numerical feature without increasing dataset dimensionality."
        ),
        technical_explanation=(
            "Given categorical feature $C$ with levels $l$, the mapping is $f(l) = \\frac{1}{N} \\sum_{i=1}^N \\mathbb{I}(c_i = l)$ (frequency ratio) "
            "or $\\text{count}(l)$ (raw frequency). Rare categories naturally map to small values, while common classes map to high values."
        ),
        why_it_matters=(
            "Avoids the curse of dimensionality when categorical features have hundreds or thousands of distinct categories (e.g. Zipcodes, IP addresses, Merchant IDs)."
        ),
        real_world_example=ConceptExample(
            title="Web Clickstream URL Path Encoding",
            description="An e-commerce site with 20,000 unique product URLs.",
            table_headers=["User Visit", "URL Category", "One-Hot Columns", "Frequency Ratio Feature"],
            table_rows=[
                ["Visit #1", "/homepage", "Requires 20,000 cols", "0.450 (45% of all traffic)"],
                ["Visit #2", "/rare-item-xyz", "Requires 20,000 cols", "0.0001 (Very rare page)"]
            ],
            takeaway="Frequency encoding collapses 20,000 sparse columns into a single meaningful traffic density feature."
        ),
        ml_impact="Ideal for tree ensembles (XGBoost/LightGBM) modeling high-cardinality search, ads, and transaction logs.",
        common_methods=["Category Count (Occurrences)", "Category Proportion (Count / Total Rows)"],
        when_to_use="When categorical columns have high cardinality ($>50$ unique levels) where One-Hot Encoding is impractical.",
        when_not_to_use="When two completely unrelated categories happen to share the exact same frequency count (causes collision).",
        common_mistakes=[
            "Computing frequencies on test sets (always compute on train, map to test, handle unseen categories with 0).",
            "Assuming frequency encoding captures category semantics (it only captures popularity/rarity)."
        ],
        interview_tip="Explain frequency collision: if 'Paris' and 'Tokyo' both appear 500 times, frequency encoding gives them identical values. In such cases, combine frequency encoding with Target Encoding.",
        related_concepts=["feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_freq_01",
            question="What is the primary advantage of Frequency Encoding over One-Hot Encoding for a column with 1,000 unique categories?",
            options=[
                "It creates 1,000 separate binary columns.",
                "It produces a single compact numerical column representing category prevalence without causing dimensionality explosion.",
                "It automatically removes outliers.",
                "It encrypts strings into SHA-256."
            ],
            correct_option_index=1,
            explanation="Frequency encoding replaces categories with their counts or percentages, preserving 1-column compactness while providing valuable prevalence signals."
        )
    ),

    EducationalConcept(
        concept_id="text_features",
        category="advanced",
        title="Basic Text Statistics & Deterministic Signals",
        short_definition="Basic text feature extraction computes structural, length, and character statistics from raw unstructured text columns.",
        beginner_explanation=(
            "Before using complex AI to read paragraphs, simple stats can reveal huge insights! "
            "For example, in customer reviews, angry complaints are often longer, contain more ALL CAPS words, and have multiple exclamation marks."
        ),
        intermediate_explanation=(
            "Deterministic text statistics (character count, word count, digit count, uppercase ratio) provide lightweight numerical signals "
            "from string fields without requiring large NLP language models."
        ),
        technical_explanation=(
            "Given text string $s$, feature extraction maps $s \\mapsto (\\text{len}(s), \\text{words}(s), \\text{digits}(s), \\text{upper}(s)) \\in \\mathbb{N}^4$. "
            "These metrics quantify text complexity, effort, and formatting style."
        ),
        why_it_matters=(
            "Fast, deterministic, and works seamlessly with standard tabular gradient boosting models without expensive neural embeddings."
        ),
        real_world_example=ConceptExample(
            title="Spam & Phishing Email Classification",
            description="Detecting spam from subject line formatting.",
            table_headers=["Subject Line", "Character Count", "Word Count", "Uppercase Count", "Is Likely Spam?"],
            table_rows=[
                ["Meeting notes for Tuesday", "25", "4", "1", "0 (Legitimate)"],
                ["WIN $1,000,000 FREE CASH NOW!!!", "31", "5", "21 (68% CAPS)", "1 (Spam)"]
            ],
            takeaway="Uppercase count and punctuation density immediately signal spam formatting."
        ),
        ml_impact="Provides simple yet powerful meta-features for spam, sentiment, and essay grading models.",
        common_methods=["Character Count (`len(text)`)", "Word Count", "Sentence Count", "Uppercase Character Count", "Digit Count"],
        when_to_use="When tabular datasets contain short text columns (comments, titles, descriptions, notes, addresses).",
        when_not_to_use="When deep semantic meaning and context are required (use NLP/embeddings in later stages).",
        common_mistakes=[
            "Applying word counts without stripping whitespace and punctuation.",
            "Failing to handle null text values safely (returns 0 instead of crashing)."
        ],
        interview_tip="Highlight how simple text length and uppercase features frequently rank among the top 10 most important features in spam and fraud models.",
        related_concepts=["feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_text_01",
            question="Which basic text feature is especially effective in detecting spam or urgent messaging?",
            options=[
                "Average vowel frequency",
                "Uppercase character count / ALL CAPS ratio",
                "Word count modulo 2",
                "ASCII checksum"
            ],
            correct_option_index=1,
            explanation="Spam and phishing emails heavily utilize uppercase shouting ('FREE MONEY NOW') compared to standard professional communications."
        )
    ),

    EducationalConcept(
        concept_id="feature_leakage",
        category="advanced",
        title="Feature Leakage (Target & Temporal Leakage)",
        short_definition="Feature leakage occurs when an engineered feature incorporates information from the target variable or future events that would not be available at inference time.",
        beginner_explanation=(
            "Imagine building a model to predict if a patient has pneumonia. If your dataset includes 'Pneumonia Medicine Prescribed', "
            "the model will just check if the doctor gave the medicine! It cheats by using the future outcome to make the prediction."
        ),
        intermediate_explanation=(
            "Feature leakage happens when predictors contain signals that only occur *after* the target event, or when test data statistics "
            "leak into training features during grouped aggregations and encodings."
        ),
        technical_explanation=(
            "Formally, feature $X_j$ leaks if $I(X_j; Y | \\mathcal{I}_{inference}) > 0$, meaning $X_j$ carries mutual information with $Y$ "
            "that is conditionally unobservable under the operational data generation process $\\mathcal{P}_{inference}$."
        ),
        why_it_matters=(
            "Feature leakage leads to models that score 99.9% accuracy during offline cross-validation but fail completely in live production."
        ),
        real_world_example=ConceptExample(
            title="Predicting Hospital Patient Length of Stay",
            description="Predicting if a patient will stay $>5$ days at admission time.",
            table_headers=["Feature", "Available at Admission?", "Leakage Status"],
            table_rows=[
                ["Admission Blood Pressure", "Yes (Measured at check-in)", "✅ Valid Feature"],
                ["Discharge Summary Notes", "No (Generated when leaving)", "❌ Severe Target Leakage"]
            ],
            takeaway="Never include features generated after or as a consequence of the prediction event."
        ),
        ml_impact="Creates falsely confident models that catastrophically degrade when deployed in live environments.",
        common_methods=["Strict chronological splitting", "Out-of-fold feature encoding", "Pipeline isolation"],
        when_to_use="Always audit every newly engineered feature for potential leakage before training.",
        when_not_to_use="Never allow feature leakage.",
        common_mistakes=[
            "Using aggregate statistics computed over the entire dataset.",
            "Including ID columns that are assigned sequentially after an account is approved or banned."
        ],
        interview_tip="State the golden rule of feature engineering: 'Ask yourself: At the exact millisecond this prediction is made in production, will this feature be 100% available without knowing the future?'",
        related_concepts=["data_leakage", "fit_vs_transform", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_fleak_01",
            question="What is the critical test to determine whether an engineered feature has feature leakage?",
            options=[
                "Check if the feature has a normal distribution",
                "Verify whether the feature is strictly observable at the exact moment of prediction in live production without knowing the future outcome",
                "Check if the column name is longer than 15 characters",
                "Verify that the standard deviation is equal to 1"
            ],
            correct_option_index=1,
            explanation="If a feature contains information that is only known after the prediction event or incorporates future target outcomes, it is feature leakage."
        )
    )
]
