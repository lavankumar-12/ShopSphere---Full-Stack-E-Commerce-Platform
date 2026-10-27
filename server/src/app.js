import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import errorHandler from './middleware/error.middleware.js';
import { globalLimiter } from './middleware/rateLimiter.middleware.js';
import ApiResponse from './utils/apiResponse.js';
import ApiError from './utils/apiError.js';
import logger from './utils/logger.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import couponRoutes from './routes/coupon.routes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // flexible fallback in dev
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Morgan HTTP request logging
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// Global Rate Limiter
app.use('/api', globalLimiter);

// Stripe Webhook raw body middleware must go before express.json if needed,
// but for standard routes parse JSON:
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, {
      status: 'UP',
      service: 'ShopSphere Full-Stack E-Commerce API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }, 'ShopSphere API is running smoothly')
  );
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);

// 404 Route Handler
app.use('*', (req, res, next) => {
  next(new ApiError(404, `Cannot find path ${req.originalUrl} on this server`));
});

// Centralized Error Middleware
app.use(errorHandler);

export default app;
