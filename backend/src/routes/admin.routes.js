import express from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply requireAdmin to all admin-specific routes
router.use(requireAdmin);

router.patch('/change-password', AdminController.changePassword);
router.patch('/profile', AdminController.updateProfile);

export default router;
