# Model Interpretability and Feature Importance

## Why Explainability Matters
Machine learning models are frequently deployed in high-stakes domains (healthcare, credit risk, fraud detection, hiring) where black-box decisions must be transparent, audit-ready, and bias-free.

## Feature Importance Techniques

### 1. Impurity-Based (MDI / Gini) Feature Importance
- **Mechanism**: In decision tree ensembles, measures the total mean decrease in node impurity (Gini or Variance) brought by splits on a given feature, weighted by the proportion of samples reaching that node.
- **Limitation**: Tends to artificially inflate the importance of high-cardinality numerical features over meaningful binary/categorical indicators.

### 2. Permutation Feature Importance
- **Mechanism**: Evaluates the model on test data, then randomly shuffles (permutates) the values of a single feature column to break its relationship with the target, measuring the resulting drop in model score (e.g. accuracy or $R^2$).
- **Advantage**: Model-agnostic and computed on held-out validation data, avoiding training bias.

### 3. SHAP (SHapley Additive exPlanations)
- **Mechanism**: Grounded in cooperative game theory, computes Shapley values quantifying the fair additive contribution of each feature to shifting the model prediction from the baseline expected value.
- **Global & Local Explanations**: Provides global feature impact rankings as well as individual instance-level force plots explaining why a specific record received a positive or negative score.
