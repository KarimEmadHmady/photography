import { RegionService } from '../services/region.service.js';

export class RegionController {
  /**
   * GET /api/v1/regions
   */
  static async getPublicRegions(req, res, next) {
    try {
      const regions = await RegionService.getPublicRegions();
      return res.status(200).json({
        success: true,
        data: regions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/regions/:slug
   */
  static async getPublicRegionBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const region = await RegionService.getPublicRegionBySlug(slug);
      return res.status(200).json({
        success: true,
        data: region,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/regions
   */
  static async getAdminRegions(req, res, next) {
    try {
      const { search, status, page, limit } = req.query;
      const result = await RegionService.getAllRegionsAdmin({ search, status, page, limit });
      return res.status(200).json({
        success: true,
        data: result.regions,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/regions/:id
   */
  static async getAdminRegionById(req, res, next) {
    try {
      const { id } = req.params;
      const region = await RegionService.getRegionById(id);
      return res.status(200).json({
        success: true,
        data: region,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/regions
   */
  static async createRegion(req, res, next) {
    try {
      const region = await RegionService.createRegion(req.body);
      return res.status(201).json({
        success: true,
        message: 'تم إنشاء المنطقة بنجاح',
        data: region,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/regions/:id
   */
  static async updateRegion(req, res, next) {
    try {
      const { id } = req.params;
      const region = await RegionService.updateRegion(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'تم تحديث المنطقة بنجاح',
        data: region,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/regions/:id
   */
  static async deleteRegion(req, res, next) {
    try {
      const { id } = req.params;
      const result = await RegionService.deleteRegion(id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.statusCode === 409 && error.data) {
        return res.status(409).json({
          success: false,
          message: error.message,
          data: error.data,
        });
      }
      next(error);
    }
  }
}

export default RegionController;
