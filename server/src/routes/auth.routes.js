import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  getAllUsers,
  toggleBlockUser,
  updateUserRole,
  deleteUser,
} from '../controllers/auth.controller.js';
import { protect, authorizeRoles } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);

// Admin User Management Routes
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.patch('/users/:id/block', protect, authorizeRoles('admin'), toggleBlockUser);
router.patch('/users/:id/role', protect, authorizeRoles('admin'), updateUserRole);
router.delete('/users/:id', protect, authorizeRoles('admin'), deleteUser);

export default router;

