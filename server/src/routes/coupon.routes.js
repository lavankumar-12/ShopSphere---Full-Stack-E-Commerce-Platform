import express from 'express';
import {
  getAllCoupons,
  createCoupon,
  toggleCouponActive,
  deleteCoupon,
} from '../controllers/coupon.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public active coupons
router.get('/public', getAllCoupons);

// Admin Coupon Routes
router.get('/', protect, authorizeRoles('admin'), getAllCoupons);
router.post('/', protect, authorizeRoles('admin'), createCoupon);
router.patch('/:id/toggle', protect, authorizeRoles('admin'), toggleCouponActive);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCoupon);

export default router;
