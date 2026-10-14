import express from 'express';
import { RegionController } from '../controllers/region.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

// Public router for /api/v1/regions
export const publicRegionRouter = express.Router();
publicRegionRouter.get('/', RegionController.getPublicRegions);
publicRegionRouter.get('/:slug', RegionController.getPublicRegionBySlug);

// Admin router for /api/v1/admin/regions
export const adminRegionRouter = express.Router();
adminRegionRouter.use(requireAdmin);
adminRegionRouter.get('/', RegionController.getAdminRegions);
adminRegionRouter.get('/:id', RegionController.getAdminRegionById);
adminRegionRouter.post('/', RegionController.createRegion);
adminRegionRouter.patch('/:id', RegionController.updateRegion);
adminRegionRouter.delete('/:id', RegionController.deleteRegion);

export default {
  publicRouter: publicRegionRouter,
  adminRouter: adminRegionRouter,
};
