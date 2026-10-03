# Outlier Detection and Treatment Methods

## What is an Outlier?
An outlier is an observation that deviates significantly from the overall pattern of the rest of the dataset. Outliers can arise from measurement noise, data entry errors, or genuine rare events.

## Outlier Detection Techniques

### 1. Interquartile Range (IQR) Rule
The non-parametric Tukey's Fences method identifies outliers outside the bounds:
- $\text{Lower Bound} = Q1 - 1.5 \times \text{IQR}$
- $\text{Upper Bound} = Q3 + 1.5 \times \text{IQR}$
- **Extreme Outliers**: Defined using a $3.0 \times \text{IQR}$ multiplier.
- **Advantage**: Does not assume a normal distribution; robust against extreme skewness.

### 2. Z-Score Method
For normally distributed features, the Z-score measures how many standard deviations an observation lies from the sample mean:
$$Z = \frac{x - \mu}{\sigma}$$
- Points with $|Z| > 3.0$ are flagged as statistical outliers (accounting for ~0.27% of observations under a standard normal curve).
- **Modified Z-score**: Uses Median and Median Absolute Deviation (MAD) for robust outlier detection on non-Gaussian data.

### 3. Isolation Forest
An unsupervised anomaly detection algorithm based on decision trees. It isolates observations by randomly selecting a feature and randomly selecting a split value between maximum and minimum values. Anomalies require fewer splits to isolate compared to normal points.

## Outlier Treatment Strategies
1. **Trimming (Removal)**: Deleting detected outlier rows. Safe only when outliers represent verified recording corruptions.
2. **Winsorization / Capping**: Clamping values beyond the 1st and 99th percentiles (or IQR fences) to the threshold values. Preserves sample size while curbing extreme variance.
3. **Log Transformation**: Compresses right-skewed extreme values into a narrower range without dropping records.
