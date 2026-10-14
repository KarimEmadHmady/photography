import { ServiceService } from '../services/service.service.js';

export class ServiceController {
  /**
   * GET /api/v1/services
   */
  static async getPublicServices(req, res, next) {
    try {
      const { homepage, locationId, page, limit } = req.query;
      const result = await ServiceService.getPublicServices({ homepage, locationId, page, limit });
      return res.status(200).json({
        success: true,
        data: result.services,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/services/:slug
   */
  static async getPublicServiceBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const service = await ServiceService.getPublicServiceBySlug(slug);
      return res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/services
   */
  static async getAdminServices(req, res, next) {
    try {
      const { search, status, isActive, page, limit } = req.query;
      const result = await ServiceService.getAllServicesAdmin({ search, status, isActive, page, limit });
      return res.status(200).json({
        success: true,
        data: result.services,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/services/:id
   */
  static async getAdminServiceById(req, res, next) {
    try {
      const { id } = req.params;
      const service = await ServiceService.getServiceByIdAdmin(id);
      return res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/services
   */
  static async createService(req, res, next) {
    try {
      const service = await ServiceService.createService(req.body);
      return res.status(201).json({
        success: true,
        message: 'تم إنشاء الخدمة بنجاح',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/services/:id
   */
  static async updateService(req, res, next) {
    try {
      const { id } = req.params;
      const service = await ServiceService.updateService(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'تم تحديث الخدمة بنجاح',
        data: service,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/services/:id
   */
  static async deleteService(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ServiceService.deleteService(id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ServiceController;
