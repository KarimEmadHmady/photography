import { SiteSettingsService } from '../services/siteSettings.service.js';

export class SiteSettingsController {
  /**
   * GET /api/v1/settings/public
   */
  static async getPublicSettings(req, res, next) {
    try {
      const settings = await SiteSettingsService.getPublicSettings();
      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/homepage
   */
  static async getPublicHomepage(req, res, next) {
    try {
      const homepageData = await SiteSettingsService.getPublicHomepage();
      return res.status(200).json({
        success: true,
        data: homepageData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/settings
   */
  static async getAdminSettings(req, res, next) {
    try {
      const settings = await SiteSettingsService.getAdminSettings();
      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/settings
   */
  static async updateAdminSettings(req, res, next) {
    try {
      const updated = await SiteSettingsService.updateSettings(req.body);
      return res.status(200).json({
        success: true,
        message: 'تم تحديث إعدادات الموقع بنجاح',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/homepage
   */
  static async getAdminHomepage(req, res, next) {
    try {
      const homepageConfig = await SiteSettingsService.getAdminHomepage();
      return res.status(200).json({
        success: true,
        data: homepageConfig,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/homepage
   */
  static async updateAdminHomepage(req, res, next) {
    try {
      const updated = await SiteSettingsService.updateHomepageConfig(req.body);
      return res.status(200).json({
        success: true,
        message: 'تم تحديث إعدادات الصفحة الرئيسية بنجاح',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SiteSettingsController;
