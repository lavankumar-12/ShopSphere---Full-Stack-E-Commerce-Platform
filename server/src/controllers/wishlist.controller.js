import { Wishlist } from '../models/wishlist.model.js';
import { Product } from '../models/product.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

export const getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products', 'name price images stock slug');
  
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, products: [] });
  }
  
  res.status(200).json(new ApiResponse(200, wishlist.products));
});

export const toggleWishlistItem = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) return next(new ApiError(404, 'Product not found'));

  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user.id, products: [] });
  }

  const isExist = wishlist.products.some(id => (id._id || id).toString() === productId);
  let message = '';

  if (isExist) {
    wishlist.products = wishlist.products.filter(id => (id._id || id).toString() !== productId);
    message = 'Product removed from wishlist';
  } else {
    wishlist.products.push(productId);
    message = 'Product added to wishlist';
  }

  await wishlist.save();
  await wishlist.populate('products', 'name price discountPrice images stock slug brand ratings');

  res.status(200).json(new ApiResponse(200, wishlist.products, message));
});
