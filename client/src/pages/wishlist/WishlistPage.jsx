import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Trash2, ShoppingBag, ArrowRight, Star, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';
import { setWishlist, setWishlistLoading } from '../../store/slices/wishlistSlice.js';
import { setCart } from '../../store/slices/cartSlice.js';
import { toggleCartDrawer } from '../../store/slices/uiSlice.js';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products: wishlistItems, isLoading } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) return;
      try {
        dispatch(setWishlistLoading(true));
        const res = await api.get('/wishlist');
        dispatch(setWishlist(res.data.data));
      } catch (error) {
        toast.error('Failed to load wishlist');
      } finally {
        dispatch(setWishlistLoading(false));
      }
    };
    fetchWishlist();
  }, [dispatch, isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      const res = await api.post(`/wishlist/${productId}`);
      dispatch(setWishlist(res.data.data));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to cart');
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center text-pink-500 mb-6">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-white mb-3">Sign in to View Your Wishlist</h2>
        <p className="text-slate-400 mb-8 max-w-sm text-center">
          Save items you love and access your personal wishlist across all your devices.
        </p>
        <Link
          to="/login"
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)]"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-500 mb-6 border border-slate-800">
          <Heart className="w-10 h-10 text-pink-500/50" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-white mb-3">Your Wishlist is Empty</h2>
        <p className="text-slate-400 mb-8 max-w-sm text-center">
          Explore our trending collections and save your favorite products to buy later!
        </p>
        <Link
          to="/products"
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)] flex items-center gap-2"
        >
          Explore Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">My Wishlist</h1>
          <p className="text-slate-400 mt-1">You have {wishlistItems.length} saved item{wishlistItems.length > 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/products"
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => {
          const currentPrice = product.discountPrice || product.price;
          const imageUrl = product.images?.[0]?.secure_url || '/placeholder.svg';

          return (
            <div
              key={product._id}
              className="glass-card rounded-2xl overflow-hidden group flex flex-col border border-slate-800 hover:border-slate-700 transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-slate-900 overflow-hidden">
                <Link to={`/products/${product._id}`}>
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                {product.discountPrice && (
                  <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                    SALE
                  </span>
                )}
                <button
                  onClick={() => handleRemove(product._id)}
                  title="Remove from wishlist"
                  className="absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-full backdrop-blur-md transition-all shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-indigo-400 font-medium capitalize">
                    {product.brand || 'ShopSphere'}
                  </span>
                  {product.ratings > 0 && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{product.ratings}</span>
                    </div>
                  )}
                </div>

                <Link to={`/products/${product._id}`}>
                  <h3 className="text-sm font-semibold text-white line-clamp-2 hover:text-indigo-300 transition-colors mb-3">
                    {product.name}
                  </h3>
                </Link>

                <div className="mt-auto pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-white">${currentPrice.toFixed(2)}</span>
                    {product.discountPrice && (
                      <span className="text-xs text-slate-500 line-through ml-2">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product._id || product.stock < 1}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                  >
                    {addingId === product._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5" />
                    )}
                    {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
