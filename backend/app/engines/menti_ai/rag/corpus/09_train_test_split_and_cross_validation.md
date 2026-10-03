# Train-Test Splitting, Cross-Validation, and Data Leakage Prevention

## The Generalization Goal
The fundamental objective of supervised machine learning is out-of-sample generalization — performing accurately on previously unseen data, rather than memorizing the training dataset.

## Splitting Strategies
1. **Holdout Train/Test Split**:
   - Typically partitions data into **80% Training / 20% Test** (or 70/30).
   - The test partition is locked and touched only once for final unbiased evaluation.
2. **Stratified Splitting**:
   - Mandatory for imbalanced classification tasks.
   - Ensures both train and test splits retain identical class proportion ratios as the original dataset.
3. **K-Fold Cross-Validation**:
   - Partitions data into $K$ equal subsets (typically $K=5$ or $K=10$).
   - Fits model on $K-1$ folds and validates on the remaining fold, repeating $K$ times.
   - Provides a low-variance estimate of generalization error.

## Preventing Data Leakage
Data leakage occurs when information from outside the training dataset (such as target values or future test distribution statistics) is inadvertently incorporated into model training.

### Rules to Avoid Data Leakage
- **Fit Preprocessors Exclusively on Training Data**: Always compute imputation medians, scaler parameters ($\mu, \sigma$), and encoding maps using `scaler.fit(X_train)`, then call `scaler.transform(X_test)`.
- **Never Scale Before Splitting**: Performing normalization or imputation on the full dataset before splitting causes test statistics to leak into training representations.
