import React, { useState } from 'react';
import { Menu, Bell, Sparkles, Target, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
  title: string;
}

export const Navbar: React.FC<NavbarProps> = ({ setMobileOpen, title }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = [
    { id: '1', title: 'Potential Leakage Alert', msg: '₹1,85,000 potential revenue leakage detected on enterprise orders.', time: '10m ago', urgent: true },
    { id: '2', title: 'At Risk Customer Alert', msg: '40 high-value customer accounts moved to AT_RISK status.', time: '1h ago', urgent: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-900"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quick Search Pill */}
        <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 w-64 text-xs text-slate-400 focus-within:border-indigo-500/50">
          <Search className="h-3.5 w-3.5 mr-2 text-slate-500" />
          <input
            type="text"
            placeholder="Search revenue, customers..."
            className="bg-transparent border-none outline-none text-slate-200 w-full placeholder-slate-500 text-xs"
          />
        </div>

        {/* AI Assistant Pill */}
        <button
          onClick={() => navigate('/ai')}
          className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 hover:from-indigo-600/30 hover:to-cyan-500/30 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span>Ask AI Assistant</span>
        </button>

        {/* Target Milestone Indicator */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <Target className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-400">Target:</span>
          <span className="text-emerald-400 font-bold">₹{((user?.organization.monthlyTarget || 2500000) / 100000).toFixed(1)}L</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h3>
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded font-semibold">2 New</span>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <p className="text-xs font-semibold text-white flex items-center justify-between">
                      {n.title}
                      <span className="text-[10px] text-slate-500 font-normal">{n.time}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">{n.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
