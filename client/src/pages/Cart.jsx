import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, ArrowRight, Trash2, MapPin, Phone, CreditCard, ChevronRight, User } from 'lucide-react';
import api from '../services/api';

const Cart = () => {
  const { cartItems, subtotal, shippingFee, estimatedTax, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Cart review, 2 = Shipping details, 3 = Completed!
  const [createdOrder, setCreatedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Shipping form fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [addressLine, setAddressLine] = useState(user?.address || '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to complete your checkout.', 'warning');
      navigate('/auth');
      return;
    }

    if (user.role !== 'customer') {
      showToast('Only Customer accounts can checkout marketplace orders.', 'warning');
      return;
    }

    if (!fullName || !addressLine || !city || !state || !zipCode || !phone) {
      showToast('Please complete the shipping address fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const items = cartItems.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        farmer: item.farmer,
        unit: item.unit
      }));

      const shippingAddress = {
        fullName,
        addressLine,
        city,
        state,
        zipCode,
        phone
      };

      const res = await api.post('/orders', {
        items,
        totalAmount: total,
        shippingAddress
      });

      setCreatedOrder(res.data);
      clearCart();
      showToast('Order submitted successfully!', 'success');
      setCheckoutStep(3);
    } catch (err) {
      showToast(err.message || 'Checkout failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Empty state
  if (cartItems.length === 0 && checkoutStep !== 3) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-stone-200/60 p-12 rounded-3xl shadow-soft flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-800 mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-primary-950 mb-2">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-sage-500 max-w-sm leading-relaxed mb-6">
            Explore our crop marketplace to source fresh winter wheat, heirloom tomatoes, orchard fruits, and dairy direct from local farmers.
          </p>
          <Link
            to="/shop"
            className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors flex items-center gap-1.5"
          >
            Go to Marketplace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Checkout Progress Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 text-xs font-bold select-none text-sage-400">
        <span className={checkoutStep >= 1 ? 'text-primary-900 font-extrabold' : ''}>1. Review Cart</span>
        <ChevronRight className="w-4 h-4" />
        <span className={checkoutStep >= 2 ? 'text-primary-900 font-extrabold' : ''}>2. Shipping Address</span>
        <ChevronRight className="w-4 h-4" />
        <span className={checkoutStep === 3 ? 'text-primary-900 font-extrabold' : ''}>3. Receipt Confirmation</span>
      </div>

      {/* STEP 3: Order Completed Receipt screen */}
      {checkoutStep === 3 && createdOrder && (
        <div className="max-w-2xl mx-auto bg-white border border-stone-200/60 p-8 rounded-3xl shadow-soft text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mx-auto">
            <CreditCard className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-primary-950">Purchase Authorized & Logged</h2>
            <p className="text-xs text-sage-500">Order ID: #{createdOrder._id?.toString?.().substring(0, 10).toUpperCase()}</p>
          </div>
          <div className="p-4.5 bg-stone-50 border border-stone-100 rounded-2xl text-left space-y-2.5">
            <div className="flex justify-between text-xs font-bold text-primary-950">
              <span>Delivery Status:</span>
              <span className="text-emerald-700 uppercase tracking-wider">{createdOrder.orderStatus}</span>
            </div>
            <div className="flex justify-between text-xs text-sage-600">
              <span>Total Paid:</span>
              <span className="font-bold text-primary-950">Rs.{createdOrder.totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-xs text-sage-600 border-t border-stone-200/50 pt-2.5">
              <span className="font-bold block mb-1 text-primary-950">Shipping Destination:</span>
              <p>{createdOrder.shippingAddress.fullName}</p>
              <p>{createdOrder.shippingAddress.addressLine}</p>
              <p>{createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.state} {createdOrder.shippingAddress.zipCode}</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-sm transition-colors"
            >
              Track in Customer Dashboard
            </Link>
            <Link
              to="/shop"
              className="bg-white hover:bg-stone-50 text-primary-950 font-bold px-6 py-3 rounded-xl text-xs border border-stone-200 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* STEP 1 & 2: Cart Grid */}
      {checkoutStep < 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form/List Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Cart Items Review */}
            {checkoutStep === 1 && (
              <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-soft space-y-4">
                <h3 className="font-extrabold text-base text-primary-950 mb-6">Review Sourced Crops</h3>
                <div className="divide-y divide-stone-100">
                  {cartItems.map((item) => (
                    <div key={item._id} className="py-4.5 flex gap-4 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 border shrink-0">
                        <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:justify-between justify-start gap-2">
                        <div>
                          <Link to={`/products/${item._id}`} className="font-bold text-sm text-primary-950 hover:text-primary-850 leading-tight">
                            {item.name}
                          </Link>
                          <span className="text-[10px] text-sage-400 block mt-0.5">Sourced: {item.farmerName}</span>
                          <span className="text-[10px] font-bold text-primary-600 block mt-1">Rs.{item.price.toFixed(2)} per {item.unit}</span>
                        </div>
                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-stone-200 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-2 hover:bg-stone-50 text-sage-600 rounded font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-xs font-bold text-primary-950">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="px-2 hover:bg-stone-50 text-sage-600 rounded font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                          
                          {/* Trash button */}
                          <button
                            onClick={() => {
                              removeFromCart(item._id);
                              showToast('Item removed from cart', 'info');
                            }}
                            className="text-sage-400 hover:text-red-650 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Shipping Destination Form */}
            {checkoutStep === 2 && (
              <form onSubmit={handleCheckout} className="bg-white border border-stone-200/60 p-6 sm:p-8 rounded-3xl shadow-soft space-y-5">
                <h3 className="font-extrabold text-base text-primary-950 mb-4">Delivery Destination</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-sage-700">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-sage-700">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-sage-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 0123"
                        className="w-full border border-stone-200 pl-9 pr-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Shipping Address Line</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-sage-400" />
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="Street name, Apartment number..."
                      className="w-full border border-stone-200 pl-9 pr-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold text-sage-700">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="San Francisco"
                      className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                      required
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold text-sage-700">State / Region</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="CA"
                      className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                      required
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs font-semibold text-sage-700">Zip / Postal Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="94102"
                      className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100 flex justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="border border-stone-200 text-sage-600 hover:text-primary-900 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
                  >
                    Back to Review
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5"
                  >
                    {submitting ? 'Creating Secure Order...' : 'Complete Payment'}
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 bg-white border border-stone-200/60 p-6 rounded-3xl shadow-soft space-y-4">
            <h3 className="font-extrabold text-base text-primary-950 border-b border-stone-100 pb-3">Order Summary</h3>
            
            <div className="space-y-2.5 text-xs text-sage-600">
              <div className="flex justify-between">
                <span>Crops Subtotal:</span>
                <span className="font-bold text-primary-950">Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Freight Shipping:</span>
                <span className="font-bold text-primary-950">{shippingFee === 0 ? 'FREE' : `Rs.${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (13%):</span>
                <span className="font-bold text-primary-950">Rs.{estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-3 text-sm font-extrabold text-primary-950">
                <span>Order Total:</span>
                <span>Rs.{total.toFixed(2)}</span>
              </div>
            </div>

            {checkoutStep === 1 && (
              <button
                onClick={() => {
                  if (!user) {
                    showToast('Please log in to continue.', 'warning');
                    navigate('/auth');
                    return;
                  }
                  if (user.role !== 'customer') {
                    showToast('Only Customer accounts can buy crops.', 'warning');
                    return;
                  }
                  setCheckoutStep(2);
                }}
                className="w-full bg-primary-900 hover:bg-primary-950 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                Proceed to Shipping
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {/* Quick check showing user role eligibility */}
            {!user ? (
              <div className="p-3 bg-beige-50 border border-beige-200/50 rounded-xl text-[10px] text-sage-500 leading-normal">
                🔑 Please register or log in to complete your checkout transaction.
              </div>
            ) : user.role !== 'customer' ? (
              <div className="p-3 bg-red-50 border border-red-150 text-red-955 rounded-xl text-[10px] leading-normal font-semibold">
                ⚠️ You are logged in as a {user.role.toUpperCase()}. To test checkout purchasing, please log out and sign in using a Customer account.
              </div>
            ) : null}

          </div>

        </div>
      )}

    </div>
  );
};

export default Cart;
