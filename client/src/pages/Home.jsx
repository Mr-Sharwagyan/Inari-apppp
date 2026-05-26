import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Tractor,
  ArrowRight,
  Sprout,
  ShieldCheck,
  HeartHandshake,
  ChevronRight,
  Play,
  Star,
  Users,
  Package,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';

// ─── Hero Unsplash images (farm / field themed) ────────────────────────────
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=90&w=1800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=90&w=1800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=90&w=1800&auto=format&fit=crop',
];

// ─── Counter animation hook ────────────────────────────────────────────────
const useCountUp = (target, duration = 1600, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

// ─── Stats component ───────────────────────────────────────────────────────
const StatItem = ({ value, suffix, label, icon: Icon, animate }) => {
  const count = useCountUp(value, 1400, animate);
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: 32,
          fontWeight: 800,
          color: '#fff',
          fontFamily: "'Instrument Serif', Georgia, serif",
          lineHeight: 1,
        }}
      >
        {animate ? count : value}
        {suffix}
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.65)',
          marginTop: 4,
          fontWeight: 500,
          letterSpacing: '0.03em',
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const [platformStats, setPlatformStats] = useState({ activeBatches: '...', cropValue: '...', orders: '...' });

  // Preload first hero image
  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMAGES[0];
    img.onload = () => setHeroLoaded(true);
  }, []);

  // Cycle hero images every 5s
  useEffect(() => {
    const t = setInterval(
      () => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length),
      5000
    );
    return () => clearInterval(t);
  }, []);

  // Intersection observer for stats counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const res = await api.get('/products');
        const products = res.data || [];
        const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
        const totalValue = products.reduce((s, p) => s + (p.price * p.stock), 0);
        setPlatformStats({
          activeBatches: products.length.toString(),
          cropValue: 'Rs. ' + (totalValue > 1000 ? (totalValue/1000).toFixed(1) + 'K' : totalValue.toFixed(0)),
          orders: totalStock.toString()
        });
      } catch {}
    };
    fetchPlatformStats();
  }, []);

  return (
    <div className="bg-[#FAF9F5] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
        @keyframes heroFadeIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes imageCrossfade {
          0%   { opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { opacity: 0; }
        }
        .hero-img {
          animation: imageCrossfade 5s ease-in-out forwards;
        }
        .hero-content-badge  { animation: slideIn  0.7s 0.2s both ease-out; }
        .hero-content-h1     { animation: slideUp  0.7s 0.35s both ease-out; }
        .hero-content-p      { animation: slideUp  0.7s 0.5s  both ease-out; }
        .hero-content-cta    { animation: slideUp  0.7s 0.65s both ease-out; }
        .hero-content-stats  { animation: slideUp  0.7s 0.8s  both ease-out; }
        .hero-card           { animation: slideUp  0.7s 0.55s both ease-out; }
        .feature-card:hover  { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
        .feature-card        { transition: transform 0.25s, box-shadow 0.25s; }
        .cat-card:hover img  { transform: scale(1.06); }
        .cat-card img        { transition: transform 0.4s ease; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Full-bleed Unsplash image with overlay content
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        {/* ── Background image slideshow ── */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {HERO_IMAGES.map((src, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: i === heroIndex ? 1 : 0,
                transition: 'opacity 1.2s ease-in-out',
              }}
            >
              <img
                src={src}
                alt="Farm landscape"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 40%',
                  filter: 'brightness(0.72) saturate(1.1)',
                  transform: i === heroIndex ? 'scale(1.03)' : 'scale(1)',
                  transition: 'transform 5s ease-out, opacity 1.2s ease-in-out',
                }}
              />
            </div>
          ))}

          {/* Multi-layer gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `
                linear-gradient(
                  to right,
                  rgba(5,20,10,0.82) 0%,
                  rgba(5,20,10,0.55) 50%,
                  rgba(5,20,10,0.20) 100%
                ),
                linear-gradient(
                  to top,
                  rgba(5,20,10,0.70) 0%,
                  transparent 60%
                )
              `,
            }}
          />

          {/* Subtle noise texture */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
              opacity: 0.35,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* ── Image indicator dots ── */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 8,
            zIndex: 10,
          }}
        >
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              style={{
                width: i === heroIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                background: i === heroIndex ? '#4ade80' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* ── Hero content ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: 1280,
            margin: '0 auto',
            padding: '80px 32px 100px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 420px',
            gap: 64,
            alignItems: 'center',
          }}
        >
          {/* Left: Text */}
          <div>
            <div
              className="hero-content-badge"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                background: 'rgba(74,222,128,0.15)',
                border: '1px solid rgba(74,222,128,0.3)',
                borderRadius: 100,
                color: '#86efac',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 22,
              }}
            >
              <Sprout size={11} />
              Next-Gen Smart Agriculture Ecosystem
            </div>

            <h1
              className="hero-content-h1"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(40px, 5vw, 68px)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: 24,
              }}
            >
              Empowering growers,<br />
              <span style={{ fontStyle: 'normal', fontWeight: 400 }}>
                connecting markets.
              </span>
            </h1>

            <p
              className="hero-content-p"
              style={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.72)',
                maxWidth: 520,
                lineHeight: 1.7,
                marginBottom: 36,
              }}
            >
              INARI streamlines agricultural supply chains — giving farmers robust
              batch-level ERP crop tracking and buyers transparent access to fresh
              wholesale produce, direct from the field.
            </p>

            <div
              className="hero-content-cta"
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}
            >
              <Link
                to="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  boxShadow: '0 8px 28px rgba(34,197,94,0.40)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 36px rgba(34,197,94,0.55)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(34,197,94,0.40)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Explore Marketplace <ArrowRight size={15} />
              </Link>

              <Link
                to="/auth"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.10)')}
              >
                Register Farm Profile
              </Link>
            </div>

            {/* Inline stats */}
            <div
              className="hero-content-stats"
              ref={statsRef}
              style={{
                display: 'flex',
                gap: 40,
              }}
            >
              <StatItem value={1200} suffix="+" label="Active Farmers" animate={statsVisible} />
              <StatItem value={48} suffix="K+" label="Orders Fulfilled" animate={statsVisible} />
              <StatItem value={98} suffix="%" label="Satisfaction Rate" animate={statsVisible} />
            </div>
          </div>

          {/* Right: Floating card */}
          <div className="hero-card" style={{ position: 'relative' }}>
            {/* Glow */}
            <div
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 260,
                height: 260,
                background: 'radial-gradient(circle, rgba(74,222,128,0.22) 0%, transparent 65%)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            {/* Card */}
            <div
              style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(28px)',
                border: '1px solid rgba(255,255,255,0.16)',
                borderRadius: 28,
                padding: 24,
                boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
              }}
            >
              {/* Card header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: 'rgba(74,222,128,0.18)',
                      border: '1px solid rgba(74,222,128,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Tractor size={18} color="#4ade80" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Farm Dashboard</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>Live Overview</div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    background: 'rgba(74,222,128,0.15)',
                    border: '1px solid rgba(74,222,128,0.25)',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#4ade80',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#4ade80',
                      display: 'inline-block',
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                  LIVE
                </div>
              </div>

              {/* Stats row */}
              {[
                { icon: Package, label: 'Active Batches', value: platformStats.activeBatches, color: '#86efac' },
                { icon: TrendingUp, label: 'Crop Ledger Value', value: platformStats.cropValue, color: '#fbbf24' },
                { icon: ShieldCheck, label: 'Quality Grade', value: 'Grade A Certified', color: '#60a5fa' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: 16,
                    padding: '12px 16px',
                    marginBottom: i < 2 ? 10 : 0,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')
                  }
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <item.icon size={14} color={item.color} />
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>
                      {item.label}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
                    {item.value}
                  </div>
                </div>
              ))}

              {/* Farmer quote */}
              <div
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  background: 'rgba(74,222,128,0.08)',
                  border: '1px solid rgba(74,222,128,0.18)',
                  borderRadius: 16,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=80&q=80"
                  alt="Farmer"
                  style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.60)', lineHeight: 1.5 }}>
                    "INARI has simplified our wholesale distribution completely."
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#86efac', marginTop: 5 }}>
                    Sharwagyan Farm, Madhyapur Thimi, Nepal
                  </div>
                  <div style={{ display: 'flex', gap: 2, marginTop: 3 }}>
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={9} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. FEATURES GRID
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-stone-200/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-primary-950 tracking-tight">
              Unified Agriculture Infrastructure
            </h2>
            <p className="text-sm text-sage-500">
              Blending e-commerce distribution with back-office inventory tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Tractor,
                title: 'Crop Batch ERP',
                desc: 'Farmers can log crop yields, track storage temperatures, location bins, and quality ratings. Automated inventory calculations keep markets informed.',
                img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80',
              },
              {
                icon: ShieldCheck,
                title: 'Transparent Sourcing',
                desc: 'Every crop listed in the marketplace displays full batch transparency, harvest dates, expiry estimations, and direct contact for the farmers.',
                img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
              },
              {
                icon: HeartHandshake,
                title: 'Farmer Ecosystem',
                desc: 'Direct transactions eliminate wholesale markups, ensuring growers retain higher margins while buyers secure cheaper premium bulk goods.',
                img: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=400&q=80',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="feature-card"
                style={{
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.07)',
                  background: '#fff',
                }}
              >
                <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={f.img}
                    alt={f.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15,31,16,0.6) 0%, transparent 60%)',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 14,
                      left: 16,
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <f.icon size={18} color="#fff" />
                  </div>
                </div>
                <div style={{ padding: '20px 22px 24px' }}>
                  <h3 className="text-lg font-bold text-primary-950 mb-2">{f.title}</h3>
                  <p className="text-xs text-sage-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. CATEGORY GRID
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div className="text-left space-y-1.5">
            <h2 className="text-3xl font-extrabold text-primary-950 tracking-tight">
              Shop by Category
            </h2>
            <p className="text-sm text-sage-500">
              Fresh organic crops sourced directly from the fields.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-primary-800 hover:text-primary-950 flex items-center gap-1"
          >
            Browse All Crops
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 animate-pulse"
              >
                <div className="bg-stone-200 aspect-[4/3] rounded-xl w-full" />
                <div className="bg-stone-200 h-4 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.name}`}
                className="cat-card group bg-white border border-stone-200/60 rounded-3xl p-4 hover:shadow-soft-lg hover:border-primary-200 transition-all duration-300 flex flex-col"
              >
                <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-stone-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-primary-950 text-base group-hover:text-primary-800 transition-colors">
                  {cat.name}
                </h4>
                <p className="text-[11px] text-sage-400 leading-normal mt-1 flex-grow">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. FARMER HIGHLIGHT — full-bleed image + CTA
      ═══════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: 480,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=85&w=1800&auto=format&fit=crop"
          alt="Farm fields"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
            filter: 'brightness(0.38) saturate(1.15)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(10,31,18,0.85) 0%, rgba(10,31,18,0.55) 60%, transparent 100%)',
          }}
        />

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
            padding: '80px 32px',
          }}
        >
          <div style={{ color: '#fff' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                background: 'rgba(74,222,128,0.15)',
                border: '1px solid rgba(74,222,128,0.3)',
                borderRadius: 100,
                color: '#86efac',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginBottom: 18,
              }}
            >
              <Users size={10} /> For Farmers
            </div>
            <h2
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(28px, 3.5vw, 46px)',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1.15,
                marginBottom: 18,
              }}
            >
              Grow Your Distribution Network
            </h2>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.7,
                maxWidth: 460,
                marginBottom: 32,
              }}
            >
              Create your digital farm profile, list products, trace active crop
              yields via inventory batches, and manage your delivery pipeline
              directly through the INARI SaaS console.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link
                to="/auth"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 26px',
                  borderRadius: 14,
                  background: '#fff',
                  color: '#0f2d1d',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
              >
                Apply as a Farmer
              </Link>
              <a
                href="#"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '13px 20px',
                  color: 'rgba(255,255,255,0.75)',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
              >
                Read documentation <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Testimonial card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 28,
              padding: '28px 28px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, color: '#86efac', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
              Farmer Highlights
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=120&q=80"
                alt="Farmer"
                style={{ width: 52, height: 52, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Sharwagyan Farm</div>
                <div style={{ fontSize: 12, color: '#86efac', marginTop: 2 }}>Madhyapur Thimi, Nepal</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  Organic certified grains & vegetables
                </div>
              </div>
            </div>
            <blockquote
              style={{
                fontSize: 13,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.65)',
                lineHeight: 1.65,
                borderLeft: '2px solid rgba(74,222,128,0.5)',
                paddingLeft: 16,
                margin: 0,
              }}
            >
              "INARI has simplified our wholesale distribution. Logging batches is
              intuitive, and our clients love the transparent crop traceability."
            </blockquote>
            <div style={{ display: 'flex', gap: 3, marginTop: 14 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={13} fill="#fbbf24" color="#fbbf24" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;