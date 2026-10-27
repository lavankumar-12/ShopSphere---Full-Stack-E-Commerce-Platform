import User from '../models/user.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import ApiResponse from '../utils/apiResponse.js';
import { generateTokenAndSetCookie } from '../utils/jwt.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ApiError(400, 'User with this email already exists'));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  // Remove password from output
  user.password = undefined;

  // Generate Token
  const token = generateTokenAndSetCookie(user, res);

  res.status(201).json(
    new ApiResponse(201, { user, token }, 'Registration successful')
  );
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide email and password'));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password, user.password);
  if (!isMatch) {
    return next(new ApiError(401, 'Invalid credentials'));
  }

  // Check if blocked
  if (user.isBlocked) {
    return next(new ApiError(403, 'Your account has been blocked. Please contact support.'));
  }

  // Generate Token
  const token = generateTokenAndSetCookie(user, res);
  
  // Remove password from response
  user.password = undefined;

  res.status(200).json(
    new ApiResponse(200, { user, token }, 'Login successful')
  );
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie('jwt', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // expires in 10 seconds
    httpOnly: true,
  });

  res.status(200).json(new ApiResponse(200, null, 'User successfully logged out'));
});

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.status(200).json(new ApiResponse(200, { user }, 'User profile fetched successfully'));
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, addresses } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (addresses && Array.isArray(addresses)) user.addresses = addresses;

  await user.save();
  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully'));
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/auth/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password').sort('-createdAt');
  res.status(200).json(new ApiResponse(200, users, 'Users retrieved successfully'));
});

/**
 * @desc    Toggle block/unblock status for a user (Admin only)
 * @route   PATCH /api/auth/users/:id/block
 * @access  Private/Admin
 */
export const toggleBlockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  // Prevent blocking self
  if (user._id.toString() === req.user.id) {
    return next(new ApiError(400, 'Cannot block your own account'));
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.status(200).json(
    new ApiResponse(200, user, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`)
  );
});

/**
 * @desc    Update user role (Admin only)
 * @route   PATCH /api/auth/users/:id/role
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  if (!['admin', 'customer'].includes(role)) {
    return next(new ApiError(400, 'Invalid role. Must be admin or customer'));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  // Prevent self demotion
  if (user._id.toString() === req.user.id && role !== 'admin') {
    return next(new ApiError(400, 'Cannot demote your own admin account'));
  }

  user.role = role;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, `User role changed to ${role}`));
});

/**
 * @desc    Delete a user (Admin only)
 * @route   DELETE /api/auth/users/:id
 * @access  Private/Admin
 */
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (user._id.toString() === req.user.id) {
    return next(new ApiError(400, 'Cannot delete your own account'));
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
});

