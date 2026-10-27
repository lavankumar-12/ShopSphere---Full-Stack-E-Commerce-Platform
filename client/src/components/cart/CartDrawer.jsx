import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { toggleCartDrawer } from '../../store/slices/uiSlice.js';
import { setCart } from '../../store/slices/cartSlice.js';
import api from '../../services/api.js';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { isCartDrawerOpen } = useSelector((state) => state.ui);
  const { items, totalPrice } = useSelector((state) => state.cart);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await handleRemove(productId);
        return;
      }
      const res = await api.put(`/cart/${productId}`, { quantity: newQuantity });
      dispatch(setCart(res.data.data));
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (productId) => {
    try {
      const res = await api.delete(`/cart/${productId}`);
      dispatch(setCart(res.data.data));
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  if (!isCartDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => dispatch(toggleCartDrawer())}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Your Cart</h2>
            <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
              {items.length} items
            </span>
          </div>
          <button
            onClick={() => dispatch(toggleCartDrawer())}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-500 mb-2">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold text-white">Your cart is empty</h3>
              <p className="text-slate-400 text-sm max-w-[250px]">
                Looks like you haven't added anything to your cart yet.
              </p>
              <button
                onClick={() => dispatch(toggleCartDrawer())}
                className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const prodId = item.product?._id || item.product;
                const prodName = item.product?.name || 'Product';
                const prodImage = item.product?.images?.[0]?.secure_url || '/placeholder.svg';

                return (
                  <div key={prodId} className="flex gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                      <img
                        src={prodImage}
                        alt={prodName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-white line-clamp-2">{prodName}</h4>
                        <p className="text-xs text-indigo-400 font-semibold mt-1">${(item.price || 0).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(prodId, item.quantity - 1)}
                            className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-sm font-medium text-white">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(prodId, item.quantity + 1)}
                            className="px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(prodId)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white font-semibold">${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Shipping, taxes, and discounts calculated at checkout.
            </p>
            <div className="flex gap-3">
              <Link
                to="/cart"
                onClick={() => dispatch(toggleCartDrawer())}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors text-center"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => dispatch(toggleCartDrawer())}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
