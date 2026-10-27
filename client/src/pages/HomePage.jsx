import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, ShoppingBag, Zap, ShieldCheck, Star, Heart, Truck, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api.js';
import { setCart } from '../store/slices/cartSlice.js';
import { setWishlist } from '../store/slices/wishlistSlice.js';
import { toggleCartDrawer } from '../store/slices/uiSlice.js';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { products: wishlistItems } = useSelector((state) => state.wishlist);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/categories'),
        ]);
        setFeaturedProducts(prodRes.data.data.products || []);
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error('Error loading home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    try {
      setAddingId(product._id);
      const res = await api.post('/cart', { productId: product._id, quantity: 1 });
      dispatch(setCart(res.data.data));
      toast.success(`${product.name} added to cart!`);
      dispatch(toggleCartDrawer());
    } catch (error) {
      toast.error(error.message || 'Error adding to cart');
    } finally {
      setAddingId(null);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save items');
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/wishlist/${productId}`);
      dispatch(setWishlist(res.data.data));
      toast.success(res.data.message || 'Wishlist updated');
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const isWishlisted = (id) => wishlistItems.some((item) => (item._id || item) === id);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 pt-20 pb-28">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/15 rounded-full blur-[130px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
          <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs sm:text-sm font-semibold mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" /> Discover What's Next in Everyday Luxury
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-heading text-white tracking-tight leading-tight max-w-4xl mb-6">
            Elevate Your Lifestyle with <span className="gradient-text">ShopSphere</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
            Curated precision electronics, contemporary streetwear, and architectural home living designed for the uncompromising individual.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/products"
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 group"
            >
              Shop Full Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/products?category=featured"
              className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-md text-white font-semibold rounded-2xl border border-slate-700/50 transition-all flex items-center justify-center"
            >
              View Featured Items
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Highlights Grid */}
      <section className="py-20 bg-slate-950 relative border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-2">
                Handpicked Excellence
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white">
                Featured Products
              </h2>
            </div>
            <Link
              to="/products?category=featured"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              See All Featured <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl h-[380px] animate-pulse bg-slate-800/30" />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 text-slate-500">No featured products available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => {
                const currentPrice = product.discountPrice || product.price;
                const imageUrl = product.images?.[0]?.secure_url || '/placeholder.svg';
                const wish = isWishlisted(product._id);

                return (
                  <div
                    key={product._id}
                    className="glass-card rounded-2xl overflow-hidden group flex flex-col border border-slate-800/80 hover:border-slate-700 transition-all duration-300 shadow-xl"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-900">
                      <Link to={`/products/${product._id}`}>
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      {product.discountPrice && (
                        <span className="absolute top-3 left-3 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                          SALE
                        </span>
                      )}

                      <button
                        onClick={() => handleToggleWishlist(product._id)}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-md ${
                          wish
                            ? 'bg-pink-500/30 text-pink-400 border border-pink-500/40'
                            : 'bg-slate-950/70 text-slate-400 hover:text-pink-400 hover:bg-slate-900'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${wish ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-indigo-400 font-medium capitalize">
                          {product.category?.name || 'Curated'}
                        </span>
                        {product.ratings > 0 && (
                          <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                            <Star className="w-3.5 h-3.5 fill-current" /> {product.ratings}
                          </div>
                        )}
                      </div>

                      <Link to={`/products/${product._id}`} className="block mb-3">
                        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-indigo-300 transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-white">${currentPrice.toFixed(2)}</span>
                          {product.discountPrice && (
                            <span className="text-xs text-slate-500 line-through ml-1.5">
                              ${product.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={addingId === product._id || product.stock < 1}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                        >
                          {addingId === product._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ShoppingBag className="w-3.5 h-3.5" />
                          )}
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-24 bg-slate-950 relative border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-2">
                Departments
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white">
                Shop by Category
              </h2>
            </div>
            <Link
              to="/categories"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Browse All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(categories.length > 0 ? categories.slice(0, 3) : [
              { name: 'Electronics', slug: 'electronics', image: { secure_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop' } },
              { name: 'Fashion', slug: 'fashion', image: { secure_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop' } },
              { name: 'Home & Living', slug: 'home', image: { secure_url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop' } },
            ]).map((cat, i) => (
              <Link
                key={i}
                to={`/products?category=${cat.slug}`}
                className="group relative h-[320px] rounded-3xl overflow-hidden glass-card border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-500"
              >
                <img
                  src={cat.image?.secure_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800&auto=format&fit=crop'}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-50 group-hover:opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                  <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
