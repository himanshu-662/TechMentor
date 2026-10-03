# Descriptive Statistics and Exploratory Data Analysis (EDA)

## Descriptive Statistics Fundamentals
Descriptive statistics summarize and characterize the features of a specific dataset.

### Measures of Central Tendency
- **Mean**: The arithmetic average $\bar{x} = \frac{1}{n} \sum_{i=1}^n x_i$. Sensitive to extreme outliers.
- **Median**: The middle value separating the upper half from the lower half of data when sorted. Robust against outliers.
- **Mode**: The most frequently occurring value in a categorical or discrete distribution.

### Measures of Dispersion
- **Variance**: The average of squared deviations from the mean: $\sigma^2 = \frac{1}{n} \sum (x_i - \mu)^2$.
- **Standard Deviation**: $\sigma = \sqrt{\text{Variance}}$, expressing dispersion in the original measurement units.
- **Interquartile Range (IQR)**: $\text{IQR} = Q3 - Q1$, representing the spread of the middle 50% of the distribution.

### Distribution Shape: Skewness & Kurtosis
- **Skewness**: Measures asymmetry of the probability distribution. Positive skew indicates a right-tail skew; negative skew indicates a left-tail skew.
- **Kurtosis**: Measures the "tailedness" and sharpness of peaks relative to a normal distribution. High kurtosis indicates fat tails and frequent outlier occurrence.

## Exploratory Data Analysis (EDA)
EDA is the initial investigative process where summary statistics and graphical visualizations are employed to:
1. Uncover underlying patterns, trends, and anomalies.
2. Formulate hypotheses and test initial assumptions.
3. Check for data leakage, invalid values, and unexpected distributions before modeling.
