"""Educational concepts specifically covering Step 10: Train-Test Split (Data Leakage, Stratification, Cross-Validation, Golden Rules)."""
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

TRAIN_TEST_SPLIT_CONCEPTS = [
    EducationalConcept(
        concept_id="train_test_split",
        category="data_fundamentals",
        title="Train-Test Split & Data Leakage Prevention",
        short_definition="The process of partitioning a dataset into isolated subsets to fit models and objectively evaluate generalization without data leakage.",
        beginner_explanation=(
            "Imagine preparing for a final exam. If your teacher gives you the exact questions and answers the night before, "
            "you might score 100% simply by memorizing them. But that does not mean you actually learned the subject! "
            "To test genuine understanding, the teacher must test you on completely unseen questions. "
            "In machine learning, the Training Set is your textbook and practice homework (what the model learns from), "
            "and the Testing Set is the final exam locked in a vault until the model has finished studying."
        ),
        intermediate_explanation=(
            "A standard machine learning workflow partitions data into two or three strictly isolated partitions: "
            "1. Training Set (typically 70-80%): Used to estimate model parameters (weights, coefficients, tree split thresholds). "
            "2. Testing Set (typically 20-30%): Locked away and used solely for final unbiased performance estimation. "
            "3. Validation Set (optional or via Cross-Validation): Used for hyperparameter tuning and model architecture selection. "
            "The cardinal sin of data science is Data Leakage — introducing information about the test partition during training or preprocessing. "
            "Any scaling, imputation, encoding, or feature selection must be fit strictly on the Training fold and only applied to the Test fold."
        ),
        technical_explanation=(
            "Given empirical sample $\\mathcal{D} = \\{(x_i, y_i)\\}_{i=1}^N \\sim \\mathcal{P}(X, Y)$, we partition $\\mathcal{D}$ into disjoint index sets "
            "$\\mathcal{I}_{\\text{train}} \\cap \\mathcal{I}_{\\text{test}} = \\emptyset$ where $|\\mathcal{I}_{\\text{train}}| = N_{\\text{train}}$ and $|\\mathcal{I}_{\\text{test}}| = N_{\\text{test}}$. "
            "The empirical risk minimizer $\\hat{f} = \\arg\\min_{f \\in \\mathcal{F}} \\frac{1}{N_{\\text{train}}} \\sum_{i \\in \\mathcal{I}_{\\text{train}}} \\mathcal{L}(f(x_i), y_i)$ "
            "is evaluated via out-of-sample risk $\\hat{R}_{\\text{test}}(\\hat{f}) = \\frac{1}{N_{\\text{test}}} \\sum_{j \\in \\mathcal{I}_{\\text{test}}} \\mathcal{L}(\\hat{f}(x_j), y_j)$. "
            "Under i.i.d. sampling assumptions, $\\mathbb{E}[\\hat{R}_{\\text{test}}] = R_{\\text{true}}(\\hat{f})$, yielding an unbiased estimator of true generalization error."
        ),
        why_it_matters=(
            "Without an isolated test split, evaluation metrics only report training memorization (optimism bias). "
            "Models that look flawless on training data frequently collapse when deployed to real-world production users. "
            "Isolating the test set prevents catastrophic business failures and overconfident predictions."
        ),
        real_world_example=ConceptExample(
            title="Hospital Readmission Prediction with Data Leakage",
            description="Comparing naive training evaluation vs isolated out-of-sample test evaluation.",
            table_headers=["Scenario", "Training Accuracy", "Test Accuracy", "Outcome in Production Hospital"],
            table_rows=[
                ["Evaluated on Training Set (Memorized)", "99.2%", "N/A", "Model fails immediately in clinical trials (61% real accuracy)"],
                ["Scaled on Whole Dataset (Leaked)", "94.5%", "93.1% (Flawed)", "Test metrics are inflated because test mean leaked into scaler"],
                ["Proper Isolated Split (No Leakage)", "88.4%", "86.2% (True)", "Accurate, realistic clinical decision support"]
            ],
            takeaway="A properly isolated test split provides honest, dependable accuracy estimates that mirror production performance."
        ),
        ml_impact="Guarantees unbiased generalization error estimation; completely eliminates data leakage when preprocessing pipelines are fitted exclusively on training data.",
        common_methods=["train_test_split()", "StratifiedShuffleSplit", "KFold", "TimeSeriesSplit", "GroupKFold"],
        when_to_use="Always! Every supervised machine learning problem requires rigorous train/test partitioning prior to model fitting.",
        when_not_to_use="Unsupervised clustering or exploratory profiling tasks where no predictive model or target inference is evaluated.",
        common_mistakes=[
            "Fitting StandardScaler, OneHotEncoder, or SimpleImputer on the entire dataset before splitting (severe data leakage!).",
            "Randomly shuffling time series data instead of chronological temporal splitting (predicting the past using future data).",
            "Failing to stratify on rare imbalanced classes, resulting in 0 positive samples in the test fold.",
            "Repeatedly evaluating on the test set to tweak hyperparameters (which slowly overfits the test set; use a validation set or CV instead)."
        ],
        interview_tip="How do you detect and prevent data leakage? Fit all transformers (scalers, encoders, imputers, selectors) strictly on X_train (`fit_transform`), and only call `transform()` on X_test. Use Scikit-Learn `Pipeline` objects to enforce this automatically.",
        related_concepts=["stratified_sampling", "cross_validation", "data_leakage", "overfitting", "evaluation_metrics"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_train_test_split_1",
            question="Why must a `StandardScaler` be fit ONLY on the training fold (X_train) and never on the full dataset?",
            options=[
                "StandardScaler only supports arrays with fewer than 1,000 rows",
                "Fitting on the whole dataset leaks test distribution parameters (mean and standard deviation) into the training process, producing unrealistically optimistic scores",
                "Python throws a syntax error if StandardScaler sees test data",
                "Test data must always remain non-numerical strings"
            ],
            correct_option_index=1,
            explanation="Fitting on the entire dataset allows the test set's mean $\\mu$ and variance $\\sigma^2$ to bleed into the training data transformation, creating subtle data leakage."
        )
    ),
    EducationalConcept(
        concept_id="stratified_sampling",
        category="data_fundamentals",
        title="Stratified Sampling (Preserving Class Balance)",
        short_definition="A sampling technique that ensures each partition (train and test) maintains the exact same class proportion as the original dataset.",
        beginner_explanation=(
            "Imagine a bag of 100 marbles: 90 are blue and 10 are gold. "
            "If you randomly grab 20 marbles with your eyes closed, you might accidentally grab 0 gold marbles! "
            "Your sample would completely miss the rare gold marbles. "
            "Stratified sampling acts like an observant organizer: it intentionally picks 18 blue and 2 gold marbles, "
            "so the 90/10 ratio is perfectly preserved in your sample."
        ),
        intermediate_explanation=(
            "In imbalanced classification problems (e.g. credit card fraud with 99.5% legitimate transactions and 0.5% fraud), "
            "naive random splitting can easily place all fraud cases into the training set and zero cases into the test set. "
            "Stratified train-test split (`stratify=y`) divides the dataset within each class stratum independently, "
            "guaranteeing identical class distributions across $y_{\\text{train}}$ and $y_{\\text{test}}$."
        ),
        technical_explanation=(
            "Let target $Y \\in \\{1, \\dots, C\\}$ with prior class proportions $p_c = P(Y = c)$. "
            "Stratified sampling enforces the condition: "
            "$\\frac{N_{\\text{train}}^{(c)}}{N_{\\text{train}}} \\approx \\frac{N_{\\text{test}}^{(c)}}{N_{\\text{test}}} \\approx p_c \\quad \\forall c \\in \\{1, \\dots, C\\}$, "
            "minimizing sampling variance of empirical class error rates across folds."
        ),
        why_it_matters=(
            "Without stratification, test sets may contain too few minority class samples, rendering precision, recall, "
            "and ROC-AUC calculations statistically unreliable or completely undefined."
        ),
        real_world_example=ConceptExample(
            title="Credit Card Fraud Detection Dataset (10,000 Transactions)",
            description="Comparing naive random split vs stratified split with 1% fraud rate (100 fraud rows, 9,900 normal rows).",
            table_headers=["Splitting Method", "Train Fraud Count (80%)", "Test Fraud Count (20%)", "Test Evaluation Reliability"],
            table_rows=[
                ["Naive Random Split", "94 fraud rows (94%)", "6 fraud rows (6%)", "High variance! 1 misclassified test row swings error by 16.7%"],
                ["Stratified Split", "80 fraud rows (80%)", "20 fraud rows (20%)", "Stable, balanced representation matching true population"]
            ],
            takeaway="Stratification ensures stable minority sample counts in test sets for dependable recall and precision measurement."
        ),
        ml_impact="Stabilizes cross-validation and test set evaluation variance for imbalanced datasets.",
        common_methods=["train_test_split(..., stratify=y)", "StratifiedKFold", "StratifiedShuffleSplit"],
        when_to_use="Always for classification tasks, especially whenever class imbalance is present ($<20\\%$ minority class).",
        when_not_to_use="Continuous regression targets (where $y$ is real-valued continuous numbers) or time-series forecasting (where chronological order must be preserved).",
        common_mistakes=[
            "Passing `stratify=y` when target $y$ is a continuous float regression variable (raises an error).",
            "Attempting stratification when a rare class has only 1 total sample in the entire dataset."
        ],
        interview_tip="When should you NOT use stratified random sampling? 1) Time series problems (use `TimeSeriesSplit` to avoid lookahead bias), 2) Grouped data like multiple scans per patient (use `GroupKFold` so patient scans stay in the same fold), and 3) Continuous regression targets (unless using binned stratification).",
        related_concepts=["train_test_split", "cross_validation", "data_leakage", "class_imbalance"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_stratified_sampling_1",
            question="What is the primary benefit of passing `stratify=y` during train-test splitting of a binary classification dataset?",
            options=[
                "It automatically balances the training dataset using SMOTE",
                "It ensures the proportion of class 0 and class 1 in both training and testing sets matches the original dataset",
                "It speeds up model execution by converting features to integers",
                "It eliminates all outliers from the feature matrix"
            ],
            correct_option_index=1,
            explanation="Stratification ensures that both train and test partitions mirror the exact class ratio of the parent dataset, preventing unrepresentative test folds."
        )
    ),
    EducationalConcept(
        concept_id="data_leakage",
        category="data_fundamentals",
        title="Data Leakage (The Silent ML Killer)",
        short_definition="When information from outside the training dataset (such as target or test set distributions) is accidentally used to create the model.",
        beginner_explanation=(
            "Imagine a chef competing in a mystery ingredient cooking competition. "
            "If an assistant secretly whispers what the secret ingredient is an hour before the competition starts, "
            "the chef can pre-plan the perfect recipe and look like a genius. "
            "In machine learning, Data Leakage occurs when future or test information 'leaks' into training. "
            "The model seems to perform with genius-level accuracy during development, but fails catastrophically when served to real users."
        ),
        intermediate_explanation=(
            "Data leakage typically occurs in two primary forms: "
            "1. Target Leakage: Features contain information that would only be known after the target event occurs (e.g. including 'Account Cancellation Date' as a feature to predict 'Customer Churn'). "
            "2. Train-Test Contamination: Preprocessing transformations (imputers, scalers, target encoders, PCA, feature selection) are computed over the combined dataset before splitting. "
            "This leaks test distribution statistics (mean, variance, category encodings) directly into the model."
        ),
        technical_explanation=(
            "Let $P(Y | X)$ be the true data-generating conditional distribution. Leakage induces a surrogate distribution $\\tilde{P}(Y | X, L)$ "
            "where conditioning on leakage variable $L$ yields artificially high mutual information $I(X; Y | L) \\gg I(X; Y)$. "
            "Because $L$ is absent at production inference time $t_{\\text{prod}}$, the deploy risk is governed by $\\mathbb{E}_{P}[\\mathcal{L}(f(X), Y)] \\gg \\mathbb{E}_{\\tilde{P}}[\\mathcal{L}(f(X, L), Y)]$, "
            "manifesting as severe post-deployment model collapse."
        ),
        why_it_matters=(
            "Data leakage is the #1 reason why machine learning models with 99% accuracy in research notebooks fail in production. "
            "It gives false confidence to leadership and engineers, leading to expensive and potentially dangerous real-world failures."
        ),
        real_world_example=ConceptExample(
            title="Sepsis Shock Prediction in Intensive Care Units (ICU)",
            description="Developing an early warning model to predict sepsis 6 hours before onset.",
            table_headers=["Included Feature", "Status", "Why It Causes Data Leakage"],
            table_rows=[
                ["Heart Rate & Oxygen Saturation", "Valid Predictor", "Measured continuously prior to sepsis onset"],
                ["Administered Broad-Spectrum Antibiotics", "Target Leakage!", "Doctors only administer these antibiotics AFTER diagnosing sepsis. Leakage gives 99.8% fake accuracy!"],
                ["Full-Cohort Scaled Blood Pressure", "Contamination", "Scaling on whole dataset leaked future patient distributions into training"]
            ],
            takeaway="Removing the antibiotic administration feature dropped notebook accuracy to 84%, but saved real patient lives by catching sepsis beforehand."
        ),
        ml_impact="Creates severely inflated validation scores that completely collapse in production environments.",
        common_methods=["sklearn.pipeline.Pipeline", "Feature Store Point-in-Time Joins", "Out-of-Fold Cross Validation"],
        when_to_use="Auditing every feature and preprocessing step throughout all 13 stages of the machine learning pipeline.",
        when_not_to_use="Never acceptable in predictive modeling.",
        common_mistakes=[
            "Imputing missing values using the mean of the entire dataset before train/test split.",
            "Creating lag features on time series without strictly shifting backwards ($t - 1$).",
            "Using duplicates of the same patient or user across both training and testing folds."
        ],
        interview_tip="How do you identify target leakage in an enterprise project? Look for any feature with near-perfect correlation (e.g. >0.95) with the target, or a model that achieves unrealistically high accuracy (e.g. 99.9%) on the first iteration. Trace when that feature is populated in the database relative to when predictions are made.",
        related_concepts=["train_test_split", "stratified_sampling", "cross_validation", "feature_engineering"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_data_leakage_1",
            question="Which of the following is an example of target leakage?",
            options=[
                "Using the previous month's purchase volume to predict next month's churn",
                "Using 'Refund Issued Date' as a feature to predict whether a customer will return a product",
                "Converting categorical text to lowercase before tokenization",
                "Using an 80/20 train/test split ratio"
            ],
            correct_option_index=1,
            explanation="'Refund Issued Date' is only generated AFTER a customer has already decided to return a product. Including it leaks the outcome into the input features."
        )
    ),
    EducationalConcept(
        concept_id="cross_validation",
        category="data_fundamentals",
        title="Cross-Validation (K-Fold & Stratified)",
        short_definition="A resampling procedure used to evaluate machine learning models on multiple distinct subsets of the training data.",
        beginner_explanation=(
            "Imagine auditioning singers for a musical. If you only listen to each singer perform once for 30 seconds, "
            "someone who had a great performance might just have gotten lucky, and someone who had a small voice crack might be an amazing singer who had a dry throat. "
            "To be fair, you have each singer perform 5 different songs on 5 different days. "
            "Cross-validation is like having 5 auditions: it tests the model multiple times on different slices of data to ensure consistent talent."
        ),
        intermediate_explanation=(
            "In K-Fold Cross-Validation, the training set is partitioned into $K$ equal-sized folds. "
            "The model is trained on $K-1$ folds and validated on the remaining fold. "
            "This procedure repeats $K$ times so that every single observation is used for validation exactly once. "
            "The $K$ performance estimates are averaged to yield an overall metric along with standard deviation (error bars), "
            "providing a far more reliable indicator of model variance and stability than a single split."
        ),
        technical_explanation=(
            "Let partition $\\mathcal{D} = \\cup_{k=1}^K \\mathcal{D}_k$ with $\\mathcal{D}_i \\cap \\mathcal{D}_j = \\emptyset$. "
            "For each fold $k$, model $\\hat{f}^{(-k)}$ is trained on $\\mathcal{D} \\setminus \\mathcal{D}_k$. "
            "The cross-validation estimate is $\\text{CV}_{(K)} = \\frac{1}{N} \\sum_{k=1}^K \\sum_{i \\in \\mathcal{D}_k} \\mathcal{L}(\\hat{f}^{(-k)}(x_i), y_i)$. "
            "The variance of the CV estimator decomposes into the variance of individual fold estimates plus their pairwise covariance."
        ),
        why_it_matters=(
            "A single train/test split can be lucky or unlucky depending on random chance. "
            "K-Fold CV tests whether a model is robust and stable, or fragile and dependent on a specific data split."
        ),
        real_world_example=ConceptExample(
            title="5-Fold Cross-Validation on Diabetes Progression",
            description="Evaluating Random Forest vs Linear Regression across 5 distinct folds.",
            table_headers=["Fold", "Linear Regression $R^2$", "Random Forest $R^2$", "Insight"],
            table_rows=[
                ["Fold 1", "0.52", "0.48", "Linear regression leads on Fold 1"],
                ["Fold 2", "0.49", "0.51", "Random forest leads on Fold 2"],
                ["Fold 3", "0.51", "0.53", "Random forest leads on Fold 3"],
                ["Fold 4", "0.48", "0.50", "Random forest leads on Fold 4"],
                ["Fold 5", "0.50", "0.52", "Random forest leads on Fold 5"],
                ["Mean ± Std", "0.500 ± 0.014", "0.508 ± 0.017", "Random Forest has higher mean performance with acceptable variance"]
            ],
            takeaway="Cross-validation reports both mean performance and variance, enabling high-confidence model selection."
        ),
        ml_impact="Dramatically reduces evaluation variance and provides error bars (confidence intervals) for algorithm comparison.",
        common_methods=["cross_val_score()", "cross_validate()", "KFold", "StratifiedKFold", "RepeatedStratifiedKFold"],
        when_to_use="During model selection and hyperparameter tuning across candidate architectures.",
        when_not_to_use="Extremely massive deep learning datasets (e.g. millions of images or billions of tokens) where training a model $K$ times is cost-prohibitive (use a dedicated validation split instead).",
        common_mistakes=[
            "Using regular KFold instead of StratifiedKFold on imbalanced classification datasets.",
            "Selecting hyperparameters using the test set instead of internal cross-validation.",
            "Performing feature preprocessing on the whole dataset before passing it to `cross_val_score` (always wrap in a `Pipeline`)."
        ],
        interview_tip="What is the difference between K-Fold CV and Stratified K-Fold CV? K-Fold randomly splits data into K equal chunks regardless of class balance. Stratified K-Fold guarantees that each fold has the exact same target class distribution as the entire dataset.",
        related_concepts=["train_test_split", "stratified_sampling", "data_leakage", "evaluation_metrics"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_cross_validation_1",
            question="In 5-fold cross-validation, how many times is a model trained?",
            options=[
                "1 time",
                "5 times",
                "25 times",
                "Depends on the number of features"
            ],
            correct_option_index=1,
            explanation="The model is trained 5 times. In each iteration, 4 folds (80%) are used for training and 1 fold (20%) is held out for validation."
        )
    )
]
