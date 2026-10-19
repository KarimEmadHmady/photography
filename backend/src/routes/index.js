import express from 'express';
import authRoutes from './auth.routes.js';
import adminRoutes from './admin.routes.js';
import { publicRegionRouter, adminRegionRouter } from './region.routes.js';
import { publicLocationRouter, adminLocationRouter } from './location.routes.js';
import { publicServiceRouter, adminServiceRouter } from './service.routes.js';
import {
  publicSettingsRouter,
  publicHomepageRouter,
  adminSettingsRouter,
  adminHomepageRouter,
} from './siteSettings.routes.js';
import uploadRoutes from './upload.routes.js';
import backupRoutes from './backup.routes.js';

const router = express.Router();

// Health check endpoint (F004)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// Admin account & security routes
router.use('/admin', adminRoutes);

// Regions routes
router.use('/regions', publicRegionRouter);
router.use('/admin/regions', adminRegionRouter);

// Locations routes
router.use('/locations', publicLocationRouter);
router.use('/admin/locations', adminLocationRouter);

// Services routes
router.use('/services', publicServiceRouter);
router.use('/admin/services', adminServiceRouter);

// Site Settings & Homepage routes
router.use('/settings', publicSettingsRouter);
router.use('/homepage', publicHomepageRouter);
router.use('/admin/settings', adminSettingsRouter);
router.use('/admin/homepage', adminHomepageRouter);

// Image Uploads
router.use('/admin/uploads', uploadRoutes);

// Backup & Restore
router.use('/admin/backup', backupRoutes);

export default router;
