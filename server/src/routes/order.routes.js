import express from 'express';
import {
  createOrderAndCheckoutSession,
  confirmPayment,
  applyCoupon,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getAdminDashboardStats
} from '../controllers/order.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Specific routes first
router.get('/dashboard-stats', authorizeRoles('admin'), getAdminDashboardStats);
router.get('/my-orders', getMyOrders);
router.get('/', authorizeRoles('admin'), getAllOrders);
router.post('/checkout', createOrderAndCheckoutSession);
router.post('/apply-coupon', applyCoupon);

// Parametric routes after static routes
router.post('/:id/confirm-payment', confirmPayment);
router.put('/:id/status', authorizeRoles('admin'), updateOrderStatus);
router.get('/:id', getOrderById);

export default router;
