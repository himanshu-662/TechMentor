"""Educational concepts covering Step 13: Evaluation & Generalization Metrics (Confusion Matrix, Precision, Recall, F1, RMSE, R2, MAE, MSE)."""
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

EVALUATION_CONCEPTS = [
    EducationalConcept(
        concept_id="model_evaluation",
        category="statistics",
        title="Model Evaluation & Generalization Verification",
        short_definition="The systematic measurement of predictive performance on strictly isolated test data (y_pred vs y_test) to quantify real-world generalization.",
        beginner_explanation=(
            "Imagine you are grading a student's final exam. You don't judge their intelligence by asking if they memorized the textbook pages; "
            "you grade them on how accurately they solve brand new test questions! "
            "Model Evaluation is that exact grading scorecard. We compare the model's test predictions (y_pred) directly against the true real-world answer key (y_test) "
            "to calculate objective scores like Accuracy, Precision, Recall, or Root Mean Squared Error."
        ),
        intermediate_explanation=(
            "Model evaluation provides empirical estimates of out-of-sample generalization risk $\\mathbb{E}[\\mathcal{L}(f(X), Y)]$. "
            "Different business objectives require fundamentally different evaluation metrics: "
            "1. Classification: Accuracy measures global correctness but fails under severe class imbalance; Precision and Recall isolate False Positive vs False Negative trade-offs. "
            "2. Regression: $R^2$ measures proportion of variance explained; RMSE penalizes severe outlier errors via quadratic squaring; MAE provides a linear, intuitive average error magnitude. "
            "3. Multi-Model Benchmarking: Comparing candidate models across identical test folds prevents selection bias."
        ),
        technical_explanation=(
            "Under the i.i.d. assumption, the test sample risk $\\hat{R}_{\\text{test}}(f) = \\frac{1}{N_{\\text{test}}} \\sum_{i=1}^{N_{\\text{test}}} \\mathcal{L}(f(x_i), y_i)$ "
            "is an unbiased, minimum-variance estimator of population risk $\\mathcal{R}(f)$. "
            "By Central Limit Theorem, confidence intervals can be constructed as $\\hat{R}_{\\text{test}} \\pm z_{1-\\alpha/2} \\frac{\\hat{\\sigma}_{\\text{test}}}{\\sqrt{N_{\\text{test}}}}$. "
            "Evaluating multiple metrics simultaneously mitigates Goodhart's Law, where optimizing a single metric distorts model behavior."
        ),
        why_it_matters=(
            "Evaluation is the ultimate gatekeeper between offline ML experimentation and live business deployment. "
            "Deploying a model based on the wrong metric (e.g. 99% accuracy on a 1% fraud rate where recall is 0%) causes catastrophic financial and operational failure."
        ),
        real_world_example=ConceptExample(
            title="Loan Default: Evaluation Metric Alignment",
            description="Comparing 3 candidate models on 2,000 test loan applications with 5% default rate.",
            table_headers=["Candidate Model", "Accuracy", "Precision (Default)", "Recall (Default)", "F1-Score", "Business Impact"],
            table_rows=[
                ["Baseline (Predict All Paid)", "95.0%", "0.0%", "0.0%", "0.00", "Catastrophic ($1.2M unflagged defaults)"],
                ["Decision Tree", "92.4%", "58.0%", "64.0%", "0.61", "Moderate ($450K defaults caught)"],
                ["Gradient Boosting (Tuned)", "94.8%", "76.5%", "82.0%", "0.79", "Optimal ($980K defaults prevented)"]
            ],
            takeaway="Accuracy alone hid the total failure of the baseline model, while Recall and F1 highlighted true business value."
        ),
        ml_impact="Dictates model deployment decisions, production monitoring baselines, and hyperparameter optimization objectives.",
        common_methods=["classification_report", "confusion_matrix", "mean_squared_error", "r2_score", "cross_val_score"],
        when_to_use="Always during Step 13 as the definitive final validation of the 13-step machine learning pipeline.",
        when_not_to_use="Never compute evaluation metrics on the training set to report final expected production accuracy.",
        common_mistakes=[
            "Relying solely on Accuracy for imbalanced datasets (e.g. 99% accuracy when positive class is never predicted).",
            "Comparing RMSE across two datasets with completely different target scales without normalizing.",
            "Selecting a regression model solely on $R^2$ without checking residual distribution plots."
        ],
        interview_tip="Why can $R^2$ be negative in regression evaluation? $R^2 = 1 - \\frac{\\text{SS}_{\\text{res}}}{\\text{SS}_{\\text{tot}}}$. If the model's test predictions have larger squared error than simply predicting the training mean $\\bar{y}$ for every sample, then $\\text{SS}_{\\text{res}} > \\text{SS}_{\\text{tot}}$, driving $R^2 < 0$. This indicates severe model failure or negative generalization.",
        related_concepts=["prediction", "train_test_split", "loss_function", "residuals"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_evaluation_1",
            question="If an anomaly detection model achieves 99.5% accuracy on a dataset where 0.5% of records are anomalies by predicting 'Normal' for every row, what is its Recall?",
            options=[
                "99.5%",
                "0.0% (Zero true anomalies caught)",
                "50.0%",
                "100.0%"
            ],
            correct_option_index=1,
            explanation="Recall = TP / (TP + FN). Since the model predicted 'Normal' for all records, TP = 0, meaning Recall is exactly 0%."
        )
    ),
    EducationalConcept(
        concept_id="confusion_matrix",
        category="statistics",
        title="Confusion Matrix & Classification Diagnostics",
        short_definition="A 2x2 (or KxK) contingency table cross-tabulating ground-truth actual classes against model predicted classes (True Positives, False Positives, True Negatives, False Negatives).",
        beginner_explanation=(
            "Think of a confusion matrix like an organized four-box audit report: "
            "1. True Positive (TP): You had COVID, and the test said Positive (Correct!). "
            "2. True Negative (TN): You were healthy, and the test said Negative (Correct!). "
            "3. False Positive (FP): You were healthy, but the test gave a false alarm (Type I Error). "
            "4. False Negative (FN): You had COVID, but the test missed it (Type II Error - dangerous!). "
            "The confusion matrix lays out all 4 possibilities so you can see exactly where the model makes mistakes."
        ),
        intermediate_explanation=(
            "From the confusion matrix counts, all standard classification metrics are derived: "
            "$$\\text{Accuracy} = \\frac{TP + TN}{TP + TN + FP + FN}$$ "
            "$$\\text{Precision} = \\frac{TP}{TP + FP} \\quad (\\text{Positive Predictive Value})$$ "
            "$$\\text{Recall / Sensitivity} = \\frac{TP}{TP + FN} \\quad (\\text{True Positive Rate})$$ "
            "$$\\text{Specificity} = \\frac{TN}{TN + FP} \\quad (\\text{True Negative Rate})$$ "
            "$$\\text{F}_1 = 2 \\cdot \\frac{\\text{Precision} \\cdot \\text{Recall}}{\\text{Precision} + \\text{Recall}}$$"
        ),
        technical_explanation=(
            "In multi-class classification with $K$ classes, the confusion matrix $C \\in \\mathbb{Z}^{K \\times K}$ has entry $C_{ij}$ representing "
            "the number of samples known to be in class $i$ and predicted to be in class $j$. "
            "The trace $\\text{Tr}(C) = \\sum_{i=1}^K C_{ii}$ represents total correct predictions. "
            "Macro-averaged F1 computes unweighted mean across classes $\\frac{1}{K} \\sum F_1^{(k)}$, giving equal weight to minority classes, "
            "whereas Weighted F1 weights each class by its support $N_k / N$."
        ),
        why_it_matters=(
            "Provides an unvarnished, full-spectrum breakdown of error types, revealing whether a classifier is suffering from precision bottlenecks or recall blind spots."
        ),
        real_world_example=ConceptExample(
            title="Spam Filtering vs Cancer Diagnosis",
            description="Contrasting error tolerance in two different domains.",
            table_headers=["Domain", "Priority Metric", "Most Harmful Error", "Optimization Strategy"],
            table_rows=[
                ["Spam Filter", "Precision (>99%)", "False Positive (Important email sent to spam)", "High decision threshold (tau = 0.85)"],
                ["Cancer Screening", "Recall (>98%)", "False Negative (Cancer missed until too late)", "Low decision threshold (tau = 0.15)"],
                ["Autonomous Driving", "F1-Score / Recall", "False Negative (Obstacle undetected)", "Ensemble sensor fusion"]
            ],
            takeaway="A confusion matrix lets you tailor error trade-offs to the exact asymmetric penalty of your domain."
        ),
        ml_impact="Forms the empirical basis for precision-recall curves, ROC analysis, and cost-matrix utility optimization.",
        common_methods=["confusion_matrix(y_true, y_pred)", "ConfusionMatrixDisplay", "classification_report"],
        when_to_use="For every classification model evaluated in Step 13.",
        when_not_to_use="Do not apply confusion matrix formulas directly to continuous regression outputs.",
        common_mistakes=[
            "Inverting rows and columns (Scikit-Learn convention is rows = actual ground truth, columns = model predictions).",
            "Ignoring the off-diagonal error numbers and only reading the total accuracy percentage."
        ],
        interview_tip="In Scikit-Learn's `confusion_matrix(y_true, y_pred)`, which axis represents the ground truth and which represents predictions? Rows represent the actual ground-truth classes ($y_{\\text{true}}$), and columns represent the predicted labels ($y_{\\text{pred}}$). The top-left cell $[0, 0]$ is True Negative (TN), top-right $[0, 1]$ is False Positive (FP), bottom-left $[1, 0]$ is False Negative (FN), and bottom-right $[1, 1]$ is True Positive (TP).",
        related_concepts=["model_evaluation", "prediction", "decision_threshold"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_confusion_matrix_1",
            question="If a spam classifier flags an important job offer email as 'Spam', which type of error occurred in the confusion matrix?",
            options=[
                "True Positive",
                "False Positive (Type I Error)",
                "False Negative (Type II Error)",
                "True Negative"
            ],
            correct_option_index=1,
            explanation="The email was actually non-spam (negative), but the model falsely predicted spam (positive), creating a False Positive."
        )
    ),
    EducationalConcept(
        concept_id="regression_metrics",
        category="statistics",
        title="Regression Metrics: RMSE, R², MAE, MSE",
        short_definition="Quantitative metrics measuring the magnitude and explained variance of continuous prediction errors (y_test vs y_pred).",
        beginner_explanation=(
            "Imagine you are estimating house prices: "
            "1. MAE (Mean Absolute Error) is the everyday average error: 'On average, my price guesses are off by $15,000.' "
            "2. RMSE (Root Mean Squared Error) is like MAE with an extra alarm for huge mistakes: if you miss one house price by $200,000, RMSE spikes dramatically because errors are squared first! "
            "3. R² (R-squared) is your overall percentage score (0% to 100%): 'My model explains 88% of why house prices vary across the city!'"
        ),
        intermediate_explanation=(
            "Mathematical formulations and properties: "
            "$$\\text{MAE} = \\frac{1}{N} \\sum_{i=1}^N |y_i - \\hat{y}_i| \\quad (\\text{Linear loss, robust to extreme outliers})$$ "
            "$$\\text{MSE} = \\frac{1}{N} \\sum_{i=1}^N (y_i - \\hat{y}_i)^2 \\quad (\\text{Differentiable quadratic loss, heavily penalizes large errors})$$ "
            "$$\\text{RMSE} = \\sqrt{\\text{MSE}} \\quad (\\text{In identical scale and units as target } y)$$ "
            "$$R^2 = 1 - \\frac{\\sum (y_i - \\hat{y}_i)^2}{\\sum (y_i - \\bar{y})^2} \\quad (\\text{Proportion of total variance explained})$$"
        ),
        technical_explanation=(
            "Minimizing MSE corresponds to maximum likelihood estimation under Gaussian error assumption $\\epsilon_i \\sim \\mathcal{N}(0, \\sigma^2)$, "
            "estimating the conditional mean $\\mathbb{E}[Y|X]$. Minimizing MAE corresponds to Laplace error assumption, estimating the conditional median $\\text{Median}(Y|X)$. "
            "Adjusted $R^2 = 1 - \\frac{(1-R^2)(N-1)}{N - p - 1}$ penalizes the addition of non-informative predictor features $p$ to prevent artificial $R^2$ inflation."
        ),
        why_it_matters=(
            "Choosing between MAE and RMSE determines whether your model focuses on median typical behavior or actively protects against rare catastrophic prediction outliers."
        ),
        real_world_example=ConceptExample(
            title="Supply Chain Delivery Time Estimation",
            description="Comparing MAE vs RMSE for delivery predictions on 500 shipments.",
            table_headers=["Metric", "Value", "Scale Units", "Business Interpretation"],
            table_rows=[
                ["MAE", "1.8 hours", "Hours", "On average, typical delivery estimates are within 1.8 hours."],
                ["RMSE", "5.4 hours", "Hours", "A few severe storm delays (e.g. +36 hrs) pushed RMSE up, showing outlier sensitivity."],
                ["R² Score", "0.86 (86%)", "Unitless [0, 1]", "Model accounts for 86% of historical delivery time variance."]
            ],
            takeaway="RMSE and MAE together reveal that while typical accuracy is high, occasional extreme delivery delays occur."
        ),
        ml_impact="Governs loss function gradients during model training and validates final accuracy on test partitions.",
        common_methods=["mean_squared_error", "mean_absolute_error", "r2_score", "root_mean_squared_error"],
        when_to_use="For every continuous regression model evaluated in Step 13.",
        when_not_to_use="Do not apply regression metrics to categorical classification problems.",
        common_mistakes=[
            "Assuming $R^2 = 0.90$ means the model has no large errors (RMSE should always be checked).",
            "Reporting MSE to non-technical stakeholders without taking the square root to get RMSE in interpretable units."
        ],
        interview_tip="When would you prefer MAE over RMSE in a real-world project? Use MAE when your dataset contains legitimate extreme outliers that you do not want to dominate the model's loss function (e.g. financial transaction amounts with occasional billion-dollar outliers). Use RMSE when large errors are disproportionately costly (e.g. structural engineering tolerance or aircraft fuel estimation).",
        related_concepts=["model_evaluation", "residuals", "loss_function"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_regression_metrics_1",
            question="If a regression model's Mean Squared Error is 100 on a salary prediction task (where target is in dollars), what is its Root Mean Squared Error (RMSE)?",
            options=[
                "$100",
                "$10 (in actual salary dollars)",
                "10,000",
                "0.10"
            ],
            correct_option_index=1,
            explanation="RMSE = sqrt(MSE) = sqrt(100) = $10 in the original target units."
        )
    )
]
