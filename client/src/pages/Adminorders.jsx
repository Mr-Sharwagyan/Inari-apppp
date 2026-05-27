import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, RefreshCw, ChevronDown, ChevronUp,
  Package, Truck, CheckCircle, Clock, XCircle, RotateCcw,
  IndianRupee, ShoppingBag, TrendingUp, AlertTriangle,
  MapPin, Phone, User, Calendar, Hash, Eye, Edit3,
  ArrowUpRight, Loader2, X, Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { KpiSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    pulse: true,
  },
  processing: {
    label: 'Processing',
    icon: RotateCcw,
    classes: 'bg-violet-50 text-violet-800 border-violet-200',
    dot: 'bg-violet-500',
    pulse: false,
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    classes: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    pulse: false,
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    pulse: false,
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    classes: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-400',
    pulse: false,
  },
};

const STATUS_FLOW = ['pending', 'processing', 'shipped', 'delivered'];

const formatCurrency = (v) =>
  `Rs.${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider ${cfg.classes}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`}
      />
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

// ─── Status Updater Dropdown ──────────────────────────────────────────────────
const StatusUpdater = ({ order, onUpdate, loading }) => {
  const [open, setOpen] = useState(false);
  const statuses = Object.keys(STATUS_CONFIG);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-primary-950 transition-all disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Edit3 className="w-3.5 h-3.5 text-sage-400" />
        )}
        Update
        <ChevronDown className="w-3 h-3 text-sage-400" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-44 bg-white border border-stone-200 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden">
            {statuses.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              const isCurrent = s === order.orderStatus;
              return (
                <button
                  key={s}
                  onClick={() => {
                    onUpdate(order._id, s);
                    setOpen(false);
                  }}
                  disabled={isCurrent}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-stone-50 text-sage-400 cursor-default'
                      : 'hover:bg-stone-50 text-primary-950 cursor-pointer'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <Icon className="w-3.5 h-3.5 text-sage-500" />
                  {cfg.label}
                  {isCurrent && <Check className="w-3 h-3 ml-auto text-emerald-500" />}
                </button>
              );
            })}
            <div className="border-t border-stone-100 mt-1 pt-1">
              <button
                onClick={() => {
                  onUpdate(order._id, 'cancelled');
                  setOpen(false);
                }}
                disabled={order.orderStatus === 'cancelled'}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-default"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancel Order
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Order Detail Drawer ──────────────────────────────────────────────────────
const OrderDrawer = ({ order, onClose, onUpdate, updatingId }) => {
  if (!order) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-extrabold text-base text-primary-950">Order Detail</h3>
            <p className="text-[10px] text-sage-400 font-mono mt-0.5 uppercase tracking-widest">
              #{order._id.substring(0, 16)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-sage-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">

          {/* Status + Date */}
          <div className="flex items-center justify-between">
            <StatusBadge status={order.orderStatus} />
            <span className="text-xs text-sage-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.createdAt)}
            </span>
          </div>

          {/* Progress tracker */}
          <div className="bg-stone-50 rounded-2xl p-4">
            <p className="text-[10px] uppercase font-extrabold text-sage-400 tracking-wider mb-3">
              Order Progress
            </p>
            <div className="flex items-center gap-0">
              {STATUS_FLOW.map((s, i) => {
                const cfg = STATUS_CONFIG[s];
                const idx = STATUS_FLOW.indexOf(order.orderStatus);
                const done = i <= idx && order.orderStatus !== 'cancelled';
                const current = s === order.orderStatus;
                const Icon = cfg.icon;
                return (
                  <React.Fragment key={s}>
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          done
                            ? 'bg-primary-900 border-primary-900 text-white'
                            : 'bg-white border-stone-200 text-sage-400'
                        } ${current ? 'ring-2 ring-primary-300 ring-offset-1' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-bold uppercase ${done ? 'text-primary-800' : 'text-sage-400'}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${
                          i < idx && order.orderStatus !== 'cancelled'
                            ? 'bg-primary-700'
                            : 'bg-stone-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] uppercase font-extrabold text-sage-400 tracking-wider mb-3">
              Items ({order.items?.length})
            </p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-stone-50 rounded-xl p-3 border border-stone-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg border border-primary-100 flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary-700" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-primary-950">{item.name}</div>
                      <div className="text-[10px] text-sage-400">
                        {item.quantity} {item.unit} × {formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-primary-950">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
            <p className="text-[10px] uppercase font-extrabold text-sage-400 tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> Delivery Address
            </p>
            <div className="space-y-1 text-xs text-primary-950">
              <p className="font-bold">{order.shippingAddress?.fullName}</p>
              <p className="text-sage-600">{order.shippingAddress?.addressLine}</p>
              <p className="text-sage-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.zipCode}
              </p>
              <p className="text-sage-500 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3" /> {order.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-primary-950 text-white rounded-2xl px-5 py-4">
            <span className="text-xs font-bold opacity-70">Total Amount</span>
            <span className="text-xl font-extrabold">{formatCurrency(order.totalAmount)}</span>
          </div>

          {/* Update Status */}
          <div>
            <p className="text-[10px] uppercase font-extrabold text-sage-400 tracking-wider mb-3">
              Change Status
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).map(([s, cfg]) => {
                const Icon = cfg.icon;
                const isCurrent = s === order.orderStatus;
                return (
                  <button
                    key={s}
                    onClick={() => onUpdate(order._id, s)}
                    disabled={isCurrent || updatingId === order._id}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isCurrent
                        ? `${cfg.classes} cursor-default`
                        : 'bg-white border-stone-200 hover:border-primary-300 hover:bg-primary-50 text-primary-950 cursor-pointer'
                    } disabled:opacity-60`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                    {isCurrent && <Check className="w-3 h-3 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, warn }) => (
  <div
    className={`bg-white border p-5 rounded-2xl shadow-soft flex items-center justify-between ${
      warn ? 'border-amber-200 bg-amber-50/20' : 'border-stone-200/60'
    }`}
  >
    <div className="space-y-1.5">
      <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">
        {label}
      </span>
      <div className="text-2xl font-extrabold text-primary-950">{value}</div>
      {sub && (
        <span className={`text-[10px] font-bold ${warn ? 'text-amber-700' : 'text-sage-450'}`}>
          {sub}
        </span>
      )}
    </div>
    <div
      className={`p-3.5 rounded-xl border ${
        warn
          ? 'bg-amber-100/60 text-amber-800 border-amber-200/30'
          : 'bg-primary-50 text-primary-900 border-primary-100'
      }`}
    >
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminOrders = () => {
  const showToast = useToast();

  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [sortBy, setSortBy]               = useState('newest');

  // ── Fetch all orders (admin sees everything) ──
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Use the analytics endpoint to get all orders (admin token passes auth)
      // then also get orders via the public endpoint — admin can see all
      const res = await api.get('/orders/all');
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data);
    } catch (err) {
      // fallback: try the farmer route structure that returns all
      try {
        const res2 = await api.get('/orders/farmer');
        setOrders(Array.isArray(res2.data) ? res2.data : []);
      } catch {
        showToast('Failed to load orders.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Update order status ──
  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
      // Also update selected order if open
      setSelectedOrder((prev) =>
        prev?._id === orderId ? { ...prev, orderStatus: newStatus } : prev
      );
      showToast(`Order status updated to ${newStatus.toUpperCase()}`, 'success');
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Derived stats ──
  const totalRevenue  = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingCount  = orders.filter((o) => o.orderStatus === 'pending').length;
  const shippedCount  = orders.filter((o) => o.orderStatus === 'shipped').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'delivered').length;

  // ── Filtered + sorted ──
  const filteredOrders = orders
    .filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        o._id.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.items?.some((i) => i.name.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highest') return b.totalAmount - a.totalAmount;
      if (sortBy === 'lowest')  return a.totalAmount - b.totalAmount;
      return 0;
    });

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight">
            Order Management
          </h2>
          <p className="text-xs text-sage-450 mt-0.5">
            Monitor, filter, and update all platform orders across every farmer.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200/40 rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      {loading && !orders.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            icon={IndianRupee}
            label="Total Order Revenue"
            value={formatCurrency(totalRevenue)}
            sub="Across all platform orders"
          />
          <KpiCard
            icon={ShoppingBag}
            label="Total Orders"
            value={orders.length}
            sub={`${deliveredCount} delivered successfully`}
          />
          <KpiCard
            icon={Truck}
            label="In Transit"
            value={shippedCount}
            sub="Currently shipped out"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Awaiting Action"
            value={pendingCount}
            sub={pendingCount > 0 ? '⚠️ Needs processing' : 'No pending orders'}
            warn={pendingCount > 0}
          />
        </div>
      )}

      {/* ── Filters Bar ── */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between bg-white border border-stone-200/60 p-4 rounded-2xl shadow-soft">

        {/* Search */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-sage-400" />
          <input
            type="text"
            placeholder="Search order ID, customer, product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-sage-400 hover:text-sage-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => {
              const cfg = STATUS_CONFIG[s];
              const count = s === 'all' ? orders.length : orders.filter((o) => o.orderStatus === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all ${
                    statusFilter === s
                      ? 'bg-white text-primary-950 shadow-sm'
                      : 'text-sage-500 hover:text-primary-800'
                  }`}
                >
                  {s === 'all' ? 'All' : cfg.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] ${
                      statusFilter === s ? 'bg-primary-100 text-primary-800' : 'bg-stone-200 text-sage-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-stone-200 bg-white px-3 py-2 rounded-xl text-xs font-bold text-primary-950 focus:border-primary-500 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Value</option>
            <option value="lowest">Lowest Value</option>
          </select>

        </div>
      </div>

      {/* ── Orders Table ── */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-stone-200/60 p-16 rounded-3xl text-center shadow-soft flex flex-col items-center gap-3">
          <ShoppingBag className="w-10 h-10 text-sage-300" />
          <div>
            <h3 className="font-bold text-base text-primary-950">No orders found</h3>
            <p className="text-xs text-sage-500 mt-1">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'No orders have been placed on the platform yet.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200/50 text-sage-500 font-extrabold uppercase tracking-wider">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-primary-950">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-stone-50/50 transition-colors group"
                  >
                    {/* Order ID */}
                    <td className="p-4">
                      <span className="font-mono text-[10px] font-bold text-sage-500 bg-stone-100 px-2 py-1 rounded-lg">
                        #{order._id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center font-extrabold text-primary-900 text-sm shrink-0">
                          {(order.shippingAddress?.fullName || 'C')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm leading-tight">
                            {order.shippingAddress?.fullName || 'Customer'}
                          </div>
                          <div className="text-[10px] text-sage-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="p-4">
                      <div className="font-semibold text-primary-950">
                        {order.items?.[0]?.name}
                        {order.items?.length > 1 && (
                          <span className="text-sage-400 font-medium">
                            {' '}+{order.items.length - 1} more
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-sage-400 mt-0.5">
                        {order.items?.reduce((s, i) => s + i.quantity, 0)} units total
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-sage-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sage-400" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <span className="font-extrabold text-primary-950 text-sm">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={order.orderStatus} />
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-primary-50 hover:border-primary-200 text-xs font-bold text-primary-800 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                        <StatusUpdater
                          order={order}
                          onUpdate={handleUpdateStatus}
                          loading={updatingId === order._id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between bg-stone-50/40">
            <span className="text-[10px] text-sage-400 font-semibold">
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            {(search || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="text-[10px] text-primary-700 font-bold hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Order Detail Drawer ── */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdate={handleUpdateStatus}
        updatingId={updatingId}
      />

    </div>
  );
};

export default AdminOrders;