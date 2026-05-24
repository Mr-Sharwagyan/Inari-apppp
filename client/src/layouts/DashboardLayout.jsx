import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Tractor, 
  BarChart3, 
  Sprout, 
  Package, 
  ShoppingBag, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Home,
  Users
} from 'lucide-react';
import api from '../services/api';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const farmerNavigation = [
    { name: 'Overview', to: '/farmer', icon: BarChart3 },
    { name: 'My Crops', to: '/farmer/products', icon: Sprout },
    { name: 'Inventory Logs', to: '/farmer/inventory', icon: Package },
    { name: 'Order Queues', to: '/farmer/orders', icon: ShoppingBag },
  ];

  const adminNavigation = [
    { name: 'Approvals & Users', to: '/admin', icon: Users },
  ];

  const navigation = user?.role === 'admin' ? adminNavigation : farmerNavigation;

  return (
    <div className="min-h-screen flex bg-beige-50/50">
      
      {/* Desktop Collapsible Sidebar */}
      <aside 
        className={`hidden md:flex flex-col border-r border-stone-200/60 bg-white/80 backdrop-blur-lg transition-sidebar duration-300 relative ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white border border-stone-200 text-sage-600 hover:text-primary-850 p-1 rounded-full shadow-sm hover:shadow transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Sidebar Header Logo */}
        <div className="h-16 flex items-center px-6 border-b border-stone-200/50">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="bg-primary-900 text-white p-1.5 rounded-lg shrink-0 shadow-sm">
              <Tractor className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="font-extrabold text-lg text-primary-950 tracking-tight transition-opacity duration-200">
                INARI<span className="text-primary-500 font-medium">.</span>
              </span>
            )}
          </Link>
        </div>

        {/* Sidebar Role Profile Banner */}
        <div className={`p-4 border-b border-stone-100 flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-primary-100 border border-primary-200/50 flex items-center justify-center font-extrabold text-primary-850 shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="text-xs font-bold text-primary-950 leading-tight truncate">{user?.name}</div>
              <div className="text-[10px] uppercase font-bold text-sage-400 tracking-wider">
                {user?.role === 'admin' ? 'System Administrator' : 'Farmer ERP Portal'}
              </div>
            </div>
          )}
        </div>

        {/* Main Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-900 text-white shadow-soft'
                    : 'text-sage-600 hover:text-primary-900 hover:bg-stone-50'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-sage-400 group-hover:text-primary-600'}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-stone-200/50 space-y-1.5">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-sage-600 hover:text-primary-900 hover:bg-stone-50 ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Go to Marketplace Shop"
          >
            <Home className="w-5 h-5 text-sage-400" />
            {!collapsed && <span>View Marketplace</span>}
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-650 hover:bg-red-50 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Overlay */}
          <div 
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          />
          {/* Menu Drawer */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-white h-full p-4 border-r border-stone-200 z-10">
            <div className="flex items-center gap-2 mb-6">
              <Tractor className="w-6 h-6 text-primary-900" />
              <span className="font-extrabold text-lg text-primary-950">INARI Portal</span>
            </div>
            
            <nav className="flex-grow space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                      isActive ? 'bg-primary-900 text-white' : 'text-sage-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-stone-200 pt-4 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-sage-600 hover:bg-stone-50"
              >
                <Home className="w-5 h-5" />
                <span>Marketplace</span>
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-stone-200/50 flex items-center justify-between px-4 sm:px-6 md:px-8 z-30 sticky top-0">
          
          {/* Mobile Menu Toggle button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-sage-600 hover:bg-stone-150 rounded-xl"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Indicator Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-sage-400">
            <span>Portal</span>
            <span>/</span>
            <span className="text-primary-950 font-bold capitalize">
              {location.pathname.split('/').pop() || 'Overview'}
            </span>
          </div>

          {/* Right Header Panel */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Back to Home Button */}
            <Link 
              to="/" 
              className="text-xs font-bold text-primary-800 bg-primary-50 hover:bg-primary-100 px-3.5 py-2 rounded-xl transition-all border border-primary-200/30 flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Marketplace
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-sage-500 hover:text-primary-900 hover:bg-stone-50 rounded-xl transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-amber-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification bell menu overlay */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl p-4 max-h-96 overflow-y-auto">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm text-primary-950">System Alerts</h4>
                    <span className="text-xs text-sage-400">{unreadCount} unread</span>
                  </div>
                  <div className="space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-xs text-sage-400">No active alerts</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => handleMarkRead(notif._id)}
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

            {/* Profile Tag */}
            <div className="flex items-center gap-2 border-l border-stone-250/60 pl-4">
              <div className="w-8 h-8 rounded-full bg-beige-100 border border-beige-200/50 flex items-center justify-center font-bold text-sm text-beige-850">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-sage-800 leading-tight">{user?.name}</div>
                <div className="text-[10px] font-bold text-primary-600 capitalize leading-none">{user?.role}</div>
              </div>
            </div>

          </div>
        </header>

        {/* Dashboard Body Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
