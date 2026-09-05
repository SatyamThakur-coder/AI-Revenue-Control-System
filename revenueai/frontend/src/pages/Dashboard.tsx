import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  UserX,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [kpi, setKpi] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [leaks, setLeaks] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [kpiRes, chartRes, leakRes, recRes] = await Promise.all([
          apiClient.get('/analytics/overview'),
          apiClient.get('/analytics/revenue?range=30d'),
          apiClient.get('/leakage?status=OPEN'),
          apiClient.get('/ai/recommendations'),
        ]);

        if (kpiRes.data.success) setKpi(kpiRes.data.data);
        if (chartRes.data.success) setChartData(chartRes.data.data);
        if (leakRes.data.success) setLeaks(leakRes.data.data.leaks.slice(0, 5));
        if (recRes.data.success) setRecommendations(recRes.data.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleResolveLeak = async (id: string) => {
    try {
      await apiClient.put(`/leakage/${id}/resolve`);
      setLeaks(leaks.filter((l) => l.id !== id));
      setKpi((prev: any) => ({
        ...prev,
        potentialLeakage: Math.max(0, prev.potentialLeakage - 10000),
      }));
    } catch (err) {
      console.error('Failed to resolve leak:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-900/80 rounded-2xl border border-slate-800" />
          ))}
        </div>
        <div className="h-80 bg-slate-900/80 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Target Progress Banner */}
      <div className="glass-card p-5 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-500/20">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center space-x-4 z-10">
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Target Progress</h2>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                {kpi?.targetProgressPercent || 85.6}% Achieved
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Current Revenue: <span className="text-white font-semibold">₹{(kpi?.netRevenue / 100000).toFixed(2)}L</span> / Target: <span className="text-slate-300 font-semibold">₹{(kpi?.monthlyTarget / 100000).toFixed(2)}L</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full md:w-64 z-10 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
            <span>Progress</span>
            <span>{kpi?.targetProgressPercent || 85.6}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, kpi?.targetProgressPercent || 85.6)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Net Revenue */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Net Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              ₹{(kpi?.netRevenue / 100000).toFixed(2)}L
            </h3>
            <div className="mt-2 flex items-center text-xs font-semibold text-emerald-400">
              <ArrowUpRight className="h-4 w-4 mr-0.5" />
              <span>+{kpi?.revenueGrowth}% MoM</span>
              <span className="text-slate-500 font-normal ml-1.5">vs prior month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Gross Profit */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Profit</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              ₹{(kpi?.grossProfit / 100000).toFixed(2)}L
            </h3>
            <div className="mt-2 flex items-center text-xs font-semibold text-emerald-400">
              <ArrowUpRight className="h-4 w-4 mr-0.5" />
              <span>+9.8% margin efficiency</span>
            </div>
          </div>
        </div>

        {/* Card 3: Potential Leakage */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden border-rose-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Potential Leakage</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-rose-400 tracking-tight">
              ₹{kpi?.potentialLeakage ? (kpi.potentialLeakage / 1000).toFixed(0) : '42'}K
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                {kpi?.leakageSeverity || 'HIGH'} SEVERITY
              </span>
              <button
                onClick={() => navigate('/leakage')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center"
              >
                Audit <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Churn Risk */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Churn Risk</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-amber-400 tracking-tight">
              {kpi?.churnRiskPercent}%
            </h3>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>{kpi?.atRiskCustomers} Accounts At Risk</span>
              <button
                onClick={() => navigate('/churn')}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center"
              >
                View Risk <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart & AI Insights Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 30-Day Revenue Area Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Revenue & Profit Trajectory</h3>
              <p className="text-xs text-slate-400 mt-0.5">30-day verified daily financial collection</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center"
            >
              Full Analytics <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="revenue" name="Net Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Gross Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Actionable Recommendations Column */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white">AI Revenue Recommendations</h3>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300">{rec.title}</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{rec.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/ai')}
            className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open AI Revenue Assistant</span>
          </button>
        </div>
      </div>

      {/* Recent Leakage Alerts Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              Open Revenue Leakage Alerts
            </h3>
            <p className="text-xs text-slate-400">Automated pricing, discount, and payment failure anomalies</p>
          </div>
          <button
            onClick={() => navigate('/leakage')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View All ({leaks.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Potential Leak</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {leaks.map((leak) => (
                <tr key={leak.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{leak.type}</td>
                  <td className="py-3.5 px-4 text-rose-400 font-extrabold">₹{leak.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      leak.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      leak.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {leak.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{leak.description}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleResolveLeak(leak.id)}
                      className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] transition-colors"
                    >
                      Resolve Alert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
