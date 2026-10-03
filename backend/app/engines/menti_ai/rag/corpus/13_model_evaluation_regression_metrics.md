# Model Evaluation Metrics for Continuous Regression

## Overview of Regression Loss & Evaluation
Regression models predict continuous numerical quantities $\hat{y}_i$. Evaluation metrics assess the magnitude and distribution of prediction residuals $e_i = y_i - \hat{y}_i$.

## Key Regression Metrics

### 1. Mean Absolute Error (MAE)
$$\text{MAE} = \frac{1}{n} \sum_{i=1}^n |y_i - \hat{y}_i|$$
- **Interpretation**: Average absolute distance between predictions and actual targets in native units.
- **Robustness**: Does not square errors; robust against rare large outliers.

### 2. Mean Squared Error (MSE)
$$\text{MSE} = \frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2$$
- **Interpretation**: Punishes large errors quadratically. Differentiable loss function ideal for gradient optimization.
- **Limitation**: Units are squared (e.g. $\text{dollars}^2$), hindering intuitive interpretation.

### 3. Root Mean Squared Error (RMSE)
$$\text{RMSE} = \sqrt{\text{MSE}} = \sqrt{\frac{1}{n} \sum_{i=1}^n (y_i - \hat{y}_i)^2}$$
- **Interpretation**: Expressed in original target units while maintaining quadratic penalty on large errors.
- **Comparison with MAE**: $\text{RMSE} \ge \text{MAE}$. A large gap between RMSE and MAE indicates significant variance in error magnitude (presence of large outlier errors).

### 4. Coefficient of Determination ($R^2$ Score)
$$R^2 = 1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2} = 1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}}$$
- **Interpretation**: Proportion of target variance explained by the model relative to a naive baseline predicting the target mean $\bar{y}$.
- **Values**: $1.0$ indicates perfect fit; $0.0$ indicates performance equal to baseline mean; negative values indicate the model performs worse than predicting the mean.
