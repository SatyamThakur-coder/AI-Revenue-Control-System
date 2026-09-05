import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { LineChart as LineChartIcon, AlertTriangle, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const Forecast: React.FC = () => {
  const [forecastData, setForecastData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/forecast');
        if (res.data.success) {
          setForecastData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch revenue forecast:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800" />
      </div>
    );
  }

  // Insufficient Data State Banner (Prompt Rule)
  if (!forecastData?.sufficientData) {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-8 rounded-2xl border border-amber-500/30 text-center space-y-4 max-w-2xl mx-auto mt-12">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Not Enough Historical Data</h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            {forecastData?.message || 'Revenue forecasting requires at least 30 days of historical transaction history to train predictive ML models.'}
          </p>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono inline-block">
            Current History: <span className="text-amber-400 font-bold">{forecastData?.daysAvailable || 0} Days</span> / Required: <span className="text-white font-bold">30 Days</span>
          </div>
        </div>
      </div>
    );
  }

  // Combine historical and predicted arrays for Recharts
  const combinedChartData = [
    ...(forecastData.historicalData || []).map((h: any) => ({
      date: h.date,
      historical: h.revenue,
    })),
    ...(forecastData.predictions || []).map((p: any) => ({
      date: p.date,
      predicted: p.predictedRevenue,
      lowerBound: p.lowerBound,
      upperBound: p.upperBound,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            Predictive Revenue Forecast (30 Days Forward)
          </h2>
          <p className="text-xs text-slate-400">Scikit-Learn Random Forest time-series forecasting with 95% confidence corridor</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-slate-400">Model:</span>
          <span className="text-white font-bold">{forecastData.modelVersion || 'v1.0'}</span>
        </div>
      </div>

      {/* Model Evaluation Metric Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Mean Absolute Error (MAE)</span>
          <h4 className="text-lg font-bold text-white mt-1">₹{forecastData.evaluation?.mae?.toLocaleString()}</h4>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Root Mean Sq Error (RMSE)</span>
          <h4 className="text-lg font-bold text-white mt-1">₹{forecastData.evaluation?.rmse?.toLocaleString()}</h4>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Mean Abs % Error (MAPE)</span>
          <h4 className="text-lg font-bold text-emerald-400 mt-1">{forecastData.evaluation?.mape}%</h4>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400">Confidence Level</span>
          <h4 className="text-lg font-bold text-indigo-400 mt-1">95.0% Confidence</h4>
        </div>
      </div>

      {/* Predictive Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white mb-4">Historical Revenue vs 30-Day ML Prediction</h3>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedChartData}>
              <defs>
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="historical" name="Historical Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#histGrad)" />
              <Area type="monotone" dataKey="predicted" name="Predicted Revenue" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#predGrad)" />
              <Area type="monotone" dataKey="upperBound" name="Upper Confidence Bound (95%)" stroke="#334155" strokeWidth={1} fill="none" />
              <Area type="monotone" dataKey="lowerBound" name="Lower Confidence Bound (95%)" stroke="#334155" strokeWidth={1} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
