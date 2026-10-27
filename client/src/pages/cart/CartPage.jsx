import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';
import { setCart } from '../../store/slices/cartSlice.js';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice } = useSelector(state => state.cart);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await removeItem(productId);
        return;
      }
      const res = await api.put(`/cart/${productId}`, { quantity: newQuantity });
      dispatch(setCart(res.data.data));
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      dispatch(setCart(res.data.data));
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-slate-500 mb-6 border border-slate-800">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-white mb-3">Your Cart is Empty</h2>
        <p className="text-slate-400 mb-8 max-w-sm text-center">
          Looks like you haven't added anything to your cart yet. Discover our premium collection today!
        </p>
        <Link to="/products" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)]">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shipping = totalPrice > 100 ? 0 : 15;
  const tax = totalPrice * 0.05;
  const finalTotal = totalPrice + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold font-heading text-white mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          <div className="glass-card rounded-3xl overflow-hidden border border-slate-800">
            {items.map((item, index) => {
              const prodId = item.product?._id || item.product;
              const prodName = item.product?.name || 'Product';
              const prodImage = item.product?.images?.[0]?.secure_url || '/placeholder.svg';

              return (
                <div key={prodId} className={`p-6 flex flex-col sm:flex-row gap-6 ${index !== items.length - 1 ? 'border-b border-slate-800/60' : ''}`}>
                  <Link to={`/products/${prodId}`} className="w-full sm:w-32 h-32 bg-slate-900 rounded-2xl overflow-hidden shrink-0 border border-slate-800">
                    <img src={prodImage} alt={prodName} className="w-full h-full object-cover" />
                  </Link>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link to={`/products/${prodId}`}>
                          <h3 className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-2">
                            {prodName}
                          </h3>
                        </Link>
                        <p className="text-indigo-400 font-bold mt-2">${(item.price || 0).toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeItem(prodId)} className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl h-10">
                        <button onClick={() => updateQuantity(prodId, item.quantity - 1)} className="px-3 h-full text-slate-400 hover:text-white transition-colors">-</button>
                        <span className="w-10 text-center text-white font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(prodId, item.quantity + 1)} className="px-3 h-full text-slate-400 hover:text-white transition-colors">+</button>
                      </div>
                      <span className="font-semibold text-white">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="glass-card p-6 rounded-3xl sticky top-28">
            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium text-white">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span className="font-medium text-white">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estimated Tax (5%)</span>
                <span className="font-medium text-white">${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-700/50 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-semibold text-white">Total</span>
                <span className="text-2xl font-bold text-indigo-400">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)]"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure Checkout powered by Stripe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
