import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart, getCustomerPrice } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Tractor, MapPin, Phone, Mail, ShoppingCart, ArrowLeft, ShieldCheck, Heart } from 'lucide-react';
import { CardSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';
import { useWishlist } from '../context/WishlistContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const showToast = useToast();


  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const wishlist = isInWishlist(id);

  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);

        // Fetch related products
        const relRes = await api.get(`/products?category=${res.data.category}`);
        // Exclude current product
        setRelated(relRes.data.filter(p => p._id !== id).slice(0, 3));
      } catch (err) {
        console.error('Failed to load product:', err.message);
        showToast('Product details not found.', 'error');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    loadProductDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-6 w-24 bg-stone-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-stone-200 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-stone-200 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-stone-200 rounded animate-pulse" />
            <div className="h-24 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const stockPercentage = Math.min((product.stock / 200) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back button */}
      <div className="text-left mb-6">
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-500 hover:text-primary-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white border border-stone-200/60 p-6 sm:p-8 rounded-3xl shadow-soft">
        
        {/* Large Product Preview Image */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-stone-50 border border-stone-100">
            <img
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=800&q=80'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Details Actions and Metadata */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            
            {/* Category tag and status badge */}
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-extrabold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200/20">
                {product.category}
              </span>
              <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-700' : 'text-red-650'}`}>
                {product.stock > 0 ? 'In Stock & Verifiable' : 'Out of Stock'}
              </span>
            </div>

            <h2 className="text-3xl font-extrabold text-primary-950 tracking-tight leading-tight">
              {product.name}
            </h2>

            {/* Price display */}
            <div className="flex items-baseline gap-2 py-2">
              <span className="text-3xl font-extrabold text-primary-950">Rs.{getCustomerPrice(product.price).toFixed(2)}</span>
              <span className="text-[11px] text-sage-400 font-semibold block mt-0.5">Farmer price: Rs.{product.price.toFixed(2)}</span>
              <span className="text-xs text-sage-450 font-semibold">per {product.unit}</span>
            </div>

            <p className="text-xs text-sage-600 leading-relaxed">
              {product.description}
            </p>

            {/* Stock Level status bar */}
            {product.stock > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] font-bold text-sage-500 uppercase">
                  <span>Available Reserve</span>
                  <span>{product.stock} {product.unit}</span>
                </div>
                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/30">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Add to Cart Actions */}
          <div className="space-y-4 pt-6 border-t border-stone-100">
            {product.stock > 0 ? (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-sage-600">Quantity:</span>
                  <div className="flex items-center border border-stone-200 rounded-xl p-0.5">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3.5 py-1.5 hover:bg-stone-50 text-sage-600 rounded-lg font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-xs font-bold text-primary-950">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      className="px-3.5 py-1.5 hover:bg-stone-50 text-sage-600 rounded-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 pt-2">
                  <button
                    onClick={() => {
                      addToCart(product, quantity);
                      showToast(`${quantity} ${product.unit} of ${product.name} added to cart!`, 'success');
                    }}
                    className="col-span-4 bg-primary-900 hover:bg-primary-950 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 border border-primary-950/20"
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                    Add to Order Cart
                  </button>
                  <button
                    onClick={() => {
                      if (wishlist) {
                        removeFromWishlist(product._id);
                        showToast('Removed from Wishlist', 'info');
                      } else {
                        addToWishlist(product);
                        showToast('Saved to Wishlist!', 'success');
                      }
                    }}
                    className={`col-span-1 border rounded-xl flex items-center justify-center transition-colors ${
                      wishlist
                        ? 'bg-red-50 border-red-200 text-red-600'
                        : 'border-stone-200 hover:bg-stone-50 text-sage-400'
                    }`}
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-900 text-xs font-medium">
                <span>⚠️ Out of Stock. Farmer is harvesting the next batch. Check back soon.</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sourcing / Farmer Verification Widget */}
      <section className="mt-8 bg-white border border-stone-200/60 rounded-3xl p-6 sm:p-8 shadow-soft">
        <h3 className="font-extrabold text-base text-primary-950 tracking-tight mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Verified Sourcing & Farm Profile
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Logo/Icon */}
          <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-stone-100 pb-4 md:pb-0">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center font-extrabold text-primary-800 text-xl">
              {product.farmerName.charAt(0)}
            </div>
            <div>
              <div className="font-extrabold text-primary-950 text-base leading-snug">{product.farmerName}</div>
              <div className="text-[10px] uppercase font-bold text-sage-400 tracking-wider">Independent Certified Grower</div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-sage-400 font-bold uppercase block">Location</span>
              <div className="flex items-center gap-1 text-sage-700">
                <MapPin className="w-3.5 h-3.5 text-sage-400" />
                <span>{product.farmerAddress || 'Thimi,Bhaktapur'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-sage-400 font-bold uppercase block">Contact Phone</span>
              <div className="flex items-center gap-1 text-sage-700">
                <Phone className="w-3.5 h-3.5 text-sage-400" />
                <span>{product.farmerPhone || '+977 9800000000'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-sage-400 font-bold uppercase block">Email Address</span>
              <div className="flex items-center gap-1 text-sage-700">
                <Mail className="w-3.5 h-3.5 text-sage-400" />
                <span className="truncate">{product.farmerEmail || 'farmer@inari.com'}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="mt-12 space-y-6">
          <h3 className="font-extrabold text-lg text-primary-950 tracking-tight">Other crops in this category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((prod) => (
              <div
                key={prod._id}
                className="bg-white border border-stone-200/60 rounded-3xl p-4 hover:shadow-soft hover:border-primary-200 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <Link to={`/products/${prod._id}`} className="block rounded-2xl overflow-hidden aspect-[4/3] mb-3 bg-stone-50">
                    <img
                      src={prod.images?.[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                  </Link>
                  <Link to={`/products/${prod._id}`} className="font-bold text-sm text-primary-950 hover:text-primary-800 leading-tight block mb-1">
                    {prod.name}
                  </Link>
                  <span className="text-[10px] text-sage-400 font-medium">Sourced from: {prod.farmerName}</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-100">
                  <span className="text-sm font-extrabold text-primary-950">Rs.{getCustomerPrice(prod.price).toFixed(2)}</span>
                  <Link
                    to={`/products/${prod._id}`}
                    className="text-[10px] bg-primary-50 text-primary-900 font-bold px-2.5 py-1.5 rounded-lg border border-primary-200/20"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetail;