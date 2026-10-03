"""Educational concepts specifically covering Step 11: Model Fitting (Loss Functions, Inductive Bias, Tree Splitting, Ensemble Bagging)."""
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

MODEL_FITTING_CONCEPTS = [
    EducationalConcept(
        concept_id="model_fitting",
        category="statistics",
        title="Model Fitting & Empirical Risk Minimization",
        short_definition="The mathematical optimization procedure where an algorithm iteratively adjusts internal parameters to minimize loss on training data.",
        beginner_explanation=(
            "Imagine learning how to shoot basketball free throws. On your first attempt, you shoot too far to the left. "
            "You notice your error, adjust your elbow angle and release force, and shoot again. "
            "After 100 practice shots, your muscle memory has found the exact optimal angle that consistently makes the basket. "
            "In machine learning, Model Fitting is that exact practice session: the algorithm makes a prediction, "
            "measures how wrong it was using a mathematical scoreboard (loss function), and updates its internal knobs (weights) until errors are as small as possible."
        ),
        intermediate_explanation=(
            "Model fitting is formal empirical risk minimization over isolated training data $(X_{\\text{train}}, y_{\\text{train}})$. "
            "Different algorithm families embody distinct inductive biases: "
            "1. Linear/Logistic Regression: Assumes target depends linearly on features; solves convex loss via closed-form OLS $(X^T X)^{-1} X^T y$ or gradient descent. "
            "2. Decision Trees: Non-parametric recursive binary splitting using greedy impurity minimization (Gini, Entropy, or MSE reduction); invariant to monotonic feature scaling. "
            "3. Random Forests: Bagging ensemble of $B$ decorrelated randomized decision trees; averages tree outputs to drastically reduce estimator variance $\\text{Var}(\\bar{f}) = \\rho \\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2$ without increasing bias."
        ),
        technical_explanation=(
            "Given hypothesis space $\\mathcal{F}$ with parameter vector $\\theta \\in \\Theta$, empirical risk minimization solves: "
            "$\\hat{\\theta} = \\arg\\min_{\\theta \\in \\Theta} \\frac{1}{N_{\\text{train}}} \\sum_{i=1}^{N_{\\text{train}}} \\mathcal{L}(f(x_i; \\theta), y_i) + \\Omega(\\theta)$, "
            "where $\\mathcal{L}$ is a convex surrogate loss (e.g. Squared Loss $\\frac{1}{2}(y - \\hat{y})^2$ for regression, Cross-Entropy $-\\sum y_k \\log \\hat{p}_k$ for classification), "
            "and $\\Omega(\\theta)$ represents regularization penalty ($L_1$ or $L_2$). "
            "Optimization utilizes analytic normals, coordinate descent, L-BFGS, or stochastic gradient descent."
        ),
        why_it_matters=(
            "Fitting is the core computational engine where raw mathematical representation transforms into functional predictive intelligence. "
            "Choosing the right architecture, loss function, and regularization hyperparameters directly controls model capacity and prevents severe overfitting or underfitting."
        ),
        real_world_example=ConceptExample(
            title="House Price Prediction: Model Family Comparison",
            description="Fitting Linear Regression vs Decision Tree vs Random Forest on 1,000 homes with 10 features.",
            table_headers=["Algorithm", "Training Time", "Inductive Bias", "Overfitting Tendency", "Interpretability"],
            table_rows=[
                ["Linear Regression", "2.1 ms", "Linear additive hyperplane", "Low (Underfits non-linear)", "High (direct coefficients)"],
                ["Decision Tree (Depth 15)", "4.5 ms", "Orthogonal axis-aligned splits", "Very High (Memorizes training)", "Moderate (tree flowchart)"],
                ["Random Forest (100 trees)", "48.2 ms", "Ensemble bootstrap aggregation", "Low (variance reduction)", "Moderate (Gini importance)"]
            ],
            takeaway="Random Forest strikes an optimal balance between learning complex interactions and suppressing single-tree variance."
        ),
        ml_impact="Directly determines parameter values, convergence speed, memory footprint, and inductive representation capacity.",
        common_methods=["model.fit(X_train, y_train)", "GridSearchCV", "RandomizedSearchCV", "EarlyStopping"],
        when_to_use="Always during Step 11 after completing strict Train/Test partitioning in Step 10.",
        when_not_to_use="Do not fit models on un-split datasets or datasets with raw unencoded text and categorical columns.",
        common_mistakes=[
            "Fitting a complex ensemble (e.g. 500 trees) on an tiny dataset (e.g. 30 rows), leading to 100% memorization.",
            "Using Linear Regression on target data that exhibits strong non-linear polynomial or interaction curves.",
            "Ignoring convergence warnings (such as max_iter exceeded in LogisticRegression or Ridge).",
            "Evaluating model accuracy on the training data instead of waiting for Step 12/13 test evaluation."
        ],
        interview_tip="How does Random Forest reduce overfitting compared to a single Decision Tree? Each tree in the forest is trained on a bootstrap sample (bagging) and selects from a random subset of features at each split (`max_features`). This decorrelates the trees, so when their predictions are averaged, variance drops substantially while bias remains nearly unchanged.",
        related_concepts=["train_test_split", "loss_function", "hyperparameters", "overfitting", "bias_variance_tradeoff"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_model_fitting_1",
            question="What is the primary mechanism by which Random Forest achieves lower variance than a single Decision Tree?",
            options=[
                "It forces all features to be standardized between 0 and 1",
                "It trains multiple decorrelated trees on bootstrap samples and averages their predictions",
                "It eliminates all negative target labels",
                "It uses deep gradient descent with backpropagation"
            ],
            correct_option_index=1,
            explanation="By combining bootstrap aggregation (bagging) with random feature subspace sampling, individual tree errors cancel out when averaged."
        )
    ),
    EducationalConcept(
        concept_id="hyperparameters",
        category="statistics",
        title="Hyperparameters vs Model Parameters",
        short_definition="Configuration settings external to the model that must be chosen before training begins, as opposed to parameters learned directly from data.",
        beginner_explanation=(
            "Imagine baking bread. The ingredients that transform into bread (flour, yeast, water) are like Model Parameters: they undergo a chemical change during the process. "
            "The oven temperature and timer you set before baking are Hyperparameters: you decide them beforehand to control the baking environment. "
            "If your temperature is set too low, the dough stays raw (underfitting). If set too high, the crust burns black (overfitting)."
        ),
        intermediate_explanation=(
            "Parameters (like regression weights $w_j$ or tree split thresholds) are learned automatically from training data via loss minimization. "
            "Hyperparameters (like tree `max_depth`, `n_estimators`, learning rate $\\alpha$, or regularization strength $\\lambda$) cannot be learned via direct training loss minimization, "
            "because setting `max_depth = infinity` or `lambda = 0` will always minimize training loss while destroying out-of-sample generalization."
        ),
        technical_explanation=(
            "Let empirical risk minimizer be $\\theta^*(\\lambda) = \\arg\\min_\\theta R_{\\text{train}}(\\theta; \\lambda)$. "
            "Hyperparameter optimization constitutes a bi-level optimization problem: "
            "$\\lambda^* = \\arg\\min_{\\lambda \\in \\Lambda} R_{\\text{val}}(\\theta^*(\\lambda))$, "
            "where validation loss $R_{\\text{val}}$ evaluates generalization over held-out folds."
        ),
        why_it_matters=(
            "Hyperparameter choice governs model capacity and regularization. Incorrect settings lead directly to catastrophic overfitting or severe underfitting."
        ),
        real_world_example=ConceptExample(
            title="Tuning `max_depth` in Decision Trees",
            description="Evaluating training vs test accuracy as tree depth increases from 1 to 20.",
            table_headers=["Max Depth", "Train Accuracy", "Test Accuracy", "Diagnostic State"],
            table_rows=[
                ["Depth = 1 (Stump)", "62.4%", "61.8%", "High Bias (Underfitting)"],
                ["Depth = 4 (Optimal)", "86.1%", "84.7%", "Balanced Sweet Spot"],
                ["Depth = 8", "94.2%", "82.1%", "Beginning to Overfit"],
                ["Depth = 20", "100.0%", "73.5%", "High Variance (Overfitting memorization)"]
            ],
            takeaway="As tree depth expands, training accuracy climbs to 100%, but test accuracy collapses past depth 4 due to variance inflation."
        ),
        ml_impact="Regulates the hypothesis search space, controlling the bias-variance tradeoff.",
        common_methods=["GridSearchCV", "RandomizedSearchCV", "Bayesian Optimization (Optuna)", "Validation Curve"],
        when_to_use="During algorithm configuration in Step 11 to tune complexity constraints.",
        when_not_to_use="Do not tune hyperparameters on the testing dataset (causes subtle data leakage).",
        common_mistakes=[
            "Tuning hyperparameters on the Test fold instead of a Validation fold or internal Cross-Validation.",
            "Testing an exhaustive grid search with too many combinations, exhausting CPU runtime."
        ],
        interview_tip="How do you explain the difference between a parameter and a hyperparameter? Parameters are learned by the algorithm from data during `model.fit()` (e.g. weights $w$, bias $b$). Hyperparameters are architectural constraints set by the engineer prior to training (e.g. `n_estimators`, `max_depth`, learning rate $\\eta$)." ,
        related_concepts=["model_fitting", "overfitting", "bias_variance_tradeoff", "cross_validation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_hyperparams_1",
            question="Which of the following is a hyperparameter rather than a model parameter?",
            options=[
                "The coefficient slope of a linear regression feature",
                "The intercept constant $\\beta_0$",
                "The maximum tree depth (`max_depth`) in a decision tree",
                "The feature split value chosen at node 3"
            ],
            correct_option_index=2,
            explanation="`max_depth` is specified by the engineer before training commences, whereas split values, slopes, and intercepts are computed from data."
        )
    ),
    EducationalConcept(
        concept_id="bias_variance_tradeoff",
        category="statistics",
        title="The Bias-Variance Tradeoff",
        short_definition="The fundamental tension between a model's simplicity (bias) and its sensitivity to sample fluctuations in the training set (variance).",
        beginner_explanation=(
            "Imagine an archer shooting arrows at a target: "
            "1. High Bias (Underfitting): The archer is wearing a blindfold. Every arrow hits the wrong spot in the exact same corner. The shots are consistent, but systematically wrong. "
            "2. High Variance (Overfitting): The archer has no blindfold, but their hand shakes uncontrollably. One arrow hits top-left, another hits bottom-right. The average might be near the bullseye, but individual shots scatter wildly. "
            "3. Sweet Spot: A steady archer whose arrows cluster tightly inside the bullseye."
        ),
        intermediate_explanation=(
            "Total expected test error decomposes mathematically into three distinct components: "
            "$\\text{Expected Error} = \\text{Bias}^2 + \\text{Variance} + \\text{Irreducible Noise}$. "
            "As model complexity increases: "
            "- Bias decreases (the model can represent intricate non-linear decision boundaries). "
            "- Variance increases (the model becomes overly sensitive to small random fluctuations in the training sample). "
            "The goal of Step 11 model fitting is to identify the optimal complexity sweet spot that minimizes total generalization error."
        ),
        technical_explanation=(
            "For true function $Y = f(X) + \\epsilon$ with $\\mathbb{E}[\\epsilon] = 0$ and $\\text{Var}(\\epsilon) = \\sigma^2$, "
            "the expected mean squared error of estimator $\\hat{f}(X)$ at point $x_0$ decomposes as: "
            "$\\mathbb{E}[(Y - \\hat{f}(x_0))^2] = \\underbrace{(\\mathbb{E}[\\hat{f}(x_0)] - f(x_0))^2}_{\\text{Bias}^2} + \\underbrace{\\mathbb{E}[(\\hat{f}(x_0) - \\mathbb{E}[\\hat{f}(x_0)])^2]}_{\\text{Variance}} + \\underbrace{\\sigma^2}_{\\text{Irreducible Noise}}$. "
            "Ridge/Lasso shrink weights to inject minor bias in exchange for massive variance reduction."
        ),
        why_it_matters=(
            "Every architectural choice (linear vs tree vs ensemble) and hyperparameter setting directly navigates this fundamental dilemma. "
            "Understanding it prevents you from building fragile models that memorize training noise."
        ),
        real_world_example=ConceptExample(
            title="Diagnosing Overfitting vs Underfitting",
            description="Evaluating training vs validation error curves across models.",
            table_headers=["Symptom", "Training Error", "Validation Error", "Diagnosis", "Remedy"],
            table_rows=[
                ["High Training Error, High Validation Error", "35%", "37%", "High Bias (Underfitting)", "Increase model capacity, add non-linear features, reduce regularization"],
                ["Near-Zero Training Error, High Validation Error", "1%", "28%", "High Variance (Overfitting)", "Gather more data, prune tree depth, add L2 regularization, use Random Forest bagging"],
                ["Low Training Error, Low Validation Error", "12%", "13%", "Optimal Generalization", "Deploy to test evaluation"]
            ],
            takeaway="A wide gap between training error and validation error is the universal signature of high variance (overfitting)."
        ),
        ml_impact="Governs generalization across all predictive machine learning paradigms.",
        common_methods=["Learning Curves", "Validation Curves", "Regularization (L1/L2)", "Ensemble Bagging", "Pruning"],
        when_to_use="When diagnosing training convergence and tuning complexity constraints in Step 11.",
        when_not_to_use="N/A; applies ubiquitously to all supervised learning.",
        common_mistakes=[
            "Assuming that achieving 0% training error means you have built a 'perfect' model.",
            "Adding more polynomial features when a model is already suffering from severe high variance."
        ],
        interview_tip="How do you mathematically write the bias-variance decomposition? $\\text{MSE} = \\text{Bias}^2 + \\text{Variance} + \\sigma^2$. Mention that irreducible noise $\\sigma^2$ is the absolute lower bound on error caused by unmeasured variables or measurement noise.",
        related_concepts=["model_fitting", "hyperparameters", "train_test_split", "overfitting"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_bias_variance_1",
            question="If a machine learning model achieves 99.8% accuracy on training data but only 64.2% accuracy on validation data, what is the primary diagnosis?",
            options=[
                "High Bias (Underfitting)",
                "High Variance (Overfitting)",
                "The dataset has too many duplicate rows",
                "The loss function is convex"
            ],
            correct_option_index=1,
            explanation="A massive performance drop between training and validation indicates that the model has memorized sample noise rather than true underlying relationships (High Variance)."
        )
    )
]
