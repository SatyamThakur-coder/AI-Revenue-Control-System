import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Filter,
  DollarSign,
  Percent,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const RevenueAnalytics: React.FC = () => {
  const [range, setRange] = useState('30d');
  const [timeSeries, setTimeSeries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [tsRes, catRes, payRes] = await Promise.all([
          apiClient.get(`/analytics/revenue?range=${range}`),
          apiClient.get('/analytics/category'),
          apiClient.get('/analytics/payment-methods'),
        ]);

        if (tsRes.data.success) setTimeSeries(tsRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (payRes.data.success) setPayments(payRes.data.data);
      } catch (err) {
        console.error('Failed to fetch revenue analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  const totalRev = timeSeries.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = timeSeries.reduce((sum, item) => sum + item.profit, 0);
  const avgProfitMargin = totalRev > 0 ? (totalProfit / totalRev) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Revenue & Profit Intelligence</h2>
          <p className="text-xs text-slate-400">Deep-dive financial breakdown across categories and payment channels</p>
        </div>

        {/* Date Range Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {['7d', '30d', '90d', '6m', '12m'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === r
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Metrics Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Net Revenue ({range})</span>
          <h3 className="text-2xl font-extrabold text-white mt-1">₹{totalRev.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Total Gross Profit ({range})</span>
          <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">₹{totalProfit.toLocaleString()}</h3>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Average Profit Margin</span>
          <h3 className="text-2xl font-extrabold text-indigo-400 mt-1">{avgProfitMargin.toFixed(1)}%</h3>
        </div>
      </div>

      {/* Main Revenue vs Profit Area Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4">Revenue & Profit Over Time</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" name="Net Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="profit" name="Gross Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance & Payment Methods Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4">Revenue by Product Category</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-4">Payment Method Distribution</h3>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="amount"
                  nameKey="method"
                >
                  {payments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Collected']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
