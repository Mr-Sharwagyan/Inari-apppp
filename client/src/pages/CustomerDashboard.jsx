import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,Heart,MapPin,ChevronRight,Star,TrendingUp,Leaf,CheckCircle,Truck,RotateCcw,User,LogOut,Settings,Gift,ArrowUpRight,BarChart3,ShoppingCart,AlertCircle,Loader2,X,Edit3,Save,Phone,Home,ShieldCheck,Clock,XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';



// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@400;500;600;700;800&display=swap');`;

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.25)',
  },
  processing: {
    label: 'Processing',
    icon: RotateCcw,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.10)',
    border: 'rgba(139,92,246,0.25)',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.25)',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.10)',
    border: 'rgba(22,163,74,0.25)',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.25)',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
    `Rs. ${new Intl.NumberFormat('en-US').format(amount)}`;

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning 🌿';
  if (h < 17) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ w = '100%', h = 16, r = 8, style = {} }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: r,
      background: 'linear-gradient(90deg, #e8f5e9 25%, #c8e6c9 50%, #e8f5e9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.6s infinite',
      ...style,
    }}
  />
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, accent, loading }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.7)',
      borderRadius: 20,
      padding: '20px 22px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
      transition: 'transform 0.22s, box-shadow 0.22s',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = `0 12px 32px ${accent}25`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)';
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: `${accent}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
      }}
    >
      <Icon size={18} color={accent} />
    </div>
    {loading ? (
      <>
        <Skeleton h={28} w="60%" r={6} />
        <Skeleton h={12} w="80%" r={4} style={{ marginTop: 8 }} />
      </>
    ) : (
      <>
        <div
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 26,
            fontWeight: 400,
            color: '#0f1f10',
            lineHeight: 1,
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
          {label}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 11,
              color: accent,
              marginTop: 5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <ArrowUpRight size={11} /> {sub}
          </div>
        )}
      </>
    )}
  </div>
);

// ─── Order Row ────────────────────────────────────────────────────────────────
const OrderRow = ({ order }) => {
  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const firstItem = order.items?.[0];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '13px 0',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Product image or placeholder */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Leaf size={18} color="#16a34a" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: '#0f1f10',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {firstItem ? firstItem.name : 'Order'}
          {order.items?.length > 1 && (
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>
              {' '}
              +{order.items.length - 1} more
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
          {order._id.substring(0, 8).toUpperCase()} · {formatDate(order.createdAt)}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f1f10' }}>
          {formatCurrency(order.totalAmount)}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          {order.items?.reduce((s, i) => s + i.quantity, 0)} items
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          background: cfg.bg,
          color: cfg.color,
          border: `1px solid ${cfg.border}`,
          borderRadius: 20,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        <StatusIcon size={11} />
        {cfg.label}
      </div>

      {['shipped', 'processing'].includes(order.orderStatus) && (
        <Link
          to={`/track/${order._id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: '#eff6ff',
            color: '#3b82f6',
            border: '1px solid #bfdbfe',
            borderRadius: 20,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700,
            textDecoration: 'none',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          🗺️ Track
        </Link>
      )}
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ item }) => {
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = cartItems.some((c) => c._id === item._id);

  const handleAdd = () => {
    addToCart(item, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.7)',
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'transform 0.28s, box-shadow 0.28s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(22,163,74,0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#f0fdf4' }}>
        {item.images?.[0] ? (
          <img
            src={item.images[0]}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Leaf size={32} color="#bbf7d0" />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: item.status === 'available' ? '#16a34a' : '#ef4444',
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 20,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
          }}
        >
          {item.category}
        </div>
      </div>

      <div style={{ padding: '13px 14px 15px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0f1f10' }}>{item.name}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
          {item.farmerName || 'Local Farm'}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 14, color: '#166534' }}>
            {formatCurrency(item.price)}
            <span style={{ fontSize: 10, fontWeight: 500, color: '#94a3b8' }}>/{item.unit}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#64748b' }}>
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            {item.rating?.toFixed(1) || '4.8'}
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={item.status !== 'available'}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '8px 0',
            borderRadius: 12,
            border: 'none',
            background:
              added || inCart
                ? 'rgba(22,163,74,0.12)'
                : item.status !== 'available'
                  ? '#f1f5f9'
                  : 'linear-gradient(135deg, #166534, #16a34a)',
            color:
              added || inCart
                ? '#16a34a'
                : item.status !== 'available'
                  ? '#94a3b8'
                  : '#fff',
            fontWeight: 700,
            fontSize: 12,
            cursor: item.status !== 'available' ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          {added ? (
            <>
              <CheckCircle size={13} /> Added!
            </>
          ) : inCart ? (
            <>
              <ShoppingCart size={13} /> In Cart
            </>
          ) : item.status !== 'available' ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart size={13} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Settings Panel ───────────────────────────────────────────────────────────
const SettingsPanel = ({ user, onUpdate }) => {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await onUpdate(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.7)',
        borderRadius: 24,
        padding: '28px 32px',
      }}
    >
      <h2
        style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 22,
          color: '#0f1f10',
          marginBottom: 24,
        }}
      >
        Account Settings
      </h2>

      {error && (
        <div
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#dc2626',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 13,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {[
        { label: 'Full Name', key: 'name', icon: User, placeholder: 'Your full name' },
        { label: 'Phone', key: 'phone', icon: Phone, placeholder: '+1 (555) 0000' },
        { label: 'Delivery Address', key: 'address', icon: Home, placeholder: 'Street, City, State' },
      ].map(({ label, key, icon: Icon, placeholder }) => (
        <div key={key} style={{ marginBottom: 18 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <Icon size={12} /> {label}
          </label>
          <input
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 12,
              border: '1.5px solid rgba(0,0,0,0.1)',
              background: 'rgba(240,253,244,0.5)',
              fontSize: 14,
              color: '#0f1f10',
              outline: 'none',
              transition: 'border 0.2s',
              fontFamily: "'Outfit', sans-serif",
            }}
            onFocus={(e) => (e.target.style.border = '1.5px solid #16a34a')}
            onBlur={(e) => (e.target.style.border = '1.5px solid rgba(0,0,0,0.1)')}
          />
        </div>
      ))}

      <div
        style={{
          background: 'rgba(240,253,244,0.6)',
          border: '1px solid rgba(22,163,74,0.15)',
          borderRadius: 14,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 20,
        }}
      >
        <ShieldCheck size={16} color="#16a34a" />
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>Verified Account</div>
          <div style={{ fontSize: 11, color: '#86a87a' }}>{user?.email}</div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '11px 24px',
          borderRadius: 14,
          border: 'none',
          background: saved
            ? 'rgba(22,163,74,0.12)'
            : 'linear-gradient(135deg, #166534, #16a34a)',
          color: saved ? '#16a34a' : '#fff',
          fontWeight: 700,
          fontSize: 14,
          cursor: saving ? 'wait' : 'pointer',
          transition: 'all 0.25s',
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {saving ? (
          <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
        ) : saved ? (
          <><CheckCircle size={14} /> Saved!</>
        ) : (
          <><Save size={14} /> Save Changes</>
        )}
      </button>
    </div>
  );
};

