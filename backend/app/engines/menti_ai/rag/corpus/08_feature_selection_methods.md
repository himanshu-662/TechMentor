# Feature Selection Methods and Strategies

## Importance of Feature Selection
Selecting an optimal subset of informative features reduces model complexity, prevents overfitting, shortens training time, and enhances model explainability.

## Taxonomy of Feature Selection

### 1. Filter Methods (Statistical Screening)
Evaluate features independently of any machine learning model based on statistical properties:
- **Variance Threshold**: Drops near-constant features whose variance falls below a threshold $\tau$ (e.g. constant columns containing 0 information).
- **Correlation Filter**: Removes highly redundant collinear features (e.g., Pearson correlation $|r| > 0.85$).
- **ANOVA F-test**: Evaluates linear dependency between numerical features and categorical targets.
- **Mutual Information (MI)**: Non-parametric metric quantifying non-linear statistical dependency between features and target.
- **Pros/Cons**: Extremely fast and computationally lightweight; ignores multivariate feature interactions.

### 2. Wrapper Methods (Search-Based)
Use a predictive model as an evaluation engine to search the feature space:
- **Recursive Feature Elimination (RFE)**: Fits a model iteratively, pruning the least important features at each step until reaching the target count.
- **Sequential Forward/Backward Selection**: Greedily adds or removes features one at a time.
- **Pros/Cons**: Captures complex feature interactions; computationally expensive and prone to overfitting on small datasets.

### 3. Embedded (Intrinsic) Methods
Feature selection performed natively during model training:
- **L1 Regularization (Lasso)**: Drives unimportant feature coefficients to exactly zero.
- **Tree-Based Feature Importance**: Random Forest and Gradient Boosting compute impurity decrease (Gini) for each feature across all tree splits.
