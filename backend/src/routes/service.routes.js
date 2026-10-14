import express from 'express';
import { ServiceController } from '../controllers/service.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

// Public router for /api/v1/services
export const publicServiceRouter = express.Router();
publicServiceRouter.get('/', ServiceController.getPublicServices);
publicServiceRouter.get('/:slug', ServiceController.getPublicServiceBySlug);

// Admin router for /api/v1/admin/services
export const adminServiceRouter = express.Router();
adminServiceRouter.use(requireAdmin);
adminServiceRouter.get('/', ServiceController.getAdminServices);
adminServiceRouter.get('/:id', ServiceController.getAdminServiceById);
adminServiceRouter.post('/', ServiceController.createService);
adminServiceRouter.patch('/:id', ServiceController.updateService);
adminServiceRouter.delete('/:id', ServiceController.deleteService);

export default {
  publicRouter: publicServiceRouter,
  adminRouter: adminServiceRouter,
};
