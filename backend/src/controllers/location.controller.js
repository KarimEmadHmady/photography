import { LocationService } from '../services/location.service.js';

export class LocationController {
  /**
   * GET /api/v1/locations
   */
  static async getPublicLocations(req, res, next) {
    try {
      const { region, featured, page, limit } = req.query;
      const result = await LocationService.getPublicLocations({ region, featured, page, limit });
      return res.status(200).json({
        success: true,
        data: result.locations,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/locations/:slug
   */
  static async getPublicLocationBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const location = await LocationService.getPublicLocationBySlug(slug);
      return res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/locations/:identifier/related
   */
  static async getRelatedLocations(req, res, next) {
    try {
      const { identifier } = req.params;
      const related = await LocationService.getRelatedLocations(identifier);
      return res.status(200).json({
        success: true,
        data: related,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/locations
   */
  static async getAdminLocations(req, res, next) {
    try {
      const { search, regionId, status, isFeatured, page, limit } = req.query;
      const result = await LocationService.getAllLocationsAdmin({
        search,
        regionId,
        status,
        isFeatured,
        page,
        limit,
      });
      return res.status(200).json({
        success: true,
        data: result.locations,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/locations/:id
   */
  static async getAdminLocationById(req, res, next) {
    try {
      const { id } = req.params;
      const location = await LocationService.getLocationByIdAdmin(id);
      return res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/locations
   */
  static async createLocation(req, res, next) {
    try {
      const location = await LocationService.createLocation(req.body);
      return res.status(201).json({
        success: true,
        message: 'تم إنشاء مكان التصوير بنجاح',
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/locations/:id
   */
  static async updateLocation(req, res, next) {
    try {
      const { id } = req.params;
      const location = await LocationService.updateLocation(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'تم تحديث مكان التصوير بنجاح',
        data: location,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/locations/:id
   */
  static async deleteLocation(req, res, next) {
    try {
      const { id } = req.params;
      const result = await LocationService.deleteLocation(id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/locations/:id/gallery-order
   */
  static async updateGalleryOrder(req, res, next) {
    try {
      const { id } = req.params;
      const { gallery } = req.body;
      const result = await LocationService.updateGalleryOrder(id, gallery);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.gallery,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LocationController;
