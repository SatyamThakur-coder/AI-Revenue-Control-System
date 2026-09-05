# RevenueAI — REST API Documentation

Base URL: `http://localhost:5000/api`

## Authentication (`/auth`)
- `POST /auth/register`: Create organization & owner user.
- `POST /auth/login`: Authenticate & return JWT token.
- `GET /auth/me`: Get current authenticated user & business profile.

## Customers (`/customers`)
- `GET /customers`: List customers (Search, Status Filter, Pagination).
- `POST /customers`: Create customer profile.
- `GET /customers/:id`: Get customer profile with purchase history.
- `PUT /customers/:id`: Update customer details.
- `DELETE /customers/:id`: Delete customer.

## Products (`/products`)
- `GET /products`: List products with profit margin & refund rate analytics.
- `POST /products`: Create product/service.
- `GET /products/:id`: Get product details.
- `PUT /products/:id`: Update product.
- `DELETE /products/:id`: Delete product.

## Transactions (`/transactions`)
- `GET /transactions`: Query transaction ledger with filters.
- `POST /transactions`: Record transaction (runs backend finance math & triggers leakage engine).
- `GET /transactions/:id`: Get transaction details.
- `DELETE /transactions/:id`: Delete transaction.

## Analytics (`/analytics`)
- `GET /analytics/overview`: Top KPI summary (Net Revenue, Profit, Leakage, Churn Risk, Targets).
- `GET /analytics/revenue`: Time-series revenue data (7d, 30d, 90d, 6m, 12m).
- `GET /analytics/profit`: Product category profit breakdown.
- `GET /analytics/payment-methods`: Payment channel distribution.

## Revenue Leakage (`/leakage`)
- `GET /leakage`: List open/resolved revenue leakage alerts.
- `POST /leakage/scan`: Run automated leakage scan on pending transactions.
- `PUT /leakage/:id/resolve`: Mark leakage alert resolved.

## Forecast (`/forecast`)
- `GET /forecast`: Return 30-day forward ML prediction curve (enforces 30-day data rule).

## Churn Prediction (`/churn`)
- `GET /churn`: List customer churn predictions & explainability factors.

## AI Assistant (`/ai`)
- `POST /ai/chat`: Context-aware financial assistant querying live tenant DB.
- `GET /ai/recommendations`: Actionable growth & leakage recommendations.

## Reports (`/reports`)
- `GET /reports/export?type=revenue|customers|products|leakage`: Download CSV report.

## Settings (`/settings`)
- `GET /settings`: Get monthly revenue targets & team list.
- `PUT /settings/target`: Update monthly target benchmark.
