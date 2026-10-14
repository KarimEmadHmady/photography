import express from 'express';
import { LocationController } from '../controllers/location.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

// Public router for /api/v1/locations
export const publicLocationRouter = express.Router();
publicLocationRouter.get('/', LocationController.getPublicLocations);
publicLocationRouter.get('/:slug', LocationController.getPublicLocationBySlug);
publicLocationRouter.get('/:identifier/related', LocationController.getRelatedLocations);

// Admin router for /api/v1/admin/locations
export const adminLocationRouter = express.Router();
adminLocationRouter.use(requireAdmin);
adminLocationRouter.get('/', LocationController.getAdminLocations);
adminLocationRouter.get('/:id', LocationController.getAdminLocationById);
adminLocationRouter.post('/', LocationController.createLocation);
adminLocationRouter.patch('/:id', LocationController.updateLocation);
adminLocationRouter.delete('/:id', LocationController.deleteLocation);
adminLocationRouter.patch('/:id/gallery-order', LocationController.updateGalleryOrder);

export default {
  publicRouter: publicLocationRouter,
  adminRouter: adminLocationRouter,
};
