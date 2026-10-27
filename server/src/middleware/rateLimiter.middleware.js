import rateLimit from 'express-rate-limit';
import ApiError from '../utils/apiError.js';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new ApiError(429, 'Too many requests from this IP, please try again after 15 minutes.'));
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new ApiError(429, 'Too many login/registration attempts from this IP, please try again after 15 minutes.'));
  },
});
