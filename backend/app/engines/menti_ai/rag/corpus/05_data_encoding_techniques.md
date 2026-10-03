# Categorical Data Encoding Techniques

## Purpose of Categorical Encoding
Machine learning algorithms (such as linear regression, SVM, and neural networks) require numerical inputs. Categorical encoding transforms qualitative attributes (strings or discrete labels) into quantitative numerical matrices.

## Common Encoding Approaches

### 1. One-Hot Encoding (OHE)
- **Mechanism**: Creates a binary ($0$ or $1$) indicator column for each distinct category.
- **When to Use**: Nominal categorical variables without inherent natural ordering (e.g. `Color: ['Red', 'Green', 'Blue']`).
- **The Dummy Variable Trap**: High collinearity caused when all dummy columns sum to 1. Resolved by dropping one baseline category (`drop_first=True`).
- **Limitation**: High cardinality features (e.g., zip codes, user IDs) cause high-dimensional sparse explosion.

### 2. Ordinal & Label Encoding
- **Mechanism**: Assigns an integer value ($0, 1, 2, \dots$) to each category based on an explicit logical ordering (e.g. `Education: ['High School': 0, 'Bachelors': 1, 'Masters': 2, 'PhD': 3]`).
- **When to Use**: Ordinal features where rank or progression exists.
- **Risk**: Applying ordinal encoding to nominal data falsely implies a numerical distance and order (e.g., $2 > 1$) that linear models will exploit inappropriately.

### 3. Target (Mean) Encoding
- **Mechanism**: Replaces each category with the average target value for that category across the training partition.
- **Advantage**: Maintains a single numeric column without expanding feature dimensionality.
- **Risk of Overfitting & Data Leakage**: Requires smoothing / regularization or cross-fold target encoding to prevent leakage of target signal into features.
