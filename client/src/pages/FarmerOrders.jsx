import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  ShoppingBag, Clock, CheckCircle2, Truck, XCircle, ChevronRight, 
  MapPin, Calendar, DollarSign, ListOrdered, User, ExternalLink
} from 'lucide-react';
import { TableSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const FarmerOrders = () => {
  const { user } = useAuth();
  const showToast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/farmer');
      setOrders(res.data);
    } catch (err) {
      console.error('Farmer orders load error:', err);
      showToast('Failed to load order queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order status updated to: ${newStatus}`, 'success');
      // Update local state instead of full reload to feel extremely responsive
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (err) {
      console.error('Order status update error:', err);
      showToast('Failed to update order status.', 'error');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'processing':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-stone-50 text-stone-850 border-stone-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5 text-amber-650" />;
      case 'processing':
        return <ListOrdered className="w-3.5 h-3.5 text-blue-650" />;
      case 'shipped':
        return <Truck className="w-3.5 h-3.5 text-indigo-650" />;
      case 'delivered':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-650" />;
      case 'cancelled':
        return <XCircle className="w-3.5 h-3.5 text-red-650" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.orderStatus === filterStatus
  );

  // Calculate stats
  const pendingCount = orders.filter(o => o.orderStatus === 'pending').length;
  const processingCount = orders.filter(o => o.orderStatus === 'processing').length;
  const shippedCount = orders.filter(o => o.orderStatus === 'shipped').length;
  const completedCount = orders.filter(o => o.orderStatus === 'delivered').length;

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="text-left">
        <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight">Order Queue Fulfillment</h2>
        <p className="text-xs text-sage-455 mt-0.5">Package customer harvest logs, verify payments, and coordinate supply chain shipping details.</p>
      </div>

      {/* Analytics Mini Ledger Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200/60 p-4 rounded-xl shadow-soft space-y-1">
          <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Pending Packing</span>
          <div className="text-xl font-extrabold text-amber-700">{pendingCount} orders</div>
        </div>
        <div className="bg-white border border-stone-200/60 p-4 rounded-xl shadow-soft space-y-1">
          <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">In Processing</span>
          <div className="text-xl font-extrabold text-blue-700">{processingCount} orders</div>
        </div>
        <div className="bg-white border border-stone-200/60 p-4 rounded-xl shadow-soft space-y-1">
          <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Shipped / Transiting</span>
          <div className="text-xl font-extrabold text-indigo-700">{shippedCount} batches</div>
        </div>
        <div className="bg-white border border-stone-200/60 p-4 rounded-xl shadow-soft space-y-1">
          <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Delivered Goods</span>
          <div className="text-xl font-extrabold text-emerald-700">{completedCount} total</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              filterStatus === status 
                ? 'bg-primary-900 text-white shadow-soft' 
                : 'text-sage-500 hover:text-primary-950 hover:bg-stone-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Grid/List */}
      {loading ? (
        <div className="space-y-4">
          <TableSkeleton rows={3} cols={4} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-stone-200/60 p-12 rounded-3xl text-center space-y-3 shadow-soft flex flex-col items-center">
          <ShoppingBag className="w-10 h-10 text-sage-355" />
          <div>
            <h3 className="font-bold text-base text-primary-950">No orders in queue</h3>
            <p className="text-xs text-sage-500">When customers purchase crops from the marketplace, they will populate here for packing.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            // Sum only this farmer's subtotal
            const farmerSubtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            return (
              <div 
                key={order._id} 
                className="bg-white border border-stone-200/60 rounded-2xl shadow-soft overflow-hidden hover:shadow-md transition-all border-l-4 border-l-primary-900"
              >
                
                {/* Order Top Summary Bar */}
                <div className="bg-stone-50/50 p-4 border-b border-stone-150/60 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-primary-950">
                        ORDER #{order._id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${getStatusStyle(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-sage-450 font-semibold">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-sage-400 font-bold block leading-none">Fulfillment Subtotal</span>
                      <span className="text-sm font-extrabold text-primary-950">${farmerSubtotal.toFixed(2)}</span>
                    </div>
                    
                    {/* Status Fulfill Action Selector */}
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="border border-stone-200/80 bg-white p-2 rounded-xl text-xs font-bold text-primary-950 focus:border-primary-500 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Pack (Processing)</option>
                      <option value="shipped">Fulfill (Shipped)</option>
                      <option value="delivered">Complete (Delivered)</option>
                      <option value="cancelled">Cancel Order</option>
                    </select>
                  </div>
                </div>

                {/* Order Content Panel */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left: Crop Items lists */}
                  <div className="lg:col-span-2 space-y-3.5">
                    <span className="text-[10px] text-sage-400 font-extrabold uppercase tracking-wider block">Packed Commodities</span>
                    <div className="divide-y divide-stone-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-primary-950 text-sm">{item.name}</span>
                            <span className="text-[10px] text-sage-450 block">Quantity: {item.quantity} {item.unit || 'kg'}</span>
                          </div>
                          <div className="text-right font-semibold">
                            <span className="text-sage-500 block text-[10px]">${item.price.toFixed(2)} / unit</span>
                            <span className="text-primary-950 font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Shipping coordinates */}
                  <div className="bg-beige-50/50 p-4 rounded-xl border border-stone-150/70 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-sage-400 font-extrabold uppercase tracking-wider">
                        <User className="w-3.5 h-3.5" />
                        <span>Client Shipping Details</span>
                      </div>
                      <div className="text-xs text-primary-950 space-y-1">
                        <div className="font-bold">{order.shippingAddress?.name || 'Customer Profile'}</div>
                        <div className="text-sage-600 flex items-start gap-1.5 mt-1.5">
                          <MapPin className="w-3.5 h-3.5 text-sage-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">
                            {order.shippingAddress?.street}, <br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.zip || 'Zip Code'}
                          </span>
                        </div>
                        <div className="text-sage-500 mt-1 text-[10px] font-bold">
                          Phone: {order.shippingAddress?.phone || 'Not provided'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200/50 flex justify-between items-center text-[10px] font-bold">
                      <span className="text-sage-400 uppercase">Payment Status</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-150">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default FarmerOrders;
