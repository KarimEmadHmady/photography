import express from 'express';
import rateLimit from 'express-rate-limit';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rate limiting on login attempts to protect against brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login requests per windowMs
  message: {
    success: false,
    message: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول، يرجى المحاولة بعد 15 دقيقة',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication endpoints
router.post('/login', loginLimiter, AdminController.login);
router.post('/logout', AdminController.logout);
router.get('/me', requireAdmin, AdminController.getMe);

export default router;
