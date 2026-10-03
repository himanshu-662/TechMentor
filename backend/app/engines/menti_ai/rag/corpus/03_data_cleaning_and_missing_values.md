# Data Cleaning and Missing Value Imputation

## Mechanisms of Missing Data
Understanding why values are missing dictates the appropriate treatment strategy:
1. **Missing Completely at Random (MCAR)**: The probability of missingness is completely independent of both observed and unobserved data. Example: Random sensor connection drop.
2. **Missing at Random (MAR)**: Missingness depends on observed data but not on the unobserved missing value itself. Example: Younger participants being less likely to report income.
3. **Missing Not at Random (MNAR)**: Missingness depends directly on the unobserved value itself. Example: Individuals with very high debt choosing not to answer debt questions.

## Missing Value Strategies
### 1. Row Deletion (Listwise / Pairwise)
- **When to Use**: Safe when MCAR and missingness affects < 3-5% of observations.
- **Risk**: Can introduce severe selection bias if data is MAR or MNAR, and drastically reduces statistical power.

### 2. Statistical Imputation (Mean / Median / Mode)
- **Mean Imputation**: Replaces missing values with feature mean. Best for symmetric, non-skewed distributions.
- **Median Imputation**: Replaces missing values with feature median. Strongly recommended for skewed distributions and data with outliers.
- **Mode Imputation**: Replaces missing values with the most frequent category. Standard for categorical variables.
- **Note**: Single-value imputation reduces overall feature variance and distorts covariance structures.

### 3. Advanced Model-Based Imputation (KNN & Iterative)
- **KNN Imputation**: Replaces missing values with the weighted average of $k$ nearest neighboring observations in Euclidean feature space.
- **Iterative Imputer (MICE)**: Models each feature with missing values as a function of all other features in a round-robin regression sequence.
