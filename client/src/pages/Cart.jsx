import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShoppingBag, ArrowRight, Trash2, MapPin, Phone, CreditCard,
  ChevronRight, Banknote, Smartphone, CheckCircle2, ExternalLink
} from 'lucide-react';
import api from '../services/api';

// Khalti public key (replace with your live key in production)
const KHALTI_PUBLIC_KEY = import.meta.env.VITE_KHALTI_PUBLIC_KEY || 'test_public_key_dc74e0fd57cb46cd93832aee0a390234';

const Cart = () => {
  const { cartItems, subtotal, shippingFee, estimatedTax, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();

  const [checkoutStep, setCheckoutStep] = useState(1);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'khalti'
  const [khaltiLoading, setKhaltiLoading] = useState(false);

  // Shipping form fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [addressLine, setAddressLine] = useState(user?.address || '');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');

  // Load Khalti SDK dynamically
  useEffect(() => {
    if (!document.getElementById('khalti-sdk')) {
      const script = document.createElement('script');
      script.id = 'khalti-sdk';
      script.src = 'https://khalti.com/static/khalti-checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const validateShipping = () => {
    if (!fullName || !addressLine || !city || !state || !zipCode || !phone) {
      showToast('Please complete all shipping address fields.', 'warning');
      return false;
    }
    return true;
  };

  const buildOrderPayload = (khaltiTransactionId = null) => ({
    items: cartItems.map(item => ({
      product: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      farmer: item.farmer,
      unit: item.unit
    })),
    totalAmount: total,
    shippingAddress: { fullName, addressLine, city, state, zipCode, phone },
    paymentMethod,
    ...(khaltiTransactionId && { khaltiTransactionId })
  });

  const placeOrder = async (payload) => {
    const res = await api.post('/orders', payload);
    setCreatedOrder(res.data);
    clearCart();
    showToast('Order placed successfully!', 'success');
    setCheckoutStep(3);
  };

  const handleCodCheckout = async (e) => {
    e.preventDefault();
    if (!user) { showToast('Please sign in first.', 'warning'); navigate('/auth'); return; }
    if (user.role !== 'customer') { showToast('Only Customer accounts can checkout.', 'warning'); return; }
    if (!validateShipping()) return;
    setSubmitting(true);
    try {
      await placeOrder(buildOrderPayload());
    } catch (err) {
      showToast(err.response?.data?.message || 'Checkout failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKhaltiCheckout = async (e) => {
    e.preventDefault();
    if (!user) { showToast('Please sign in first.', 'warning'); navigate('/auth'); return; }
    if (user.role !== 'customer') { showToast('Only Customer accounts can checkout.', 'warning'); return; }
    if (!validateShipping()) return;

    if (!window.KhaltiCheckout) {
      showToast('Khalti SDK not loaded. Please refresh and try again.', 'error');
      return;
    }

    setKhaltiLoading(true);

    const config = {
      publicKey: KHALTI_PUBLIC_KEY,
      productIdentity: `inari-order-${Date.now()}`,
      productName: `INARI Order (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`,
      productUrl: window.location.origin + '/cart',
      eventHandler: {
        onSuccess: async (payload) => {
          try {
            setSubmitting(true);
            // Verify on backend then create order
            const verifyRes = await api.post('/orders/verify-khalti', {
              token: payload.token,
              amount: Math.round(total * 100) // Khalti uses paisa
            });
            await placeOrder(buildOrderPayload(verifyRes.data.transaction_id || payload.token));
          } catch (err) {
            showToast(err.response?.data?.message || 'Payment verification failed.', 'error');
          } finally {
            setSubmitting(false);
            setKhaltiLoading(false);
          }
        },
        onError: (error) => {
          console.error('Khalti error:', error);
          showToast('Khalti payment failed. Please try again.', 'error');
          setKhaltiLoading(false);
        },
        onClose: () => {
          setKhaltiLoading(false);
        }
      },
      paymentPreference: ['KHALTI', 'EBANKING', 'MOBILE_BANKING', 'CONNECT_IPS', 'SCT'],
    };

    const checkout = new window.KhaltiCheckout(config);
    checkout.show({ amount: Math.round(total * 100) }); // amount in paisa
  };

  const handleCheckout = paymentMethod === 'cod' ? handleCodCheckout : handleKhaltiCheckout;

  // Empty state
  if (cartItems.length === 0 && checkoutStep !== 3) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-stone-200/60 p-12 rounded-3xl shadow-soft flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-800 mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-primary-950 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-sage-500 max-w-sm leading-relaxed mb-6">
            Explore our crop marketplace to source fresh produce direct from local farmers.
          </p>
          <Link to="/shop" className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-6 py-3 rounded-xl text-xs transition-colors flex items-center gap-1.5">
            Go to Marketplace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 text-xs font-bold select-none text-sage-400">
        <span className={checkoutStep >= 1 ? 'text-primary-900 font-extrabold' : ''}>1. Review Cart</span>
        <ChevronRight className="w-4 h-4" />
        <span className={checkoutStep >= 2 ? 'text-primary-900 font-extrabold' : ''}>2. Shipping & Payment</span>
        <ChevronRight className="w-4 h-4" />
        <span className={checkoutStep === 3 ? 'text-primary-900 font-extrabold' : ''}>3. Confirmation</span>
      </div>

      {/* STEP 3: Order Confirmed */}
      {checkoutStep === 3 && createdOrder && (
        <div className="max-w-2xl mx-auto bg-white border border-stone-200/60 p-8 rounded-3xl shadow-soft text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-primary-950">Order Confirmed!</h2>
            <p className="text-xs text-sage-500">Order ID: #{createdOrder._id?.toString?.().substring(0, 10).toUpperCase()}</p>
          </div>
          <div className="p-4 bg-stone-50 border border-stone-100 rounded-2xl text-left space-y-2.5">
            <div className="flex justify-between text-xs font-bold text-primary-950">
              <span>Status:</span>
              <span className="text-emerald-700 uppercase tracking-wider">{createdOrder.orderStatus}</span>
            </div>
            <div className="flex justify-between text-xs text-sage-600">
              <span>Payment:</span>
              <span className="font-bold text-primary-950 flex items-center gap-1">
                {createdOrder.paymentMethod === 'khalti'
                  ? <><Smartphone className="w-3 h-3 text-purple-600" /> Online (Khalti) — Paid</>
                  : <><Banknote className="w-3 h-3 text-emerald-600" /> Cash on Delivery</>
                }
              </span>
            </div>
            <div className="flex justify-between text-xs text-sage-600">
              <span>Total:</span>
              <span className="font-bold text-primary-950">Rs.{createdOrder.totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-xs text-sage-600 border-t border-stone-200/50 pt-2.5">
              <span className="font-bold block mb-1 text-primary-950">Delivery Address:</span>
              <p>{createdOrder.shippingAddress.fullName}</p>
              <p>{createdOrder.shippingAddress.addressLine}, {createdOrder.shippingAddress.city}</p>
            </div>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <Link to="/dashboard" className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-sm transition-colors">
              Track Order
            </Link>
            <Link to="/shop" className="bg-white hover:bg-stone-50 text-primary-950 font-bold px-6 py-3 rounded-xl text-xs border border-stone-200 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {/* STEP 1 & 2 */}
      {checkoutStep < 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 space-y-6">

            {/* Step 1: Cart Review */}
            {checkoutStep === 1 && (
              <div className="bg-white border border-stone-200/60 p-6 rounded-3xl shadow-soft space-y-4">
                <h3 className="font-extrabold text-base text-primary-950 mb-4">Review Sourced Crops</h3>
                <div className="divide-y divide-stone-100">
                  {cartItems.map((item) => (
                    <div key={item._id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-50 border shrink-0">
                        <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-2">
                        <div>
                          <Link to={`/products/${item._id}`} className="font-bold text-sm text-primary-950 hover:text-primary-850 leading-tight">
                            {item.name}
                          </Link>
                          <span className="text-[10px] text-sage-400 block mt-0.5">Sourced: {item.farmerName}</span>
                          <span className="text-[10px] font-bold text-primary-600 block mt-1">Rs.{item.price.toFixed(2)} per {item.unit}</span>
                        </div>
                        <div className="flex items-center gap-4 justify-between sm:justify-end">
                          <div className="flex items-center border border-stone-200 rounded-lg p-0.5">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 hover:bg-stone-50 text-sage-600 rounded font-bold text-xs">-</button>
                            <span className="px-2.5 text-xs font-bold text-primary-950">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 hover:bg-stone-50 text-sage-600 rounded font-bold text-xs">+</button>
                          </div>
                          <button onClick={() => { removeFromCart(item._id); showToast('Item removed', 'info'); }} className="text-sage-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Shipping + Payment */}
            {checkoutStep === 2 && (
              <form onSubmit={handleCheckout} className="bg-white border border-stone-200/60 p-6 sm:p-8 rounded-3xl shadow-soft space-y-6">
                <h3 className="font-extrabold text-base text-primary-950">Delivery & Payment</h3>

                {/* Shipping Fields */}
                <div>
                  <h4 className="text-xs font-extrabold text-sage-500 uppercase tracking-wider mb-4">Shipping Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-sage-700">Full Name</label>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                        placeholder="Firstname Lastname" required
                        className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-sage-700">Contact Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-3.5 h-3.5 text-sage-400" />
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="+977 9800000000" required
                          className="w-full border border-stone-200 pl-9 pr-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
                      </div>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-sage-700">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-3.5 h-3.5 text-sage-400" />
                        <input type="text" value={addressLine} onChange={e => setAddressLine(e.target.value)}
                          placeholder="Tole, Ward No., Street" required
                          className="w-full border border-stone-200 pl-9 pr-4 py-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-sage-700">City</label>
                      <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Bhaktapur" required
                        className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-sage-700">State / Region</label>
                      <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Bagmati" required
                        className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-sage-700">Zip / Postal</label>
                      <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="44600" required
                        className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500" />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h4 className="text-xs font-extrabold text-sage-500 uppercase tracking-wider mb-4">Payment Method</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* COD */}
                    <button type="button" onClick={() => setPaymentMethod('cod')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        paymentMethod === 'cod'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        paymentMethod === 'cod' ? 'bg-primary-100' : 'bg-stone-100'
                      }`}>
                        <Banknote className={`w-5 h-5 ${paymentMethod === 'cod' ? 'text-primary-700' : 'text-sage-400'}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-extrabold ${paymentMethod === 'cod' ? 'text-primary-950' : 'text-primary-900'}`}>
                          Cash on Delivery
                        </div>
                        <div className="text-[10px] text-sage-400">Pay when your order arrives</div>
                      </div>
                      {paymentMethod === 'cod' && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </button>

                    {/* Khalti */}
                    <button type="button" onClick={() => setPaymentMethod('khalti')}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                        paymentMethod === 'khalti'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        paymentMethod === 'khalti' ? 'bg-purple-100' : 'bg-stone-100'
                      }`}>
                        <Smartphone className={`w-5 h-5 ${paymentMethod === 'khalti' ? 'text-purple-600' : 'text-sage-400'}`} />
                      </div>
                      <div>
                        <div className={`text-sm font-extrabold ${paymentMethod === 'khalti' ? 'text-purple-900' : 'text-primary-900'}`}>
                          Khalti
                        </div>
                        <div className="text-[10px] text-sage-400">Secure online payment</div>
                      </div>
                      {paymentMethod === 'khalti' && (
                        <div className="ml-auto w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </button>
                  </div>

                  {paymentMethod === 'khalti' && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-xl text-[11px] text-purple-700 font-semibold flex items-start gap-2">
                      <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      Khalti checkout will open in a popup. Complete payment there to finalize your order.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 flex justify-between items-center gap-4">
                  <button type="button" onClick={() => setCheckoutStep(1)}
                    className="border border-stone-200 text-sage-600 hover:text-primary-900 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors">
                    Back to Review
                  </button>
                  <button type="submit" disabled={submitting || khaltiLoading}
                    className={`font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-60 ${
                      paymentMethod === 'khalti'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-primary-900 hover:bg-primary-950 text-white'
                    }`}
                  >
                    {submitting || khaltiLoading
                      ? (paymentMethod === 'khalti' ? 'Opening Khalti...' : 'Placing Order...')
                      : (paymentMethod === 'khalti' ? 'Pay with Khalti' : 'Place COD Order')
                    }
                    {paymentMethod === 'khalti' ? <Smartphone className="w-3.5 h-3.5" /> : <Banknote className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 bg-white border border-stone-200/60 p-6 rounded-3xl shadow-soft space-y-4">
            <h3 className="font-extrabold text-base text-primary-950 border-b border-stone-100 pb-3">Order Summary</h3>
            <div className="space-y-2.5 text-xs text-sage-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items):</span>
                <span className="font-bold text-primary-950">Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Freight Shipping:</span>
                <span className="font-bold text-primary-950">{shippingFee === 0 ? 'FREE' : `Rs.${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (13%):</span>
                <span className="font-bold text-primary-950">Rs.{estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-stone-100 pt-3 text-sm font-extrabold text-primary-950">
                <span>Total:</span>
                <span>Rs.{total.toFixed(2)}</span>
              </div>
            </div>

            {checkoutStep === 1 && (
              <button onClick={() => {
                if (!user) { showToast('Please log in to continue.', 'warning'); navigate('/auth'); return; }
                if (user.role !== 'customer') { showToast('Only Customer accounts can buy.', 'warning'); return; }
                setCheckoutStep(2);
              }}
                className="w-full bg-primary-900 hover:bg-primary-950 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                Proceed to Shipping <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {!user ? (
              <div className="p-3 bg-beige-50 border border-beige-200/50 rounded-xl text-[10px] text-sage-500 leading-normal">
                🔑 Please register or log in to complete your checkout.
              </div>
            ) : user.role !== 'customer' ? (
              <div className="p-3 bg-red-50 border border-red-150 text-red-800 rounded-xl text-[10px] font-semibold">
                ⚠️ You are logged in as {user.role.toUpperCase()}. Use a Customer account to checkout.
              </div>
            ) : null}
          </div>

        </div>
      )}
    </div>
  );
};

export default Cart;