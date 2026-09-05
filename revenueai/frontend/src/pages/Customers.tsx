import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import {
  Users,
  Search,
  Plus,
  Filter,
  ChevronRight,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Customer Profile Drawer State
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add Customer Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    status: 'NEW',
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/customers?page=${page}&limit=15&search=${search}&status=${status}`);
      if (res.data.success) {
        setCustomers(res.data.data.customers);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, status]);

  const handleOpenDrawer = async (id: string) => {
    try {
      const res = await apiClient.get(`/customers/${id}`);
      if (res.data.success) {
        setSelectedCustomer(res.data.data);
        setDrawerOpen(true);
      }
    } catch (err) {
      console.error('Failed to load customer profile:', err);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/customers', formData);
      setModalOpen(false);
      setFormData({ name: '', email: '', phone: '', location: '', status: 'NEW' });
      fetchCustomers();
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Customer Directory</h2>
          <p className="text-xs text-slate-400">Manage account profiles, revenue totals, and churn risk indicators</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/25"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-80 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search name, email, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full text-xs placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Status:
          </span>
          {['ALL', 'ACTIVE', 'VIP', 'AT_RISK', 'CHURNED', 'NEW'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatus(st); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                status === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Total Revenue</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Last Purchase</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{c.name}</div>
                    <div className="text-slate-400 text-[11px]">{c.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                      c.status === 'VIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      c.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      c.status === 'AT_RISK' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' :
                      c.status === 'CHURNED' ? 'bg-slate-800 text-slate-400' :
                      'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    ₹{c.totalRevenue.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{c.location || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString() : 'No purchase'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenDrawer(c.id)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-lg text-xs font-semibold"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Page {page} of {totalPages}</span>
          <div className="flex space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Customer Profile Side Drawer */}
      {drawerOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">{selectedCustomer.name}</h3>
              <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-indigo-400" /><span>{selectedCustomer.email}</span></div>
              <div className="flex items-center space-x-2"><Phone className="h-4 w-4 text-indigo-400" /><span>{selectedCustomer.phone || 'N/A'}</span></div>
              <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-indigo-400" /><span>{selectedCustomer.location || 'N/A'}</span></div>
              <div className="flex items-center space-x-2"><DollarSign className="h-4 w-4 text-emerald-400" /><span className="font-bold text-emerald-400 text-sm">Total Spend: ₹{selectedCustomer.totalRevenue.toLocaleString()}</span></div>
            </div>

            {/* Churn Prediction Box */}
            {selectedCustomer.churnPredictions && selectedCustomer.churnPredictions.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> AI Churn Risk Score
                  </span>
                  <span className="text-xs font-extrabold text-white">
                    {Math.round(selectedCustomer.churnPredictions[0].churnProbability * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Risk Level: <span className="font-bold text-amber-400">{selectedCustomer.churnPredictions[0].riskLevel}</span>
                </p>
              </div>
            )}

            {/* Purchase History */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Purchase History</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedCustomer.transactions.map((tx: any) => (
                  <div key={tx.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{tx.product.name}</p>
                      <p className="text-[10px] text-slate-500">{new Date(tx.transactionDate).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold text-emerald-400">₹{tx.netRevenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Customer Profile</h3>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold">Customer Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold">Email</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold">Phone</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold">Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold">
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
