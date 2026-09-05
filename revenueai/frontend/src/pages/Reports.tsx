import React, { useState } from 'react';
import { apiClient } from '../api/apiClient';
import { FileSpreadsheet, Download, FileText, CheckCircle2 } from 'lucide-react';

export const Reports: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const reportTypes = [
    { type: 'revenue', title: 'Revenue & Transaction Ledger Report', desc: 'Complete breakdown of all sales transactions, gross amount, discounts, net revenue, and gross profit.' },
    { type: 'customers', title: 'Customer Directory & ARR Report', desc: 'Customer account profiles, location, total spend, status, and recency.' },
    { type: 'products', title: 'Product & Profitability Report', desc: 'Product selling price, cost, total units sold, profit margins, and refund rate metrics.' },
    { type: 'leakage', title: 'Revenue Leakage & Audit Report', desc: 'List of all detected pricing anomalies, uncollected payments, and excessive discount alerts.' },
  ];

  const handleExport = async (type: string) => {
    try {
      setDownloading(type);
      const res = await apiClient.get(`/reports/export?type=${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revenueai_${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Report export failed:', err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
          Financial Reports & Export Engine
        </h2>
        <p className="text-xs text-slate-400">Generate and export verified financial reports in CSV format</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((rep) => (
          <div key={rep.type} className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">{rep.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{rep.desc}</p>
            </div>

            <button
              onClick={() => handleExport(rep.type)}
              disabled={downloading === rep.type}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{downloading === rep.type ? 'Generating CSV...' : 'Download CSV Report'}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
