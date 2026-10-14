import express from 'express';
import { SiteSettingsController } from '../controllers/siteSettings.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

// Public router for settings & homepage
export const publicSettingsRouter = express.Router();
publicSettingsRouter.get('/public', SiteSettingsController.getPublicSettings);

export const publicHomepageRouter = express.Router();
publicHomepageRouter.get('/', SiteSettingsController.getPublicHomepage);

// Admin router for /api/v1/admin/settings and /api/v1/admin/homepage
export const adminSettingsRouter = express.Router();
adminSettingsRouter.use(requireAdmin);
adminSettingsRouter.get('/', SiteSettingsController.getAdminSettings);
adminSettingsRouter.patch('/', SiteSettingsController.updateAdminSettings);

export const adminHomepageRouter = express.Router();
adminHomepageRouter.use(requireAdmin);
adminHomepageRouter.get('/', SiteSettingsController.getAdminHomepage);
adminHomepageRouter.patch('/', SiteSettingsController.updateAdminHomepage);

export default {
  publicSettingsRouter,
  publicHomepageRouter,
  adminSettingsRouter,
  adminHomepageRouter,
};
