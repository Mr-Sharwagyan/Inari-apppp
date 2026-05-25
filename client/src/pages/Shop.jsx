import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, MapPin, AlertCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { CardSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const showToast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI Preferences
  const [gridView, setGridView] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Active query state values
  const activeCategory = searchParams.get('category') || 'All';
  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const loadFiltersAndProducts = async () => {
      setLoading(true);
      try {
        // Fetch categories for filter list
        const catRes = await api.get('/categories');
        setCategories(catRes.data);

        // Fetch products with currently active queries
        const queryParams = new URLSearchParams();
        if (activeCategory !== 'All') queryParams.append('category', activeCategory);
        if (activeSearch) queryParams.append('search', activeSearch);
        if (activeSort) queryParams.append('sort', activeSort);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);

        const prodRes = await api.get(`/products?${queryParams.toString()}`);
        setProducts(prodRes.data);
      } catch (err) {
        console.error('Error fetching marketplace:', err.message);
        showToast('Failed to load marketplace products.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadFiltersAndProducts();
  }, [activeCategory, activeSearch, activeSort, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Banner / Breadcrumb */}
      <div className="text-left mb-8 space-y-1">
        <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight">Crop Marketplace</h1>
        <p className="text-sm text-sage-500">Traceable wholesale farm crops available for dispatch.</p>
      </div>

      {/* Main Grid: Filters Sidebar + Catalog Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          
          {/* Category Filter list */}
          <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft">
            <h3 className="font-bold text-xs uppercase text-primary-950 tracking-wider mb-4">Crops Category</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => updateParam('category', 'All')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === 'All'
                    ? 'bg-primary-900 text-white font-bold'
                    : 'text-sage-600 hover:bg-stone-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateParam('category', cat.name)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat.name
                      ? 'bg-primary-900 text-white font-bold'
                      : 'text-sage-600 hover:bg-stone-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filters */}
          <div className="bg-white border border-stone-200/60 p-5 rounded-2xl shadow-soft space-y-4">
            <h3 className="font-bold text-xs uppercase text-primary-950 tracking-wider">Price Bounds ($)</h3>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <span className="text-[10px] text-sage-400 font-bold uppercase block mb-1">Min Price</span>
                <input
                  type="number"
                  value={minPrice}
                  placeholder="Min"
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="w-full text-xs border border-stone-200 p-2.5 rounded-xl outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-sage-400 font-bold uppercase block mb-1">Max Price</span>
                <input
                  type="number"
                  value={maxPrice}
                  placeholder="Max"
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full text-xs border border-stone-200 p-2.5 rounded-xl outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <button
              onClick={handleClearFilters}
              className="w-full border border-stone-200 text-sage-600 hover:text-primary-900 py-2 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
            >
              Reset Filters
            </button>
          </div>

        </aside>

        {/* Catalog List section */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Header Controls: Search + Sort + Toggle layout */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white border border-stone-200/60 p-4 rounded-2xl shadow-soft">
            
            {/* Search Input bar */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 w-4 h-4 text-sage-400" />
              <input
                type="text"
                placeholder="Search crops, produce..."
                value={activeSearch}
                onChange={(e) => updateParam('search', e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
              />
            </div>

            {/* Sort Dropdown & Display Toggle controls */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-sage-400 font-bold">Sort</span>
                <select
                  value={activeSort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-primary-500 font-medium"
                >
                  <option value="newest">Newest Harvest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              <div className="flex items-center border border-stone-200 rounded-xl p-0.5 shrink-0">
                <button
                  onClick={() => setGridView(true)}
                  className={`p-1.5 rounded-lg transition-colors ${gridView ? 'bg-primary-50 text-primary-900' : 'text-sage-400 hover:text-sage-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridView(false)}
                  className={`p-1.5 rounded-lg transition-colors ${!gridView ? 'bg-primary-50 text-primary-900' : 'text-sage-400 hover:text-sage-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Product list grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-soft">
              <div className="w-16 h-16 rounded-full bg-stone-50 border border-stone-150 flex items-center justify-center text-stone-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-primary-950">No crops found</h3>
                <p className="text-xs text-sage-405">We couldn't find any products matching your query.</p>
              </div>
              <button
                onClick={handleClearFilters}
                className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : gridView ? (
            /* Grid View layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border border-stone-200/60 rounded-3xl p-4 flex flex-col hover:shadow-soft-lg hover:border-primary-200 transition-all duration-300 group"
                >
                  <Link to={`/products/${product._id}`} className="block rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-stone-50">
                    <img
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  </Link>

                  <div className="flex-grow flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-1.5">
                      <span className="text-[10px] uppercase font-extrabold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
                        {product.category}
                      </span>
                      <span className={`text-[10px] font-bold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-650'}`}>
                        {product.stock > 0 ? `${product.stock} ${product.unit} left` : 'Out of Stock'}
                      </span>
                    </div>

                    <Link to={`/products/${product._id}`} className="font-bold text-sm text-primary-950 hover:text-primary-850 leading-tight">
                      {product.name}
                    </Link>

                    {/* Farmer label */}
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-sage-400">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{product.farmerName}</span>
                    </div>

                    {/* Price and Cart checkout CTA */}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-100">
                      <div>
                        <span className="text-[10px] text-sage-400 font-bold block uppercase leading-none">Price per {product.unit}</span>
                        <span className="text-base font-extrabold text-primary-950">Rs.{product.price.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (product.stock <= 0) {
                            showToast('This product is out of stock.', 'warning');
                            return;
                          }
                          addToCart(product, 1);
                          showToast(`${product.name} added to cart!`, 'success');
                        }}
                        disabled={product.stock <= 0}
                        className="bg-primary-900 hover:bg-primary-950 disabled:bg-stone-200 text-white disabled:text-sage-400 p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center shrink-0 border border-primary-950/20"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View Layout */
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white border border-stone-200/60 rounded-3xl p-4 flex flex-col sm:flex-row gap-5 hover:shadow-soft transition-all duration-300 group"
                >
                  <Link to={`/products/${product._id}`} className="sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden bg-stone-50 shrink-0 block">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  </Link>

                  <div className="flex-grow flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-extrabold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full">
                          {product.category}
                        </span>
                        <span className={`text-[10px] font-bold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-650'}`}>
                          {product.stock > 0 ? `${product.stock} ${product.unit} left` : 'Out of Stock'}
                        </span>
                      </div>

                      <Link to={`/products/${product._id}`} className="font-bold text-base text-primary-950 hover:text-primary-850">
                        {product.name}
                      </Link>

                      <p className="text-xs text-sage-500 line-clamp-2 mt-1.5 leading-relaxed pr-6">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-1 mt-2 text-xs text-sage-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Sourced from: {product.farmerName}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-100">
                      <div>
                        <span className="text-[10px] text-sage-400 font-bold block uppercase leading-none">Price per {product.unit}</span>
                        <span className="text-lg font-extrabold text-primary-950">Rs.{product.price.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (product.stock <= 0) {
                            showToast('This product is out of stock.', 'warning');
                            return;
                          }
                          addToCart(product, 1);
                          showToast(`${product.name} added to cart!`, 'success');
                        }}
                        disabled={product.stock <= 0}
                        className="bg-primary-900 hover:bg-primary-950 disabled:bg-stone-200 text-white disabled:text-sage-400 px-4 py-2.5 rounded-xl transition-all shadow-sm text-xs font-semibold flex items-center gap-1.5"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

      </div>

    </div>
  );
};

export default Shop;
