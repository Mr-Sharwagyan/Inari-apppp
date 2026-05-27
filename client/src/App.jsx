import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MarketplaceLayout from './layouts/MarketplaceLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import CustomerDashboard from './pages/CustomerDashboard';
import FarmerOverview from './pages/FarmerOverview';
import FarmerProducts from './pages/FarmerProducts';
import FarmerInventory from './pages/FarmerInventory';
import FarmerOrders from './pages/FarmerOrders';
import AdminDashboard from './pages/AdminDashboard';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import Sla from './pages/Sla.jsx';
import EventsMarketplace from './pages/Events.jsx';
import CreateEvent from './pages/CreateEvent.jsx';
import EventDetail from './pages/EventDetail.jsx';
import AdminOrders from './pages/AdminOrders';

import { WishlistProvider } from './context/WishlistContext';

const App = () => {
  return (
    <WishlistProvider>
      <Routes>
        {/* Marketplace Shell (Home, Shop, Cart, Details, etc.) */}
      <Route path="/" element={<MarketplaceLayout />}>
        <Route index element={<Home />} />
        <Route path="shop" element={<Shop />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="auth" element={<Auth />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="sla" element={<Sla />} />
        <Route path="events" element={<EventsMarketplace />} />
        <Route path="events/:id" element={<EventDetail />} />


        {/* Protected Customer Dashboard */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="event/create"
        element={
          <ProtectedRoute allowedRoles={['farmer', 'admin']}>
            <CreateEvent />
          </ProtectedRoute>
        }
      />

      {/* Farmer ERP Portal (DashboardLayout Shell) */}
      <Route
        path="/farmer"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FarmerOverview />} />
        <Route path="products" element={<FarmerProducts />} />
        <Route path="inventory" element={<FarmerInventory />} />
        <Route path="orders" element={<FarmerOrders />} />
      </Route>

      {/* Admin Control Panel (DashboardLayout Shell) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </WishlistProvider>
  );
};


export default App;