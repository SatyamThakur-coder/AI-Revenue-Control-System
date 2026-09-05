# RevenueAI — AI Revenue Control & Intelligence Platform

RevenueAI is an enterprise-grade AI revenue intelligence, anomaly detection, predictive forecasting, and customer churn platform built for small and medium-sized businesses.

---

## 🌟 Key Features

* **Multi-Tenant Security**: strict `organizationId` database scoping across all endpoints.
* **Role-Based Authorization**: `OWNER`, `MANAGER`, and `STAFF` access levels.
* **Backend Financial Engine**: Deterministic calculation of Gross Revenue, Discounts, Net Revenue, Cost, Gross Profit, and Profit Margins.
* **Automated Revenue Leakage Engine**: Detects excessive discounts (>25%), failed payments, duplicate orders, and pricing anomalies.
* **Predictive ML Forecasting**: Scikit-Learn Random Forest timeseries forecasting with 95% confidence intervals and 30-day minimum dataset enforcement.
* **Customer Churn Risk Scoring**: RFM & engagement modeling with explainable risk driver breakdown.
* **Context-Aware AI Assistant**: Interactive revenue advisor querying live organization database metrics.
* **Reports & CSV Exports**: Instant CSV report generation for transactions, customers, products, and leakage logs.
* **High-Density B2B UI**: Modern dark theme inspired by Stripe, Vercel, and Linear with Recharts data visualizations.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS v4, React Router, Recharts, Lucide React, Axios.
* **Backend**: Node.js, Express.js, Prisma ORM, JWT, bcrypt, Zod validation.
* **Database**: SQLite (Zero-config dev setup) / PostgreSQL compatible via Prisma.
* **ML Microservice**: Python 3.12, FastAPI, Scikit-Learn, Pandas, NumPy, XGBoost, Statsmodels.

---

## 🚀 Quick Start Guide

### 1. Database Setup & Seed Data
```bash
cd backend
npm install
npx prisma db push
npm run seed
```
*(Populates 500 customers, 50 products, 5,000 transactions over 12 months, leakage alerts, and AI recommendations)*

### 2. Start Express Backend Service (Port 5000)
```bash
cd backend
npm run dev
```

### 3. Start Python ML Microservice (Port 8000)
```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 4. Start React Vite Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Default Demo Login Credentials

* **URL**: `http://localhost:5173/login`
* **Owner Email**: `demo@revenueai.com`
* **Password**: `Password123!`
* **Manager Email**: `manager@revenueai.com`
* **Password**: `Password123!`
* **Staff Email**: `staff@revenueai.com`
* **Password**: `Password123!`

---

## 📁 Repository Structure

```
revenueai/
├── frontend/             # React + Vite + Tailwind CSS UI
├── backend/              # Node.js + Express REST API & Prisma ORM
├── ml-service/           # Python FastAPI Scikit-Learn microservice
├── database/             # Prisma SQLite database schema & migrations
├── docs/                 # architecture.md, api.md, ml.md
└── README.md
```
