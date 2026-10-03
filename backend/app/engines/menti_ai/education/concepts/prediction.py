"""Educational concepts covering Step 12: Prediction & Model Inference (Generalization, Decision Boundaries, Probability Calibration, Residuals)."""
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

PREDICTION_CONCEPTS = [
    EducationalConcept(
        concept_id="prediction",
        category="statistics",
        title="Model Prediction & Inductive Inference",
        short_definition="The process of applying learned mathematical weights to unseen test feature vectors (X_test) to generate predictions (y_pred) without updating parameters.",
        beginner_explanation=(
            "Think of model training like studying for a final exam using past practice problems. "
            "Model Prediction is taking the actual exam on test day with brand new questions you have never seen before! "
            "You cannot look up the answers or change what you studied—you must rely entirely on the patterns and principles you learned. "
            "In machine learning, we feed the isolated test features (X_test) into our frozen model to see how well it predicts the answers (y_pred)."
        ),
        intermediate_explanation=(
            "Prediction (or inference) computes $\\hat{y} = f(X_{\\text{test}}; \\hat{\\theta})$, where $\\hat{\\theta}$ represents the fixed parameters "
            "fitted exclusively during Step 11. Crucially, inference does not calculate gradients or update weights. "
            "For regression models, inference outputs continuous real numbers $\\hat{y} \\in \\mathbb{R}$. "
            "For classification models, inference typically calculates class probability distributions $P(Y=k|x)$ before applying a decision rule (such as $\\arg\\max$). "
            "Testing on strictly held-out data verifies that the model has learned true underlying relationships rather than memorized training noise (generalization)."
        ),
        technical_explanation=(
            "Formally, inductive inference evaluates the learned hypothesis $\\hat{f} \\in \\mathcal{F}$ over test distribution $\\mathcal{D}_{\\text{test}}$: "
            "$\\hat{y}_i = \\hat{f}(x_i) = g(w^T x_i + b)$ for linear models, or $\\hat{y}_i = \\frac{1}{B} \\sum_{b=1}^B T_b(x_i)$ for tree ensembles. "
            "Time complexity of inference is generally $\\mathcal{O}(d)$ for linear models and $\\mathcal{O}(B \\cdot \\text{depth})$ for random forests, "
            "making inference significantly faster than training. Zero data leakage at this stage ensures that test error empirical estimates "
            "$\\hat{R}_{\\text{test}}(\\hat{f})$ serve as an unbiased estimator of true generalization risk $\\mathbb{E}_{(x,y)\\sim \\mathcal{D}}[\\mathcal{L}(\\hat{f}(x), y)]$."
        ),
        why_it_matters=(
            "Prediction is the ultimate objective of the entire machine learning pipeline. "
            "Generating test predictions allows us to diagnose overconfidence, measure inference latency, and inspect individual sample residuals before deploying to production."
        ),
        real_world_example=ConceptExample(
            title="Loan Approval: Test Set Batch Inference",
            description="Feeding 500 unseen loan applicant records into a fitted Gradient Boosting model.",
            table_headers=["Applicant ID", "Actual (y_test)", "Predicted Prob P(Approved)", "Final Decision (y_pred)", "Outcome"],
            table_rows=[
                ["#1042", "Approved (1)", "0.91 (91%)", "Approved (1)", "Correct True Positive"],
                ["#1043", "Rejected (0)", "0.14 (14%)", "Rejected (0)", "Correct True Negative"],
                ["#1044", "Approved (1)", "0.48 (48%)", "Rejected (0)", "Borderline False Negative (High Risk)"],
                ["#1045", "Rejected (0)", "0.76 (76%)", "Approved (1)", "False Positive Error"]
            ],
            takeaway="Inspecting raw prediction probabilities reveals borderline edge cases that hard binary outputs conceal."
        ),
        ml_impact="Directly produces the target predictions evaluated in Step 13. Dictates production serving latency and memory bandwidth.",
        common_methods=["model.predict(X_test)", "model.predict_proba(X_test)", "model.decision_function(X_test)"],
        when_to_use="Always during Step 12 after training a model in Step 11 and before computing formal metrics in Step 13.",
        when_not_to_use="Never call predict on the full un-split dataset to claim model performance, as that leaks training memorization into your evaluation.",
        common_mistakes=[
            "Passing raw unscaled/unencoded features into predict when the model was trained on scaled/encoded data.",
            "Confusing soft class probabilities (e.g. 0.52) with high-confidence hard predictions.",
            "Evaluating model predictions against y_test before verifying that X_test feature column ordering matches X_train exactly.",
            "Modifying model weights during inference."
        ],
        interview_tip="What is the difference between `predict` and `predict_proba` in Scikit-Learn? `predict` returns hard class labels based on an internal threshold (default argmax or $\\tau = 0.5$). `predict_proba` returns the calibrated probability distribution across all classes $P(Y=c|X)$. In production, you should almost always use `predict_proba` so you can tune the decision threshold for domain-specific risk tolerances (e.g. minimizing false negatives in medical diagnostics).",
        related_concepts=["model_fitting", "train_test_split", "loss_function", "evaluation_metrics"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_prediction_1",
            question="Why must the test feature matrix X_test be kept strictly isolated from the model until Step 12?",
            options=[
                "To reduce the RAM footprint of the Python interpreter",
                "To ensure the model has no prior exposure to test records, providing an unbiased estimate of generalization",
                "Because Scikit-Learn will throw a syntax error if X_train and X_test are loaded together",
                "To automatically scale the target variable between 0 and 1"
            ],
            correct_option_index=1,
            explanation="Unbiased generalization assessment requires that the model's learned parameters have never seen or adjusted to the test partition."
        )
    ),
    EducationalConcept(
        concept_id="probability_calibration",
        category="statistics",
        title="Probability Calibration & Prediction Confidence",
        short_definition="The property where a model's predicted probability reflects the true long-run frequency of occurrence (e.g. of all samples assigned 80% confidence, 80% are truly positive).",
        beginner_explanation=(
            "Imagine a weather forecaster who says 'There is an 80% chance of rain today.' "
            "If it rains on 80 out of 100 days when they make that prediction, their forecast is well-calibrated! "
            "If it only rains 20% of the time when they claim 80% confidence, they are overconfident and poorly calibrated. "
            "In machine learning, probability calibration ensures that confidence scores are trustworthy percentages, not just wild guesses."
        ),
        intermediate_explanation=(
            "Many classification algorithms (like Naive Bayes or Support Vector Machines) produce uncalibrated probability estimates. "
            "Naive Bayes pushes probabilities toward 0 and 1 due to the independence assumption, while SVM margins require Platt scaling or isotonic regression. "
            "A well-calibrated model satisfies $\\mathbb{P}(Y=1 | \\hat{P}=p) = p$ for all $p \\in [0, 1]$. "
            "Calibration curves (reliability diagrams) plot predicted probability bins against empirical accuracy."
        ),
        technical_explanation=(
            "Calibration error is quantified via Expected Calibration Error (ECE): "
            "$\\text{ECE} = \\sum_{m=1}^M \\frac{|B_m|}{N} |\\text{acc}(B_m) - \\text{conf}(B_m)|$, "
            "where samples are partitioned into $M$ probability bins $B_m$. Post-hoc calibration methods include: "
            "1. Platt Scaling: Fitting a logistic sigmoid over raw model logits $\\sigma(A \\cdot f(x) + B)$. "
            "2. Isotonic Regression: Non-parametric monotonic piecewise constant fitting via pool adjacent violators (PAV)."
        ),
        why_it_matters=(
            "In high-stakes domains (healthcare, fraud detection, autonomous vehicles), knowing *how certain* the model is determines whether to automate a decision or route it to a human specialist."
        ),
        real_world_example=ConceptExample(
            title="Medical Triage: Confidence Scoring",
            description="Comparing raw vs calibrated probabilities for patient readmission risk.",
            table_headers=["Patient", "Raw Score", "Calibrated P(Readmit)", "Action Threshold (>0.60)", "Triage Result"],
            table_rows=[
                ["Patient A", "0.98", "0.74 (74%)", "Exceeds 0.60", "Schedule Home Nurse Follow-up"],
                ["Patient B", "0.58", "0.52 (52%)", "Below 0.60", "Standard Discharge Protocol"],
                ["Patient C", "0.85", "0.62 (62%)", "Exceeds 0.60", "Schedule Home Nurse Follow-up"]
            ],
            takeaway="Calibrated probabilities prevent over-allocating medical resources to artificially inflated 98% confidence claims."
        ),
        ml_impact="Ensures confidence outputs are statistically sound for decision thresholding and risk scoring.",
        common_methods=["CalibratedClassifierCV", "Platt scaling", "Isotonic regression", "Brier score"],
        when_to_use="Whenever model outputs are used for risk scoring, automated financial transactions, or clinical decisions.",
        when_not_to_use="When you only need ranking order (ROC-AUC) and absolute probability magnitudes do not matter.",
        common_mistakes=[
            "Assuming all classification models output true probabilities by default (e.g. SVM decision values are not probabilities).",
            "Evaluating calibration on the training dataset where probabilities are systematically overconfident.",
            "Using uncalibrated Naive Bayes scores as financial likelihood estimates."
        ],
        interview_tip="How do you check if a classifier is well-calibrated? Plot a Reliability Diagram (Calibration Curve) by binning predicted probabilities into 10 deciles (0-10%, 10-20%, ...) and plotting mean predicted probability on the X-axis against true observed accuracy on the Y-axis. A perfectly calibrated model falls exactly along the 45-degree diagonal $y = x$.",
        related_concepts=["prediction", "decision_threshold", "loss_function"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_calibration_1",
            question="If a classifier predicts 70% probability for 100 patient diagnoses, what does perfect calibration require?",
            options=[
                "All 100 patients must test negative",
                "Exactly 70 of those 100 patients should truly be positive cases",
                "The model accuracy must be 100%",
                "The training loss must reach exactly 0.0"
            ],
            correct_option_index=1,
            explanation="Calibration means the assigned probability $p$ directly reflects the empirical true positive rate of 70%."
        )
    ),
    EducationalConcept(
        concept_id="residuals",
        category="statistics",
        title="Prediction Residuals & Error Diagnostics",
        short_definition="The difference between the ground-truth observed value and the model's predicted value: e_i = y_i - y_hat_i.",
        beginner_explanation=(
            "Imagine you are guessing the price of houses. For a house that sold for $300,000, your model predicted $280,000. "
            "Your residual (error) is $300,000 - $280,000 = +$20,000 (an underestimation). "
            "If your model predicted $320,000, your residual is -$20,000 (an overestimation). "
            "By analyzing all residuals across the test dataset, we can see whether our errors are random or if the model consistently makes mistakes in one direction!"
        ),
        intermediate_explanation=(
            "Residual analysis is the foundation of regression diagnostics: "
            "1. Zero Mean: $\\frac{1}{N} \\sum e_i \\approx 0$. If non-zero, the model has systematic bias. "
            "2. Homoscedasticity: Residual variance $\\text{Var}(e_i)$ must remain constant across all predicted values $\\hat{y}$. If errors form a funnel shape (heteroscedasticity), transformations like log or box-cox are required. "
            "3. Independence & Normality: Residuals should ideally follow an uncorrelated Gaussian distribution $\\mathcal{N}(0, \\sigma^2)$."
        ),
        technical_explanation=(
            "For regression model $y = f(X) + \\epsilon$, raw residual is $e_i = y_i - \\hat{y}_i$. "
            "Standardized residuals $r_i = \\frac{e_i}{\\hat{\\sigma} \\sqrt{1 - h_{ii}}}$ (where $h_{ii}$ is the leverage from hat matrix $H = X(X^T X)^{-1} X^T$) "
            "identify influential outliers exceeding $|r_i| > 3$. The Durbin-Watson statistic $d = \\frac{\\sum (e_i - e_{i-1})^2}{\\sum e_i^2}$ tests for first-order autocorrelation."
        ),
        why_it_matters=(
            "Residual patterns expose non-linearities, missing interaction features, and unequal variance that summary scalar metrics (like $R^2$) fail to reveal."
        ),
        real_world_example=ConceptExample(
            title="E-Commerce Delivery Time Residuals",
            description="Inspecting residuals of delivery time estimates (Actual - Predicted hours).",
            table_headers=["Order #", "Actual Hours (y)", "Predicted (y_hat)", "Residual (e = y - y_hat)", "Diagnostic Insight"],
            table_rows=[
                ["#501", "24.5 hrs", "24.0 hrs", "+0.5 hrs", "Minimal Error (Accurate)"],
                ["#502", "48.0 hrs", "26.0 hrs", "+22.0 hrs", "Severe Underestimate (Holiday Storm Outlier)"],
                ["#503", "12.0 hrs", "14.5 hrs", "-2.5 hrs", "Slight Overestimate"]
            ],
            takeaway="Outlier residuals highlight real-world disruptions or uncaptured features like weather conditions."
        ),
        ml_impact="Guides feature engineering, non-linear transformations, and loss function selection.",
        common_methods=["Residual plot (e vs y_hat)", "Q-Q plot", "Durbin-Watson test", "Breusch-Pagan test"],
        when_to_use="Every time you generate regression predictions in Step 12.",
        when_not_to_use="Do not confuse classification prediction probabilities with continuous regression residuals.",
        common_mistakes=[
            "Ignoring a clear parabolic/U-shaped curve in the residual plot, which proves the model missed a non-linear relationship.",
            "Only looking at Mean Squared Error without checking whether residuals are biased toward positive or negative errors."
        ],
        interview_tip="What does a funnel shape in a residual plot (Predicted vs Residuals) indicate? It indicates Heteroscedasticity—the variance of prediction errors increases as the predicted magnitude grows. This violates OLS regression assumptions and can be resolved by applying a log transformation to the target variable or using weighted least squares (WLS).",
        related_concepts=["prediction", "loss_function", "evaluation_metrics"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_residuals_1",
            question="If a residual plot of e_i vs y_pred exhibits a distinct quadratic curve (U-shape), what does this indicate?",
            options=[
                "The model has achieved 100% test accuracy",
                "The model is missing a non-linear or polynomial relationship in the data",
                "The dataset must have all outliers deleted",
                "The train-test split ratio was inverted"
            ],
            correct_option_index=1,
            explanation="A curved pattern in residual plots proves that the linear model failed to capture higher-order polynomial relationships."
        )
    ),
    EducationalConcept(
        concept_id="decision_threshold",
        category="statistics",
        title="Decision Thresholds & Risk Asymmetry",
        short_definition="The probability cutoff (tau) used to convert a continuous probability P(Y=1|X) into a discrete classification decision (default tau = 0.50).",
        beginner_explanation=(
            "Imagine a smoke detector in your home. Would you want the detector to trigger only when it is 99% certain the house is on fire? "
            "No! A 5% chance of fire is dangerous enough that you want the alarm to sound immediately. "
            "That means the smoke detector uses a low decision threshold. "
            "In machine learning, we don't have to stick to the default 50% cutoff—we can adjust the sensitivity threshold depending on how dangerous false alarms vs missed emergencies are!"
        ),
        intermediate_explanation=(
            "By default, classifiers assign $\\hat{y} = 1$ if $P(Y=1|X) \\ge 0.50$. "
            "However, in asymmetric cost problems: "
            "1. Fraud Detection / Cancer Screening: Missing a positive (False Negative) is catastrophic. We lower threshold $\\tau \\to 0.20$ to maximize Recall. "
            "2. Spam Filtering / Push Notifications: Falsely flagging an important email (False Positive) annoys users. We raise threshold $\\tau \\to 0.85$ to maximize Precision. "
            "Tuning $\\tau$ moves the operating point along the ROC curve or Precision-Recall curve."
        ),
        technical_explanation=(
            "Optimal decision threshold $\\tau^*$ minimizes expected misclassification cost: "
            "$\\tau^* = \\frac{C_{\\text{FP}} - C_{\\text{TN}}}{(C_{\\text{FP}} - C_{\\text{TN}}) + (C_{\\text{FN}} - C_{\\text{TP}})}$, "
            "where $C$ represents the domain cost matrix. When cost of False Negative $C_{\\text{FN}} \\gg C_{\\text{FP}}$, $\\tau^* \\ll 0.50$."
        ),
        why_it_matters=(
            "Allows engineering teams to align machine learning predictions with real-world business unit economics and safety risk profiles without retraining models."
        ),
        real_world_example=ConceptExample(
            title="Credit Card Fraud: Threshold Optimization",
            description="Impact of shifting decision threshold $\\tau$ from 0.50 to 0.15 on 10,000 transactions.",
            table_headers=["Decision Threshold (tau)", "Fraud Caught (Recall)", "False Alarms (FPs)", "Customer Friction", "Business Impact"],
            table_rows=[
                ["tau = 0.50 (Default)", "72%", "15 accounts", "Low", "$280,000 fraud loss uncaught"],
                ["tau = 0.15 (Optimized)", "97%", "85 accounts", "Moderate (SMS check)", "$18,000 fraud loss uncaught (93% reduction)"]
            ],
            takeaway="Lowering the threshold to 0.15 caught nearly all fraud with minimal friction via automated 2FA SMS verification."
        ),
        ml_impact="Governs the precision-recall trade-off directly at inference time without re-running model training.",
        common_methods=["Threshold tuning", "Precision-Recall curve", "Cost-sensitive matrix optimization", "F-beta score"],
        when_to_use="In any classification application with imbalanced classes or asymmetric costs between False Positives and False Negatives.",
        when_not_to_use="When classes are perfectly balanced and costs of FP and FN are strictly identical.",
        common_mistakes=[
            "Blindly using tau = 0.50 for severe class imbalances (e.g. 1% fraud rate), resulting in zero positive predictions.",
            "Retraining an entire deep model when simply adjusting the inference threshold solves the recall issue."
        ],
        interview_tip="How do you choose an optimal classification threshold? Define a cost matrix for False Positives ($C_{\\text{FP}}$) vs False Negatives ($C_{\\text{FN}}$), sweep candidate thresholds $\\tau \\in [0.01, 0.99]$ across out-of-fold validation probabilities, compute total cost at each $\\tau$, and select $\\tau^*$ that minimizes total business cost or maximizes $F_\\beta$ score where $\\beta = \\sqrt{C_{\\text{FN}} / C_{\\text{FP}}}$.",
        related_concepts=["prediction", "probability_calibration", "evaluation_metrics"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_threshold_1",
            question="In a medical test for a life-threatening illness where missing a sick patient is catastrophic, what should you do with the decision threshold tau?",
            options=[
                "Raise tau to 0.90 to ensure 100% precision",
                "Lower tau below 0.50 (e.g. to 0.15-0.25) to increase sensitivity/recall and catch more true positives",
                "Delete all test data",
                "Always keep tau fixed at 0.50"
            ],
            correct_option_index=1,
            explanation="Lowering the decision threshold reduces False Negatives and boosts Recall in high-risk detection scenarios."
        )
    )
]
