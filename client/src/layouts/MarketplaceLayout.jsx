import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X, Bell, Tractor } from 'lucide-react';
import api from '../services/api';

const MarketplaceLayout = () => {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications if logged in
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data);
        } catch (err) {
          console.error('Failed to load notifications:', err.message);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      {/* Premium Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-stone-200/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
                <img
                  src="/uploads/logo2.png"
                  alt="Inari Logo"
                  className="h-12 w-auto group-hover:scale-105 transition-transform duration-200"
                />

              <span className="font-extrabold text-xl tracking-tight text-primary-950">
                INARI<span className="text-primary-500 font-medium">.</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/"
                className={`text-sm font-semibold transition-colors duration-200 ${
                  location.pathname === '/' ? 'text-primary-800' : 'text-sage-500 hover:text-primary-900'
                }`}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={`text-sm font-semibold transition-colors duration-200 ${
                  location.pathname === '/shop' ? 'text-primary-800' : 'text-sage-500 hover:text-primary-900'
                }`}
              >
                Marketplace
              </Link>
              <Link
                to="/community"
                className={`text-sm font-semibold transition-colors duration-200 ${
                  location.pathname === '/community' ? 'text-primary-800' : 'text-sage-500 hover:text-primary-900'
                }`}
              >
                Community
              </Link>
              
              <Link
                to="/events"
                className={`text-sm font-semibold transition-colors duration-200 ${
                  location.pathname === '/events' ? 'text-primary-800' : 'text-sage-500 hover:text-primary-900'
                }`}
              >
                Events
              </Link>
              {user?.role === 'farmer' && (
                <Link
                  to="/farmer"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-900 flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Farmer ERP
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-900 flex items-center gap-1.5"
                >
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Actions Panel */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notification Bell */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-sage-500 hover:text-primary-900 hover:bg-stone-100 rounded-xl transition-all"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Overlay Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl p-4 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-sm text-primary-950">Notifications</h4>
                        <span className="text-xs text-sage-400">{unreadCount} unread</span>
                      </div>
                      <div className="space-y-2">
                        {notifications.length === 0 ? (
                          <div className="text-center py-4 text-xs text-sage-400">No notifications</div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleMarkAsRead(notif._id)}
                              className={`p-2.5 rounded-xl transition-colors cursor-pointer text-xs border ${
                                notif.read 
                                  ? 'bg-stone-50/50 border-stone-100 text-sage-600' 
                                  : 'bg-emerald-50/50 border-emerald-100 text-emerald-950 font-medium'
                              }`}
                            >
                              <div className="font-bold mb-0.5">{notif.title}</div>
                              <div>{notif.message}</div>
                              <div className="text-[10px] text-sage-400 mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Shopping Cart */}
              <Link
                to="/cart"
                className="relative p-2.5 bg-primary-50/80 hover:bg-primary-100 text-primary-900 rounded-xl transition-all flex items-center justify-center border border-primary-200/40"
              >
                <ShoppingBag className="w-5 h-5" /> Cart
                {itemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary-700 text-[#FAF9F5] text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {itemsCount}
                  </span>
                )}
              </Link>

              {/* User Account / Login */}
              {user ? (
                <div className="flex items-center gap-3 border-l border-stone-200 pl-4">
                  <Link
                    to={user.role === 'farmer' ? '/farmer' : '/dashboard'}
                    className="flex items-center gap-2 text-sage-700 hover:text-primary-900 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-beige-200 border border-beige-300 flex items-center justify-center font-bold text-sm text-beige-800">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold hidden lg:inline">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="p-2 text-sage-400 hover:text-red-650 hover:bg-red-50 rounded-xl transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-primary hover:bg-gray-200 text-[#846e19] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Actions Drawer toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <Link to="/cart" className="relative p-2.5 text-sage-600 hover:text-primary-900">
                <ShoppingBag className="w-5.5 h-5.5" />
                {itemsCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-700 text-[#FAF9F5] text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                    {itemsCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-sage-600 hover:text-primary-900 hover:bg-stone-150 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-lg px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-sage-700 hover:bg-stone-50 hover:text-primary-900"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-sage-700 hover:bg-stone-50 hover:text-primary-900"
            >
              Marketplace
            </Link>
            {user?.role === 'farmer' && (
              <Link
                to="/farmer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-semibold text-primary-700 hover:bg-primary-50"
              >
                Farmer ERP
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-semibold text-primary-700 hover:bg-primary-50"
              >
                Admin Panel
              </Link>
            )}
            {user ? (
              <div className="pt-4 border-t border-stone-200 space-y-1">
                <Link
                  to={user.role === 'farmer' ? '/farmer' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-semibold text-sage-700 hover:bg-stone-50"
                >
                  My Dashboard ({user.name})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="w-full text-left block px-3 py-2 rounded-xl text-base font-semibold text-red-650 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center mt-4 bg-primary-900 text-white px-4 py-2.5 rounded-xl font-bold"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main View Container */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary-950 text-[#FAF9F5] border-t border-primary-900/50 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            <div className="space-y-4">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                <img
                  src="/uploads/logo2.png"
                  alt="Inari Logo"
                  className="h-12 w-auto group-hover:scale-105 transition-transform duration-200"
                />
                INARI<span className="text-primary-400 font-medium">.</span>
              </span>
              <p className="text-xs text-sage-400/90 leading-relaxed">
                Empowering modern agricultural supply chains through software. ERP for local farmers, transparent direct marketplaces for buyers.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-primary-400 mb-4">SaaS Platform</h5>
              <ul className="space-y-2.5 text-xs text-sage-400">
                <li><Link to="/farmer" className="hover:text-white transition-colors">Farmer ERP</Link></li>
                <li><Link to="/shop" className="hover:text-white transition-colors">Direct Marketplace</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Supply Chain Ledger</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Yield Forecasts</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-primary-400 mb-4">Marketplace</h5>
              <ul className="space-y-2.5 text-xs text-sage-400">
                <li><Link to="/shop?category=grains" className="hover:text-white transition-colors">Grains & Cereals</Link></li>
                <li><Link to="/shop?category=vegetables" className="hover:text-white transition-colors">Organic Greens</Link></li>
                <li><Link to="/shop?category=fruits" className="hover:text-white transition-colors">Fresh Harvest Fruits</Link></li>
                <li><Link to="/shop?category=dairy" className="hover:text-white transition-colors">Farm Dairy</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-primary-400 mb-4">Company</h5>
              <ul className="space-y-2.5 text-xs text-sage-400">
                <li><a href="#" className="hover:text-white transition-colors">About Sustainable Agri</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developer API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Security</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-primary-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-sage-400/80">
            <div>
              © 2026 INARI Technologies Inc. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white">
                Terms of Service
              </Link>
              <Link to="/sla" className="hover:text-white">
                SLA Commitments
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketplaceLayout;
