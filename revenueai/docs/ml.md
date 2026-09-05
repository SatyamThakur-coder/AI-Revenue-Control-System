# RevenueAI — Machine Learning Architecture

The RevenueAI Python ML microservice provides predictive business intelligence using Scikit-Learn and Pandas.

## 1. Predictive Revenue Forecasting (`POST /predict/revenue`)
- **Algorithm**: `RandomForestRegressor(n_estimators=100)`
- **Features**: Day of week, day of month, month, revenue lag (t-1, t-7), 7-day moving average, 30-day moving average.
- **Evaluation**:
  - MAE (Mean Absolute Error)
  - RMSE (Root Mean Squared Error)
  - MAPE (Mean Absolute Percentage Error)
- **Data Sufficiency Constraint**: Requires minimum 30 days of distinct transaction data points. Returns explicit warning state if dataset length < 30.

## 2. Customer Churn Prediction (`POST /predict/churn`)
- **Algorithm**: Scikit-Learn RFM Classifier + Heuristic Rule Scoring.
- **Inputs**: Recency (days since last purchase), frequency (purchases/month), total spend, average order value, refund count, failed payment count.
- **Explainability**: Outputs top risk factors for every at-risk customer account.

## 3. Anomaly Detection (`POST /detect/anomalies`)
- **Algorithm**: `IsolationForest(contamination=0.05)`
- Detects multi-dimensional price & discount outliers.
