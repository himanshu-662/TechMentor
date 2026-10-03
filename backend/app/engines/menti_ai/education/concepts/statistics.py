"""Statistics Educational Concepts."""
from typing import List
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

STATISTICS_CONCEPTS: List[EducationalConcept] = [
    EducationalConcept(
        concept_id="mean",
        category="statistics",
        title="Mean (Arithmetic Average)",
        short_definition="The sum of all numerical values in a dataset divided by the total number of observations.",
        beginner_explanation="Imagine sharing a pizza bill equally. You add up the total bill ($60) and divide by the number of friends (4), so each person owes $15. That $15 is the mean.",
        intermediate_explanation="The expected value or center of mass of a numeric distribution: $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^n x_i$. Highly sensitive to extreme values or outliers.",
        technical_explanation="The first raw sample moment $\\hat{\\mu}$, minimizing the sum of squared Euclidean deviations $\\arg\\min_c \\sum_{i=1}^n (x_i - c)^2$. Under Gauss-Markov assumptions, it is the best linear unbiased estimator (BLUE) of the population mean.",
        why_it_matters="Used in standard scaling ($z = \\frac{x - \\mu}{\\sigma}$), linear models, and mean imputation. However, using the mean to represent skewed distributions can be deeply deceptive.",
        real_world_example=ConceptExample(
            title="Income Distortion from an Outlier",
            description="Five salaries in a small office where one executive earns a massive compensation.",
            table_headers=["Employee", "Salary"],
            table_rows=[
                ["Worker 1", "$40,000"],
                ["Worker 2", "$45,000"],
                ["Worker 3", "$50,000"],
                ["Worker 4", "$55,000"],
                ["CEO", "$1,000,000"]
            ],
            takeaway="The mean salary is $238,000, which describes none of the workers accurately due to the CEO outlier."
        ),
        ml_impact="Imputing skewed features with the mean pulls values toward the outlier, corrupting clean observations and skewing model coefficients.",
        common_methods=["df['col'].mean()", "np.mean()", "scipy.stats.trim_mean()"],
        when_to_use="When data is symmetrically and normally distributed without extreme outliers.",
        when_not_to_use="Do not use mean to summarize or impute heavily skewed variables (such as income, house prices, or web traffic). Use median instead.",
        common_mistakes=[
            "Using the mean as the default summary metric without checking the histogram or skewness.",
            "Imputing missing values with the mean when extreme outliers exist."
        ],
        interview_tip="Prove why the mean minimizes the sum of squared errors $\\sum (x_i - c)^2$. Take the derivative with respect to $c$, set to zero: $-2\\sum(x_i - c) = 0 \\implies n c = \\sum x_i \\implies c = \\bar{x}$.",
        related_concepts=["median", "standard_deviation", "variance", "skewness", "outlier"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_mean_1",
            question="Why does the presence of a single extreme outlier drastically distort the sample mean?",
            options=[
                "The mean calculation divides by $n-1$ instead of $n$",
                "The mean gives equal weight to all data points, so an extreme value pulls the sum directly toward itself",
                "Outliers force the mean to become a complex imaginary number",
                "Pandas replaces the mean with NaN whenever an outlier is detected"
            ],
            correct_option_index=1,
            explanation="Because the arithmetic mean adds every raw value into the numerator without bounds, an extreme value pulls the entire sum toward that direction."
        )
    ),
    EducationalConcept(
        concept_id="median",
        category="statistics",
        title="Median (50th Percentile / Midpoint)",
        short_definition="The middle value that separates the higher half from the lower half of an ordered dataset.",
        beginner_explanation="Line up a group of people from shortest to tallest. The person standing exactly in the middle is the median. Even if an 8-foot giant joins the end of the line, the person in the middle barely changes.",
        intermediate_explanation="The 50th percentile ($Q_2$) of a distribution. Because it is rank-based, the median is robust to extreme outliers and skewed distributions.",
        technical_explanation="The value $m$ that minimizes the sum of absolute deviations $\\arg\\min_c \\sum_{i=1}^n |x_i - c|$. It has a breakdown point of $0.5$ (50%), meaning up to 50% of the data can be arbitrarily corrupted before the median breaks down.",
        why_it_matters="The gold standard measure of central tendency for real-world, skewed tabular data (income, housing prices, website session times) and the preferred imputation strategy for skewed variables.",
        real_world_example=ConceptExample(
            title="Median vs Mean on Office Salaries",
            description="Comparing median against mean for the previous office salary scenario.",
            table_headers=["Metric", "Value", "Representative of Typical Worker?"],
            table_rows=[
                ["Mean", "$238,000", "No (Distorted by CEO)"],
                ["Median", "$50,000", "Yes (Accurate center of typical workers)"]
            ],
            takeaway="The median ($50,000) provides an honest, robust representation of typical staff pay."
        ),
        ml_impact="Median imputation preserves the central tendency of skewed features without pulling values toward unrealistic extreme tails.",
        common_methods=["df['col'].median()", "np.median()", "SimpleImputer(strategy='median')"],
        when_to_use="When summarizing or imputing numeric columns that are skewed or contain notable outliers.",
        when_not_to_use="Do not choose median over mean when data is strictly normal and maximum statistical efficiency of the sample mean is desired.",
        common_mistakes=[
            "Assuming the median is always one of the actual numbers in the dataset (for an even sample size $n$, it is the average of the two middle numbers).",
            "Believing the median is unaffected by heavy clustering at distribution boundaries."
        ],
        interview_tip="What is the breakdown point of the median compared to the mean? The mean has a breakdown point of 0 (a single point at $\\infty$ ruins it); the median has a breakdown point of 0.5 (50%).",
        related_concepts=["mean", "quartiles", "iqr", "skewness", "outlier"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_median_1",
            question="What is the median of the following dataset: [10, 12, 14, 18, 1000]?",
            options=[
                "210.8",
                "14",
                "18",
                "12"
            ],
            correct_option_index=1,
            explanation="Sorting the 5 numbers gives [10, 12, 14, 18, 1000]. The middle element (3rd item) is 14. The extreme outlier 1000 has zero influence on the middle position."
        )
    ),
    EducationalConcept(
        concept_id="standard_deviation",
        category="statistics",
        title="Standard Deviation (Spread / Volatility)",
        short_definition="A measure of the amount of variation or dispersion of values around the arithmetic mean.",
        beginner_explanation="If two cities both have an average temperature of 70°F, but City A stays between 68°F and 72°F all year while City B swings between 20°F and 120°F, City B has a much higher standard deviation.",
        intermediate_explanation="The square root of the variance ($s = \\sqrt{s^2}$), expressed in the exact same physical units as the original data, describing average deviation from the mean.",
        technical_explanation="The sample standard deviation $s = \\sqrt{\\frac{1}{n-1} \\sum_{i=1}^n (x_i - \\bar{x})^2}$ using Bessel's correction $(n-1)$ to ensure an unbiased estimator of variance. For Gaussian data, $\\pm 1\\sigma$ captures ~68.27% and $\\pm 2\\sigma$ captures ~95.45% of density.",
        why_it_matters="Essential for standard scaling ($z$-score), detecting parametric outliers ($|z| > 3$), and evaluating feature volatility and signal-to-noise ratio.",
        real_world_example=ConceptExample(
            title="Comparing Quality Consistency of Two Factories",
            description="Bolt diameter measurements (target: 10.0 mm).",
            table_headers=["Factory", "Mean Diameter", "Standard Deviation", "Verdict"],
            table_rows=[
                ["Factory Alpha", "10.0 mm", "0.05 mm", "High precision, reliable bolts"],
                ["Factory Beta", "10.0 mm", "1.20 mm", "High variation, loose tolerances"]
            ],
            takeaway="Both share identical means, but Factory Beta has 24x higher spread."
        ),
        ml_impact="StandardScaler uses standard deviation to normalize feature variances to 1.0. A feature with near-zero standard deviation causes division-by-zero artifacts.",
        common_methods=["df['col'].std()", "np.std(ddof=1)", "StandardScaler()"],
        when_to_use="When quantifying dispersion around the mean for roughly bell-shaped or symmetric distributions.",
        when_not_to_use="Do not use standard deviation as a dispersion metric for heavy-tailed or Pareto-distributed data; use Interquartile Range (IQR) or MAD instead.",
        common_mistakes=[
            "Using population standard deviation ($N$) instead of sample standard deviation ($N-1$) when working with sample data.",
            "Assuming standard deviation is robust against outliers."
        ],
        interview_tip="Why do we divide by $n-1$ instead of $n$ in sample variance/std? Bessel's correction corrects the downward bias caused by estimating the population mean $\\mu$ with the sample mean $\\bar{x}$.",
        related_concepts=["variance", "mean", "iqr", "numerical_data", "outlier"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_std_1",
            question="In a standard normal distribution (Gaussian), approximately what percentage of observations fall within $\\pm 2$ standard deviations of the mean?",
            options=[
                "50.0%",
                "68.3%",
                "95.4%",
                "99.7%"
            ],
            correct_option_index=2,
            explanation="According to the Empirical 68-95-99.7 Rule, approximately 95.4% of values fall within 2 standard deviations of the mean in a Gaussian distribution."
        )
    ),
    EducationalConcept(
        concept_id="variance",
        category="statistics",
        title="Variance",
        short_definition="The expectation of the squared deviation of a random variable from its mean, measuring data dispersion.",
        beginner_explanation="Variance measures how 'spread out' your numbers are. It is calculated by taking the distances from the average and squaring them, so bigger differences get amplified.",
        intermediate_explanation="The average of the squared differences from the Mean ($s^2$). Because differences are squared, variance is measured in squared units (e.g., dollars squared).",
        technical_explanation="The second central moment $\\mu_2 = \\mathbb{E}[(X - \\mathbb{E}[X])^2]$. For sample estimation, $s^2 = \\frac{1}{n-1}\\sum_{i=1}^n (x_i - \\bar{x})^2$. It serves as the diagonal entries in the covariance matrix $\\Sigma$.",
        why_it_matters="The foundation of PCA (Principal Component Analysis), which seeks orthogonal axes that maximize variance. Low variance flags uninformative features.",
        real_world_example=ConceptExample(
            title="Stock Price Daily Variance",
            description="Comparing a low-volatility utility stock with a high-volatility cryptocurrency.",
            table_headers=["Asset", "Mean Return", "Variance (Return^2)"],
            table_rows=[
                ["Stable Bond Fund", "+0.02%", "0.0001"],
                ["Volatile Crypto", "+0.05%", "0.0450"]
            ],
            takeaway="The crypto asset exhibits 450x higher variance, reflecting erratic swings."
        ),
        ml_impact="Features with zero or near-zero variance provide no predictive signal and are pruned using `VarianceThreshold` feature selectors.",
        common_methods=["df['col'].var()", "np.var(ddof=1)", "VarianceThreshold()"],
        when_to_use="In mathematical modeling, PCA dimensionality reduction, and analysis of variance (ANOVA).",
        when_not_to_use="Do not present variance to non-technical business stakeholders as an intuitive measure, because squared units ($dollars^2$) are difficult to interpret.",
        common_mistakes=[
            "Confusing variance with standard deviation (Standard Deviation = $\\sqrt{\\text{Variance}}$).",
            "Assuming higher variance always equals higher predictive power."
        ],
        interview_tip="Explain the Bias-Variance tradeoff: High bias causes underfitting (ignoring signals); high variance causes overfitting (fitting noise in training data).",
        related_concepts=["standard_deviation", "mean", "constant_features", "near_constant_features"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_var_1",
            question="If a dataset of house prices has a standard deviation of $20,000, what is its variance?",
            options=[
                "$141.42",
                "$40,000",
                "$400,000,000 (dollars squared)",
                "$20,000"
            ],
            correct_option_index=2,
            explanation="Variance is the square of standard deviation: $(20,000)^2 = 400,000,000\\text{ dollars}^2$."
        )
    ),
    EducationalConcept(
        concept_id="minimum",
        category="statistics",
        title="Minimum (Lowest Observed Value)",
        short_definition="The smallest numerical value recorded in a specific feature or dataset.",
        beginner_explanation="The lowest score, coldest temperature, or smallest price in your list. It marks the absolute bottom boundary of your data.",
        intermediate_explanation="The 0th percentile or lower extreme: $\\min(X) = \\{x_{(1)} \\mid x_{(1)} \\le x_{(i)} \\; \\forall i\\}$.",
        technical_explanation="The first order statistic $X_{(1)}$ of a random sample. Essential in establishing the support boundary of bounded distributions (e.g. Uniform$[a, b]$).",
        why_it_matters="Checking the minimum is the quickest way to detect physically impossible data entries, such as negative ages (Age = -5), negative product prices, or placeholder codes like -999.",
        real_world_example=ConceptExample(
            title="Human Age Verification Audit",
            description="Inspecting minimum age in a clinical survey.",
            table_headers=["Column", "Expected Min", "Observed Min", "Diagnosis"],
            table_rows=[
                ["Patient_Age", "0", "-99", "Corrupt missing value sentinel coded as -99"]
            ],
            takeaway="An observed minimum of -99 immediately reveals an unparsed missing value code."
        ),
        ml_impact="Impossible negative minimums corrupt mathematical transformations like logarithms ($\\log(x)$ is undefined for $x \\le 0$).",
        common_methods=["df['col'].min()", "np.min()", "df.describe()"],
        when_to_use="During domain integrity verification and Min-Max normalization.",
        when_not_to_use="Do not assume the sample minimum represents the true physical lower bound of the population.",
        common_mistakes=[
            "Failing to recognize negative values (-999, -1) as missing data flags.",
            "Applying Min-Max scaling when the minimum is an extreme negative outlier."
        ],
        interview_tip="How does an extreme minimum impact Min-Max scaling $x_{\\text{scaled}} = \\frac{x - x_{\\min}}{x_{\\max} - x_{\\min}}$? It compresses almost all normal data into a tiny fraction close to 1.0.",
        related_concepts=["maximum", "quartiles", "numerical_data", "outlier"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_min_1",
            question="If a column 'Trip_Duration_Minutes' shows a minimum value of -15, what does this indicate?",
            options=[
                "The car traveled backwards in time",
                "Data entry error or corrupt telemetry that must be cleaned",
                "Trip duration is normally distributed",
                "The column is ready for logarithmic transformation"
            ],
            correct_option_index=1,
            explanation="Physical durations cannot be negative; an observed minimum of -15 signals data corruption or sensor failure."
        )
    ),
    EducationalConcept(
        concept_id="maximum",
        category="statistics",
        title="Maximum (Highest Observed Value)",
        short_definition="The highest numerical value recorded in a specific feature or dataset.",
        beginner_explanation="The highest peak, the oldest age, or the biggest sale in your data. It marks the absolute ceiling of your recorded numbers.",
        intermediate_explanation="The 100th percentile or upper extreme: $\\max(X) = \\{x_{(n)} \\mid x_{(n)} \\ge x_{(i)} \\; \\forall i\\}$.",
        technical_explanation="The highest order statistic $X_{(n)}$. Used in extreme value theory (Fisher-Tippett-Gnedenko theorem) to model tails and catastrophic risks.",
        why_it_matters="Crucial for detecting data entry typos (e.g. typing Age = 999 instead of 99), sensor saturation caps, and extreme upper outliers.",
        real_world_example=ConceptExample(
            title="User Age Typo Detection",
            description="Auditing maximum values in an onboarding form.",
            table_headers=["User_ID", "Reported_Age", "Status"],
            table_rows=[
                ["U-102", "34", "Valid"],
                ["U-103", "999", "Obvious typo or missing sentinel"]
            ],
            takeaway="A maximum of 999 highlights a severe data quality issue requiring remediation."
        ),
        ml_impact="Extreme maximum outliers skew Min-Max scaling, compressing all regular data into near-zero values.",
        common_methods=["df['col'].max()", "np.max()", "df.describe()"],
        when_to_use="During initial range auditing and upper bound validation.",
        when_not_to_use="Do not rely on the maximum to scale features if upper extreme outliers are present; use robust scaling instead.",
        common_mistakes=[
            "Assuming the maximum value in training data is the upper bound the model will ever see in production.",
            "Failing to clip or winsorize extreme maximum values before linear modeling."
        ],
        interview_tip="What happens to Min-Max scaling when a production record has a value greater than the training maximum? The scaled value will exceed 1.0, potentially violating model bounds.",
        related_concepts=["minimum", "quartiles", "outlier", "numerical_data"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_max_1",
            question="What is the danger of applying Min-Max scaling to a feature with a massive upper outlier?",
            options=[
                "It raises an invalid syntax exception in Scikit-Learn",
                "The outlier compresses virtually all normal observations into a narrow cluster near 0.0",
                "It reverses the sign of all negative numbers",
                "It turns the feature into categorical text"
            ],
            correct_option_index=1,
            explanation="When the denominator $(x_{\\max} - x_{\\min})$ is dominated by a giant outlier, typical values $(x - x_{\\min})$ become tiny fractions close to 0."
        )
    ),
    EducationalConcept(
        concept_id="quartiles",
        category="statistics",
        title="Quartiles (Q1, Q2, Q3)",
        short_definition="The three cut points that divide a sorted dataset into four equal parts, each containing 25% of the data.",
        beginner_explanation="Imagine cutting a long ribbon into 4 equal quarters. You need to make 3 cuts: the 1st cut is Q1 (25%), the middle cut is Q2 (the median at 50%), and the 3rd cut is Q3 (75%).",
        intermediate_explanation="Three rank-based summary points: $Q_1$ (25th percentile), $Q_2$ (50th percentile or median), and $Q_3$ (75th percentile). They form the foundation of box plots.",
        technical_explanation="The inverse of the empirical cumulative distribution function $\\hat{F}^{-1}(p)$ evaluated at $p \\in \\{0.25, 0.50, 0.75\\}$. As non-parametric rank statistics, they are invariant to monotonic transformations.",
        why_it_matters="Quartiles show how data is distributed without being skewed by extreme tails. The distance between $Q_1$ and $Q_3$ defines the Interquartile Range (IQR).",
        real_world_example=ConceptExample(
            title="University Exam Grade Quartiles",
            description="Exam scores across 100 students.",
            table_headers=["Quartile Cut", "Percentile", "Score Value", "Meaning"],
            table_rows=[
                ["Q1", "25th Percentile", "62", "25% scored at or below 62"],
                ["Q2 (Median)", "50th Percentile", "78", "Half scored above, half below 78"],
                ["Q3", "75th Percentile", "88", "Top 25% scored 88 or higher"]
            ],
            takeaway="Quartiles clearly delineate the lower, middle, and upper tiers of performance."
        ),
        ml_impact="Quartiles are used in RobustScaler ($x' = \\frac{x - Q_2}{Q_3 - Q_1}$), which scales features robustly without being warped by outliers.",
        common_methods=["df['col'].quantile([0.25, 0.5, 0.75])", "np.percentile()", "RobustScaler()"],
        when_to_use="When exploring distribution spread, detecting skewness, and creating box plots.",
        when_not_to_use="Do not rely on quartiles for very small sample sizes ($n < 20$) where percentiles have high estimation variance.",
        common_mistakes=[
            "Assuming $Q_2 - Q_1$ must equal $Q_3 - Q_2$ (they only equal if the distribution is perfectly symmetric).",
            "Confusing percentiles with raw percentages."
        ],
        interview_tip="How can you identify skewness using quartiles alone? Compare $(Q_3 - Q_2)$ against $(Q_2 - Q_1)$. If $(Q_3 - Q_2) > (Q_2 - Q_1)$, the distribution is right-skewed.",
        related_concepts=["iqr", "median", "skewness", "outlier"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_quartiles_1",
            question="If $Q_1 = 20$, $Q_2 = 30$, and $Q_3 = 80$, what does this indicate about the distribution?",
            options=[
                "The distribution is perfectly symmetric",
                "The distribution is right-skewed because the upper half ($Q_3 - Q_2 = 50$) is much more spread out than the lower half ($Q_2 - Q_1 = 10$)",
                "The distribution has negative variance",
                "The dataset must contain duplicate values"
            ],
            correct_option_index=1,
            explanation="When the distance from the median to the 75th percentile is significantly larger than from the 25th percentile to the median, the right tail is elongated (right-skewed)."
        )
    ),
    EducationalConcept(
        concept_id="iqr",
        category="statistics",
        title="Interquartile Range (IQR)",
        short_definition="The difference between the third quartile (75th percentile) and the first quartile (25th percentile), measuring the spread of the middle 50% of the data.",
        beginner_explanation="The IQR is the width of the middle 50% of your data. If you throw away the lowest 25% and highest 25% of scores, the range of what remains in the middle is your IQR.",
        intermediate_explanation="$\\text{IQR} = Q_3 - Q_1$. A robust measure of statistical dispersion that ignores extreme tails and forms the basis of Tukey's outlier detection rule.",
        technical_explanation="The statistical spread metric $\\text{IQR} = F^{-1}(0.75) - F^{-1}(0.25)$. In Tukey's fences, observations outside $[Q_1 - 1.5\\cdot\\text{IQR}, Q_3 + 1.5\\cdot\\text{IQR}]$ are designated as outliers.",
        why_it_matters="Unlike standard deviation, IQR cannot be inflated by a few wild outliers. It provides the mathematical bounds for box plot whiskers and automated outlier flagging.",
        real_world_example=ConceptExample(
            title="Tukey Outlier Fence on Delivery Times",
            description="Calculating outlier fences using IQR on meal delivery times (minutes).",
            table_headers=["Metric", "Calculation", "Value"],
            table_rows=[
                ["Q1 (25th)", "Measured", "20 min"],
                ["Q3 (75th)", "Measured", "35 min"],
                ["IQR", "Q3 - Q1", "15 min"],
                ["Upper Fence", "Q3 + 1.5 * IQR", "35 + 22.5 = 57.5 min"]
            ],
            takeaway="Any delivery taking longer than 57.5 minutes is mathematically flagged as an outlier."
        ),
        ml_impact="Used in robust feature scaling (`RobustScaler`) and data cleaning pipelines to detect and filter anomalies before training.",
        common_methods=["scipy.stats.iqr()", "Q3 - Q1", "sklearn.preprocessing.RobustScaler"],
        when_to_use="When measuring spread or detecting outliers in non-normal or skewed tabular features.",
        when_not_to_use="Do not discard outliers identified by IQR blindly without consulting domain experts.",
        common_mistakes=[
            "Automatically deleting all data points beyond the 1.5 * IQR fence without investigating their cause.",
            "Confusing IQR with the total range ($X_{\\max} - X_{\\min}$)."
        ],
        interview_tip="Why did John Tukey choose 1.5 for the IQR fence? In a normal distribution, $Q_1 - 1.5 \\cdot \\text{IQR}$ and $Q_3 + 1.5 \\cdot \\text{IQR}$ correspond to approximately $\\pm 2.7\\sigma$, capturing 99.3% of normal data and flagging only 0.7% as outliers.",
        related_concepts=["quartiles", "outlier", "median", "standard_deviation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_iqr_1",
            question="If $Q_1 = 100$ and $Q_3 = 140$, what is the upper Tukey outlier fence ($Q_3 + 1.5 \\cdot \\text{IQR}$)?",
            options=[
                "160",
                "200",
                "180",
                "220"
            ],
            correct_option_index=1,
            explanation="$\\text{IQR} = 140 - 100 = 40$. The upper fence is $140 + (1.5 \\times 40) = 140 + 60 = 200$."
        )
    ),
    EducationalConcept(
        concept_id="skewness",
        category="statistics",
        title="Skewness (Distribution Asymmetry)",
        short_definition="A measure of the asymmetry of the probability distribution of a real-valued random variable about its mean.",
        beginner_explanation="Picture a slide on a playground. If the slide trails off toward the right, the distribution has a 'long right tail' (positive skew). If it trails off toward the left, it has a 'long left tail' (negative skew).",
        intermediate_explanation="Quantifies deviation from a symmetric bell curve. Positive skew (right tail): $\\text{Mean} > \\text{Median}$. Negative skew (left tail): $\\text{Mean} < \\text{Median}$. Symmetrical: $\\text{Skewness} \\approx 0$.",
        technical_explanation="The normalized third standardized central moment: $\\tilde{\\mu}_3 = \\mathbb{E}\\left[\\left(\\frac{X - \\mu}{\\sigma}\\right)^3\\right] = \\frac{\\mu_3}{\\sigma^3}$. Sample estimate computed via Fisher-Pearson coefficient of skewness.",
        why_it_matters="Linear models (Linear Regression, Logistic Regression, LDA) assume features are normally distributed with symmetric error residuals. High skewness degrades their stability and predictive performance.",
        real_world_example=ConceptExample(
            title="House Prices in a Metropolis",
            description="Most houses sell between $200k-$500k, but a few penthouses sell for $20M+.",
            table_headers=["Metric", "Value", "Effect"],
            table_rows=[
                ["Median Price", "$350,000", "Represents the center"],
                ["Mean Price", "$620,000", "Pulled heavily to the right by mega-mansions"],
                ["Skewness", "+3.85", "Severe right skew; needs log transformation"]
            ],
            takeaway="Applying $\\log(x)$ or PowerTransformer makes the distribution bell-shaped."
        ),
        ml_impact="Heavily skewed features cause gradient descent oscillations and violate normality assumptions. Applying $\\log(1+x)$ or Box-Cox normalization restores symmetry and boosts linear model accuracy.",
        common_methods=["df['col'].skew()", "np.log1p()", "scipy.stats.boxcox()", "PowerTransformer(method='yeo-johnson')"],
        when_to_use="When evaluating whether numeric features require logarithmic or power transformations prior to modeling.",
        when_not_to_use="Do not apply logarithmic transformations to features containing negative numbers without using Yeo-Johnson power transforms.",
        common_mistakes=[
            "Applying `np.log()` directly on columns with zero values, causing `-\\infty` errors (use `np.log1p()` instead).",
            "Assuming tree models (Random Forest, XGBoost) require log transformations (trees are monotonic and immune to skewness)."
        ],
        interview_tip="When does a right-skewed feature benefit from a log transform? In linear models, neural nets, and distance metrics. For gradient boosted trees (LightGBM/XGBoost), monotonic transformations rarely improve performance because split choices remain identical.",
        related_concepts=["mean", "median", "outlier", "numerical_data"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="check_skew_1",
            question="In a positively (right) skewed distribution with a long right tail, what is the typical relationship between the mean and median?",
            options=[
                "Mean is significantly lower than the Median",
                "Mean is significantly greater than the Median",
                "Mean and Median are mathematically identical",
                "The Median cannot be computed"
            ],
            correct_option_index=1,
            explanation="The long tail of high values pulls the arithmetic mean up toward the right, while the median remains anchored in the denser cluster of lower values."
        )
    )
]
