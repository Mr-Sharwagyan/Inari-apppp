import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  DollarSign, ShoppingBag, Sprout, Layers,
  AlertTriangle, ArrowUpRight, IndianRupee,
  PackageOpen, TrendingUp, Info
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { KpiSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const COLORS = ['#51CF66','#4ECDC4','#45B7D1','#FFA94D','#845EF7','#FF6B6B','#FFD43B','#F06595'];

// ── Empty state shown inside charts when there is no data yet ──────────────
const EmptyChart = ({ message = 'No data yet' }) => (
  <div style={{
    height: '100%', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    color: '#94a3b8',
  }}>
    <TrendingUp size={32} strokeWidth={1.2} />
    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{message}</p>
    <p style={{ fontSize: 11, margin: 0 }}>Data will appear once you receive orders.</p>
  </div>
);

// ── Zero-safe KPI card ─────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, subColor = 'text-emerald-700', icon: Icon, warn }) => (
  <div className={`bg-white border p-5 rounded-2xl shadow-soft flex items-center justify-between transition-all ${
    warn ? 'border-amber-200 bg-amber-50/20' : 'border-stone-200/60'
  }`}>
    <div className="space-y-2">
      <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">
        {label}
      </span>
      <div className="text-2xl font-extrabold text-primary-950">{value}</div>
      {sub && (
        <span className={`text-[10px] font-bold flex items-center gap-0.5 ${subColor}`}>
          {sub}
        </span>
      )}
    </div>
    <div className={`p-3.5 rounded-xl border ${
      warn
        ? 'bg-amber-100/60 text-amber-800 border-amber-200/30'
        : 'bg-primary-50 text-primary-900 border-primary-100'
    }`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

const FarmerOverview = () => {
  const showToast = useToast();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/farmer');
        setData(res.data);
      } catch (err) {
        console.error('Analytics load error:', err);
        showToast('Failed to load ERP metrics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <div><ChartSkeleton /></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, charts } = data;

  // Derived booleans — drive empty-state rendering
  const hasOrders    = summary.totalOrders > 0;
  const hasProducts  = summary.totalProducts > 0;
  const hasRevenue   = summary.totalRevenue > 0;
  const hasChartData = charts.monthlyRevenue.some(m => m.Revenue > 0);
  const hasPieData   = charts.categoryBreakdown.length > 0;

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="text-left">
        <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight">ERP Dashboard</h2>
        <p className="text-xs text-sage-450 mt-0.5">
          Real-time metrics, warehouse volumes, and crop demand forecasts.
        </p>
      </div>

      {/* ── New farmer notice ── */}
      {!hasOrders && !hasProducts && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200/60 rounded-2xl px-5 py-4">
          <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Welcome!</strong> Your dashboard starts at zero. Add your first products and
            receive orders — all metrics will update here in real time.
          </p>
        </div>
      )}

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <KpiCard
          label="Total Revenue"
          icon={IndianRupee}
          value={`Rs.${summary.totalRevenue.toLocaleString()}`}
          sub={
            hasRevenue
              ? <><ArrowUpRight className="w-3 h-3 inline" /> Updated from your orders</>
              : 'No revenue yet'
          }
          subColor={hasRevenue ? 'text-emerald-700' : 'text-sage-400'}
        />

        <KpiCard
          label="Marketplace Orders"
          icon={ShoppingBag}
          value={summary.totalOrders}
          sub={
            hasOrders
              ? `${summary.unitsSold} units shipped`
              : 'No orders yet'
          }
          subColor={hasOrders ? 'text-primary-600' : 'text-sage-400'}
        />

        <KpiCard
          label="Silo Stocks"
          icon={Layers}
          value={summary.totalInventoryCount.toLocaleString()}
          sub={
            hasProducts
              ? `Across ${summary.totalProducts} active crop${summary.totalProducts !== 1 ? 's' : ''}`
              : 'No products listed yet'
          }
          subColor={hasProducts ? 'text-sage-450' : 'text-sage-400'}
        />

        <KpiCard
          label="Alert Ledger"
          icon={AlertTriangle}
          value={<>{summary.lowStockCount} <span className="text-xs text-sage-400 font-bold">warnings</span></>}
          sub={
            summary.lowStockCount > 0
              ? '⚠️ Low stock thresholds breached'
              : hasProducts
                ? 'All systems operating normal'
                : 'Add products to track stock'
          }
          subColor={
            summary.lowStockCount > 0
              ? 'text-amber-700 animate-pulse'
              : 'text-emerald-700'
          }
          warn={summary.lowStockCount > 0}
        />

      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area chart — Monthly Revenue */}
        <div className="lg:col-span-2 bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider">
              Revenue Flow Trends (Rs.)
            </h3>
            <span className="text-[10px] font-semibold text-sage-400">Past 6 months</span>
          </div>

          <div className="h-72 w-full text-xs">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#47896d" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#47896d" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0CE" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#899f86" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#899f86" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: '1px solid #E5DFD3',
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                    formatter={(val) => [`Rs.${val.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="#47896d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="Sales"   stroke="#aa8c5e" strokeWidth={1.5} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No revenue data yet" />
            )}
          </div>
        </div>

        {/* Pie chart — Category breakdown */}
        <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider">
              Stock Share by Category
            </h3>
          </div>

          <div className="h-72 w-full text-xs flex flex-col justify-center items-center">
            {hasPieData ? (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={charts.categoryBreakdown}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {charts.categoryBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [val.toLocaleString(), name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-3 text-[10px] font-bold text-sage-900">
                  {charts.categoryBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChart message="No products listed yet" />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default FarmerOverview;