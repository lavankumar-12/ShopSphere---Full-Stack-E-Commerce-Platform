import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Truck, ShieldCheck, Heart, ShoppingBag, Plus, Minus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';
import { toggleCartDrawer } from '../../store/slices/uiSlice.js';
import { setCart } from '../../store/slices/cartSlice.js';
import { setWishlist } from '../../store/slices/wishlistSlice.js';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(state => state.auth);
  const { products: wishlistItems } = useSelector(state => state.wishlist);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (error) {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      setAddingToCart(true);
      const res = await api.post('/cart', { productId: product._id, quantity });
      dispatch(setCart(res.data.data)); // Sync full cart from response
      toast.success('Added to cart!');
      dispatch(toggleCartDrawer());
    } catch (error) {
      toast.error(error.message || 'Error adding to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login', { state: { from: location } });
      return;
    }
    try {
      const res = await api.post(`/wishlist/${product._id}`);
      dispatch(setWishlist(res.data.data));
      toast.success(res.data.message || 'Wishlist updated!');
    } catch (error) {
      toast.error('Error updating wishlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const currentPrice = product.discountPrice || product.price;
  const isWishlisted = wishlistItems.some(item => (item._id || item) === product._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 glass-card">
            <img
              src={product.images?.[activeImage]?.secure_url || product.images?.[0]?.secure_url || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={img.public_id || idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-indigo-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.secure_url} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <p className="text-indigo-400 font-semibold mb-2 capitalize">{product.category?.name || 'Category'}</p>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-sm mb-6">
              <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full font-medium">
                <Star className="w-4 h-4 fill-current" /> {product.ratings} ({product.numReviews} Reviews)
              </div>
              <span className={`px-2.5 py-1 rounded-full font-medium ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex items-end gap-3 mb-8">
              <span className="text-4xl font-bold text-white">${currentPrice.toFixed(2)}</span>
              {product.discountPrice && (
                <span className="text-xl text-slate-500 line-through mb-1">${product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="text-slate-300 leading-relaxed mb-8">
              {product.description}
            </p>
          </div>

          {/* Action Area */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 text-slate-400 hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-white font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-3 text-slate-400 hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleWishlist}
                title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                className={`p-3 rounded-xl border transition-all ${
                  isWishlisted
                    ? 'bg-pink-500/20 text-pink-400 border-pink-500/40 shadow-sm shadow-pink-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 border-slate-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock < 1}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-900/30 border border-slate-800 rounded-2xl">
              <Truck className="w-6 h-6 text-indigo-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Free Shipping</h4>
                <p className="text-xs text-slate-400">On orders over $100</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-900/30 border border-slate-800 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Secure Payment</h4>
                <p className="text-xs text-slate-400">Powered by Stripe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
