import { Coupon } from '../models/coupon.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';

/**
 * @desc    Get all coupons (Admin sees all, public sees active)
 * @route   GET /api/coupons
 * @access  Public / Private (Admin)
 */
export const getAllCoupons = asyncHandler(async (req, res, next) => {
  let query = {};
  if (!req.user || req.user.role !== 'admin') {
    query = { isActive: true, expiresAt: { $gt: new Date() } };
  }

  const coupons = await Coupon.find(query).sort('-createdAt');
  res.status(200).json(new ApiResponse(200, coupons, 'Coupons fetched successfully'));
});

/**
 * @desc    Create a new coupon
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = asyncHandler(async (req, res, next) => {
  const {
    code,
    discountType,
    discountValue,
    minimumPurchase,
    maximumDiscount,
    expiresAt,
    usageLimit,
    isActive = true,
  } = req.body;

  if (!code || !discountType || discountValue === undefined || !expiresAt) {
    return next(new ApiError(400, 'Code, discount type, value, and expiry date are required'));
  }

  const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    return next(new ApiError(400, `Coupon with code "${code.toUpperCase()}" already exists`));
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    discountType,
    discountValue: Number(discountValue),
    minimumPurchase: minimumPurchase ? Number(minimumPurchase) : 0,
    maximumDiscount: maximumDiscount ? Number(maximumDiscount) : undefined,
    expiresAt: new Date(expiresAt),
    usageLimit: usageLimit ? Number(usageLimit) : null,
    isActive,
  });

  res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
});

/**
 * @desc    Toggle coupon active status
 * @route   PATCH /api/coupons/:id/toggle
 * @access  Private/Admin
 */
export const toggleCouponActive = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return next(new ApiError(404, 'Coupon not found'));
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  res.status(200).json(
    new ApiResponse(200, coupon, `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`)
  );
});

/**
 * @desc    Delete coupon
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return next(new ApiError(404, 'Coupon not found'));
  }

  await Coupon.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
});
