import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ArrowRight, Loader2, MapPin, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        setOrders(res.data.data || []);
      } catch (error) {
        toast.error('Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-500 mb-6 border border-slate-800">
          <Package className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-white mb-3">No Orders Yet</h2>
        <p className="text-slate-400 mb-8 max-w-sm text-center">
          You haven't placed any orders yet. Once you place an order, you can track fulfillment right here!
        </p>
        <Link
          to="/products"
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(79,70,229,0.4)] flex items-center gap-2"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Order History</h1>
          <p className="text-slate-400 mt-1">Track current shipments and view details of past purchases</p>
        </div>
        <Link
          to="/products"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2"
        >
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });

          return (
            <div
              key={order._id}
              className="glass-card rounded-3xl overflow-hidden border border-slate-800 transition-all hover:border-slate-700"
            >
              {/* Order Card Header */}
              <div className="p-6 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <span className="block text-xs text-slate-500 mb-0.5">Order ID</span>
                    <span className="font-mono font-semibold text-white tracking-wider">
                      #{order._id.substring(0, 8)}...{order._id.substring(order._id.length - 4)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-0.5">Date Placed</span>
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formattedDate}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-0.5">Payment Method</span>
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" /> {order.paymentMethod || 'Stripe'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-0.5">Total Amount</span>
                    <span className="text-lg font-bold text-indigo-400">
                      ${(order.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.orderStatus)}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-slate-800/50">
                {order.orderItems?.map((item, idx) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 sm:gap-6">
                    <div className="w-20 h-20 bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.product ? (
                        <Link
                          to={`/products/${item.product}`}
                          className="text-base font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <h4 className="text-base font-semibold text-white line-clamp-1">{item.name}</h4>
                      )}
                      <p className="text-sm text-slate-400 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-white">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                      <p className="text-xs text-slate-500">${(item.price || 0).toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer Info */}
              <div className="p-6 bg-slate-950/40 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    Ship to:{' '}
                    <strong className="text-slate-300 font-medium">
                      {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                    </strong>
                  </span>
                </div>
                <div>
                  Payment Status:{' '}
                  <span className={`font-bold ml-1 ${order.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
