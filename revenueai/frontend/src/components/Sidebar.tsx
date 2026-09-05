import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Package,
  Receipt,
  AlertTriangle,
  LineChart,
  UserX,
  Bot,
  FileSpreadsheet,
  Settings,
  LogOut,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Revenue Analytics', icon: TrendingUp, path: '/analytics' },
    { label: 'Customers', icon: Users, path: '/customers' },
    { label: 'Products', icon: Package, path: '/products' },
    { label: 'Transactions', icon: Receipt, path: '/transactions' },
    { label: 'Revenue Leakage', icon: AlertTriangle, path: '/leakage', badge: 'Alerts' },
    { label: 'Forecast', icon: LineChart, path: '/forecast' },
    { label: 'Customer Risk', icon: UserX, path: '/churn' },
    { label: 'AI Assistant', icon: Bot, path: '/ai', highlight: true },
    { label: 'Reports', icon: FileSpreadsheet, path: '/reports' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 w-64 text-slate-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight leading-none flex items-center gap-1.5">
              Revenue<span className="text-indigo-400">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-slate-500" />
              {user?.organization.name || 'Acme Corp'}
            </p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3 mx-4 mt-4 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">ROLE</span>
        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
          user?.role === 'OWNER' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
          user?.role === 'MANAGER' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          'bg-slate-800 text-slate-300'
        }`}>
          {user?.role || 'OWNER'}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : item.highlight
                    ? 'text-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4 w-4 ${item.highlight ? 'text-cyan-400 animate-pulse' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-indigo-400 border border-slate-700 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-64 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
