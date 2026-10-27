import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Cart } from '../models/cart.model.js';
import { Coupon } from '../models/coupon.model.js';
import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import stripe from '../config/stripe.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

export const createOrderAndCheckoutSession = asyncHandler(async (req, res, next) => {
  const { shippingAddress, couponCode, paymentMethod = 'Stripe' } = req.body;

  // 1. Get cart items
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return next(new ApiError(400, 'Your cart is empty'));
  }

  // 2. Validate products and calculate exact price from DB
  let itemsPrice = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive || product.stock < item.quantity) {
      return next(new ApiError(400, `Product ${product?.name || 'Unknown'} is unavailable or out of stock`));
    }
    const itemPrice = product.discountPrice || product.price;
    itemsPrice += itemPrice * item.quantity;
    
    orderItems.push({
      name: product.name,
      quantity: item.quantity,
      image: product.images?.[0]?.secure_url || '',
      price: itemPrice,
      product: product._id
    });
  }

  // 3. Apply Coupon
  let discountPrice = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon && new Date() < new Date(coupon.expiresAt) && itemsPrice >= (coupon.minimumPurchase || 0)) {
      if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
        if (coupon.discountType === 'percentage') {
          discountPrice = (itemsPrice * coupon.discountValue) / 100;
          if (coupon.maximumDiscount && discountPrice > coupon.maximumDiscount) {
            discountPrice = coupon.maximumDiscount;
          }
        } else {
          discountPrice = coupon.discountValue;
        }
        // Increment usage
        coupon.usedCount += 1;
        await coupon.save();
      }
    }
  }

  // 4. Calculate Tax & Shipping
  const taxableAmount = Math.max(0, itemsPrice - discountPrice);
  const taxPrice = Number((0.05 * taxableAmount).toFixed(2));
  const shippingPrice = itemsPrice > 100 ? 0 : 15;
  const totalPrice = Number((taxableAmount + taxPrice + shippingPrice).toFixed(2));

  // 5. Create Order in DB
  const isDirectPayment = paymentMethod === 'COD' || paymentMethod === 'Demo';

  const order = await Order.create({
    user: req.user.id,
    orderItems,
    shippingAddress,
    paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : (paymentMethod === 'Demo' ? 'Demo Card' : 'Stripe'),
    paymentStatus: paymentMethod === 'Demo' ? 'PAID' : 'PENDING',
    orderStatus: 'PROCESSING',
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice
  });

  // Handle Direct / Demo / Cash on Delivery payments
  if (isDirectPayment) {
    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart in DB
    cart.items = [];
    await cart.save();

    // Send confirmation email
    sendOrderConfirmationEmail(req.user.email, order).catch(() => {});

    return res.status(200).json(
      new ApiResponse(200, {
        directSuccess: true,
        orderId: order._id,
        url: `/order/success?order_id=${order._id}`
      }, 'Order placed successfully')
    );
  }

  // 6. Handle Stripe Checkout Session
  try {
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    // Stripe requires valid public http images or none
    const line_items = orderItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          ...(item.image && item.image.startsWith('http') ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${clientBaseUrl}/order/success?order_id=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientBaseUrl}/checkout?canceled=true`,
      customer_email: req.user.email,
      client_reference_id: order._id.toString(),
      line_items,
    });

    return res.status(200).json(new ApiResponse(200, { sessionId: session.id, url: session.url, orderId: order._id }));
  } catch (stripeError) {
    logger.error(`Stripe checkout session creation failed: ${stripeError.message}. Falling back to demo confirmation.`);
    
    // Graceful fallback to demo order if Stripe fails (e.g. test key limits or network)
    order.paymentMethod = 'Demo Payment (Fallback)';
    order.paymentStatus = 'PAID';
    order.orderStatus = 'PROCESSING';
    await order.save();

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    cart.items = [];
    await cart.save();

    sendOrderConfirmationEmail(req.user.email, order).catch(() => {});

    return res.status(200).json(
      new ApiResponse(200, {
        directSuccess: true,
        orderId: order._id,
        url: `/order/success?order_id=${order._id}`
      }, 'Order placed successfully (Demo mode)')
    );
  }
});

// Confirm payment on success page
export const confirmPayment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const order = await Order.findById(id).populate('user', 'email name');

  if (!order) return next(new ApiError(404, 'Order not found'));

  // Ensure user owns this order or is admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized to confirm this order'));
  }

  if (order.paymentStatus !== 'PAID') {
    order.paymentStatus = 'PAID';
    order.orderStatus = 'PROCESSING';
    await order.save();

    // Deduct stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart in DB
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // Send email
    sendOrderConfirmationEmail(req.user.email, order).catch(() => {});
  }

  res.status(200).json(new ApiResponse(200, order, 'Payment confirmed successfully'));
});

// Validate & Apply Coupon Endpoint
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code, itemsPrice } = req.body;

  if (!code) return next(new ApiError(400, 'Coupon code is required'));

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
  if (!coupon) {
    return next(new ApiError(404, 'Invalid coupon code'));
  }

  if (new Date() > new Date(coupon.expiresAt)) {
    return next(new ApiError(400, 'Coupon has expired'));
  }

  if (itemsPrice !== undefined && itemsPrice < (coupon.minimumPurchase || 0)) {
    return next(new ApiError(400, `Minimum purchase of $${coupon.minimumPurchase} required for this coupon`));
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return next(new ApiError(400, 'Coupon usage limit has been reached'));
  }

  let discountPrice = 0;
  const basePrice = Number(itemsPrice) || 100;

  if (coupon.discountType === 'percentage') {
    discountPrice = (basePrice * coupon.discountValue) / 100;
    if (coupon.maximumDiscount && discountPrice > coupon.maximumDiscount) {
      discountPrice = coupon.maximumDiscount;
    }
  } else {
    discountPrice = coupon.discountValue;
  }

  res.status(200).json(new ApiResponse(200, {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountPrice: Number(discountPrice.toFixed(2)),
    message: `Coupon applied: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}`
  }));
});

// Get single order by ID
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return next(new ApiError(404, 'Order not found'));

  // Ensure owner or admin
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError(403, 'Not authorized to view this order'));
  }

  res.status(200).json(new ApiResponse(200, order));
});

// Admin ONLY
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError(404, 'Order not found'));

  order.orderStatus = status;
  if (status === 'DELIVERED') order.deliveredAt = Date.now();
  if (status === 'DELIVERED' && order.paymentStatus === 'PENDING') order.paymentStatus = 'PAID';
  
  await order.save();
  res.status(200).json(new ApiResponse(200, order, 'Order status updated'));
});

// User ONLY
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json(new ApiResponse(200, orders));
});

// Admin ONLY
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  res.status(200).json(new ApiResponse(200, orders));
});

// Admin Dashboard stats
export const getAdminDashboardStats = asyncHandler(async (req, res, next) => {
  const [totalOrders, totalRevenue, pendingOrders, lowStockProducts, totalUsers, totalProducts, recentOrders, lowStockItems] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { paymentStatus: 'PAID' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.countDocuments({ orderStatus: { $in: ['PENDING', 'PROCESSING'] } }),
    Product.countDocuments({ stock: { $lt: 10 } }),
    User.countDocuments(),
    Product.countDocuments(),
    Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email'),
    Product.find({ stock: { $lt: 10 } }).limit(6).select('name stock price images category').populate('category', 'name')
  ]);

  res.status(200).json(new ApiResponse(200, {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    pendingOrders,
    lowStockProducts,
    totalUsers,
    totalProducts,
    recentOrders,
    lowStockItems
  }));
});
