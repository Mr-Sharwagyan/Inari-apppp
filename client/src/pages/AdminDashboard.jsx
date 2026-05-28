import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import {
  Users, Sprout, ShoppingBag, IndianRupee, Search, Check, X,
  ShieldAlert, Calendar, Mail, Plus, Trash2, Package, AlertTriangle,
  CheckCircle, XCircle, Clock, Eye, Send, RefreshCw, Activity, Bell
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TableSkeleton, KpiSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const COLORS = ['#47896d','#aa8c5e','#60a5fa','#f59e0b','#a78bfa','#34d399','#f87171','#fb923c'];

// ─── WARN MODAL ───────────────────────────────────────────────────────────────
const WarnModal = ({ user, onClose, onSend }) => {
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const TEMPLATES = [
    'Your product listings do not meet our quality standards. Please review and update them.',
    'We have received complaints about your transactions. Please ensure timely delivery.',
    'Your account has been flagged for unusual activity. Please contact support.',
    'Please upload clear product images — blurry or misleading photos will be removed.',
    'Repeated violations of INARI policies may result in account suspension.',
  ];
  const handleSend = async () => {
    if (!msg.trim()) return;
    setSending(true);
    await onSend(user._id, msg.trim());
    setSending(false);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-extrabold text-sm text-primary-950">Send Warning</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-sage-400 hover:text-primary-900 hover:bg-stone-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center font-extrabold text-xs text-primary-900">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-primary-950">{user.name}</p>
            <p className="text-[10px] text-sage-400">{user.email}</p>
          </div>
        </div>
        <p className="text-[11px] font-semibold text-sage-600 mb-2">Quick Templates:</p>
        <div className="space-y-1.5 mb-4">
          {TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => setMsg(t)}
              className="w-full text-left text-[11px] text-sage-700 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 px-3 py-2 rounded-xl transition-all leading-relaxed">
              {t}
            </button>
          ))}
        </div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)}
          placeholder="Or type a custom warning message..." rows={3}
          className="w-full border border-stone-200 p-3 rounded-xl text-xs outline-none focus:border-amber-400 resize-none mb-4 leading-relaxed" />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border border-stone-200 text-sage-600 font-bold py-2.5 rounded-xl text-xs hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSend} disabled={!msg.trim() || sending}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors">
            <Send className="w-3.5 h-3.5" />
            {sending ? 'Sending...' : 'Send Warning'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── ELIGIBILITY MODAL ────────────────────────────────────────────────────────
const EligibilityModal = ({ user, eligibility, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-sm text-primary-950">Eligibility Report</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg text-sage-400 hover:text-primary-900 hover:bg-stone-100 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 mb-4 bg-stone-50 rounded-xl p-3 border border-stone-200">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-extrabold text-sm text-emerald-800">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xs font-bold text-primary-950">{user.name}</p>
          <p className="text-[10px] text-sage-400">{user.email}</p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {[
          { label: 'Has Listed Products', ok: eligibility.hasProducts, detail: `${eligibility.productCount} product(s)` },
          { label: 'Has Active Listings', ok: eligibility.hasActiveProducts, detail: `${eligibility.activeProductCount} available` },
          { label: 'Account Not Rejected', ok: eligibility.notRejected, detail: `Status: ${user.status}` },
          { label: 'Account Age ≥ 1 Day', ok: eligibility.accountOldEnough, detail: `Joined ${eligibility.joinedDaysAgo}d ago` },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between bg-stone-50 px-3 py-2.5 rounded-xl border border-stone-100">
            <span className="text-xs font-semibold text-primary-900">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-sage-400">{row.detail}</span>
              {row.ok
                ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                : <XCircle className="w-4 h-4 text-red-500" />
              }
            </div>
          </div>
        ))}
      </div>
      <div className={`py-3 px-4 rounded-xl text-center font-extrabold text-sm border ${
        eligibility.isEligible
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-red-50 text-red-800 border-red-200'
      }`}>
        {eligibility.isEligible ? '✅ Farmer is Eligible' : '❌ Farmer is Not Eligible'}
      </div>
      <button onClick={onClose} className="w-full mt-3 border border-stone-200 text-sage-600 font-bold py-2 rounded-xl text-xs hover:bg-stone-50 transition-colors">
        Close
      </button>
    </div>
  </div>
);

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const showToast = useToast();

  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(false);
  const [prodLoading, setProdLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');

  // User filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Product search
  const [prodSearch, setProdSearch] = useState('');

  // Category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  // Eligibility
  const [eligMap, setEligMap] = useState({});
  const [eligLoading, setEligLoading] = useState({});
  const [eligModal, setEligModal] = useState(null);

  // Warn modal
  const [warnModal, setWarnModal] = useState(null);

  // ── Load data ──
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, analyticsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/analytics/admin')
      ]);
      setUsers(usersRes.data);
      setAnalytics(analyticsRes.data);
    } catch {
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
    } catch {
      showToast('Failed to load categories.', 'error');
    } finally {
      setCatLoading(false);
    }
  };

  const loadProducts = async () => {
    setProdLoading(true);
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data);
    } catch {
      showToast('Failed to load products.', 'error');
    } finally {
      setProdLoading(false);
    }
  };

  useEffect(() => { loadData(); loadCategories(); }, []);
  useEffect(() => { if (activeTab === 'products') loadProducts(); }, [activeTab]);

  // ── Actions ──
  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      showToast(`Status updated to ${newStatus.toUpperCase()}`, 'success');
      loadData();
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleSendWarning = async (userId, message) => {
    try {
      await api.post(`/admin/users/${userId}/warn`, { message });
      showToast('Warning notification sent!', 'success');
    } catch {
      showToast('Failed to send warning.', 'error');
    }
  };

  const handleCheckEligibility = async (user) => {
    setEligLoading(prev => ({ ...prev, [user._id]: true }));
    try {
      const res = await api.get(`/admin/users/${user._id}/eligibility`);
      setEligMap(prev => ({ ...prev, [user._id]: res.data }));
      setEligModal({ user, eligibility: res.data });
    } catch {
      showToast('Failed to check eligibility.', 'error');
    } finally {
      setEligLoading(prev => ({ ...prev, [user._id]: false }));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) { showToast('Category name is required.', 'warning'); return; }
    setSavingCat(true);
    try {
      await api.post('/categories', { name: newCatName, description: newCatDesc, image: newCatImage });
      showToast('Category created!', 'success');
      setNewCatName(''); setNewCatDesc(''); setNewCatImage('');
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create.', 'error');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast('Category deleted.', 'success');
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch {
      showToast('Failed to delete.', 'error');
    }
  };

  // ── Derived data ──
  const { summary } = analytics || {
    summary: { totalFarmers:0, totalCustomers:0, totalProducts:0, totalOrders:0, totalRevenue:0, pendingApprovals:0 }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'all'   || u.role   === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.farmerName?.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const farmers = users.filter(u => u.role === 'farmer');
  const approvedFarmers  = farmers.filter(f => f.status === 'approved').length;
  const pendingFarmers   = farmers.filter(f => f.status === 'pending').length;
  const rejectedFarmers  = farmers.filter(f => f.status === 'rejected').length;

  const revenueData = analytics?.revenueChart || [
    { name:'Jan', Revenue: Math.round((summary.totalRevenue||0)*0.10)||2200 },
    { name:'Feb', Revenue: Math.round((summary.totalRevenue||0)*0.12)||3100 },
    { name:'Mar', Revenue: Math.round((summary.totalRevenue||0)*0.15)||4800 },
    { name:'Apr', Revenue: Math.round((summary.totalRevenue||0)*0.18)||4200 },
    { name:'May', Revenue: Math.round((summary.totalRevenue||0)*0.20)||6100 },
    { name:'Jun', Revenue: Math.round((summary.totalRevenue||0)*0.25)||summary.totalRevenue||9800 },
  ];

  const userRolesData = [
    { name: 'Farmers',   value: summary.totalFarmers   || 0 },
    { name: 'Customers', value: summary.totalCustomers || 0 },
    { name: 'Admins',    value: users.filter(u => u.role === 'admin').length || 1 },
  ].filter(d => d.value > 0);

  const orderStatusData = analytics?.orderStatusBreakdown || [
    { name:'Pending',    value: Math.ceil((summary.totalOrders||0)*0.35)||5 },
    { name:'Processing', value: Math.ceil((summary.totalOrders||0)*0.20)||3 },
    { name:'Shipped',    value: Math.ceil((summary.totalOrders||0)*0.25)||4 },
    { name:'Delivered',  value: Math.ceil((summary.totalOrders||0)*0.20)||8 },
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
    { id: 'overview',   label: 'Overview',                                           icon: Activity   },
    { id: 'users',      label: `All Users (${users.length})`,                        icon: Users      },
    { id: 'farmers',    label: `Farmers (${farmers.length})`,                        icon: Sprout     },
    { id: 'products',   label: `Products (${products.length || '•••'})`,             icon: Package    },
    { id: 'categories', label: `Categories (${categories.length})`,                  icon: ShoppingBag},
  ];

  return (
    <div className="space-y-8">

      {/* Modals */}
      {warnModal  && <WarnModal user={warnModal} onClose={() => setWarnModal(null)} onSend={handleSendWarning} />}
      {eligModal  && <EligibilityModal user={eligModal.user} eligibility={eligModal.eligibility} onClose={() => setEligModal(null)} />}

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight">System Control Panel</h2>
        <p className="text-xs text-sage-455 mt-0.5">Monitor farmers, manage users, view products, and control platform settings.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Gross Revenue</span>
            <div className="text-2xl font-extrabold text-primary-950">Rs.{(summary.totalRevenue||0).toLocaleString()}</div>
            <span className="text-[10px] text-sage-450 font-bold">{summary.totalOrders} total orders</span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100"><IndianRupee className="w-5 h-5" /></div>
        </div>

        {/* Farmers */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Registered Farmers</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.totalFarmers}</div>
            <div className="flex gap-2">
              <span className="text-[10px] text-emerald-600 font-bold">{approvedFarmers} active</span>
              {pendingFarmers > 0 && <span className="text-[10px] text-amber-600 font-bold animate-pulse">{pendingFarmers} pending</span>}
            </div>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100"><Sprout className="w-5 h-5" /></div>
        </div>

        {/* Customers */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Platform Clients</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.totalCustomers}</div>
            <span className="text-[10px] text-sage-450 font-bold">{summary.totalProducts} active products</span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100"><ShoppingBag className="w-5 h-5" /></div>
        </div>

        {/* Pending Approvals */}
        <div className={`bg-white border p-5 rounded-2xl shadow-soft flex items-center justify-between ${summary.pendingApprovals > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-stone-200/60'}`}>
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Pending Approvals</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.pendingApprovals}</div>
            <span className={`text-[10px] font-bold ${summary.pendingApprovals > 0 ? 'text-amber-700 animate-pulse' : 'text-emerald-700'}`}>
              {summary.pendingApprovals > 0 ? '⚠️ Needs attention' : '✅ All clear'}
            </span>
          </div>
          <div className={`p-3.5 rounded-xl border ${summary.pendingApprovals > 0 ? 'bg-amber-100/60 text-amber-800 border-amber-200' : 'bg-primary-50 text-primary-900 border-primary-100'}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white text-primary-950 shadow-soft' : 'text-sage-500 hover:text-primary-900'}`}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* Farmer status quick cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Approved Farmers',  value: approvedFarmers, color:'emerald', Icon: CheckCircle },
              { label: 'Pending Review',    value: pendingFarmers,  color:'amber',   Icon: Clock       },
              { label: 'Rejected',          value: rejectedFarmers, color:'red',     Icon: XCircle     },
            ].map(({ label, value, color, Icon }) => (
              <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-2xl p-4 flex items-center gap-3`}>
                <Icon className={`w-7 h-7 text-${color}-600 shrink-0`} />
                <div>
                  <div className={`text-2xl font-extrabold text-${color}-900`}>{value}</div>
                  <div className={`text-[11px] font-bold text-${color}-600`}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Area Chart */}
            <div className="lg:col-span-2 bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider">Revenue Flow (Rs.)</h3>
                <span className="text-[10px] font-semibold text-sage-400">Past 6 months</span>
              </div>
              <div className="h-56 text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#47896d" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#47896d" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0CE" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#899f86" />
                    <YAxis stroke="#899f86" />
                    <Tooltip contentStyle={{ backgroundColor:'#fff', border:'1px solid #E5DFD3', borderRadius:12 }} />
                    <Area type="monotone" dataKey="Revenue" stroke="#47896d" strokeWidth={2.5} fill="url(#revGrad)" fillOpacity={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Roles Pie */}
            <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft">
              <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider mb-4">User Split</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userRolesData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={4} dataKey="value">
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
                    {item.name} ({item.value})
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status Bar */}
            <div className="lg:col-span-3 bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft">
              <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider mb-4">Order Status Breakdown</h3>
              <div className="h-44 text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderStatusData} margin={{ top:5, right:10, left:-15, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0CE" opacity={0.4} />
                    <XAxis dataKey="name" stroke="#899f86" />
                    <YAxis stroke="#899f86" />
                    <Tooltip contentStyle={{ backgroundColor:'#fff', border:'1px solid #E5DFD3', borderRadius:12 }} />
                    <Bar dataKey="value" radius={[6,6,0,0]}>
                      {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ ALL USERS TAB ═════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3 bg-white border border-stone-200/60 p-4 rounded-2xl shadow-soft">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-sage-400" />
              <input type="text" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 font-medium" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
              className="border border-stone-200 bg-white px-3 py-2 rounded-xl text-xs font-bold text-primary-950 outline-none">
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="customer">Customers</option>
              <option value="admin">Admin</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-stone-200 bg-white px-3 py-2 rounded-xl text-xs font-bold text-primary-950 outline-none">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <span className="text-xs text-sage-400 font-semibold self-center ml-auto">{filteredUsers.length} users</span>
          </div>

          {loading ? <TableSkeleton rows={4} cols={6} /> : filteredUsers.length === 0 ? (
            <div className="bg-white border border-stone-200/60 p-12 rounded-3xl text-center">
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
                  <tbody className="divide-y divide-stone-100">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center font-extrabold text-primary-900">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-primary-950">{u.name}</div>
                              {u.phone && <div className="text-[10px] text-sage-400">{u.phone}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sage-600 font-semibold">
                          <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-sage-400 shrink-0" />{u.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'farmer' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>{u.role}</span>
                        </td>
                        <td className="p-4 text-sage-500 font-medium">
                          <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-sage-400 shrink-0" />
                            {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          {u.role === 'farmer' ? (
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                              u.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              u.status === 'pending'  ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' :
                              'bg-red-50 text-red-800 border-red-200'
                            }`}>{u.status}</span>
                          ) : <span className="text-[10px] text-sage-400 italic">Auto-approved</span>}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2 flex-wrap">
                            {u.role === 'farmer' && u.status === 'pending' && (<>
                              <button onClick={() => handleUpdateStatus(u._id, 'approved')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[10px] transition-colors">
                                <Check className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button onClick={() => handleUpdateStatus(u._id, 'rejected')}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[10px] transition-colors">
                                <X className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>)}
                            {u.role === 'farmer' && u.status === 'approved' && (
                              <button onClick={() => handleUpdateStatus(u._id, 'rejected')} className="text-[10px] text-red-600 hover:underline font-bold">Revoke</button>
                            )}
                            {u.role === 'farmer' && u.status === 'rejected' && (
                              <button onClick={() => handleUpdateStatus(u._id, 'approved')} className="text-[10px] text-emerald-600 hover:underline font-bold">Activate</button>
                            )}
                            {u.role !== 'admin' && (
                              <button onClick={() => setWarnModal(u)}
                                className="text-[10px] text-amber-700 border border-amber-200 hover:bg-amber-50 font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-all">
                                <Bell className="w-3 h-3" /> Warn
                              </button>
                            )}
                          </div>
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

      {/* ══ FARMERS TAB (Eligibility Monitor) ════════════════════════════════ */}
      {activeTab === 'farmers' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-extrabold text-amber-900">Farmer Eligibility Monitor</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Check whether each farmer meets platform requirements: active product listings, account age, and non-rejected status.
                Send warnings or approve/reject directly from this panel.
              </p>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: `${approvedFarmers} Approved`,  color: 'emerald' },
              { label: `${pendingFarmers} Pending`,    color: 'amber'   },
              { label: `${rejectedFarmers} Rejected`,  color: 'red'     },
            ].map(({ label, color }) => (
              <div key={label} className={`bg-${color}-50 border border-${color}-200 text-${color}-800 text-[11px] font-extrabold px-3 py-1.5 rounded-full`}>
                {label}
              </div>
            ))}
          </div>

          <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/70 border-b border-stone-200/50 text-sage-500 font-extrabold uppercase tracking-wider">
                    <th className="p-4">Farmer</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4">Eligibility</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {farmers.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-sage-400 text-sm font-semibold">No farmers registered yet.</td></tr>
                  ) : farmers.map(u => {
                    const elig = eligMap[u._id];
                    return (
                      <tr key={u._id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-extrabold text-emerald-800">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-primary-950">{u.name}</div>
                              <div className="text-[10px] text-sage-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            u.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            u.status === 'pending'  ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' :
                            'bg-red-50 text-red-800 border-red-200'
                          }`}>{u.status}</span>
                        </td>
                        <td className="p-4 text-sage-500 font-medium">
                          {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {elig ? (
                            elig.isEligible
                              ? <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-fit"><CheckCircle className="w-3 h-3" />Eligible</span>
                              : <span className="flex items-center gap-1 text-[10px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full w-fit"><XCircle className="w-3 h-3" />Not Eligible</span>
                          ) : (
                            <span className="text-[10px] text-sage-400 italic">Not checked</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => elig ? setEligModal({ user: u, eligibility: elig }) : handleCheckEligibility(u)}
                              disabled={eligLoading[u._id]}
                              className="text-[10px] bg-primary-50 hover:bg-primary-100 text-primary-800 border border-primary-200 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50">
                              <Eye className="w-3 h-3" />
                              {eligLoading[u._id] ? 'Checking...' : elig ? 'View' : 'Check Eligibility'}
                            </button>
                            <button onClick={() => setWarnModal(u)}
                              className="text-[10px] text-amber-700 border border-amber-200 hover:bg-amber-50 font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                              <Bell className="w-3 h-3" /> Warn
                            </button>
                            {u.status === 'pending' && (
                              <button onClick={() => handleUpdateStatus(u._id, 'approved')}
                                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                                <Check className="w-3 h-3" /> Approve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══ PRODUCTS TAB ══════════════════════════════════════════════════════ */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white border border-stone-200/60 p-4 rounded-2xl shadow-soft">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-sage-400" />
              <input type="text" placeholder="Search by product, farmer, category..." value={prodSearch} onChange={e => setProdSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 font-medium" />
            </div>
            <button onClick={loadProducts} disabled={prodLoading}
              className="p-2 rounded-xl border border-stone-200 text-sage-400 hover:text-primary-900 hover:bg-stone-50 transition-all">
              <RefreshCw className={`w-4 h-4 ${prodLoading ? 'animate-spin' : ''}`} />
            </button>
            <span className="text-xs text-sage-400 font-semibold whitespace-nowrap">{filteredProducts.length} items</span>
          </div>

          {prodLoading ? <TableSkeleton rows={6} cols={6} /> : (
            <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50/70 border-b border-stone-200/50 text-sage-500 font-extrabold uppercase tracking-wider">
                      <th className="p-4">Product</th>
                      <th className="p-4">Farmer</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.length === 0 ? (
                      <tr><td colSpan={6} className="p-12 text-center text-sage-400 text-sm font-semibold">No products found.</td></tr>
                    ) : filteredProducts.map(p => (
                      <tr key={p._id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-stone-200" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-base">🌿</div>
                            )}
                            <div>
                              <div className="font-bold text-primary-950">{p.name}</div>
                              <div className="text-[10px] text-sage-400 truncate max-w-[150px]">{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-sage-700">{p.farmerName}</td>
                        <td className="p-4">
                          <span className="text-[10px] px-2 py-0.5 bg-stone-100 text-sage-700 rounded-full font-bold capitalize">{p.category}</span>
                        </td>
                        <td className="p-4 font-bold text-primary-950">Rs.{p.price}<span className="text-sage-400 font-normal">/{p.unit}</span></td>
                        <td className="p-4">
                          <span className={`font-bold ${p.stock <= 0 ? 'text-red-600' : p.stock <= 15 ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {p.stock} {p.unit}
                          </span>
                          {p.stock > 0 && p.stock <= 15 && <span className="block text-[9px] text-amber-500 font-bold animate-pulse">Low Stock</span>}
                          {p.stock <= 0 && <span className="block text-[9px] text-red-500 font-bold">Out of Stock</span>}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            p.status === 'available' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                          }`}>{p.status}</span>
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

      {/* ══ CATEGORIES TAB ════════════════════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Add Form */}
          <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Category
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">Name *</label>
                <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Grains" required
                  className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">Description</label>
                <textarea value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} placeholder="Short description..." rows={2}
                  className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">Image URL</label>
                <input type="text" value={newCatImage} onChange={e => setNewCatImage(e.target.value)} placeholder="https://..."
                  className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
              </div>
              {newCatImage && (
                <img src={newCatImage} alt="preview" className="w-full h-28 object-cover rounded-xl border border-stone-200"
                  onError={e => e.target.style.display='none'} />
              )}
              <button type="submit" disabled={savingCat}
                className="w-full bg-primary-900 hover:bg-primary-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                <Plus className="w-3.5 h-3.5" />
                {savingCat ? 'Creating...' : 'Create Category'}
              </button>
            </form>
          </div>

          {/* List */}
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
                        <div className="text-[9px] text-sage-300 mt-0.5 font-mono">/{cat.slug}</div>
                      </div>
                      <button onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="p-1.5 rounded-lg text-sage-300 hover:text-red-600 hover:bg-red-50 transition-all shrink-0">
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