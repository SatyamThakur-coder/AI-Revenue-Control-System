# RevenueAI — Platform Architecture

RevenueAI is structured as an enterprise-grade multi-tenant B2B SaaS platform designed to deliver real-time business revenue intelligence, pricing anomaly detection, predictive forecasting, and automated churn risk analysis.

```
                  ┌──────────────────────────────────────────────┐
                  │          Vite + React 18 Frontend            │
                  │   Tailwind CSS, Lucide, Recharts, Axios      │
                  └──────────────────────┬───────────────────────┘
                                         │ REST APIs (JWT)
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │         Node.js + Express.js Backend         │
                  │   Multi-tenant Scoping, Finance Engine       │
                  └──────────────┬────────────────┬──────────────┘
                                 │                │
                     Prisma ORM  │                │  HTTP JSON
                                 ▼                ▼
                  ┌────────────────────┐   ┌────────────────────────────┐
                  │  SQLite / Postgres │   │   Python FastAPI ML        │
                  │  Tenant Database   │   │   Scikit-Learn, Pandas     │
                  └────────────────────┘   └────────────────────────────┘
```

---

## 1. Multi-Tenant Security & Isolation
- **Organization Boundary**: Every database entity (`Customer`, `Product`, `Transaction`, `RevenueLeak`, `ChurnPrediction`) contains an indexed `organizationId` foreign key.
- **Backend Enforcement**: Express `authMiddleware` extracts `organizationId` from the cryptographically signed JWT. Middleware verifies tenant isolation on 100% of incoming requests.

---

## 2. Centralized Backend Financial Math
- Financial values (Gross Revenue, Net Revenue, Cost, Gross Profit, Profit Margin %) are calculated deterministically on the backend.
- Frontend calculations are never trusted to eliminate client-side tampering or rounding inconsistencies.

---

## 3. Revenue Leakage Engine
The leakage engine automatically scans every recorded transaction for:
1. **Excessive Discounts**: Discounts > 25% of gross order value.
2. **Payment Failures**: Uncollected payments.
3. **Duplicate Orders**: Same customer, product, and amount within a 10-minute window.
4. **Pricing Anomalies**: Selling unit price below product cost.
5. **Refund Anomalies**: Refund amounts exceeding 50% order value.

Alerts are explicitly categorized as **Potential Revenue Leaks** until resolved by billing managers.

---

## 4. Python ML Microservice
The Python microservice runs independently on port `8000`:
- **Scikit-Learn Random Forest Regressor**: Predicts 30-day forward daily revenue with 95% confidence bounds. Enforces a mandatory 30-day minimum dataset rule.
- **RFM Churn Scoring Classifier**: Predicts customer churn probabilities and extracts top risk drivers.
- **Isolation Forest**: Detects price & volume anomalies.
