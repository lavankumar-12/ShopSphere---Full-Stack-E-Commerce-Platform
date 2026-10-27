import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Get token from cookies or authorization header
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'You are not logged in. Please log in to get access.'));
  }

  // 2. Verify token
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_for_dev_only'
    );

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new ApiError(401, 'The user belonging to this token does no longer exist.'));
    }

    // 4. Check if user is blocked
    if (currentUser.isBlocked) {
      return next(new ApiError(403, 'Your account has been blocked. Please contact support.'));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token. Please log in again.'));
  }
});

// Role-based authorization middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `User role '${req.user.role}' is not authorized to access this route`)
      );
    }
    next();
  };
};
