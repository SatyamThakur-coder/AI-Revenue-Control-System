import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { Package, Plus, Search, Filter, Sparkles, X, DollarSign, RefreshCw } from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cloud Subscriptions',
    description: '',
    price: 1500,
    cost: 450,
    stock: 100,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products?search=${search}&category=${category}`);
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/products', formData);
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to create product:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Product & Service Intelligence</h2>
          <p className="text-xs text-slate-400">Profitability analysis, unit volume, refund rates, and automated product insights</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/25"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full sm:w-80 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search product name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full text-xs placeholder-slate-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Category:
          </span>
          {['ALL', 'Cloud Subscriptions', 'Enterprise Software', 'Consulting & Support', 'Hardware & Edge Nodes'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">MSRP / Cost</th>
                <th className="py-3.5 px-4">Net Revenue</th>
                <th className="py-3.5 px-4">Gross Profit</th>
                <th className="py-3.5 px-4">Margin %</th>
                <th className="py-3.5 px-4">Units Sold</th>
                <th className="py-3.5 px-4">Refund Rate</th>
                <th className="py-3.5 px-4">AI Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {products.map((p) => {
                const isTopRev = p.analytics?.totalRevenue > 30000;
                const isHighMargin = p.analytics?.profitMargin > 60;
                const isLowMargin = p.analytics?.profitMargin < 15;

                return (
                  <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">
                      {p.name}
                      <div className="text-[10px] text-slate-500 font-normal">{p.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-white font-semibold">₹{p.price.toLocaleString()}</span>
                      <span className="text-slate-500 block text-[10px]">Cost: ₹{p.cost.toLocaleString()}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">₹{p.analytics?.totalRevenue.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">₹{p.analytics?.totalProfit.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        p.analytics?.profitMargin >= 50 ? 'bg-emerald-500/20 text-emerald-400' :
                        p.analytics?.profitMargin >= 25 ? 'bg-indigo-500/20 text-indigo-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {p.analytics?.profitMargin}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">{p.analytics?.unitsSold}</td>
                    <td className="py-3.5 px-4 text-slate-400">{p.analytics?.refundRate}%</td>
                    <td className="py-3.5 px-4">
                      {isTopRev && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                          <Sparkles className="h-3 w-3 text-indigo-400" /> Best Revenue
                        </span>
                      )}
                      {isHighMargin && !isTopRev && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold w-fit">
                          High Margin
                        </span>
                      )}
                      {isLowMargin && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-extrabold w-fit">
                          Review Margin
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Product / Service</h3>
              <button onClick={() => setModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold">Product Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white">
                  <option value="Cloud Subscriptions">Cloud Subscriptions</option>
                  <option value="Enterprise Software">Enterprise Software</option>
                  <option value="Consulting & Support">Consulting & Support</option>
                  <option value="Hardware & Edge Nodes">Hardware & Edge Nodes</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold">Selling Price (₹)</label>
                  <input required type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold">Product Cost (₹)</label>
                  <input required type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })} className="mt-1 w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold">
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
