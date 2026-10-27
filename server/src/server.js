import './config/env.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = app.listen(PORT, () => {
  logger.info(`ShopSphere Server listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION! Shutting down... ${err.name}: ${err.message}`);
  if (err.stack) logger.error(err.stack);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`UNCAUGHT EXCEPTION! Shutting down... ${err.name}: ${err.message}`);
  if (err.stack) logger.error(err.stack);
  process.exit(1);
});
