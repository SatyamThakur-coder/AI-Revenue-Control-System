import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { UserX, AlertTriangle, Mail, Phone, ExternalLink } from 'lucide-react';

export const CustomerRisk: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChurn = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/churn');
        if (res.data.success) {
          setPredictions(res.data.data.predictions);
        }
      } catch (err) {
        console.error('Failed to fetch churn predictions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChurn();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserX className="h-5 w-5 text-amber-400" />
            Customer Churn Risk & Retention Intelligence
          </h2>
          <p className="text-xs text-slate-400">ML-driven recency & engagement analysis predicting accounts likely to churn</p>
        </div>
      </div>

      {/* Churn Risk Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Customer Account</th>
                <th className="py-3.5 px-4">Total Revenue</th>
                <th className="py-3.5 px-4">Churn Probability</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Primary Churn Drivers</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {predictions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="text-slate-400 text-[11px]">{p.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">₹{p.totalRevenue.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            p.churnProbability > 0.7 ? 'bg-rose-500' :
                            p.churnProbability > 0.35 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.round(p.churnProbability * 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-white">{Math.round(p.churnProbability * 100)}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                      p.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      p.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {p.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {(p.keyFactors || []).map((factor: string, idx: number) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`mailto:${p.email}?subject=Exclusive%20Account%20Renewal%20Offer`}
                      className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Mail className="h-3.5 w-3.5" /> Re-engage Account
                    </a>
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
