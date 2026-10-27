import React, { useEffect, useState } from 'react';
import { Eye, Loader2, CheckCircle, X, MapPin, Calendar, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api.js';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order marked as ${status}`);
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: status });
      }
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'SHIPPED':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'; // PENDING
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-white">Order Fulfillment</h1>
        <p className="text-slate-400 mt-2">View incoming customer orders and update shipping delivery stages.</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Fulfillment Status</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-semibold">
                      #{order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{order.user?.name || 'Customer'}</p>
                      <p className="text-xs text-slate-500">{order.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ${(order.totalPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer transition-colors ${getStatusColor(order.orderStatus)}`}
                      >
                        <option value="PENDING" className="bg-slate-900 text-white">
                          PENDING
                        </option>
                        <option value="PROCESSING" className="bg-slate-900 text-white">
                          PROCESSING
                        </option>
                        <option value="SHIPPED" className="bg-slate-900 text-white">
                          SHIPPED
                        </option>
                        <option value="DELIVERED" className="bg-slate-900 text-white">
                          DELIVERED
                        </option>
                        <option value="CANCELLED" className="bg-slate-900 text-white">
                          CANCELLED
                        </option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View order details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-500">Order Inspection</span>
                <h2 className="text-xl font-bold font-mono text-indigo-400">
                  #{selectedOrder._id}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Status Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800 mb-6 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Customer</span>
                <span className="font-semibold text-white block">{selectedOrder.user?.name || 'Customer'}</span>
                <span className="text-slate-400">{selectedOrder.user?.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Payment</span>
                <span className="font-semibold text-white block">{selectedOrder.paymentMethod || 'Stripe'}</span>
                <span className="text-emerald-400 font-bold">{selectedOrder.paymentStatus}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Destination Address
              </h3>
              <p className="text-sm text-slate-300">
                {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city},{' '}
                {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode},{' '}
                {selectedOrder.shippingAddress?.country}
              </p>
            </div>

            {/* Ordered Items */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                Items ({selectedOrder.orderItems?.length || 0})
              </h3>
              <div className="space-y-3">
                {selectedOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800"
                      />
                      <div>
                        <span className="text-sm font-semibold text-white line-clamp-1 block">{item.name}</span>
                        <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Pricing Breakdown */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Price</span>
                <span className="text-white">${(selectedOrder.itemsPrice || 0).toFixed(2)}</span>
              </div>
              {selectedOrder.discountPrice > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-${selectedOrder.discountPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="text-white">${(selectedOrder.shippingPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax</span>
                <span className="text-white">${(selectedOrder.taxPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800 text-white">
                <span>Total Amount</span>
                <span className="text-indigo-400">${(selectedOrder.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
