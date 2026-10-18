// server.js - Express Backend Template
// Description: Clean, structured template for starting any new project

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import compression from 'compression';
import helmet from 'helmet'; 
import rateLimit from 'express-rate-limit'; 

import connectDB from './src/config/db-mongo.js';
import { notFound } from './src/middlewares/notFound.middleware.js';
import { errorMiddleware, asyncHandler } from './src/middlewares/error.middleware.js';
import apiRouter from './src/routes/index.js';

// ================== Load Environment Variables ==================
dotenv.config();
const isDev = process.env.NODE_ENV === 'development';

// ================== Connect to MongoDB ==================
connectDB(); // Singleton connection

// ================== Initialize Express App ==================
const app = express();
const port = process.env.PORT || 5000;

// ================== Middleware ==================

// Trust proxy for proper IP resolution behind reverse proxies/Vercel
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration — supports localhost, LAN IP (e.g. 192.168.x.x), and FRONTEND_URL
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, SSR)
      if (!origin) return callback(null, true);

      const isAllowed =
        isDev ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
        /^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
        /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin);

      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback: allow request in case of custom local setups
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-requested-with',
      'Content-Disposition',
    ],
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length'],
  })
);

// Logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing (JSON & URL-encoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Rate limiting with very generous limits and smart bypass
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 50000 : 15000, // Very generous limit
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 1. Skip completely in development mode or localhost or LAN IPs
    if (isDev) return true;
    const ip = req.ip || '';
    if (
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.includes('127.0.0.1') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      ip.startsWith('::ffff:192.168.') ||
      ip.startsWith('::ffff:127.0.0.1')
    ) {
      return true;
    }

    // 2. Skip health check endpoint
    if (req.path.includes('/health')) return true;

    // 3. Skip authenticated admin requests & admin routes
    if (req.headers.authorization) return true;
    if (req.originalUrl && req.originalUrl.includes('/admin')) return true;

    return false;
  },
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة بعد قليل.',
  },
});
app.use(limiter);



// ================== Routes ==================
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// ================== 404 Not Found Handler ==================
app.use(notFound);

// ================== Error Handling Middleware ==================
app.use(errorMiddleware);

// ================== Graceful Shutdown for MongoDB ==================
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected on app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB disconnection', error);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// ================== Start Server ==================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});