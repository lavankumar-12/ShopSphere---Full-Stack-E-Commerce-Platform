import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircle2, Package, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { clearCartState } from '../../store/slices/cartSlice.js';
import api from '../../services/api.js';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const dispatch = useDispatch();

  const [order, setOrder] = useState(null);
  const [confirming, setConfirming] = useState(true);

  useEffect(() => {
    // Clear local cart
    dispatch(clearCartState());

    const confirmOrder = async () => {
      if (!orderId) {
        setConfirming(false);
        return;
      }
      try {
        // Confirm payment and sync order in database
        const res = await api.post(`/orders/${orderId}/confirm-payment`);
        setOrder(res.data.data);
      } catch (err) {
        // If already confirmed or can fetch order directly
        try {
          const res = await api.get(`/orders/${orderId}`);
          setOrder(res.data.data);
        } catch {
          // ignore
        }
      } finally {
        setConfirming(false);
      }
    };

    confirmOrder();
  }, [orderId, dispatch]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 py-12">
      <div className="glass-card p-8 sm:p-12 rounded-3xl max-w-xl w-full text-center border-emerald-500/20 shadow-[0_0_50px_-10px_rgba(16,185,129,0.15)]">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold font-heading text-white mb-3">Order Confirmed!</h1>
        <p className="text-slate-400 mb-6 text-sm leading-relaxed">
          Thank you for shopping with ShopSphere. Your payment has been received and fulfillment is now underway.
        </p>

        {orderId && (
          <div className="bg-slate-900/60 rounded-2xl p-4 mb-6 border border-slate-800 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500">Order Reference</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-md">
                {order?.paymentStatus || 'PAID'}
              </span>
            </div>
            <p className="text-indigo-400 font-mono text-sm font-bold tracking-wider">{orderId}</p>

            {order && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span className="text-slate-200 font-medium">{order.orderItems?.length || 0} product(s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className="text-white font-bold">${(order.totalPrice || 0).toFixed(2)}</span>
                </div>
                {order.shippingAddress && (
                  <div className="flex items-start gap-1 pt-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span className="truncate">
                      {order.shippingAddress.street}, {order.shippingAddress.city}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" /> View My Orders
          </Link>
          <Link
            to="/products"
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
