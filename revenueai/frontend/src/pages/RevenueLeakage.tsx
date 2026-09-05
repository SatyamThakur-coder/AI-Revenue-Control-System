import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { AlertTriangle, RefreshCw, CheckCircle2, ShieldAlert, Info, DollarSign } from 'lucide-react';

export const RevenueLeakage: React.FC = () => {
  const [leaks, setLeaks] = useState<any[]>([]);
  const [totalLeakage, setTotalLeakage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('ALL');
  const [status, setStatus] = useState('OPEN');
  const [scanning, setScanning] = useState(false);

  const fetchLeaks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/leakage?status=${status}&severity=${severity}`);
      if (res.data.success) {
        setLeaks(res.data.data.leaks);
        setTotalLeakage(res.data.data.totalPotentialLeakage);
      }
    } catch (err) {
      console.error('Failed to fetch revenue leaks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaks();
  }, [severity, status]);

  const handleScan = async () => {
    try {
      setScanning(true);
      await apiClient.post('/leakage/scan');
      fetchLeaks();
    } catch (err) {
      console.error('Failed to run leakage scan:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await apiClient.put(`/leakage/${id}/resolve`);
      fetchLeaks();
    } catch (err) {
      console.error('Failed to resolve leak:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-400" />
            Revenue Leakage & Anomaly Control
          </h2>
          <p className="text-xs text-slate-400">Identify uncollected revenue, excessive discounts, duplicate billing, and pricing anomalies</p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Scanning Transactions...' : 'Run Automated Leakage Scan'}</span>
        </button>
      </div>

      {/* Explanatory Rule Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
        <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Important Audit Context:</p>
          <p className="text-amber-300/80 leading-relaxed mt-0.5">
            Flagged items represent <span className="font-bold text-amber-200">Potential Revenue Leaks & Pricing Anomalies</span> requiring review. They do not constitute confirmed financial losses until verified by your billing manager.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-rose-500/30">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Potential Leakage</span>
          <h3 className="text-3xl font-extrabold text-rose-400 mt-2">₹{totalLeakage.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Across {leaks.length} flagged active alerts</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Excessive Discounts Alert</span>
          <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
            {leaks.filter((l) => l.type === 'EXCESSIVE_DISCOUNT').length} Alerts
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Discounts exceeding 25% cap</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Uncollected Payments</span>
          <h3 className="text-3xl font-extrabold text-white mt-2">
            {leaks.filter((l) => l.type === 'FAILED_PAYMENT' || l.type === 'MISSING_PAYMENT').length} Alerts
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Failed cards & pending balances</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Status:</span>
          {['OPEN', 'RESOLVED', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                status === st ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                severity === sev ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Leaks Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Anomaly Type</th>
                <th className="py-3.5 px-4">Potential Leak</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Detection Explanation</th>
                <th className="py-3.5 px-4">Detected Date</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {leaks.map((leak) => (
                <tr key={leak.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{leak.type}</td>
                  <td className="py-3.5 px-4 text-rose-400 font-extrabold">₹{leak.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                      leak.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      leak.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {leak.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 max-w-sm">{leak.description}</td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">{new Date(leak.detectedDate).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    {leak.status === 'OPEN' ? (
                      <button
                        onClick={() => handleResolve(leak.id)}
                        className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold"
                      >
                        Resolve Alert
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold flex items-center justify-end gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Resolved
                      </span>
                    )}
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
