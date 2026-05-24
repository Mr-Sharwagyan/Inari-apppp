import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tractor, ArrowRight, Sprout, ShieldCheck, HeartHandshake, ChevronRight } from 'lucide-react';
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
    <div className="bg-[#FAF9F5] overflow-hidden">

      {/* 1. Hero Section with soft earth tones & premium typography */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Soft floating background highlights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-100/30 rounded-full blur-3xl -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Hero Content Column */}
          <div className="lg:col-span-7 space-y-6 text-left">

            {/* Soft badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100/50 border border-primary-200/40 text-orange-900 rounded-full text-xs font-bold tracking-tight">
              <Sprout className="w-3.5 h-3.5" />
              Next-Gen Smart Agriculture Ecosystem
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black tracking-tight leading-[1.08]">
              Empowering growers<br />
              Connecting markets<span className="text-black font-medium">.</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
              INARI streamlines agricultural supply chains. We provide farmers with robust batch-level ERP crop tracking, and buyers with transparent access to fresh wholesale products.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/shop"
                className="bg-green-700 hover:bg-green-950 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Explore Marketplace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth"
                className="bg-white hover:bg-stone-50 text-primary-950 font-bold px-6 py-3.5 rounded-xl text-sm border border-stone-200 shadow-sm transition-all flex items-center gap-1.5"
              >
                Register Farm Profile
              </Link>
            </div>

          </div>

          {/* Hero Visual Column */}
          {/* Hero Visual Column */}
          <div className="lg:col-span-5 relative flex justify-center">

            {/* Glow */}
            <div className="absolute -top-10 -right-10 w-56 h-56 bg-emerald-400/30 blur-3xl rounded-full" />

            {/* Main Card */}
            <div className="relative w-full max-w-md rounded-[40px] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.35)] border border-white/10 bg-[#0d1f16]">

              {/* IMAGE */}
              <div className="relative h-[420px] overflow-hidden">

                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop"
                  alt="Farm"
                  className="w-full h-full object-cover"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07150d] via-[#07150d]/30 to-transparent" />

              </div>

              {/* Floating Dashboard Card */}
              <div className="absolute top-6 left-6 right-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5">

                <div className="flex justify-between items-start">

                  <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                    <Tractor className="w-6 h-6 text-emerald-300" />
                  </div>

                  <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-orange-800">
                    Active Batches: 148
                  </div>

                </div>

                <div className="mt-5 space-y-4">

                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex justify-between">

                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-green-800 font-bold">
                        Crop Ledger
                      </div>

                      <div className="text-black font-bold mt-1">
                        Organic Wheat
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase text-orange-800 font-bold">
                        Stock Value
                      </div>

                      <div className="text-red-700 font-black mt-1">
                        $1,250
                      </div>
                    </div>

                  </div>

                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex justify-between items-center">

                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-green-800 font-bold">
                        Quality Grade
                      </div>

                      <div className="text-black font-bold mt-1">
                        Grade A Certified
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-green-800 font-black">
                      A
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section >

  {/* 2. Features Grid */ }
  < section className = "bg-white border-y border-stone-200/50 py-20" >
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

        <div className="p-6 rounded-2xl border border-stone-200/50 space-y-4 hover:shadow-soft transition-all duration-350">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-800 border border-primary-100">
            <Tractor className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-primary-950">Crop Batch ERP</h3>
          <p className="text-xs text-sage-500 leading-relaxed">
            Farmers can log crop yields, track storage temperatures, location bins, and quality ratings. Automated inventory calculations keep markets informed.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-stone-200/50 space-y-4 hover:shadow-soft transition-all duration-350">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-800 border border-primary-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-primary-950">Transparent Sourcing</h3>
          <p className="text-xs text-sage-500 leading-relaxed">
            Every crop listed in the marketplace displays full batch transparency, harvest dates, expiry estimations, and direct contact widgets for the farmers.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-stone-200/50 space-y-4 hover:shadow-soft transition-all duration-350">
          <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-800 border border-primary-100">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-primary-950">Farmer Ecosystem</h3>
          <p className="text-xs text-sage-500 leading-relaxed">
            Direct transactions eliminate wholesale markups, ensuring growers retain higher profit margins while commercial buyers secure cheaper premium bulk goods.
          </p>
        </div>

      </div>
    </div>
      </section >

  {/* 3. Category Carousel/Grid Section */ }
  < section className = "py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
    <div className="flex justify-between items-end mb-12">
      <div className="text-left space-y-1.5">
        <h2 className="text-3xl font-extrabold text-primary-950 tracking-tight">Shop by Category</h2>
        <p className="text-sm text-sage-500">Fresh organic crops sourced directly from the fields.</p>
      </div>
      <Link to="/shop" className="text-sm font-bold text-primary-800 hover:text-primary-950 flex items-center gap-1">
        Browse All Crops
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>

{
  loading ? (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3 animate-pulse">
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
          className="group bg-white border border-stone-200/60 rounded-3xl p-4 hover:shadow-soft-lg hover:border-primary-200 transition-all duration-300 flex flex-col"
        >
          <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-stone-100">
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
  )
}
      </section >

  {/* 4. Farmer Highlight Showcase */ }
  < section className = "bg-primary-900 text-[#FAF9F5] py-20 relative overflow-hidden select-none" >
    {/* Glow overlay */ }
    < div className = "absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-800/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        <div className="lg:col-span-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Grow Your Distribution Network
          </h2>
          <p className="text-sm text-sage-300 leading-relaxed max-w-lg">
            Are you a farmer? Create your digital farm profile, list products, trace active crop yields via inventory batches, and manage incoming delivery pipeline statuses directly through the INARI SaaS admin console.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/auth"
              className="bg-[#FAF9F5] hover:bg-stone-50 text-primary-950 font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-md"
            >
              Apply as a Farmer
            </Link>
            <a
              href="#"
              className="text-white hover:text-primary-200 font-bold text-sm flex items-center gap-1.5"
            >
              Read documentation
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6.5 max-w-md w-full backdrop-blur-md">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-primary-400 mb-4">Farmer Highlights</h4>
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=300&q=80"
                  alt="Farmer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-base text-white">Green Valley Farms</div>
                <div className="text-xs text-primary-300">Sonoma County, California</div>
                <div className="text-[10px] text-sage-400 mt-0.5">Organic certified grains & vegetables</div>
              </div>
            </div>
            <blockquote className="mt-4 text-xs italic text-sage-300/90 leading-relaxed border-l-2 border-primary-500 pl-4.5">
              "INARI has simplified our wholesale distribution. Logging batches is intuitive, and our clients love the transparent crop traceability."
            </blockquote>
          </div>
        </div>

      </div>
      </section >

    </div >
  );
};

export default Home;
