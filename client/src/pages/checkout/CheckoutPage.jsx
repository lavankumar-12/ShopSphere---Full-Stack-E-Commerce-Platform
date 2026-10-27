import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { ShieldCheck, MapPin, Loader2, ArrowRight, Tag, Check, CreditCard, Banknote, Sparkles, X } from 'lucide-react';
import api from '../../services/api.js';
import { clearCartState } from '../../store/slices/cartSlice.js';

const addressSchema = z.object({
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(4, 'Valid postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Stripe'); // 'Stripe' | 'COD'
  
  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Address form
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: defaultAddr?.street || '',
      city: defaultAddr?.city || '',
      state: defaultAddr?.state || '',
      postalCode: defaultAddr?.postalCode || '',
      country: defaultAddr?.country || 'United States',
    },
  });

  useEffect(() => {
    if (defaultAddr) {
      setValue('street', defaultAddr.street || '');
      setValue('city', defaultAddr.city || '');
      setValue('state', defaultAddr.state || '');
      setValue('postalCode', defaultAddr.postalCode || '');
      setValue('country', defaultAddr.country || 'United States');
    }
  }, [defaultAddr, setValue]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      setValidatingCoupon(true);
      const res = await api.post('/orders/apply-coupon', {
        code: couponInput.trim(),
        itemsPrice: totalPrice,
      });
      setAppliedCoupon(res.data.data);
      toast.success(res.data.data.message || 'Coupon applied!');
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const onSubmit = async (data) => {
    try {
      setIsProcessing(true);
      const res = await api.post('/orders/checkout', {
        shippingAddress: data,
        couponCode: appliedCoupon?.code || undefined,
        paymentMethod: paymentMethod,
      });

      const result = res.data.data;
      if (result.directSuccess) {
        dispatch(clearCartState());
        toast.success('Order placed successfully!');
        navigate(`/order/success?order_id=${result.orderId}`);
      } else if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error(error.message || 'Error processing checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const discountAmount = appliedCoupon?.discountPrice || 0;
  const taxableSubtotal = Math.max(0, totalPrice - discountAmount);
  const shipping = totalPrice > 100 ? 0 : 15;
  const tax = Number((taxableSubtotal * 0.05).toFixed(2));
  const finalTotal = Number((taxableSubtotal + shipping + tax).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-white">Checkout Securely</h1>
        <p className="text-slate-400 mt-1">Complete your shipping address and choose your payment method</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column: Shipping & Payment Method */}
        <div className="flex-1 space-y-8">
          {/* Shipping Form Card */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">1. Shipping Address</h2>
                <p className="text-xs text-slate-400">Where should we deliver your order?</p>
              </div>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Street Address</label>
                <input
                  {...register('street')}
                  type="text"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  placeholder="123 Innovation Way"
                />
                {errors.street && <p className="text-rose-400 text-xs mt-1 ml-1">{errors.street.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">City</label>
                  <input
                    {...register('city')}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                    placeholder="New York"
                  />
                  {errors.city && <p className="text-rose-400 text-xs mt-1 ml-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">State / Province</label>
                  <input
                    {...register('state')}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                    placeholder="NY"
                  />
                  {errors.state && <p className="text-rose-400 text-xs mt-1 ml-1">{errors.state.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Postal Code</label>
                  <input
                    {...register('postalCode')}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                    placeholder="10001"
                  />
                  {errors.postalCode && <p className="text-rose-400 text-xs mt-1 ml-1">{errors.postalCode.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">Country</label>
                  <input
                    {...register('country')}
                    type="text"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                    placeholder="United States"
                  />
                  {errors.country && <p className="text-rose-400 text-xs mt-1 ml-1">{errors.country.message}</p>}
                </div>
              </div>
            </form>
          </div>

          {/* Payment Method Selector */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">2. Payment Method</h2>
                <p className="text-xs text-slate-400">Select how you'd like to complete this purchase</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stripe Option */}
              <div
                onClick={() => setPaymentMethod('Stripe')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'Stripe'
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'Stripe' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'}`}>
                    {paymentMethod === 'Stripe' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
                <h3 className="font-semibold text-white text-sm">Credit / Debit Card</h3>
                <p className="text-xs text-slate-400 mt-1">Secured by Stripe (Visa, MC, Amex, Apple Pay)</p>
              </div>

              {/* Cash on Delivery / Direct */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'}`}>
                    {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
                <h3 className="font-semibold text-white text-sm">Cash on Delivery / Direct</h3>
                <p className="text-xs text-slate-400 mt-1">Pay when your items arrive or instant test order</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="glass-card p-6 rounded-3xl sticky top-28">
            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

            {/* Items list */}
            <div className="space-y-4 mb-6 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {items.map((item) => {
                const prodId = item.product?._id || item.product;
                const prodName = item.product?.name || 'Product';
                const prodImage = item.product?.images?.[0]?.secure_url || '/placeholder.svg';

                return (
                  <div key={prodId} className="flex gap-4">
                    <div className="w-14 h-14 bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                      <img src={prodImage} alt={prodName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate">{prodName}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">Qty: {item.quantity}</p>
                      <p className="text-xs font-bold text-indigo-400 mt-0.5">
                        ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Discount Code Input */}
            <div className="mb-6 pt-4 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 ml-1">
                Promotional Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    <span>{appliedCoupon.code} ({appliedCoupon.message})</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="p-1 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white text-xs placeholder-slate-500 uppercase tracking-wider focus:outline-none focus:border-indigo-500"
                    placeholder="WELCOME10 or SAVE20"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponInput.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    {validatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mb-6 pt-4 border-t border-slate-800/80 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Items Subtotal</span>
                <span className="font-medium text-white">${totalPrice.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span className="font-medium text-white">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estimated Tax (5%)</span>
                <span className="font-medium text-white">${tax.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-800/80 pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-base font-semibold text-white">Total Amount</span>
                <span className="text-2xl font-bold text-indigo-400">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order / Pay Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_-5px_rgba(79,70,229,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  {paymentMethod === 'COD' ? 'Place Order (Cash on Delivery)' : 'Proceed to Stripe Payment'}
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center mt-3">
              Encrypted 256-bit SSL transaction with full consumer protection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
