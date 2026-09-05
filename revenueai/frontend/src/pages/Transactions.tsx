import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { Receipt, Plus, Search, Filter, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State & References
  const [modalOpen, setModalOpen] = useState(false);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    discountIsPercentage: true,
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/transactions?page=${page}&limit=15&search=${search}&paymentStatus=${paymentStatus}`);
      if (res.data.success) {
        setTransactions(res.data.data.transactions);
        setTotalPages(res.data.data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, search, paymentStatus]);

  const handleOpenModal = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        apiClient.get('/customers?limit=100'),
        apiClient.get('/products'),
      ]);
      if (cRes.data.success) setCustomersList(cRes.data.data.customers);
      if (pRes.data.success) {
        setProductsList(pRes.data.data);
        if (pRes.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            productId: pRes.data.data[0].id,
            unitPrice: pRes.data.data[0].price,
          }));
        }
      }
      if (cRes.data.data.customers.length > 0) {
        setFormData((prev) => ({ ...prev, customerId: cRes.data.data.customers[0].id }));
      }
      setModalOpen(true);
    } catch (err) {
      console.error('Failed to load references for transaction modal:', err);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/transactions', formData);
      setModalOpen(false);
      fetchTransactions();
    } catch (err) {
      console.error('Failed to record transaction:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Transaction Ledger</h2>
          <p className="text-xs text-slate-400">Verifiable sales ledger with automated discount and leakage scanning</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/25"
        >
          <Plus className="h-4 w-4" />
          <span>Record New Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-80 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search customer, product, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full text-xs placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Status:
          </span>
          {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => { setPaymentStatus(st); setPage(1); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                paymentStatus === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Transaction ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Gross Amount</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Net Revenue</th>
                <th className="py-3.5 px-4">Profit</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">#{tx.id.slice(0, 8)}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{tx.customer?.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{tx.product?.name} (x{tx.quantity})</td>
                  <td className="py-3.5 px-4 text-slate-400">₹{tx.grossAmount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-amber-400">
                    {tx.discount > 0 ? `-₹${tx.discount.toLocaleString()}` : '₹0'}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-white">₹{tx.netRevenue.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">₹{tx.grossProfit.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      tx.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      tx.paymentStatus === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      tx.paymentStatus === 'FAILED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {tx.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(tx.transactionDate).toLocaleDateString()}
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
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-50">Previous</button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Record Transaction Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Record Transaction</h3>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold">Select Customer</label>
                <select value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white">
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold">Select Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => {
                    const prod = productsList.find((p) => p.id === e.target.value);
                    setFormData({ ...formData, productId: e.target.value, unitPrice: prod ? prod.price : 0 });
                  }}
                  className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold">Quantity</label>
                  <input type="number" min={1} value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold">Discount %</label>
                  <input type="number" min={0} max={100} value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold">Payment Status</label>
                  <select value={formData.paymentStatus} onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white">
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold">Payment Method</label>
                  <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white">
                    <option value="CARD">CARD</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    <option value="CASH">CASH</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold">
                Submit Transaction & Run Leak Scanner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
