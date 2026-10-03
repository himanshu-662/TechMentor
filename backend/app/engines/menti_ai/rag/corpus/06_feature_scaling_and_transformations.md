# Feature Scaling and Mathematical Transformations

## Why Feature Scaling is Essential
Distance-based algorithms (KNN, SVM, K-Means) and gradient-descent-based models (Logistic Regression, Linear Regression, Neural Networks) are sensitive to feature scales. Features with large numerical ranges (e.g. `Income: $100,000`) will dominate objective functions over features with small scales (e.g. `Age: 35`), regardless of feature importance.

Tree-based models (Decision Trees, Random Forest, XGBoost) are scale-invariant because splits evaluate relative order rather than magnitude.

## Primary Scaling Techniques

### 1. StandardScaler (Z-Score Standardization)
Transforms features to have a mean of $0$ and a standard deviation of $1$:
$$z = \frac{x - \mu}{\sigma}$$
- **Best For**: Features with Gaussian (normal) distributions; optimal for PCA and linear models.
- **Sensitive to Outliers**: Extreme outliers distort $\mu$ and $\sigma$.

### 2. MinMaxScaler (Normalization)
Scales features into a fixed bounded interval $[0, 1]$ (or $[-1, 1]$):
$$x_{\text{scaled}} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}$$
- **Best For**: Bounded inputs (e.g. image pixels $[0, 255]$, neural network inputs).
- **Outlier Sensitivity**: A single extreme maximum shrinks all normal observations into a tiny sub-range.

### 3. RobustScaler
Scales features using the median and Interquartile Range (IQR):
$$x_{\text{scaled}} = \frac{x - \text{median}}{Q3 - Q1}$$
- **Best For**: Datasets containing stubborn outliers that should not skew the scale of the inliers.

## Power Transformations for Skewness
- **Log Transformation ($\log(1+x)$)**: Compresses long right tails and stabilizes variance for positive features.
- **Box-Cox Transformation**: Parametric power transform for strictly positive data that maximizes normality.
- **Yeo-Johnson Transformation**: Extends Box-Cox to handle zero and negative values.
