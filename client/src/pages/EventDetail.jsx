import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Calendar, Flame, ShoppingBag, ArrowLeft, Trash2,
  Package, Tag, AlertCircle, Users
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/SkeletonLoader';
import { getCustomerPrice } from '../context/CartContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const showToast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        showToast('Event not found.', 'error');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  // Live countdown
  useEffect(() => {
  if (!event?.startDate || !event?.endDate) return;

  const tick = () => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    let diff;
    let prefix = "";

    if (now < start) {
      // BEFORE EVENT STARTS
      diff = start - now;
      prefix = "Starts in";
    } else if (now >= start && now <= end) {
      // DURING EVENT
      diff = end - now;
      prefix = "Ends in";
    } else {
      // EVENT ENDED
      setTimeLeft("Event Ended");
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const formatted =
      d > 0
        ? `${d}d ${h}h ${m}m`
        : `${h}h ${m}m ${s}s`;

    setTimeLeft(`${prefix} ${formatted}`);
  };

  tick();
  const timer = setInterval(tick, 1000);

  return () => clearInterval(timer);
}, [event?.startDate, event?.endDate]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    try {
      await api.delete(`/events/${id}`);
      showToast('Event deleted.', 'success');
      navigate('/events');
    } catch (err) {
      showToast(err.message || 'Failed to delete event.', 'error');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const TYPE_COLORS = {
    bazaar: 'bg-emerald-100 text-emerald-800',
    hot_sale: 'bg-red-100 text-red-800',
    festival: 'bg-purple-100 text-purple-800',
    flash_sale: 'bg-orange-100 text-orange-800',
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="bg-stone-200 animate-pulse h-72 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link
          to="/events"
          className="flex items-center gap-2 text-xs font-bold text-sage-500 hover:text-primary-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>
        {(user?.role === 'farmer' || user?.role === 'admin') && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" /> Delete Event
          </button>
        )}
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8" style={{ minHeight: 320 }}>
        <img
          src={event.bannerImage || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=85&w=1800'}
          alt={event.title}
          className="w-full h-72 object-cover"
          style={{ filter: 'brightness(0.65)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Event type badge */}
        <div className="absolute top-5 left-5">
          <span className={`text-xs px-3 py-1.5 rounded-full font-extrabold uppercase ${TYPE_COLORS[event.type] || 'bg-primary-100 text-primary-800'}`}>
            {event.type?.replace('_', ' ')}
          </span>
        </div>

        {/* Countdown badge */}
        <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 border border-white/20">
          <Clock className="w-3.5 h-3.5 text-red-400" />
          {timeLeft}
        </div>

        {/* Title over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-extrabold text-white leading-tight tracking-tight mb-2">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-xs text-white/75 font-semibold">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(event.startDate).toLocaleDateString()} — {new Date(event.endDate).toLocaleDateString()}
            </span>
            {event.products?.length > 0 && (
              <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />{event.products.length} products featured</span>
            )}
          </div>
        </div>
      </div>

      {/* Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft md:col-span-2">
          <h2 className="text-sm font-extrabold text-primary-950 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" /> About This Event
          </h2>
          <p className="text-sm text-sage-600 leading-relaxed">{event.description}</p>
        </div>
        <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft space-y-3">
          <h2 className="text-sm font-extrabold text-primary-950 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" /> Event Timeline
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-sage-400 font-semibold">Starts</span>
              <span className="font-bold text-primary-950">{new Date(event.startDate).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sage-400 font-semibold">Ends</span>
              <span className="font-bold text-primary-950">{new Date(event.endDate).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-stone-100 pt-2">
              <span className="text-sage-400 font-semibold">Time Left</span>
              <span className="font-extrabold text-red-600">{timeLeft}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sage-400 font-semibold">Status</span>
              <span className={`font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-full ${event.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>
                {event.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <h2 className="text-xl font-extrabold text-primary-950 tracking-tight mb-6 flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary-600" />
          Featured Products
          {event.products?.length > 0 && (
            <span className="text-xs font-bold text-sage-400 ml-1">({event.products.length} items)</span>
          )}
        </h2>

        {!event.products || event.products.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center space-y-3">
            <AlertCircle className="w-10 h-10 text-sage-300" />
            <p className="text-sm font-semibold text-sage-500">No products featured in this event yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {event.products.map((product) => {
              const customerPrice = getCustomerPrice(product.price);
              return (
                <div
                  key={product._id}
                  className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden hover:shadow-soft-lg hover:border-primary-200 transition-all duration-300 group flex flex-col"
                >
                  <Link to={`/products/${product._id}`} className="block aspect-[4/3] overflow-hidden bg-stone-100">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/products/${product._id}`} className="font-bold text-sm text-primary-950 hover:text-primary-700 leading-tight mb-1">
                      {product.name}
                    </Link>
                    <p className="text-[11px] text-sage-400 line-clamp-2 mb-3">{product.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <div className="text-base font-extrabold text-primary-950">Rs.{customerPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-sage-400">per {product.unit}</div>
                      </div>
                      {product.stock > 0 ? (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-primary-900 hover:bg-primary-950 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 uppercase">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;