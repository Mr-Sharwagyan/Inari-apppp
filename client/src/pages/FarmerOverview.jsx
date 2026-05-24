import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { DollarSign, ShoppingBag, Sprout, Layers, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { KpiSkeleton, ChartSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const COLORS = ['#234737', '#47896d', '#899f86', '#aa8c5e', '#684d37'];

const FarmerOverview = () => {
  const showToast = useToast();
  const [data, setData] = useState(null);
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

  const { summary, charts } = data;

  return (
    <div className="space-y-8">
      
      {/* 1. Dashboard Top Header */}
      <div className="text-left">
        <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight">ERP Dashboard</h2>
        <p className="text-xs text-sage-450 mt-0.5">Real-time metrics, warehouse volumes, and crop demand forecasts.</p>
      </div>

      {/* 2. KPI Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Total Revenue</span>
            <div className="text-2xl font-extrabold text-primary-950">${summary.totalRevenue.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" />
              +12.4% vs last month
            </span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Marketplace Orders</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.totalOrders}</div>
            <span className="text-[10px] text-primary-600 font-bold">
              {summary.unitsSold} units shipped
            </span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Silo Stocks</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.totalInventoryCount.toLocaleString()}</div>
            <span className="text-[10px] text-sage-450 font-bold">
              Across {summary.totalProducts} active crops
            </span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Warnings */}
        <div className={`bg-white border p-5 rounded-2xl shadow-soft flex items-center justify-between transition-all ${
          summary.lowStockCount > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-stone-200/60'
        }`}>
          <div className="space-y-2">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Alert Ledger</span>
            <div className="text-2xl font-extrabold text-primary-950">
              {summary.lowStockCount} <span className="text-xs text-sage-400 font-bold">warnings</span>
            </div>
            <span className={`text-[10px] font-bold ${summary.lowStockCount > 0 ? 'text-amber-700 animate-pulse' : 'text-emerald-700'}`}>
              {summary.lowStockCount > 0 ? '⚠️ Low stock thresholds breached' : 'All systems operating normal'}
            </span>
          </div>
          <div className={`p-3.5 rounded-xl border ${
            summary.lowStockCount > 0 
              ? 'bg-amber-100/60 text-amber-800 border-amber-250/30' 
              : 'bg-primary-50 text-primary-900 border-primary-100'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. Recharts Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Revenue (Area Chart) */}
        <div className="lg:col-span-2 bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider">Revenue Flow Trends ($)</h3>
            <span className="text-[10px] font-semibold text-sage-400">Past 6 months</span>
          </div>
          
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#47896d" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#47896d" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E0CE" opacity={0.3} />
                <XAxis dataKey="name" stroke="#899f86" />
                <YAxis stroke="#899f86" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #E5DFD3',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }} 
                />
                <Area type="monotone" dataKey="Revenue" stroke="#47896d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="Sales" stroke="#aa8c5e" strokeWidth={1.5} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Breakdown (Pie Chart) */}
        <div className="bg-white border border-stone-200/60 p-6 rounded-2xl shadow-soft flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-sm text-primary-950 uppercase tracking-wider">Stock Share by Category</h3>
          </div>
          
          <div className="h-72 w-full text-xs relative flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={charts.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Labels ledger list */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-3 text-[10px] font-bold text-sage-600">
              {charts.categoryBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default FarmerOverview;
