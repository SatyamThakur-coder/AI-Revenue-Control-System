import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard': return 'Dashboard Overview';
      case '/analytics': return 'Revenue & Profit Analytics';
      case '/customers': return 'Customer Management & Segmentation';
      case '/products': return 'Product & Service Intelligence';
      case '/transactions': return 'Transaction Ledger & Sales Log';
      case '/leakage': return 'Revenue Leakage Audit Center';
      case '/forecast': return 'Predictive Revenue Forecast';
      case '/churn': return 'Customer Churn Risk Model';
      case '/ai': return 'AI Revenue Assistant';
      case '/reports': return 'Financial Reports & CSV Exports';
      case '/settings': return 'Business Settings & Targets';
      default: return 'RevenueAI Control Center';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar setMobileOpen={setMobileOpen} title={getPageTitle(location.pathname)} />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
