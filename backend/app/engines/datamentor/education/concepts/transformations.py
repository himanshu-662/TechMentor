"""Educational concepts covering Data Transformations, Feature Scaling, Power Transforms, and Data Leakage."""
from app.engines.menti_ai.education.models import EducationalConcept, ConceptExample, ConceptKnowledgeCheck

TRANSFORMATION_CONCEPTS = [
    EducationalConcept(
        concept_id="data_transformation",
        category="advanced",
        title="Data Transformation",
        short_definition="Data transformation is the mathematical modification of numerical feature values to alter their scale, range, or probability distribution shape.",
        beginner_explanation=(
            "Imagine comparing the weight of an elephant (thousands of pounds) to the weight of an apple (a few ounces). "
            "If an algorithm looks at raw numbers, it might assume the elephant is infinitely more important just because its number is bigger! "
            "Data transformation puts different features onto comparable scales or reshapes skewed distributions so models can learn fairly."
        ),
        intermediate_explanation=(
            "Transformations adjust numerical representations to satisfy mathematical assumptions of machine learning algorithms. "
            "Linear and distance-based models assume features share similar variances and scales. Power transformations stabilize variance "
            "and convert right-skewed or left-skewed distributions into approximately Gaussian (bell-shaped) distributions."
        ),
        technical_explanation=(
            "Formally, a transformation is a mapping $f: \\mathbb{R} \\to \\mathbb{R}$ applied to feature vector $X$. "
            "Affine transformations (standardization, min-max scaling) preserve distribution moments and relative distances up to a constant factor. "
            "Non-linear monotonic transformations (logarithm, Yeo-Johnson, Box-Cox) compress extreme tails and stabilize heteroscedastic residuals in regression."
        ),
        why_it_matters=(
            "Without appropriate transformation, gradient descent optimization oscillates slowly, distance metrics (Euclidean, Manhattan) "
            "are dominated by large-scale features, and regularized models (L1 Lasso, L2 Ridge) penalize smaller-magnitude features unfairly."
        ),
        real_world_example=ConceptExample(
            title="House Price Prediction: Income vs Age",
            description="A dataset where 'Annual Income' ranges from $20,000 to $500,000 while 'Age' ranges from 18 to 85.",
            table_headers=["Customer", "Age", "Annual Income ($)", "Raw Euclidean Distance to Mean"],
            table_rows=[
                ["Alice", "25", "$45,000", "Dominates by Income ($)"],
                ["Bob", "65", "$48,000", "Age difference (40 yrs) is ignored vs $3k income diff"],
                ["Scaled Alice", "-1.10 std", "-0.65 std", "Balanced distance in scaled space"],
                ["Scaled Bob", "+1.25 std", "-0.40 std", "Both features contribute meaningfully"]
            ],
            takeaway="Scaling features prevents large numerical dimensions from drowning out smaller but equally predictive signals."
        ),
        ml_impact=(
            "Gradient-based optimizers (Neural Networks, Logistic Regression) converge up to 10x faster. "
            "Distance algorithms (KNN, SVM, K-Means, PCA) function properly. Tree models (Random Forest, XGBoost) remain unaffected."
        ),
        common_methods=[
            "StandardScaler (Z-Score)",
            "MinMaxScaler (Bounded Range)",
            "RobustScaler (Median & IQR)",
            "Log / Log1p Transform",
            "Yeo-Johnson & Box-Cox Power Transforms"
        ],
        when_to_use="When using distance-based models (KNN, SVM, K-Means), gradient descent (Neural Nets), or regularized regressions (Lasso/Ridge).",
        when_not_to_use="When using tree-based ensembles (Decision Trees, XGBoost, LightGBM) unless reducing extreme skewness for regression targets.",
        common_mistakes=[
            "Transforming every feature blindly without checking model requirements.",
            "Fitting scalers on the entire dataset before splitting (causing data leakage).",
            "Applying logarithmic transforms to negative numbers without appropriate offsets."
        ],
        interview_tip=(
            "State clearly: 'Not every feature needs transformation.' Tree-based models are scale-invariant because splits depend on feature rank order, "
            "whereas distance-based and gradient models strictly require scale normalization."
        ),
        related_concepts=["feature_scaling", "standardization", "min_max_scaling", "robust_scaling", "log_transformation", "fit_vs_transform"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_transform_01",
            question="Which machine learning algorithm is naturally invariant to monotonic feature scaling?",
            options=[
                "K-Nearest Neighbors (KNN)",
                "Support Vector Machine (SVM) with RBF kernel",
                "Decision Tree / Random Forest",
                "Principal Component Analysis (PCA)"
            ],
            correct_option_index=2,
            explanation="Decision trees split on individual feature thresholds based on ordering/impurity reduction and are completely unaffected by monotonic scaling."
        )
    ),

    EducationalConcept(
        concept_id="feature_scaling",
        category="advanced",
        title="Feature Scaling",
        short_definition="Feature scaling is the process of normalizing the range of independent features in a dataset to a standard scale.",
        beginner_explanation=(
            "If you measure distance in centimeters and time in hours, the distance numbers will look gigantic compared to the time numbers. "
            "Feature scaling translates all measurements onto a level playing field so no feature gets unfair attention just because of its units."
        ),
        intermediate_explanation=(
            "Feature scaling ensures that objective functions in optimization algorithms (like cost functions in gradient descent) "
            "have spherical or circular contour lines rather than elongated ellipses, preventing zig-zagging gradient updates."
        ),
        technical_explanation=(
            "Let $J(\\theta)$ be the loss surface. When condition number $\\kappa(X^T X)$ is large due to disparate feature scales, "
            "the Hessian matrix exhibits extreme eigenvalue ratios, leading to slow first-order gradient convergence. Scaling minimizes $\\kappa$."
        ),
        why_it_matters=(
            "In regularized models ($L_1/L_2$), penalties are isotropic. If feature $A$ is in millions and feature $B$ is in decimals, "
            "regularization will shrink feature $B$'s coefficient to zero almost instantly while leaving feature $A$ untouched."
        ),
        real_world_example=ConceptExample(
            title="Credit Risk Scoring: Salary vs Number of Credit Cards",
            description="Comparing annual salary ($30,000 - $200,000) with number of open credit cards (1 - 10).",
            table_headers=["Feature", "Raw Min", "Raw Max", "Scaled Range (MinMax)"],
            table_rows=[
                ["Salary", "$30,000", "$200,000", "0.0 to 1.0"],
                ["Credit Cards", "1", "10", "0.0 to 1.0"]
            ],
            takeaway="After scaling, a 1-unit step represents the full span of variability for both features."
        ),
        ml_impact="Prevents bias toward high-magnitude features in KNN, SVM, PCA, K-Means, and regularized Linear Models.",
        common_methods=["StandardScaler", "MinMaxScaler", "RobustScaler", "MaxAbsScaler"],
        when_to_use="Whenever algorithms compute distances, dot products, or use gradient descent optimization.",
        when_not_to_use="For pure tree-based models or when raw units must remain human-interpretable in business dashboards.",
        common_mistakes=[
            "Scaling target variable $y$ unnecessarily in classification tasks.",
            "Using MinMaxScaler when extreme outliers are present (which squashes normal data into a tiny band)."
        ],
        interview_tip="Explain how feature scaling directly affects gradient descent convergence rate and regularization fairness.",
        related_concepts=["standardization", "min_max_scaling", "robust_scaling", "data_leakage"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_scaling_01",
            question="What happens if you train Ridge Regression on unscaled features with vastly different magnitudes?",
            options=[
                "The model will fail to compile.",
                "Features with smaller numerical values are penalized disproportionately harder.",
                "Tree depth will exceed maximum limits.",
                "The training loss will become negative."
            ],
            correct_option_index=1,
            explanation="Ridge adds $\\lambda \\sum \\beta_j^2$. If feature $x_j$ has small values, its coefficient $\\beta_j$ must be large, making it heavily penalized by the regularization term."
        )
    ),

    EducationalConcept(
        concept_id="standardization",
        category="advanced",
        title="Standardization (Z-Score Scaling)",
        short_definition="Standardization centers feature values around a mean of 0 and rescales them to have a standard deviation of 1.",
        beginner_explanation=(
            "Standardization answers: 'How many standard deviations is this value away from the average?' "
            "A value of 0 means exactly average. +2 means notably higher than average, and -1.5 means below average."
        ),
        intermediate_explanation=(
            "Standardization transforms features using the formula $z = (x - \\mu) / \\sigma$. "
            "It does not bound values to a fixed [0, 1] range and does not change the shape of skewed distributions, but it standardizes the spread."
        ),
        technical_explanation=(
            "Given $X \\sim (\\mu, \\sigma^2)$, $Z = \\frac{X - \\mu}{\\sigma}$ yields $\\mathbb{E}[Z] = 0$ and $\\text{Var}(Z) = 1$. "
            "Standardization assumes approximately Gaussian distributed features. For constant features ($\\sigma = 0$), $z$ is defined as 0."
        ),
        why_it_matters=(
            "Standardization is the default preprocessing standard for PCA (which maximizes variance), SVMs, and neural networks "
            "with zero-centered activation functions."
        ),
        real_world_example=ConceptExample(
            title="Exam Score Standardization (SAT vs ACT)",
            description="Comparing a student with SAT score 1400 (mean 1050, std 200) to a student with ACT score 31 (mean 21, std 5).",
            table_headers=["Exam", "Raw Score", "Mean (μ)", "Std (σ)", "Standardized Z-Score"],
            table_rows=[
                ["SAT", "1400", "1050", "200", "+1.75 σ above average"],
                ["ACT", "31", "21", "5", "+2.00 σ above average"]
            ],
            takeaway="Standardization allows direct, fair comparison across different testing scales."
        ),
        ml_impact="Essential for PCA, Logistic Regression, Linear Regression with L1/L2, SVM, and deep learning architectures.",
        common_methods=["StandardScaler in scikit-learn", "scipy.stats.zscore"],
        when_to_use="When feature distributions are roughly bell-shaped or symmetric, and downstream models assume zero-centered features.",
        when_not_to_use="When data has severe outliers (use RobustScaler) or when strictly bounded non-negative inputs are required.",
        common_mistakes=[
            "Believing standardization turns non-normal distributions into normal bell curves (it only shifts and scales).",
            "Dividing by zero on constant columns without safeguards."
        ],
        interview_tip="Highlight that standardization preserves outlier distance while MinMax scaling squashes normal points if outliers exist.",
        related_concepts=["feature_scaling", "min_max_scaling", "robust_scaling", "standard_deviation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_standard_01",
            question="What is the resulting mean and variance of a feature after applying StandardScaler?",
            options=[
                "Mean = 1, Variance = 0",
                "Mean = 0, Variance = 1",
                "Mean = 0, Variance = 0",
                "Mean = 0.5, Variance = 0.5"
            ],
            correct_option_index=1,
            explanation="StandardScaler centers the mean at 0 and scales the variance (and standard deviation) to 1."
        )
    ),

    EducationalConcept(
        concept_id="min_max_scaling",
        category="advanced",
        title="Min-Max Scaling (Normalization)",
        short_definition="Min-Max Scaling shifts and rescales values into a fixed bounded interval, typically between 0 and 1.",
        beginner_explanation=(
            "Imagine a volume knob marked from 0 to 100%. Min-Max scaling takes the smallest value and turns it into 0%, "
            "the largest value into 100%, and scales everything in between proportionally."
        ),
        intermediate_explanation=(
            "Using $x' = \\frac{x - \\min(x)}{\\max(x) - \\min(x)} \\cdot (b - a) + a$, Min-Max scaling bounds data strictly within range $[a, b]$. "
            "It preserves exact zero values when scaling to $[0, 1]$ and maintains proportional distances between non-outlier points."
        ),
        technical_explanation=(
            "Min-Max scaling is a linear affine mapping. Its major weakness is sensitivity to sample extrema: if test data contains "
            "values outside $[\\min_{train}, \\max_{train}]$, transformed values will fall outside $[0, 1]$ unless clipped."
        ),
        why_it_matters=(
            "Required when algorithms require positive or bounded inputs, such as image pixel values for Neural Networks ($[0, 1]$ or $[-1, 1]$) "
            "and algorithms computing probability distributions."
        ),
        real_world_example=ConceptExample(
            title="Customer Satisfaction Ratings (1 to 5 Stars)",
            description="Normalizing customer ratings from 1-5 stars into a standard 0 to 1 confidence metric.",
            table_headers=["Customer Rating", "Min", "Max", "Normalized Value [0, 1]"],
            table_rows=[
                ["1 Star (Worst)", "1", "5", "0.00"],
                ["3 Stars (Neutral)", "1", "5", "0.50"],
                ["5 Stars (Best)", "1", "5", "1.00"]
            ],
            takeaway="Bounded scaling makes disparate scale ratings directly comparable."
        ),
        ml_impact="Critical for image processing, Neural Networks with Sigmoid/Tanh activations, and algorithms requiring bounded non-negative matrices.",
        common_methods=["MinMaxScaler in scikit-learn"],
        when_to_use="When you need strictly bounded features (e.g. $[0, 1]$) and the feature distribution has known, fixed minimum and maximum boundaries without wild outliers.",
        when_not_to_use="When features contain extreme outliers, as a single high outlier will compress 99% of normal data into a narrow sliver near 0.",
        common_mistakes=[
            "Using MinMaxScaler on data with extreme outliers.",
            "Assuming test set values will never exceed the training min/max bounds."
        ],
        interview_tip="Mention that if a new production sample has a value larger than training max, MinMaxScaler outputs a value $> 1.0$ unless clipped.",
        related_concepts=["feature_scaling", "standardization", "robust_scaling"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_minmax_01",
            question="What is the main vulnerability of MinMaxScaler compared to StandardScaler?",
            options=[
                "It requires more computational memory.",
                "A single extreme outlier will compress all other data points into a very tight cluster near 0.",
                "It cannot work with decimal numbers.",
                "It changes the rank order of data points."
            ],
            correct_option_index=1,
            explanation="Because MinMax scaling depends strictly on minimum and maximum extrema, an extreme outlier artificially inflates the denominator and squashes normal data."
        )
    ),

    EducationalConcept(
        concept_id="robust_scaling",
        category="advanced",
        title="Robust Scaling",
        short_definition="Robust Scaling centers features using the median and scales using the Interquartile Range (IQR), making it resistant to outliers.",
        beginner_explanation=(
            "If Elon Musk walks into a diner, the average wealth shoots into billions, but the *median* wealth barely changes! "
            "Robust scaling uses the median and the middle 50% spread (IQR) instead of the easily misled mean and standard deviation."
        ),
        intermediate_explanation=(
            "Robust scaling computes $x' = (x - \\text{median}) / IQR$. Because median and IQR ignore extreme values in the top and bottom 25% tails, "
            "the scaling parameters are not distorted by outliers."
        ),
        technical_explanation=(
            "Estimators based on sample mean and standard deviation have a breakdown point of $0$ (a single outlier can drive them to $\\pm \\infty$). "
            "The median and IQR have breakdown points of $50\\%$ and $25\\%$ respectively, providing high M-estimator resistance."
        ),
        why_it_matters=(
            "Allows effective feature scaling without requiring aggressive outlier deletion or arbitrary truncation before model training."
        ),
        real_world_example=ConceptExample(
            title="Real Estate Pricing with Luxury Mansions",
            description="Comparing home sales where 95% of homes are $300k but 5 mansions sold for $20M.",
            table_headers=["Metric", "Mean/Std Value", "Median/IQR Value", "Robust Scaled Impact"],
            table_rows=[
                ["Center", "Mean = $1,200,000", "Median = $310,000", "Centers on typical home"],
                ["Spread", "Std = $3,500,000", "IQR = $80,000", "Maintains high resolution for 95% of homes"]
            ],
            takeaway="Robust scaling prevents rare multi-million dollar sales from ruining the scaling of regular family homes."
        ),
        ml_impact="Keeps features balanced for distance and linear models without destroying genuine outlier signals.",
        common_methods=["RobustScaler in scikit-learn"],
        when_to_use="When data contains outliers or heavy tails that you want to keep rather than remove or winsorize.",
        when_not_to_use="When the data is cleanly Gaussian with zero outliers (StandardScaler is statistically more efficient).",
        common_mistakes=[
            "Assuming robust scaling removes outliers (it only scales the data so outliers do not distort the rest of the feature).",
            "Handling constant IQR ($IQR = 0$) incorrectly."
        ],
        interview_tip="Tie RobustScaler directly to Tukey's IQR concept from Phase 6, explaining breakdown points of median vs mean.",
        related_concepts=["iqr", "median", "outlier", "standardization"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_robust_01",
            question="Why is RobustScaler preferable over StandardScaler for heavy-tailed datasets with outliers?",
            options=[
                "It guarantees all output values are strictly between 0 and 1.",
                "It uses the median and IQR, which are resistant to extreme tail leverage.",
                "It converts categorical variables into numerical dummy features.",
                "It runs faster on GPU clusters."
            ],
            correct_option_index=1,
            explanation="The median and IQR are robust statistics with high breakdown points that prevent outliers from artificially inflating feature variance."
        )
    ),

    EducationalConcept(
        concept_id="log_transformation",
        category="advanced",
        title="Logarithmic Transformation (Log & Log1p)",
        short_definition="Log transformation applies the natural logarithm to compress large values and convert right-skewed distributions into symmetric ones.",
        beginner_explanation=(
            "When you have values where most numbers are small (like $10, $50, $100) but a few are huge ($100,000, $1,000,000), "
            "logarithm turns multiplicative growth into additive steps: 10 becomes ~1, 100 becomes 2, 1000 becomes 3. It pulls extreme high numbers closer."
        ),
        intermediate_explanation=(
            "The $\\log_e(1 + x)$ (log1p) transform handles zeros gracefully (since $\\log(1) = 0$). It is widely used on monetary amounts, "
            "counts, and right-skewed positive features to reduce skewness and stabilize variance."
        ),
        technical_explanation=(
            "Log transformation linearizes power-law and exponential relationships: if $Y = a X^b$, then $\\ln(Y) = \\ln(a) + b \\ln(X)$. "
            "Domain restriction: $\\ln(x)$ is undefined for $x \\le 0$, and $\\log(1+x)$ is undefined for $x < -1$. It cannot be applied to negative numbers."
        ),
        why_it_matters=(
            "Right-skewed target variables and features violate normality of residuals in linear regression and cause high heteroscedasticity. "
            "Log transforms stabilize residual variance."
        ),
        real_world_example=ConceptExample(
            title="E-Commerce Order Amounts",
            description="Most orders are $15 to $50, but corporate bulk orders reach $50,000.",
            table_headers=["Order ID", "Raw Amount ($)", "log1p(Amount)", "Skewness Shift"],
            table_rows=[
                ["#1", "$15.00", "2.77", "Raw Skewness = +4.85"],
                ["#2", "$45.00", "3.83", "After Log1p = +0.22 (Bell-like)"],
                ["#3", "$50,000.00", "10.82", "Extreme outlier compressed smoothly"]
            ],
            takeaway="Log transformation compressed a $50k extreme value while preserving relative order and converting skewness to symmetric."
        ),
        ml_impact="Crucial for Linear Regression, RMSE evaluation metrics on skewed targets, and stabilizing variance in neural networks.",
        common_methods=["np.log1p", "np.log", "FunctionTransformer(np.log1p)"],
        when_to_use="When a numerical feature is strictly non-negative ($x \\ge 0$) and exhibits strong positive (right) skewness.",
        when_not_to_use="When the feature contains negative numbers (use Yeo-Johnson instead) or when the distribution is already symmetric.",
        common_mistakes=[
            "Applying $\\log(x)$ directly to data containing zeros, producing $-\\infty$ errors (always use $\\log(1+x)$ or $\\log(x + c)$).",
            "Applying log to left-skewed (negatively skewed) data, which worsens the skew."
        ],
        interview_tip="Explain why log1p ($f(x)=\\ln(1+x)$) is numerically superior for small values close to zero compared to raw $\\ln(x)$.",
        related_concepts=["power_transformation", "yeo_johnson", "box_cox", "skewness"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_log_01",
            question="What is the mathematical error if you evaluate standard np.log(0)?",
            options=[
                "Returns 0.0",
                "Returns -Infinity (division by zero in log space)",
                "Returns NaN (Not a Number)",
                "Throws a syntax exception"
            ],
            correct_option_index=1,
            explanation="The natural logarithm of zero approaches $-\\infty$. Using $\\log(1 + x)$ avoids this because $\\ln(1 + 0) = \\ln(1) = 0$."
        )
    ),

    EducationalConcept(
        concept_id="power_transformation",
        category="advanced",
        title="Power Transformations",
        short_definition="Power transformations are a family of parametric non-linear transformations designed to map non-normal data into an approximately Gaussian distribution.",
        beginner_explanation=(
            "Imagine bending and stretching a rubber ruler until all the data points line up into a symmetrical bell curve. "
            "Power transforms automatically find the best mathematical exponent (called lambda $\\lambda$) to reshape skewed data."
        ),
        intermediate_explanation=(
            "Power transforms find the optimal parameter $\\lambda$ using Maximum Likelihood Estimation (MLE) to maximize the normality "
            "of the resulting distribution. The two primary algorithms are Box-Cox (strictly positive data) and Yeo-Johnson (any real values)."
        ),
        technical_explanation=(
            "Under the assumption that there exists $\\lambda$ such that $Y^{(\\lambda)} \\sim \\mathcal{N}(\\mu, \\sigma^2)$, "
            "the parameter $\\hat{\\lambda}$ is estimated by maximizing the profile log-likelihood function $L(\\lambda) = -\\frac{n}{2} \\ln(\\hat{\\sigma}^2(\\lambda)) + (\\lambda - 1) \\sum \\ln(y_i)$."
        ),
        why_it_matters=(
            "Many classical statistical tests (ANOVA, t-tests) and linear regression assume normally distributed errors. "
            "Power transformations make non-normal features conform to these assumptions."
        ),
        real_world_example=ConceptExample(
            title="Manufacturing Tolerance Measurements",
            description="Drift measurements that are skewed with both positive and negative deviation values.",
            table_headers=["Measurement Type", "Supported Values", "Algorithm Chosen", "Estimated Lambda (λ)"],
            table_rows=[
                ["Strictly Positive ($x > 0$)", "$0.5, 12.4, 88.1$", "Box-Cox or Yeo-Johnson", "λ = 0.28"],
                ["Zero & Negative ($x \\le 0$)", "$-4.2, 0.0, 15.6$", "Yeo-Johnson Only", "λ = 0.65"]
            ],
            takeaway="Power transformations dynamically calibrate $\\lambda$ to find the optimal curve for normality."
        ),
        ml_impact="Enhances performance of linear models, LDA, and Gaussian Naive Bayes by ensuring normality assumptions are respected.",
        common_methods=["PowerTransformer(method='yeo-johnson')", "PowerTransformer(method='box-cox')"],
        when_to_use="When data violates normality and you need automatic parameter tuning rather than a fixed log transform.",
        when_not_to_use="When interpretability in original units is essential or when features are strictly categorical counts.",
        common_mistakes=[
            "Trying to apply Box-Cox to datasets containing zero or negative numbers.",
            "Forgetting to save the fitted $\\lambda$ parameter to transform unseen test data."
        ],
        interview_tip="Explain how $\\lambda = 1$ means no transform, $\\lambda = 0$ corresponds to log transform, and $\\lambda = 0.5$ is square root.",
        related_concepts=["yeo_johnson", "box_cox", "log_transformation", "skewness"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_power_01",
            question="What technique does PowerTransformer use to find the optimal power parameter lambda (λ)?",
            options=[
                "Gradient descent on cross-entropy loss",
                "Maximum Likelihood Estimation (MLE)",
                "K-Means clustering",
                "Grid search over random integers"
            ],
            correct_option_index=1,
            explanation="PowerTransformer uses Maximum Likelihood Estimation to find the $\\lambda$ that maximizes the normality log-likelihood."
        )
    ),

    EducationalConcept(
        concept_id="yeo_johnson",
        category="advanced",
        title="Yeo-Johnson Transformation",
        short_definition="Yeo-Johnson is an extension of Box-Cox power transformation that supports positive, zero, and negative values.",
        beginner_explanation=(
            "Box-Cox is great, but it breaks if your dataset has zero or negative numbers. "
            "Yeo-Johnson is the upgraded version that can reshape any numerical column, whether positive, zero, or negative!"
        ),
        intermediate_explanation=(
            "Introduced in 2000, Yeo-Johnson applies distinct mathematical formulas for non-negative ($x \\ge 0$) and negative ($x < 0$) numbers, "
            "ensuring continuity and monotonicity across zero while optimizing parameter $\\lambda$."
        ),
        technical_explanation=(
            "For $x \\ge 0$: $\\psi(\\lambda, x) = ((x+1)^\\lambda - 1)/\\lambda$ (if $\\lambda \\neq 0$) or $\\ln(x+1)$ (if $\\lambda = 0$). "
            "For $x < 0$: $\\psi(\\lambda, x) = -((-x+1)^{2-\\lambda} - 1)/(2-\\lambda)$ (if $\\lambda \\neq 2$) or $-\\ln(-x+1)$ (if $\\lambda = 2$)."
        ),
        why_it_matters=(
            "It is the most versatile power transformation in modern data science because it has no positivity domain restrictions."
        ),
        real_world_example=ConceptExample(
            title="Financial Profit and Loss Distribution",
            description="Company net quarterly profits ranging from -$500,000 (losses) to +$2,000,000 (gains).",
            table_headers=["Company", "Quarterly Net P&L", "Box-Cox Allowed?", "Yeo-Johnson Allowed?"],
            table_rows=[
                ["Startup A", "-$120,000 (Loss)", "❌ Rejects (Negative)", "✅ Successfully Transforms"],
                ["Startup B", "$0 (Break even)", "❌ Rejects (Zero)", "✅ Successfully Transforms"],
                ["Company C", "+$450,000 (Profit)", "✅ Allowed", "✅ Successfully Transforms"]
            ],
            takeaway="Yeo-Johnson handles the full real number spectrum without requiring manual shifting."
        ),
        ml_impact="Normalizes feature distributions with negative or zero values for linear regression and covariance-based algorithms.",
        common_methods=["PowerTransformer(method='yeo-johnson')"],
        when_to_use="When a feature is skewed, needs normalization to Gaussian shape, and contains zero or negative values.",
        when_not_to_use="When simpler linear scaling (StandardScaler) is sufficient and original scale interpretability must be retained.",
        common_mistakes=[
            "Assuming Yeo-Johnson produces identical results to Box-Cox on positive data (formulas differ slightly by $x+1$ offset).",
            "Failing to standardize after power transformation."
        ],
        interview_tip="Highlight that Yeo-Johnson extends Box-Cox specifically to overcome the $x > 0$ strictly positive restriction.",
        related_concepts=["power_transformation", "box_cox", "log_transformation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_yeo_01",
            question="What is the primary advantage of Yeo-Johnson over Box-Cox?",
            options=[
                "Yeo-Johnson supports zero and negative values natively.",
                "Yeo-Johnson operates on text strings.",
                "Yeo-Johnson is 100x faster to compute.",
                "Yeo-Johnson guarantees 100% accuracy in models."
            ],
            correct_option_index=0,
            explanation="Yeo-Johnson was formulated specifically to allow power transformations on datasets with zero and negative values."
        )
    ),

    EducationalConcept(
        concept_id="box_cox",
        category="advanced",
        title="Box-Cox Transformation",
        short_definition="Box-Cox is a classic power transformation that stabilizes variance and normalizes strictly positive numerical features.",
        beginner_explanation=(
            "Box-Cox is a time-tested math recipe from 1964. If all your numbers are strictly greater than zero, "
            "it finds the best power exponent to turn a skewed distribution into a symmetrical bell curve."
        ),
        intermediate_explanation=(
            "Box-Cox calculates $y^{(\\lambda)} = (y^\\lambda - 1) / \\lambda$ for $\\lambda \\neq 0$ and $\\ln(y)$ for $\\lambda = 0$. "
            "It strictly requires $y > 0$. If any value is $\\le 0$, the algorithm cannot be computed."
        ),
        technical_explanation=(
            "The Box-Cox transform is defined on positive support $\\mathbb{R}_{>0}$. The Jacobian of the transformation is $\\prod y_i^{\\lambda - 1}$. "
            "Because $\\ln(y)$ is undefined for $y \\le 0$, non-positive inputs cause mathematical domain failure."
        ),
        why_it_matters=(
            "It is a foundational statistical method in econometrics and time-series analysis (ARIMA variance stabilization)."
        ),
        real_world_example=ConceptExample(
            title="Website Session Durations",
            description="User session times in seconds (ranging strictly from 1.2s to 3,600s).",
            table_headers=["User", "Raw Duration (s)", "Box-Cox λ = 0.15 Transform"],
            table_rows=[
                ["User A", "2.5s", "0.98"],
                ["User B", "45.0s", "4.82"],
                ["User C", "1,800.0s", "10.45"]
            ],
            takeaway="All positive session durations are successfully mapped into an approximately Gaussian distribution."
        ),
        ml_impact="Normalizes positive target variables and features in linear models, reducing heteroscedasticity.",
        common_methods=["scipy.stats.boxcox", "PowerTransformer(method='box-cox')"],
        when_to_use="When all values in the feature are strictly positive ($x > 0$) and the distribution is heavily skewed.",
        when_not_to_use="When data contains zero or negative values (use Yeo-Johnson instead).",
        common_mistakes=[
            "Applying Box-Cox without verifying that $\\min(x) > 0$.",
            "Adding an arbitrary constant $+c$ to force negative numbers to positive without understanding shift artifacts."
        ],
        interview_tip="Always mention the strict positivity constraint: $x_i > 0, \\forall i$.",
        related_concepts=["power_transformation", "yeo_johnson", "log_transformation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_boxcox_01",
            question="What happens if you attempt to run Box-Cox on a column that contains 0 or negative numbers?",
            options=[
                "It automatically replaces them with mean.",
                "It raises a mathematical domain error because Box-Cox requires strictly positive values ($x > 0$).",
                "It converts negative numbers to positive absolute values.",
                "It executes without issue."
            ],
            correct_option_index=1,
            explanation="Box-Cox is strictly defined for positive numbers ($x > 0$). Zero or negative values cause a domain error."
        )
    ),

    EducationalConcept(
        concept_id="data_leakage",
        category="advanced",
        title="Data Leakage in Preprocessing",
        short_definition="Data leakage occurs when information from outside the training dataset (like test or validation sets) is inadvertently used to train a model or fit scalers.",
        beginner_explanation=(
            "Imagine a teacher giving you the answers to the final exam before you study for it. You will get 100% on the practice test, "
            "but you will fail when given real new questions! Data leakage happens when your preprocessing 'cheats' by peeking at test data."
        ),
        intermediate_explanation=(
            "If you fit a scaler (calculating mean and standard deviation) across the entire dataset *before* splitting into train and test sets, "
            "the mean of the test set leaks into the training pipeline. This creates overly optimistic cross-validation scores that fail in production."
        ),
        technical_explanation=(
            "Let $D = D_{train} \\cup D_{test}$. Estimating parameters $\\theta = (\\mu, \\sigma, \\min, \\max, \\lambda)$ using $D$ introduces a conditional dependency: "
            "$\\hat{y} = f(x; \\theta(D_{train}, D_{test}))$, violating the assumption of independent identically distributed (i.i.d.) test evaluation."
        ),
        why_it_matters=(
            "Data leakage is the #1 cause of machine learning models performing brilliantly in academic notebooks but failing catastrophically in real-world deployment."
        ),
        real_world_example=ConceptExample(
            title="Hospital Patient Readmission Model",
            description="Preprocessing dataset of 10,000 patients by scaling all rows before performing 80/20 train/test split.",
            table_headers=["Step", "Incorrect Workflow (Leakage)", "Correct Workflow (Zero Leakage)"],
            table_rows=[
                ["1. Split", "Split after scaling", "Split raw dataset FIRST into Train and Test"],
                ["2. Fit", "Fit scaler on all 10,000 rows", "Fit scaler ONLY on 8,000 Train rows"],
                ["3. Transform", "Already done", "Transform Train AND Test using Train's fitted scaler"]
            ],
            takeaway="Never fit transformations on the test dataset. Always fit on train, then transform test."
        ),
        ml_impact="Produces false high validation metrics and poor generalization on unseen production data.",
        common_methods=["sklearn.pipeline.Pipeline", "fit_transform on train, transform on test"],
        when_to_use="Always follow strict leakage prevention in every preprocessing and feature engineering step.",
        when_not_to_use="Never allow data leakage.",
        common_mistakes=[
            "Computing mean/std on the full dataset before train/test splitting.",
            "Imputing missing values using the whole dataset median before splitting."
        ],
        interview_tip="Whenever asked how to build a data pipeline, start with: 'First, I split into train and test sets to prevent data leakage.'",
        related_concepts=["fit_vs_transform", "feature_scaling", "data_transformation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_leakage_01",
            question="What is the correct sequence to scale data and avoid data leakage?",
            options=[
                "Fit scaler on all data -> Split into train/test -> Train model",
                "Split into train/test -> Fit scaler on train -> Transform train and test with train scaler -> Train model",
                "Split into train/test -> Fit scaler on test -> Transform train with test scaler",
                "Fit scaler on train -> Fit different scaler on test -> Train model"
            ],
            correct_option_index=1,
            explanation="Always split first, fit parameters exclusively on the training set, and apply those fitted parameters to both train and test."
        )
    ),

    EducationalConcept(
        concept_id="fit_vs_transform",
        category="advanced",
        title="Fit vs. Transform (The Two-Phase Rule)",
        short_definition="The fundamental machine learning rule where transformations first compute parameters on training data ('fit'), and then apply those stored parameters ('transform').",
        beginner_explanation=(
            "Think of 'fit' as creating a custom cookie cutter based on your training recipe. 'Transform' is using that exact same cookie cutter to cut dough. "
            "You never make a new cookie cutter for the customer's plate!"
        ),
        intermediate_explanation=(
            "In scikit-learn terminology: `.fit()` calculates the statistical parameters (like $\\mu$ and $\\sigma$). "
            "`.transform()` applies the formula using those learned parameters. `.fit_transform()` is a convenience method that does both on training data in one step."
        ),
        technical_explanation=(
            "Training phase: $\\hat{\\theta}_{train} = \\text{Fit}(X_{train})$. Transformed train: $X'_{train} = \\text{Transform}(X_{train}; \\hat{\\theta}_{train})$. "
            "Inference phase: $X'_{test} = \\text{Transform}(X_{test}; \\hat{\\theta}_{train})$. Never call `.fit()` on $X_{test}$."
        ),
        why_it_matters=(
            "Ensures identical scale transformations between training data and incoming live production inference records."
        ),
        real_world_example=ConceptExample(
            title="Real-Time Fraud Detection Deployment",
            description="A live transaction arrives with Amount = $150. How does the system scale it?",
            table_headers=["Phase", "Action", "Parameters Used", "Result"],
            table_rows=[
                ["Offline Training", "scaler.fit(X_train)", "Saved mean=$85.00, std=$32.50", "Scaler model serialized to disk"],
                ["Online Production", "scaler.transform([[150.0]])", "Uses saved mean=$85.00, std=$32.50", "Scaled z = (150 - 85) / 32.5 = +2.00"]
            ],
            takeaway="Production predictions rely on the exact transformation parameters learned during offline training."
        ),
        ml_impact="Guarantees consistency between offline training and live production serving.",
        common_methods=["scaler.fit()", "scaler.transform()", "scaler.fit_transform()"],
        when_to_use="In every data preprocessing pipeline without exception.",
        when_not_to_use="Never fit a separate scaler on test or production data.",
        common_mistakes=[
            "Calling `scaler.fit_transform(X_test)` instead of `scaler.transform(X_test)`.",
            "Discarding fitted scaler parameters after training."
        ],
        interview_tip="State: '.fit() learns the parameters; .transform() applies them. We fit only on train and transform both train and test.'",
        related_concepts=["data_leakage", "feature_scaling", "data_transformation"],
        knowledge_check=ConceptKnowledgeCheck(
            check_id="kc_fit_01",
            question="Which method should be called on the test dataset?",
            options=[
                "scaler.fit(X_test)",
                "scaler.fit_transform(X_test)",
                "scaler.transform(X_test)",
                "scaler.re_fit(X_test)"
            ],
            correct_option_index=2,
            explanation="Only .transform(X_test) should be called on the test set, using the parameters previously learned from the training set."
        )
    )
]
