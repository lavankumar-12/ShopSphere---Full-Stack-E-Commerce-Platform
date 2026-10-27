import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

export const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price images stock');
  
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }
  
  res.status(200).json(new ApiResponse(200, cart));
});

export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return next(new ApiError(404, 'Product not found or unavailable'));
  }

  if (product.stock < quantity) {
    return next(new ApiError(400, 'Not enough stock available'));
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

  if (existingItemIndex > -1) {
    const newQuantity = cart.items[existingItemIndex].quantity + Number(quantity);
    if (product.stock < newQuantity) {
      return next(new ApiError(400, 'Not enough stock available'));
    }
    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // ALWAYS GET PRICE FROM DB, NOT FRONTEND
    cart.items.push({
      product: productId,
      quantity,
      price: product.discountPrice || product.price
    });
  }

  await cart.save();
  await cart.populate('items.product', 'name price images stock');

  res.status(200).json(new ApiResponse(200, cart, 'Item added to cart'));
});

export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new ApiError(404, 'Cart not found'));

  if (quantity <= 0) {
    cart.items = cart.items.filter(item => (item.product?._id || item.product).toString() !== productId);
    await cart.save();
    await cart.populate('items.product', 'name price images stock');
    return res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
  }

  const itemIndex = cart.items.findIndex(item => (item.product?._id || item.product).toString() === productId);
  if (itemIndex === -1) return next(new ApiError(404, 'Item not in cart'));

  const product = await Product.findById(productId);
  if (!product) return next(new ApiError(404, 'Product not found'));

  if (product.stock < quantity) {
    return next(new ApiError(400, 'Not enough stock available'));
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  await cart.populate('items.product', 'name price images stock');

  res.status(200).json(new ApiResponse(200, cart, 'Cart updated'));
});

export const removeFromCart = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return next(new ApiError(404, 'Cart not found'));

  cart.items = cart.items.filter(item => (item.product?._id || item.product).toString() !== productId);
  await cart.save();
  await cart.populate('items.product', 'name price images stock');

  res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
});

export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.status(200).json(new ApiResponse(200, cart, 'Cart cleared'));
});