// ─── Orders Panel ──────────────────────────────────────────────────────────────
const OrdersPanel = ({ orders, loading }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.7)',
      borderRadius: 24,
      padding: '28px 32px',
    }}
  >
    <h2
      style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: 22,
        color: '#0f1f10',
        marginBottom: 20,
      }}
    >
      All Orders
    </h2>

    {loading ? (
      [1, 2, 3, 4].map((i) => (
        <div key={i} style={{ padding: '13px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <Skeleton h={14} w="55%" r={4} />
          <Skeleton h={10} w="35%" r={3} style={{ marginTop: 6 }} />
        </div>
      ))
    ) : orders.length === 0 ? (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 0',
          color: '#94a3b8',
        }}
      >
        <Package size={40} color="#d1fae5" style={{ marginBottom: 12 }} />
        <div style={{ fontWeight: 600, fontSize: 15 }}>No orders yet</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>
          Start shopping to see your orders here
        </div>
        <Link
          to="/shop"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 16,
            padding: '10px 22px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #166534, #16a34a)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          Browse Shop <ArrowUpRight size={14} />
        </Link>
      </div>
    ) : (
      orders.map((order) => <OrderRow key={order._id} order={order} />)
    )}
  </div>
);

// ─── Wishlist Placeholder ─────────────────────────────────────────────────────
const WishlistPanel = ({ items, removeFromWishlist }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.7)',
      borderRadius: 24,
      padding: '28px 32px',
    }}
  >
    <h2
      style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: 22,
        color: '#0f1f10',
        marginBottom: 24,
      }}
    >
      Wishlist
    </h2>

    {items.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Heart size={48} color="#fecdd3" />
        <div style={{ marginTop: 14, fontWeight: 600 }}>
          Your wishlist is empty
        </div>
      </div>
    ) : (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
      >
        {items.map((item) => (
          <div
            key={item._id}
            style={{
              background: '#fff',
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid #eee',
            }}
          >
            <img
              src={item.images?.[0]}
              alt={item.name}
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover',
              }}
            />

            <div style={{ padding: 14 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#0f1f10',
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  marginTop: 4,
                }}
              >
                {item.farmerName}
              </div>

              <div
                style={{
                  marginTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: '#166534',
                  }}
                >
                  Rs. {item.price}
                </span>

                <button
                  onClick={() => removeFromWishlist(item._id)}
                  style={{
                    border: 'none',
                    background: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: 10,
                    padding: '6px 10px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Addresses Panel ──────────────────────────────────────────────────────────
const AddressesPanel = ({ user }) => (
  <div
    style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.7)',
      borderRadius: 24,
      padding: '28px 32px',
    }}
  >
    <h2
      style={{
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontSize: 22,
        color: '#0f1f10',
        marginBottom: 20,
      }}
    >
      Saved Addresses
    </h2>

    {user?.address ? (
      <div
        style={{
          background: 'rgba(240,253,244,0.6)',
          border: '1.5px solid rgba(22,163,74,0.2)',
          borderRadius: 16,
          padding: '18px 20px',
          display: 'flex',
          gap: 14,
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: 'rgba(22,163,74,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Home size={16} color="#16a34a" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f1f10' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 3 }}>{user.address}</div>
          {user.phone && (
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {user.phone}
            </div>
          )}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 8,
              background: 'rgba(22,163,74,0.1)',
              color: '#16a34a',
              borderRadius: 20,
              padding: '3px 9px',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <CheckCircle size={10} /> Default
          </div>
        </div>
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
        <MapPin size={40} color="#d1fae5" style={{ marginBottom: 12 }} />
        <div style={{ fontWeight: 600, fontSize: 15 }}>No saved addresses</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>
          Add your address in Account Settings
        </div>
      </div>
    )}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const CustomerDashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const { cartItems, itemsCount } = useCart();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  // ── Fetch orders ──
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await api.get('/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setOrdersError(err.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // ── Fetch products ──
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await api.get('/products?sort=newest');
      const data = Array.isArray(res.data) ? res.data : res.data?.products || [];
      setProducts(data.slice(0, 8));
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, [fetchOrders, fetchProducts]);

  // ── Derived stats ──
  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const inTransit = orders.filter((o) =>
    ['shipped', 'processing', 'pending'].includes(o.orderStatus)
  ).length;
  const delivered = orders.filter((o) => o.orderStatus === 'delivered').length;
  const recentOrders = [...orders].slice(0, 5);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const NAV_LINKS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'transparent',
        fontFamily: "'Outfit', 'Helvetica Neue', sans-serif",
      }}
    >
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; margin: 0; }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #bbf7d0; border-radius: 10px; }
      `}</style>

      <div
        style={{
          display: 'flex',
          maxWidth: 1380,
          margin: '0 auto',
          padding: '28px 20px',
          gap: 24,
          animation: 'fadeUp 0.4s ease both',
        }}
      >
        {/* ── Sidebar ── */}
        <aside style={{ width: 214, flexShrink: 0 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.7)',
              borderRadius: 22,
              padding: '6px 0',
              position: 'sticky',
              top: 24,
            }}
          >
            {/* Profile */}
            <div
              style={{
                padding: '18px 18px 18px',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #14532d, #4ade80)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  fontFamily: "'Instrument Serif', serif",
                }}
              >
                {user?.name?.[0]?.toUpperCase() || <User size={22} color="#fff" />}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#0f1f10',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'Customer'}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.email}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 9,
                  background: 'rgba(22,163,74,0.1)',
                  color: '#16a34a',
                  borderRadius: 20,
                  padding: '3px 9px',
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <Leaf size={9} /> Customer
              </div>
            </div>

            {/* Nav */}
            <nav style={{ padding: '8px 8px' }}>
              {NAV_LINKS.map((link) => {
                const active = activeTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 9,
                      padding: '9px 11px',
                      borderRadius: 12,
                      border: 'none',
                      background: active
                        ? 'linear-gradient(135deg, #14532d, #16a34a)'
                        : 'transparent',
                      color: active ? '#fff' : '#475569',
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all 0.18s',
                      textAlign: 'left',
                      marginBottom: 1,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    <link.icon size={15} />
                    {link.label}
                    {link.id === 'orders' && orders.length > 0 && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: active ? 'rgba(255,255,255,0.25)' : 'rgba(22,163,74,0.12)',
                          color: active ? '#fff' : '#16a34a',
                          borderRadius: 20,
                          padding: '1px 7px',
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {orders.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Cart quick-link */}
            {itemsCount > 0 && (
              <div style={{ padding: '4px 8px 0' }}>
                <Link
                  to="/cart"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '9px 11px',
                    borderRadius: 12,
                    background: 'rgba(59,130,246,0.08)',
                    color: '#3b82f6',
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: 'none',
                  }}
                >
                  <ShoppingCart size={15} />
                  Cart
                  <span
                    style={{
                      marginLeft: 'auto',
                      background: '#3b82f6',
                      color: '#fff',
                      borderRadius: 20,
                      padding: '1px 7px',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {itemsCount}
                  </span>
                </Link>
              </div>
            )}

            {/* Sign out */}
            <div
              style={{
                padding: '8px 8px 6px',
                borderTop: '1px solid rgba(0,0,0,0.05)',
                marginTop: 6,
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '9px 11px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'transparent',
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  transition: 'background 0.18s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'rgba(239,68,68,0.07)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <>
              {/* Welcome Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0a1f0f 0%, #132e1c 55%, #1a4228 100%)',
                  borderRadius: 26,
                  padding: '26px 30px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Decorative blobs */}
                <div
                  style={{
                    position: 'absolute',
                    top: -50,
                    right: 220,
                    width: 220,
                    height: 220,
                    background: 'radial-gradient(circle, rgba(74,222,128,0.13) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -70,
                    right: 50,
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                  }}
                />

                <div style={{ zIndex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#86efac',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {getGreeting()}
                  </div>
                  <h1
                    style={{
                      fontFamily: "'Instrument Serif', Georgia, serif",
                      fontSize: 30,
                      fontWeight: 400,
                      fontStyle: 'italic',
                      color: '#ffffff',
                      marginTop: 4,
                      lineHeight: 1.2,
                    }}
                  >
                    Welcome back, {user?.name?.split(' ')[0] || 'there'}!
                  </h1>
                  <p style={{ color: '#86efac', fontSize: 13, marginTop: 5, fontWeight: 500 }}>
                    {inTransit > 0
                      ? `You have ${inTransit} order${inTransit > 1 ? 's' : ''} on the way.`
                      : 'Fresh produce is waiting for you.'}
                  </p>
                </div>

                <Link
                  to="/shop"
                  style={{
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff',
                    padding: '11px 20px',
                    borderRadius: 14,
                    fontWeight: 700,
                    fontSize: 13,
                    textDecoration: 'none',
                    flexShrink: 0,
                    boxShadow: '0 6px 20px rgba(34,197,94,0.35)',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  Shop Now <ArrowUpRight size={15} />
                </Link>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                <StatCard
                  icon={Package}
                  label="Total Orders"
                  value={ordersLoading ? '—' : orders.length}
                  sub={delivered > 0 ? `${delivered} delivered` : undefined}
                  accent="#22c55e"
                  loading={ordersLoading}
                />
                <StatCard
                  icon={Truck}
                  label="In Transit"
                  value={ordersLoading ? '—' : inTransit}
                  accent="#3b82f6"
                  loading={ordersLoading}
                />
                <StatCard
                  icon={ShoppingCart}
                  label="Cart Items"
                  value={itemsCount}
                  accent="#f59e0b"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Total Spent"
                  value={ordersLoading ? '—' : formatCurrency(totalSpent)}
                  accent="#8b5cf6"
                  loading={ordersLoading}
                />
              </div>

              {/* Orders + Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18 }}>
                {/* Recent Orders */}
                <div
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    borderRadius: 22,
                    padding: '22px 26px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "'Instrument Serif', Georgia, serif",
                        fontSize: 20,
                        color: '#0f1f10',
                      }}
                    >
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => setActiveTab('orders')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        color: '#16a34a',
                        fontWeight: 700,
                        fontSize: 12,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      View All <ChevronRight size={13} />
                    </button>
                  </div>

                  {ordersError && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#dc2626',
                        fontSize: 13,
                        padding: '10px 0',
                      }}
                    >
                      <AlertCircle size={14} /> {ordersError}
                      <button
                        onClick={fetchOrders}
                        style={{
                          marginLeft: 8,
                          color: '#16a34a',
                          fontWeight: 700,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {ordersLoading ? (
                    [1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: 14,
                          padding: '13px 0',
                          borderBottom: '1px solid rgba(0,0,0,0.05)',
                          alignItems: 'center',
                        }}
                      >
                        <Skeleton w={48} h={48} r={12} />
                        <div style={{ flex: 1 }}>
                          <Skeleton h={13} w="60%" r={4} />
                          <Skeleton h={10} w="40%" r={3} style={{ marginTop: 6 }} />
                        </div>
                        <Skeleton w={80} h={24} r={12} />
                      </div>
                    ))
                  ) : recentOrders.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '36px 0',
                        color: '#94a3b8',
                      }}
                    >
                      <Package size={32} color="#d1fae5" style={{ marginBottom: 10 }} />
                      <div style={{ fontSize: 14, fontWeight: 600 }}>No orders yet</div>
                    </div>
                  ) : (
                    recentOrders.map((order) => <OrderRow key={order._id} order={order} />)
                  )}
                </div>

                {/* Summary / Quick Links */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  {/* Loyalty card */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #0a1f0f 0%, #1a4228 100%)',
                      borderRadius: 22,
                      padding: '22px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: -30,
                        right: -20,
                        width: 120,
                        height: 120,
                        background: 'rgba(74,222,128,0.10)',
                        borderRadius: '50%',
                        pointerEvents: 'none',
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 14,
                      }}
                    >
                      <Gift size={15} color="#86efac" />
                      <span style={{ color: '#86efac', fontWeight: 700, fontSize: 12 }}>
                        Harvest Rewards
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: 32,
                        color: '#fff',
                      }}
                    >
                      {orders.length * 100}{' '}
                      <span style={{ fontSize: 15, color: '#86efac' }}>pts</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#86efac', marginTop: 4 }}>
                      {Math.max(0, 3000 - orders.length * 100)} pts to Platinum tier
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        height: 6,
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, (orders.length * 100) / 3000 * 100)}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #22c55e, #86efac)',
                          borderRadius: 4,
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.7)',
                      borderRadius: 22,
                      padding: '18px 20px',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "'Instrument Serif', serif",
                        fontSize: 16,
                        color: '#0f1f10',
                        marginBottom: 14,
                      }}
                    >
                      Quick Actions
                    </h3>
                    {[
                      { label: 'Browse Shop', icon: ShoppingCart, to: '/shop', color: '#16a34a' },
                      { label: 'View Cart', icon: ShoppingCart, to: '/cart', color: '#3b82f6', badge: itemsCount },
                      { label: 'My Orders', icon: Package, tab: 'orders', color: '#8b5cf6' },
                      { label: 'Settings', icon: Settings, tab: 'settings', color: '#f59e0b' },
                    ].map((action, i) =>
                      action.to ? (
                        <Link
                          key={i}
                          to={action.to}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '9px 10px',
                            borderRadius: 11,
                            color: action.color,
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: 13,
                            transition: 'background 0.18s',
                            marginBottom: 2,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = `${action.color}0f`)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'transparent')
                          }
                        >
                          <action.icon size={14} />
                          {action.label}
                          {action.badge > 0 && (
                            <span
                              style={{
                                marginLeft: 'auto',
                                background: action.color,
                                color: '#fff',
                                borderRadius: 20,
                                padding: '1px 7px',
                                fontSize: 10,
                                fontWeight: 800,
                              }}
                            >
                              {action.badge}
                            </span>
                          )}
                        </Link>
                      ) : (
                        <button
                          key={i}
                          onClick={() => setActiveTab(action.tab)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '9px 10px',
                            borderRadius: 11,
                            border: 'none',
                            background: 'transparent',
                            color: action.color,
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.18s',
                            marginBottom: 2,
                            fontFamily: "'Outfit', sans-serif",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = `${action.color}0f`)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'transparent')
                          }
                        >
                          <action.icon size={14} />
                          {action.label}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Recommended Products */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: "'Instrument Serif', Georgia, serif",
                        fontSize: 24,
                        color: '#0f1f10',
                      }}
                    >
                      Fresh From the Farm
                    </h2>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                      Latest available produce
                    </p>
                  </div>
                  <Link
                    to="/shop"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: '#16a34a',
                      fontWeight: 700,
                      fontSize: 12,
                      textDecoration: 'none',
                    }}
                  >
                    Browse All <ChevronRight size={13} />
                  </Link>
                </div>

                {productsLoading ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 16,
                    }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          borderRadius: 20,
                          overflow: 'hidden',
                          background: 'rgba(255,255,255,0.8)',
                          border: '1px solid rgba(255,255,255,0.7)',
                        }}
                      >
                        <Skeleton h={160} r={0} style={{ borderRadius: 0 }} />
                        <div style={{ padding: '13px 14px 15px' }}>
                          <Skeleton h={14} w="70%" r={4} />
                          <Skeleton h={10} w="50%" r={3} style={{ marginTop: 8 }} />
                          <Skeleton h={30} r={10} style={{ marginTop: 12 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#94a3b8',
                      background: 'rgba(255,255,255,0.7)',
                      borderRadius: 20,
                    }}
                  >
                    No products available right now.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 16,
                    }}
                  >
                    {products.map((item) => (
                      <ProductCard key={item._id} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Spacer */}
              <div style={{ paddingBottom: 32 }} />
            </>
          )}

          {/* Tab: Orders */}
          {activeTab === 'orders' && (
            <OrdersPanel orders={orders} loading={ordersLoading} />
          )}

          {/* Tab: Wishlist */}
          {activeTab === 'wishlist' && (
            <WishlistPanel
              items={wishlistItems}
              removeFromWishlist={removeFromWishlist}
            />
          )}

          {/* Tab: Addresses */}
          {activeTab === 'addresses' && <AddressesPanel user={user} />}

          {/* Tab: Settings */}
          {activeTab === 'settings' && (
            <SettingsPanel user={user} onUpdate={updateProfile} />
          )}
        </main>
      </div>
    </div>
  );
};

export default CustomerDashboard;