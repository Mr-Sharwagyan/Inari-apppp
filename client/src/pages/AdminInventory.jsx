import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import {
  Package, Search, RefreshCw, Plus, Trash2, Edit3, X, Check,
  AlertTriangle, TrendingDown, TrendingUp, BarChart3, Filter,
  ChevronUp, ChevronDown, Warehouse, Activity, Clock, CheckCircle
} from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { TableSkeleton, KpiSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const COLORS = ['#47896d','#aa8c5e','#60a5fa','#f59e0b','#a78bfa','#34d399','#f87171','#fb923c'];

// ─── ADJUST STOCK MODAL ───────────────────────────────────────────────────────
const AdjustModal = ({ item, onClose, onSave }) => {
  const [delta, setDelta] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState('add'); // 'add' | 'remove' | 'set'
  const [saving, setSaving] = useState(false);

  const REASONS = [
    'Restock from supplier',
    'Damaged/spoiled goods removed',
    'Manual correction after audit',
    'Returned from buyer',
    'Reserved for pending orders',
  ];

  const handleSave = async () => {
    const val = Number(delta);
    if (!delta || isNaN(val) || val < 0) return;
    setSaving(true);
    await onSave(item._id, { type, delta: val, reason: reason.trim() });
    setSaving(false);
    onClose();
  };

  const preview = () => {
    const val = Number(delta) || 0;
    if (type === 'set') return val;
    if (type === 'add') return (item.stock || 0) + val;
    return Math.max(0, (item.stock || 0) - val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
              <Package className="w-4 h-4 text-primary-800" />
            </div>
            <h3 className="font-extrabold text-sm text-primary-950">Adjust Inventory</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-sage-400 hover:text-primary-900 hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product info */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-4 flex items-center gap-3">
          {item.images?.[0] ? (
            <img src={item.images[0]} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-stone-200" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-stone-200 flex items-center justify-center text-lg">🌿</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-primary-950 truncate">{item.name}</p>
            <p className="text-[10px] text-sage-400">{item.farmerName} · {item.category}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-extrabold text-primary-950">{item.stock}</div>
            <div className="text-[10px] text-sage-400">{item.unit} current</div>
          </div>
        </div>

        {/* Adjustment type */}
        <div className="flex gap-2 mb-4">
          {[
            { value: 'add',    label: '+ Add',  color: 'emerald' },
            { value: 'remove', label: '– Remove', color: 'red'  },
            { value: 'set',    label: '= Set',  color: 'blue'   },
          ].map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                type === value
                  ? `bg-${color}-600 text-white border-${color}-600 shadow-sm`
                  : `bg-${color}-50 text-${color}-700 border-${color}-200 hover:bg-${color}-100`
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Delta input */}
        <div className="mb-4 space-y-1">
          <label className="text-xs font-semibold text-sage-700">
            {type === 'set' ? 'New Stock Value' : 'Quantity'} ({item.unit})
          </label>
          <input
            type="number" min="0" value={delta} onChange={e => setDelta(e.target.value)}
            placeholder="Enter amount..."
            className="w-full border border-stone-200 p-2.5 rounded-xl text-xs outline-none focus:border-primary-500 font-bold"
          />
          {delta && !isNaN(Number(delta)) && (
            <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
              preview() < 10 ? 'text-red-600' : 'text-emerald-700'
            }`}>
              <Activity className="w-3 h-3" />
              New stock will be: <span className="text-sm ml-1">{preview()} {item.unit}</span>
            </div>
          )}
        </div>

        {/* Reason templates */}
        <p className="text-[11px] font-semibold text-sage-600 mb-2">Reason (optional):</p>
        <div className="space-y-1.5 mb-4">
          {REASONS.map((r, i) => (
            <button key={i} onClick={() => setReason(r)}
              className={`w-full text-left text-[11px] px-3 py-2 rounded-xl border transition-all leading-relaxed ${
                reason === r
                  ? 'bg-primary-50 border-primary-300 text-primary-900 font-semibold'
                  : 'text-sage-700 bg-stone-50 hover:bg-stone-100 border-stone-200'
              }`}>
              {r}
            </button>
          ))}
        </div>
        <textarea value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Or type a custom reason..." rows={2}
          className="w-full border border-stone-200 p-3 rounded-xl text-xs outline-none focus:border-primary-500 resize-none mb-4 leading-relaxed" />

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-stone-200 text-sage-600 font-bold py-2.5 rounded-xl text-xs hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!delta || isNaN(Number(delta)) || Number(delta) < 0 || saving}
            className="flex-1 bg-primary-900 hover:bg-primary-950 text-white font-bold py-2.5 rounded-xl text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors">
            <Check className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Apply Adjustment'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN ADMIN INVENTORY ─────────────────────────────────────────────────────
const AdminInventory = () => {
  const showToast = useToast();

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out' | 'ok'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortKey, setSortKey]       = useState('stock');
  const [sortDir, setSortDir]       = useState('asc');
  const [adjustModal, setAdjustModal] = useState(null);
  const [logs, setLogs]             = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeTab, setActiveTab]   = useState('inventory'); // 'inventory' | 'logs'

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data);
    } catch {
      showToast('Failed to load inventory.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await api.get('/admin/inventory/logs');
      setLogs(res.data);
    } catch {
      // logs endpoint may not exist yet — silently fail
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { if (activeTab === 'logs') loadLogs(); }, [activeTab]);

  // ── Adjust stock ──
  const handleAdjust = async (productId, { type, delta, reason }) => {
    try {
      await api.put(`/admin/inventory/${productId}/adjust`, { type, delta, reason });
      showToast('Stock updated successfully!', 'success');
      loadProducts();
      if (activeTab === 'logs') loadLogs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update stock.', 'error');
    }
  };

  // ── Derived / filtered data ──
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products
    .filter(p => {
      const matchSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.farmerName?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchStock =
        stockFilter === 'all' ? true :
        stockFilter === 'out' ? p.stock <= 0 :
        stockFilter === 'low' ? p.stock > 0 && p.stock <= 15 :
        p.stock > 15;
      return matchSearch && matchCat && matchStock;
    })
    .sort((a, b) => {
      const av = sortKey === 'name' ? a.name : sortKey === 'price' ? a.price : a.stock;
      const bv = sortKey === 'name' ? b.name : sortKey === 'price' ? b.price : b.stock;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });

  const totalStock  = products.reduce((s, p) => s + (p.stock || 0), 0);
  const outOfStock  = products.filter(p => p.stock <= 0).length;
  const lowStock    = products.filter(p => p.stock > 0 && p.stock <= 15).length;
  const healthyStock = products.filter(p => p.stock > 15).length;

  // Chart: top 8 products by stock
  const chartData = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 8)
    .map(p => ({ name: p.name?.length > 10 ? p.name.slice(0, 10) + '…' : p.name, stock: p.stock }));

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => (
    <span className="inline-flex flex-col ml-1 opacity-50">
      <ChevronUp  className={`w-2.5 h-2.5 -mb-0.5 ${sortKey === col && sortDir === 'asc'  ? 'opacity-100 text-primary-900' : ''}`} />
      <ChevronDown className={`w-2.5 h-2.5 ${sortKey === col && sortDir === 'desc' ? 'opacity-100 text-primary-900' : ''}`} />
    </span>
  );

  return (
    <div className="space-y-8">

      {/* Adjust Modal */}
      {adjustModal && (
        <AdjustModal
          item={adjustModal}
          onClose={() => setAdjustModal(null)}
          onSave={handleAdjust}
        />
      )}

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight">Inventory Management</h2>
        <p className="text-xs text-sage-455 mt-0.5">Monitor stock levels across all farmers, adjust quantities, and review inventory logs.</p>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Total Stock Units</span>
              <div className="text-2xl font-extrabold text-primary-950">{totalStock.toLocaleString()}</div>
              <span className="text-[10px] text-sage-450 font-bold">{products.length} products</span>
            </div>
            <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100"><Warehouse className="w-5 h-5" /></div>
          </div>

          <div className="bg-white border border-emerald-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Healthy Stock</span>
              <div className="text-2xl font-extrabold text-emerald-800">{healthyStock}</div>
              <span className="text-[10px] text-emerald-600 font-bold">products ({'>'} 15 units)</span>
            </div>
            <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl border border-emerald-100"><TrendingUp className="w-5 h-5" /></div>
          </div>

          <div className={`bg-white p-5 rounded-2xl shadow-soft flex items-center justify-between border ${lowStock > 0 ? 'border-amber-200/60' : 'border-stone-200/60'}`}>
            <div className="space-y-1">
              <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Low Stock</span>
              <div className="text-2xl font-extrabold text-amber-800">{lowStock}</div>
              <span className={`text-[10px] font-bold ${lowStock > 0 ? 'text-amber-600 animate-pulse' : 'text-sage-450'}`}>
                {lowStock > 0 ? '⚠️ Needs restocking' : '✅ None critical'}
              </span>
            </div>
            <div className={`p-3.5 rounded-xl border ${lowStock > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-primary-50 text-primary-900 border-primary-100'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className={`bg-white p-5 rounded-2xl shadow-soft flex items-center justify-between border ${outOfStock > 0 ? 'border-red-200/60' : 'border-stone-200/60'}`}>
            <div className="space-y-1">
              <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Out of Stock</span>
              <div className="text-2xl font-extrabold text-red-800">{outOfStock}</div>
              <span className={`text-[10px] font-bold ${outOfStock > 0 ? 'text-red-600 animate-pulse' : 'text-emerald-600'}`}>
                {outOfStock > 0 ? '🚨 Action required' : '✅ All stocked'}
              </span>
            </div>
            <div className={`p-3.5 rounded-xl border ${outOfStock > 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-primary-50 text-primary-900 border-primary-100'}`}>
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Stock Bar Chart */}
      {!loading && chartData.length > 0 && (
        <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider">Top Products by Stock</h3>
            <span className="text-[10px] font-semibold text-sage-400">Top 8 by volume</span>
          </div>
          <div className="h-40 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0CE" opacity={0.4} />
                <XAxis dataKey="name" stroke="#899f86" tick={{ fontSize: 10 }} />
                <YAxis stroke="#899f86" />
                <Tooltip contentStyle={{ backgroundColor:'#fff', border:'1px solid #E5DFD3', borderRadius:12, fontSize: 11 }} />
                <Bar dataKey="stock" radius={[6,6,0,0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {[
          { id: 'inventory', label: `Inventory (${products.length})`, icon: Package   },
          { id: 'logs',      label: 'Adjustment Logs',                icon: Activity  },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white text-primary-950 shadow-soft' : 'text-sage-500 hover:text-primary-900'}`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ INVENTORY TAB ════════════════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3 bg-white border border-stone-200/60 p-4 rounded-2xl shadow-soft flex-wrap">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-sage-400" />
              <input
                type="text" placeholder="Search product, farmer..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 font-medium"
              />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="border border-stone-200 bg-white px-3 py-2 rounded-xl text-xs font-bold text-primary-950 outline-none capitalize">
              {categories.map(c => <option key={c} value={c} className="capitalize">{c === 'all' ? 'All Categories' : c}</option>)}
            </select>
            <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
              className="border border-stone-200 bg-white px-3 py-2 rounded-xl text-xs font-bold text-primary-950 outline-none">
              <option value="all">All Stock Levels</option>
              <option value="ok">Healthy ({'>'} 15)</option>
              <option value="low">Low Stock (1–15)</option>
              <option value="out">Out of Stock</option>
            </select>
            <button onClick={loadProducts} disabled={loading}
              className="p-2 rounded-xl border border-stone-200 text-sage-400 hover:text-primary-900 hover:bg-stone-50 transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs text-sage-400 font-semibold self-center ml-auto whitespace-nowrap">{filtered.length} items</span>
          </div>

          {loading ? <TableSkeleton rows={6} cols={7} /> : filtered.length === 0 ? (
            <div className="bg-white border border-stone-200/60 p-12 rounded-3xl text-center">
              <Package className="w-8 h-8 text-sage-300 mx-auto mb-3" />
              <p className="text-sm text-sage-500 font-semibold">No products match your filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50/70 border-b border-stone-200/50 text-sage-500 font-extrabold uppercase tracking-wider">
                      <th className="p-4 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                        Product <SortIcon col="name" />
                      </th>
                      <th className="p-4">Farmer</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 cursor-pointer select-none" onClick={() => toggleSort('price')}>
                        Price <SortIcon col="price" />
                      </th>
                      <th className="p-4 cursor-pointer select-none" onClick={() => toggleSort('stock')}>
                        Stock <SortIcon col="stock" />
                      </th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filtered.map(p => {
                      const stockStatus =
                        p.stock <= 0 ? 'out' :
                        p.stock <= 15 ? 'low' : 'ok';
                      return (
                        <tr key={p._id} className="hover:bg-stone-50/50 transition-colors">
                          {/* Product */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-stone-200 shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-base shrink-0">🌿</div>
                              )}
                              <div>
                                <div className="font-bold text-primary-950">{p.name}</div>
                                <div className="text-[10px] text-sage-400 truncate max-w-[140px]">{p.description}</div>
                              </div>
                            </div>
                          </td>
                          {/* Farmer */}
                          <td className="p-4 font-semibold text-sage-700">{p.farmerName || '—'}</td>
                          {/* Category */}
                          <td className="p-4">
                            <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-sage-700 rounded-full font-bold capitalize">{p.category || '—'}</span>
                          </td>
                          {/* Price */}
                          <td className="p-4 font-bold text-primary-950">
                            Rs.{p.price}<span className="text-sage-400 font-normal">/{p.unit}</span>
                          </td>
                          {/* Stock */}
                          <td className="p-4">
                            <div className={`font-extrabold text-sm ${
                              stockStatus === 'out' ? 'text-red-600' :
                              stockStatus === 'low' ? 'text-amber-600' : 'text-emerald-700'
                            }`}>
                              {p.stock} <span className="text-[10px] font-normal text-sage-400">{p.unit}</span>
                            </div>
                            {stockStatus === 'low' && <div className="text-[9px] text-amber-500 font-bold animate-pulse">Low Stock</div>}
                            {stockStatus === 'out' && <div className="text-[9px] text-red-500 font-bold animate-pulse">Out of Stock</div>}
                            {/* Mini stock bar */}
                            <div className="w-16 h-1 bg-stone-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${stockStatus === 'out' ? 'bg-red-400' : stockStatus === 'low' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }}
                              />
                            </div>
                          </td>
                          {/* Status */}
                          <td className="p-4">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              p.status === 'available'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}>{p.status}</span>
                          </td>
                          {/* Actions */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setAdjustModal(p)}
                              className="bg-primary-50 hover:bg-primary-100 text-primary-800 border border-primary-200 font-bold px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5 ml-auto transition-all"
                            >
                              <Edit3 className="w-3 h-3" /> Adjust
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ LOGS TAB ═════════════════════════════════════════════════════════ */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-sage-500 font-semibold">History of all manual stock adjustments made by admins.</p>
            <button onClick={loadLogs} disabled={logsLoading}
              className="p-2 rounded-xl border border-stone-200 text-sage-400 hover:text-primary-900 hover:bg-stone-50 transition-all">
              <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {logsLoading ? <TableSkeleton rows={5} cols={5} /> : logs.length === 0 ? (
            <div className="bg-white border border-stone-200/60 p-12 rounded-3xl text-center">
              <Clock className="w-8 h-8 text-sage-300 mx-auto mb-3" />
              <p className="text-sm text-sage-500 font-semibold">No adjustment logs yet.</p>
              <p className="text-xs text-sage-400 mt-1">Logs will appear here after stock adjustments are made.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50/70 border-b border-stone-200/50 text-sage-500 font-extrabold uppercase tracking-wider">
                      <th className="p-4">Product</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Delta</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Admin</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {logs.map((log, i) => (
                      <tr key={log._id || i} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4 font-bold text-primary-950">{log.productName || '—'}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            log.type === 'add'    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            log.type === 'remove' ? 'bg-red-50 text-red-800 border-red-200' :
                            'bg-blue-50 text-blue-800 border-blue-200'
                          }`}>{log.type}</span>
                        </td>
                        <td className="p-4 font-bold">
                          <span className={log.type === 'remove' ? 'text-red-700' : 'text-emerald-700'}>
                            {log.type === 'remove' ? '−' : log.type === 'add' ? '+' : '='}{log.delta}
                          </span>
                        </td>
                        <td className="p-4 text-sage-600 max-w-[200px] truncate">{log.reason || <span className="italic text-sage-300">No reason provided</span>}</td>
                        <td className="p-4 text-sage-600 font-semibold">{log.adminName || 'Admin'}</td>
                        <td className="p-4 text-sage-500">{new Date(log.createdAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminInventory;