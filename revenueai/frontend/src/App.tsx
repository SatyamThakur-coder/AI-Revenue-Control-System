import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { RevenueAnalytics } from './pages/RevenueAnalytics';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Transactions } from './pages/Transactions';
import { RevenueLeakage } from './pages/RevenueLeakage';
import { Forecast } from './pages/Forecast';
import { CustomerRisk } from './pages/CustomerRisk';
import { AIAssistant } from './pages/AIAssistant';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected SaaS App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/analytics" element={<Layout><RevenueAnalytics /></Layout>} />
            <Route path="/customers" element={<Layout><Customers /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />
            <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
            <Route path="/leakage" element={<Layout><RevenueLeakage /></Layout>} />
            <Route path="/forecast" element={<Layout><Forecast /></Layout>} />
            <Route path="/churn" element={<Layout><CustomerRisk /></Layout>} />
            <Route path="/ai" element={<Layout><AIAssistant /></Layout>} />
            <Route path="/reports" element={<Layout><Reports /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
