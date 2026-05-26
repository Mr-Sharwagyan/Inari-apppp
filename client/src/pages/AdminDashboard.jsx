import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
  Users, Sprout, ShoppingBag, IndianRupee, Search, Check, X,
  ShieldAlert, Calendar, Mail, Plus, Trash2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TableSkeleton, KpiSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const COLORS = ['#47896d','#aa8c5e','#60a5fa','#f59e0b','#a78bfa','#34d399','#f87171','#fb923c'];

const AdminDashboard = () => {
  const showToast = useToast();
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'categories'

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/analytics/admin')
      ]);
      setUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      showToast('Failed to load admin data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setCatLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      showToast('Failed to load categories.', 'error');
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => { loadData(); loadCategories(); }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      showToast(`User status updated to ${newStatus.toUpperCase()}`, 'success');
      loadData();
    } catch (err) {
      showToast('Failed to update user status.', 'error');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) { showToast('Category name is required.', 'warning'); return; }
    setSavingCat(true);
    try {
      await api.post('/categories', { name: newCatName, description: newCatDesc, image: newCatImage });
      showToast('Category created successfully!', 'success');
      setNewCatName(''); setNewCatDesc(''); setNewCatImage('');
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create category.', 'error');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? Products in this category will remain but unlinked.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast('Category deleted.', 'success');
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete category.', 'error');
    }
  };

  const { summary } = analytics || {
    summary: { totalFarmers: 0, totalCustomers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingApprovals: 0 }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Build chart data from analytics
  const revenueData = analytics?.revenueChart || [
    { name: 'Jan', Revenue: Math.round((summary.totalRevenue || 0) * 0.10) || 2200 },
    { name: 'Feb', Revenue: Math.round((summary.totalRevenue || 0) * 0.12) || 3100 },
    { name: 'Mar', Revenue: Math.round((summary.totalRevenue || 0) * 0.15) || 4800 },
    { name: 'Apr', Revenue: Math.round((summary.totalRevenue || 0) * 0.18) || 4200 },
    { name: 'May', Revenue: Math.round((summary.totalRevenue || 0) * 0.20) || 6100 },
    { name: 'Jun', Revenue: Math.round((summary.totalRevenue || 0) * 0.25) || summary.totalRevenue || 9800 },
  ];

  const userRolesData = [
    { name: 'Farmers', value: summary.totalFarmers || 0 },
    { name: 'Customers', value: summary.totalCustomers || 0 },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length || 1 },
  ].filter(d => d.value > 0);

  const orderStatusData = analytics?.orderStatusBreakdown || [
    { name: 'Pending', value: Math.ceil((summary.totalOrders || 0) * 0.35) || 5 },
    { name: 'Processing', value: Math.ceil((summary.totalOrders || 0) * 0.20) || 3 },
    { name: 'Shipped', value: Math.ceil((summary.totalOrders || 0) * 0.25) || 4 },
    { name: 'Delivered', value: Math.ceil((summary.totalOrders || 0) * 0.20) || 8 },
  ];

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: `Users (${users.length})` },
    { id: 'categories', label: `Categories (${categories.length})` },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight">System Control Panel</h2>
        <p className="text-xs text-sage-455 mt-0.5">Platform analytics, user management, and category administration.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Gross Revenue</span>
            <div className="text-2xl font-extrabold text-primary-950">Rs.{(summary.totalRevenue || 0).toLocaleString()}</div>
            <span className="text-[10px] text-sage-450 font-bold">Total platform sales</span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100"><IndianRupee className="w-5 h-5" /></div>
        </div>
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Registered Farmers</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.totalFarmers}</div>
            <span className="text-[10px] text-sage-450 font-bold">{summary.totalProducts} active crops</span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100"><Sprout className="w-5 h-5" /></div>
        </div>
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Platform Clients</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.totalCustomers}</div>
            <span className="text-[10px] text-sage-450 font-bold">{summary.totalOrders} total orders</span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100"><ShoppingBag className="w-5 h-5" /></div>
        </div>
        <div className={`bg-white border p-5 rounded-2xl shadow-soft flex items-center justify-between ${summary.pendingApprovals > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-stone-200/60'}`}>
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Pending Approvals</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.pendingApprovals} <span className="text-xs text-sage-455 font-bold">pending</span></div>
            <span className={`text-[10px] font-bold ${summary.pendingApprovals > 0 ? 'text-amber-700 animate-pulse' : 'text-emerald-700'}`}>
              {summary.pendingApprovals > 0 ? '⚠️ Verification queue active' : 'All profiles active'}
            </span>
          </div>
          <div className={`p-3.5 rounded-xl border ${summary.pendingApprovals > 0 ? 'bg-amber-100/60 text-amber-800 border-amber-200' : 'bg-primary-50 text-primary-900 border-primary-100'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white text-primary-950 shadow-soft' : 'text-sage-500 hover:text-primary-900'}`}
          >{tab.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Revenue Area Chart */}
          <div className="lg:col-span-2 bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider">Revenue Flow (Rs.)</h3>
              <span className="text-[10px] font-semibold text-sage-400">Past 6 months</span>
            </div>
            <div className="h-60 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#47896d" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#47896d" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0CE" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#899f86" />
                  <YAxis stroke="#899f86" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5DFD3', borderRadius: 12 }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#47896d" strokeWidth={2.5} fillOpacity={1} fill="url(#adminRevGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Roles Pie */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider mb-6">User Distribution</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={userRolesData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                    {userRolesData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] font-bold text-sage-700 mt-2">
              {userRolesData.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Bar */}
          <div className="lg:col-span-3 bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider mb-6">Order Status Breakdown</h3>
            <div className="h-48 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0CE" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#899f86" />
                  <YAxis stroke="#899f86" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5DFD3', borderRadius: 12 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white border border-stone-200/60 p-4 rounded-2xl shadow-soft">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-3 w-4 h-4 text-sage-400" />
              <input type="text" placeholder="Search user or email..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 font-medium" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-sage-500 font-semibold">
                <span>Role:</span>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                  className="border border-stone-200 bg-white px-2.5 py-1.5 rounded-xl text-xs font-bold text-primary-950 outline-none">
                  <option value="all">All Roles</option>
                  <option value="farmer">Farmers</option>
                  <option value="customer">Customers</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-sage-500 font-semibold">
                <span>Status:</span>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="border border-stone-200 bg-white px-2.5 py-1.5 rounded-xl text-xs font-bold text-primary-950 outline-none">
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? <TableSkeleton rows={4} cols={5} /> : filteredUsers.length === 0 ? (
            <div className="bg-white border border-stone-200/60 p-12 rounded-3xl text-center shadow-soft">
              <p className="text-sm text-sage-500 font-semibold">No users matched your filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50/70 border-b border-stone-200/50 text-sage-500 font-extrabold uppercase tracking-wider">
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-primary-950 font-medium">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center font-extrabold text-primary-900">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sm">{u.name}</div>
                              {u.phone && <div className="text-[10px] text-sage-400">Ph: {u.phone}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-sage-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-sage-400 shrink-0" />{u.email}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-sage-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-sage-400 shrink-0" />
                            {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          {u.role === 'farmer' ? (
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${u.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : u.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' : 'bg-red-50 text-red-800 border-red-200'}`}>
                              {u.status}
                            </span>
                          ) : <span className="text-[10px] text-sage-400 italic">Auto-Approved</span>}
                        </td>
                        <td className="p-4 text-right">
                          {u.role === 'farmer' && u.status === 'pending' ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleUpdateStatus(u._id, 'approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded-lg flex items-center gap-1">
                                <Check className="w-4 h-4" /><span className="text-[9px] pr-1">Approve</span>
                              </button>
                              <button onClick={() => handleUpdateStatus(u._id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white font-bold p-1.5 rounded-lg flex items-center gap-1">
                                <X className="w-4 h-4" /><span className="text-[9px] pr-1">Reject</span>
                              </button>
                            </div>
                          ) : u.role === 'farmer' ? (
                            <div className="flex justify-end">
                              {u.status === 'approved'
                                ? <button onClick={() => handleUpdateStatus(u._id, 'rejected')} className="text-[10px] text-red-600 hover:underline font-bold">Revoke</button>
                                : <button onClick={() => handleUpdateStatus(u._id, 'approved')} className="text-[10px] text-emerald-600 hover:underline font-bold">Activate</button>
                              }
                            </div>
                          ) : <span className="text-[10px] text-sage-400 italic">N/A</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Add Category Form */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Category
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">Category Name *</label>
                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Grains" required
                  className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">Description</label>
                <textarea value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)}
                  placeholder="Short description..." rows={2}
                  className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">Image URL</label>
                <input type="text" value={newCatImage} onChange={e => setNewCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
              </div>
              {newCatImage && (
                <img src={newCatImage} alt="preview" className="w-full h-28 object-cover rounded-xl border border-stone-200" onError={e => e.target.style.display='none'} />
              )}
              <button type="submit" disabled={savingCat}
                className="w-full bg-primary-900 hover:bg-primary-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                <Plus className="w-3.5 h-3.5" />
                {savingCat ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider mb-4">All Categories ({categories.length})</h3>
            {catLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white border border-stone-200 rounded-2xl p-4 animate-pulse space-y-2">
                    <div className="bg-stone-200 h-24 rounded-xl" />
                    <div className="bg-stone-200 h-3 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
                <p className="text-sm text-sage-400 font-semibold">No categories yet. Add one using the form.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <div key={cat._id} className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden hover:shadow-soft group transition-all">
                    {cat.image && (
                      <div className="h-24 overflow-hidden bg-stone-100">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-primary-950 truncate">{cat.name}</div>
                        {cat.description && <div className="text-[10px] text-sage-400 line-clamp-1 mt-0.5">{cat.description}</div>}
                        <div className="text-[9px] text-sage-300 mt-1 font-mono">/{cat.slug}</div>
                      </div>
                      <button onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="p-1.5 rounded-lg text-sage-300 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
                        title="Delete category">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default AdminDashboard;