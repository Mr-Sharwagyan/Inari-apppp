import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Tractor, User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateNepalPhone = (phone) => {
    return /^(98|97)\d{8}$/.test(phone);
  };

  const validateName = (name) => {
    return /^[A-Za-z ]{3,}$/.test(name.trim());
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  };

const Auth = () => {
  const { login, register } = useAuth();
  const showToast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('customer'); // 'customer' or 'farmer'
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
   if (!email || !password || (!isLogin && !name)) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Invalid email format.', 'error');
      return;
    }

    // 🚨 ONLY enforce strong password on REGISTER
    if (!isLogin && !validatePassword(password)) {
      showToast(
        'Weak password. Use 8+ chars, uppercase, number & symbol.',
        'error'
      );
      return;
    }

    // 🚨 ONLY validate name/phone on REGISTER
    if (!isLogin) {
      if (!validateName(name)) {
        showToast('Name must be at least 3 letters (letters only).', 'error');
        return;
      }

      if (phone && !validateNepalPhone(phone)) {
        showToast('Phone must be valid 10-digit Nepali number.', 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        const loggedInUser = await login(email, password);
        showToast(`Welcome back, ${loggedInUser.name}!`, 'success');
        if (loggedInUser.role === 'farmer') {
          navigate('/farmer');
        } else if (loggedInUser.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from);
        }
      } else {
        const registeredUser = await register(name, email, password, role, phone, address);
        
        if (role === 'farmer') {
          showToast('Farmer profile registered! Your account is pending administrator approval.', 'success');
          setIsLogin(true);
          setPassword('');
        } else {
          showToast(`Account created successfully! Welcome, ${registeredUser.name}.`, 'success');
          navigate('/');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-[#FAF9F4]">
      
      {/* Left Column: Sustainable Agriculture Illustration & Quote */}
      <div className="md:w-1/2 bg-primary-950 flex flex-col justify-between p-8 sm:p-12 md:p-16 text-[#FAF9F5] relative overflow-hidden select-none">
        {/* Subtle glowing circular background */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-850/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl" />

        {/* Top Header info */}
        <div className="flex items-center gap-2.5 z-10">
          
            <img
              src="/uploads/logo2.png"
              alt="Inari Logo"
              className="h-12 w-auto group-hover:scale-105 transition-transform duration-200"
            />
          
          <span className="font-extrabold text-xl tracking-tight text-white">INARI.</span>
        </div>

        {/* Dynamic Center Illustration Card */}
        <div className="my-auto py-12 flex flex-col items-center justify-center text-center z-10 max-w-md mx-auto">
          <div className="relative w-44 h-44 mb-8 flex items-center justify-center animate-float">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full border border-primary-500/20 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute inset-4 rounded-full border border-primary-500/30 border-dashed animate-spin" style={{ animationDuration: '10s' }} />
            
            {/* Inner Sprout graphic */}
              <img
                src="/uploads/logo2.png"
                alt="Inari Logo"
                className="h-45 w-auto group-hover:scale-105 transition-transform duration-200"
              />
          </div>

          <h2 className="text-2xl font-extrabold mb-3 tracking-tight text-white leading-snug">
            Digitizing the Farm-to-Table Supply Chain
          </h2>
          <p className="text-sm text-sage-400/90 leading-relaxed">
            Configure smart crop inventory batches, monitor soil yields, and access a wholesale food marketplace. Empowering farmers with ERP tools.
          </p>
        </div>

        {/* Bottom Footer Info */}
        <div className="text-[11px] text-sage-500 z-10 flex justify-between">
          <span>Enterprise Grade SaaS</span>
          <span>© 2026 INARI Inc.</span>
        </div>

      </div>

      {/* Right Column: Glassmorphic Auth Card Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md bg-white border border-stone-200/70 p-8 rounded-3xl shadow-soft">
          
          {/* Form Header Title */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-extrabold text-primary-950 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create ERP Account'}
            </h3>
            <p className="text-xs text-sage-500 mt-1.5">
              {isLogin ? 'Sign in to access crop dashboards & market orders' : 'Select your portal role to register'}
            </p>
          </div>

          {/* Toggle Tabs (Login vs Register) */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                isLogin ? 'bg-white text-primary-950 shadow-sm' : 'text-sage-500 hover:text-sage-850'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-white text-primary-950 shadow-sm' : 'text-sage-500 hover:text-sage-850'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* If Registering: Role Selection Cards */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-sage-500 uppercase tracking-wider block">Choose Portal Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setRole('customer')}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      role === 'customer'
                        ? 'border-primary-850 bg-primary-50/50 text-primary-950 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-sage-600'
                    }`}
                  >
                    <User className="w-4 h-4 mx-auto mb-1 text-sage-400" />
                    <span className="text-xs block">Customer</span>
                  </div>
                  <div
                    onClick={() => setRole('farmer')}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                      role === 'farmer'
                        ? 'border-primary-850 bg-primary-50/50 text-primary-950 font-bold'
                        : 'border-stone-200 hover:border-stone-300 text-sage-600'
                    }`}
                  >
                    <img
                      src="/uploads/logo2.png"
                      alt="Inari Logo"
                      className="h-4 w-auto group-hover:scale-105 transition-transform duration-200 mx-auto mb-1 text-sage-400"
                    />
                    <span className="text-xs block">Farmer</span>
                  </div>
                </div>
                {role === 'farmer' && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded-lg mt-2 leading-relaxed">
                    ⚠️ Farmer profiles are approved by administrators. You can log in once approved.
                  </p>
                )}
              </div>
            )}

            {/* Name Field (Register Only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">Full Name / Farm Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-sage-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'farmer' ? 'Green Valley Farms Inc.' : 'firstname lastname'}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-sage-400"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-sage-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-sage-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-sage-400"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-sage-700">Password</label>
                {isLogin && (
                  <a href="#" onClick={(e) => { e.preventDefault(); showToast("Mock Forgot Password triggered! Link sent to email.", "info"); }} className="text-[11px] font-bold text-primary-750 hover:underline">
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-sage-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-stone-200 outline-none text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-sage-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sage-400 hover:text-sage-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Phone & Address Fields (Register Only) */}
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-sage-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 98123 45678"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-sage-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Physical Address / Farm Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-sage-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Madhyapur Thimi, Bhaktapur, Nepal"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-100 placeholder:text-sage-400"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-900 hover:bg-primary-950 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-150 shadow-md hover:shadow-lg disabled:bg-primary-300 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading INARI secure node...</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Register Account'}</span>
              )}
            </button>
          </form>

          {/* Quick Mock Login helper links for testing convenience */}
          <div className="mt-8 border-t border-stone-200 pt-6 text-center">
            <span className="text-[10px] font-bold text-sage-400 uppercase tracking-widest block mb-3">Quick Sandbox Logins</span>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    await login('farmer@inari.com', 'farmer123');
                    showToast('Logged in as Farmer (Green Valley Farm)!', 'success');
                    navigate('/farmer');
                  } catch (e) {
                    showToast('Failed to quick login.', 'error');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="text-[10px] bg-primary-50 hover:bg-primary-100 border border-primary-200/50 text-primary-900 font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Tractor className="w-3 h-3" />
                Farmer ERP
              </button>
              <button
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    await login('customer@inari.com', 'customer123');
                    showToast('Logged in as Customer (Arthur)!', 'success');
                    navigate('/');
                  } catch (e) {
                    showToast('Failed to quick login.', 'error');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="text-[10px] bg-beige-100 hover:bg-beige-200 border border-beige-300/40 text-beige-850 font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                Customer Shop
              </button>
              <button
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    await login('admin@inari.com', 'admin123');
                    showToast('Logged in as Platform Admin!', 'success');
                    navigate('/admin');
                  } catch (e) {
                    showToast('Failed to quick login.', 'error');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="text-[10px] bg-stone-100 hover:bg-stone-200 border border-stone-300/40 text-sage-800 font-bold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                Admin Panel
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Auth;
