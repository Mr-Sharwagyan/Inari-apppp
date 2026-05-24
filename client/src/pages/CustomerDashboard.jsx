import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Tractor,
  ArrowRight,
  Sprout,
  ShieldCheck,
  HeartHandshake,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import api from '../services/api';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#f4fff7] via-[#f8faf7] to-[#eefbf3] text-slate-900">

      {/* Background Glow */}
      <div className="absolute top-[-150px] left-[-100px] w-[450px] h-[450px] bg-green-300/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-emerald-400/20 blur-3xl rounded-full" />

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-7 z-10">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg text-sm font-semibold text-green-900">
              <Sparkles className="w-4 h-4 text-green-600" />
              Next Generation Smart Agriculture Platform
            </div>

            {/* Main Heading */}
            <h1 className="mt-7 text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-[-0.05em] text-slate-900">
              Empowering Growers
              <br />
              <span className="bg-gradient-to-r from-green-700 via-emerald-500 to-lime-500 bg-clip-text text-transparent">
                Connecting Markets.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              INARI transforms agricultural supply chains with intelligent ERP
              crop tracking, transparent sourcing, and a powerful wholesale
              marketplace connecting farmers directly with buyers.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">

              <Link
                to="/shop"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-green-700 to-emerald-600 hover:scale-105 transition-all duration-300 text-white font-bold px-7 py-4 rounded-2xl shadow-[0_15px_40px_rgba(34,197,94,0.35)]"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xl hover:bg-white border border-white/60 text-slate-900 font-bold px-7 py-4 rounded-2xl shadow-lg transition-all duration-300"
              >
                Register Farm
              </Link>

            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-10 mt-10">

              <div>
                <div className="text-4xl font-black text-green-800">12K+</div>
                <div className="text-sm text-slate-500 mt-1">
                  Farmers Connected
                </div>
              </div>

              <div>
                <div className="text-4xl font-black text-green-800">98%</div>
                <div className="text-sm text-slate-500 mt-1">
                  Delivery Success
                </div>
              </div>

              <div>
                <div className="text-4xl font-black text-green-800">340+</div>
                <div className="text-sm text-slate-500 mt-1">
                  Verified Farms
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT HERO CARD */}
          <div className="lg:col-span-5 relative flex justify-center">

            <div className="relative w-full max-w-md aspect-square rounded-[40px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#163826] via-[#0f2d1d] to-[#07150d] shadow-[0_25px_80px_rgba(0,0,0,0.35)] p-8">

              {/* Glow */}
              <div className="absolute top-[-50px] right-[-50px] w-[180px] h-[180px] bg-green-400/20 blur-3xl rounded-full" />

              {/* Top */}
              <div className="relative z-10 flex justify-between items-start">

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
                  <Tractor className="w-7 h-7 text-green-300" />
                </div>

                <div className="px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-xl text-xs font-bold text-green-200">
                  Active Batches: 148
                </div>

              </div>

              {/* Center */}
              <div className="relative z-10 mt-12 space-y-5">

                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex justify-between items-center">

                  <div>
                    <div className="text-[11px] tracking-widest uppercase text-green-300 font-bold">
                      Crop Ledger
                    </div>

                    <div className="text-xl font-bold text-white mt-1">
                      Organic Wheat
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] uppercase text-green-300 font-bold">
                      Stock Value
                    </div>

                    <div className="text-xl font-black text-white mt-1">
                      $1,250
                    </div>
                  </div>

                </div>

                <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex justify-between items-center">

                  <div>
                    <div className="text-[11px] tracking-widest uppercase text-green-300 font-bold">
                      Quality Grade
                    </div>

                    <div className="text-xl font-bold text-white mt-1">
                      Grade A Certified
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-lg font-black text-emerald-300">
                    A
                  </div>

                </div>

              </div>

              {/* Bottom Graph */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent" />

            </div>

          </div>

        </div>

      </section>

      {/* DIVIDER */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-200 to-transparent" />

      {/* FEATURES */}
      <section className="py-24">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-16">

            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Agriculture Infrastructure Reimagined
            </h2>

            <p className="mt-4 text-slate-600 text-lg">
              Intelligent ERP systems combined with transparent marketplace
              technology.
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* CARD */}
            <div className="group p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)] transition-all duration-500">

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-lg">
                <Tractor className="w-8 h-8 text-green-800" />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">
                Crop Batch ERP
              </h3>

              <p className="mt-4 text-slate-600 leading-relaxed">
                Track storage, crop yields, inventory bins, and quality metrics
                in one centralized intelligent system.
              </p>

            </div>

            {/* CARD */}
            <div className="group p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)] transition-all duration-500">

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-8 h-8 text-green-800" />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">
                Transparent Sourcing
              </h3>

              <p className="mt-4 text-slate-600 leading-relaxed">
                Buyers can verify harvest dates, crop origins, and quality
                certifications directly from the farmers.
              </p>

            </div>

            {/* CARD */}
            <div className="group p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)] transition-all duration-500">

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-lg">
                <HeartHandshake className="w-8 h-8 text-green-800" />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">
                Farmer Ecosystem
              </h3>

              <p className="mt-4 text-slate-600 leading-relaxed">
                Direct market access empowers growers with better profits while
                businesses secure premium produce at scale.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* CATEGORY SECTION */}
      <section className="py-24 relative">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-end mb-14">

            <div>
              <h2 className="text-4xl font-black tracking-tight text-slate-900">
                Shop by Category
              </h2>

              <p className="mt-2 text-slate-600">
                Fresh produce sourced directly from verified farms.
              </p>
            </div>

            <Link
              to="/shop"
              className="flex items-center gap-2 text-green-700 font-bold hover:gap-3 transition-all"
            >
              Browse Marketplace
              <ChevronRight className="w-5 h-5" />
            </Link>

          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-3xl bg-white p-5 shadow-lg"
                >
                  <div className="aspect-[4/3] rounded-2xl bg-slate-200" />
                  <div className="h-5 bg-slate-200 rounded mt-4 w-1/2" />
                </div>
              ))}

            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${cat.name}`}
                  className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-[28px] overflow-hidden hover:-translate-y-3 hover:shadow-[0_25px_60px_rgba(34,197,94,0.18)] transition-all duration-500"
                >

                  <div className="overflow-hidden aspect-[4/3]">

                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />

                  </div>

                  <div className="p-5">

                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                      {cat.name}
                    </h4>

                    <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                      {cat.description}
                    </p>

                  </div>

                </Link>
              ))}

            </div>
          )}

        </div>

      </section>

    </div>
  );
};

export default Home;