import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  Users, UserCheck, ShieldAlert, DollarSign, Sprout, ShoppingBag, 
  Search, Check, X, ShieldAlert as AlertIcon, Calendar, Mail, FileText,
  IndianRupee
} from 'lucide-react';
import { TableSkeleton, KpiSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const AdminDashboard = () => {
  const showToast = useToast();

  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);

      const analyticsRes = await api.get('/analytics/admin');
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Admin portal load error:', err);
      showToast('Failed to load system administration ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      showToast(`User status updated to ${newStatus.toUpperCase()}`, 'success');
      loadData(); // Reload to refresh both users list and pending KPI numbers
    } catch (err) {
      console.error('User status update error:', err);
      showToast('Failed to update user registration status.', 'error');
    }
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
        </div>
        <TableSkeleton rows={4} cols={5} />
      </div>
    );
  }

  const { summary } = analytics || {
    summary: { totalFarmers: 0, totalCustomers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, pendingApprovals: 0 }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="text-left">
        <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight">System Control Panel</h2>
        <p className="text-xs text-sage-455 mt-0.5">Validate registrations, monitor transactions, and oversee platform status.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Platform Revenue */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Gross Transactions</span>
            <div className="text-2xl font-extrabold text-primary-950">Rs.{summary.totalRevenue.toLocaleString()}</div>
            <span className="text-[10px] text-sage-450 font-bold">Total platform sales flow</span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100">
            <IndianRupee className="w-5 h-5" />
          </div>
        </div>

        {/* Farmers Count */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Registered Farmers</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.totalFarmers}</div>
            <span className="text-[10px] text-sage-450 font-bold">{summary.totalProducts} active marketplace crops</span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100">
            <Sprout className="w-5 h-5" />
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Platform Clients</span>
            <div className="text-2xl font-extrabold text-primary-950">{summary.totalCustomers}</div>
            <span className="text-[10px] text-sage-450 font-bold">{summary.totalOrders} total checkout orders</span>
          </div>
          <div className="bg-primary-50 text-primary-900 p-3.5 rounded-xl border border-primary-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Approvals alert card */}
        <div className={`bg-white border p-5 rounded-2xl shadow-soft flex items-center justify-between transition-all ${
          summary.pendingApprovals > 0 ? 'border-amber-200 bg-amber-50/20' : 'border-stone-200/60'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Pending Farmer Approvals</span>
            <div className="text-2xl font-extrabold text-primary-950">
              {summary.pendingApprovals} <span className="text-xs text-sage-455 font-bold">pending</span>
            </div>
            <span className={`text-[10px] font-bold ${summary.pendingApprovals > 0 ? 'text-amber-700 animate-pulse' : 'text-emerald-700'}`}>
              {summary.pendingApprovals > 0 ? '⚠️ Verification queue holds profiles' : 'All farmer profiles active'}
            </span>
          </div>
          <div className={`p-3.5 rounded-xl border ${
            summary.pendingApprovals > 0 
              ? 'bg-amber-100/60 text-amber-800 border-amber-250/30' 
              : 'bg-primary-50 text-primary-900 border-primary-100'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* User Management Ledger Section */}
      <div className="space-y-4">
        
        {/* Table Filters header */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white border border-stone-200/60 p-4 rounded-2xl shadow-soft">
          
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-3 w-4 h-4 text-sage-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filter by Role */}
            <div className="flex items-center gap-1.5 text-xs text-sage-500 font-semibold">
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-stone-200 bg-white px-2.5 py-1.5 rounded-xl text-xs font-bold text-primary-950 focus:border-primary-500 outline-none"
              >
                <option value="all">All Roles</option>
                <option value="farmer">Farmers</option>
                <option value="customer">Customers</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 text-xs text-sage-500 font-semibold">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-stone-200 bg-white px-2.5 py-1.5 rounded-xl text-xs font-bold text-primary-950 focus:border-primary-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

          </div>

        </div>

        {/* Users Table */}
        {loading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white border border-stone-200/60 p-12 rounded-3xl text-center space-y-3 shadow-soft flex flex-col items-center">
            <Users className="w-10 h-10 text-sage-355" />
            <div>
              <h3 className="font-bold text-base text-primary-950">No users found</h3>
              <p className="text-xs text-sage-500">No registered profiles matched your current filter criteria.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/70 border-b border-stone-200/50 text-sage-500 font-extrabold uppercase tracking-wider">
                    <th className="p-4">User Detail</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">System Role</th>
                    <th className="p-4">Member Since</th>
                    <th className="p-4">Farming Status</th>
                    <th className="p-4 text-right">Approval Actions</th>
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
                            <div className="font-bold text-sm leading-tight">{u.name}</div>
                            {u.phone && (
                              <div className="text-[10px] text-sage-400 mt-0.5 font-semibold">Ph: {u.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-sage-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-sage-400 shrink-0" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          u.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : u.role === 'farmer' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-blue-105 text-blue-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-sage-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sage-400 shrink-0" />
                          <span>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.role === 'farmer' ? (
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            u.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : u.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            {u.status}
                          </span>
                        ) : (
                          <span className="text-[10px] text-sage-400 font-semibold uppercase italic">Auto-Approved</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {u.role === 'farmer' && u.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(u._id, 'approved')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                              title="Approve Farmer Profile"
                            >
                              <Check className="w-4 h-4" />
                              <span className="text-[9px] pr-1">Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(u._id, 'rejected')}
                              className="bg-red-650 hover:bg-red-750 text-white font-bold p-1.5 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                              title="Reject Farmer Profile"
                            >
                              <X className="w-4 h-4" />
                              <span className="text-[9px] pr-1">Reject</span>
                            </button>
                          </div>
                        ) : u.role === 'farmer' ? (
                          <div className="flex justify-end gap-1.5">
                            {u.status === 'approved' ? (
                              <button
                                onClick={() => handleUpdateStatus(u._id, 'rejected')}
                                className="text-[10px] text-red-600 hover:underline font-bold"
                              >
                                Revoke Approval
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(u._id, 'approved')}
                                className="text-[10px] text-emerald-600 hover:underline font-bold"
                              >
                                Activate Profile
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-sage-400 font-medium italic">No actions needed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default AdminDashboard;
