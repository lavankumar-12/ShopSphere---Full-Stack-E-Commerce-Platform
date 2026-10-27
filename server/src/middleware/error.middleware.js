import ApiError from '../utils/apiError.js';
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle errors that are not instances of ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' || error.name === 'ZodError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for '${field}'. Please use another value.`;
    error = new ApiError(400, message);
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ${err.path}: ${err.value}`;
    error = new ApiError(404, message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token expired. Please log in again.');
  }

  logger.error(`${req.method} ${req.originalUrl} - ${error.statusCode} - ${error.message}`);

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
