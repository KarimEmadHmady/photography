import express from 'express';
import rateLimit from 'express-rate-limit';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rate limiting on login attempts to protect against brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 100 : 30, // Limit login attempts
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول، يرجى المحاولة بعد 15 دقيقة',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (process.env.NODE_ENV === 'development') return true;
    if (req.ip === '127.0.0.1' || req.ip === '::1') return true;
    return false;
  },
});

// Authentication endpoints
router.post('/login', loginLimiter, AdminController.login);
router.post('/logout', AdminController.logout);
router.get('/me', requireAdmin, AdminController.getMe);

export default router;
