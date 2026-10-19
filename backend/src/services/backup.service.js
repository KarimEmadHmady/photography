import { Region, Location, Service, SiteSettings } from '../models/index.js';
import { cacheManager } from '../utlis/cache.util.js';

export class BackupService {
  /**
   * Get current database collections stats
   */
  static async getDatabaseStats() {
    const [
      totalRegions,
      totalLocations,
      publishedLocations,
      draftLocations,
      totalServices,
      activeServices,
      settingsCount,
      siteSettingsDoc,
    ] = await Promise.all([
      Region.countDocuments(),
      Location.countDocuments(),
      Location.countDocuments({ status: 'published' }),
      Location.countDocuments({ status: 'draft' }),
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
      SiteSettings.countDocuments(),
      SiteSettings.findOne({ key: 'main' }).select('updatedAt photographerName').lean(),
    ]);

    return {
      regions: {
        total: totalRegions,
      },
      locations: {
        total: totalLocations,
        published: publishedLocations,
        draft: draftLocations,
      },
      services: {
        total: totalServices,
        active: activeServices,
      },
      settings: {
        configured: settingsCount > 0,
        photographerName: siteSettingsDoc?.photographerName || 'غير محدد',
        lastUpdated: siteSettingsDoc?.updatedAt || null,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Export all database data to a comprehensive JSON structure
   */
  static async exportAllData() {
    const [regions, locations, services, siteSettings] = await Promise.all([
      Region.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
      Location.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
      Service.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
      SiteSettings.find().lean(),
    ]);

    const timestamp = new Date().toISOString();

    const backupPayload = {
      meta: {
        version: '1.0.0',
        exportedAt: timestamp,
        appName: ' Photography System',
        stats: {
          regionsCount: regions.length,
          locationsCount: locations.length,
          servicesCount: services.length,
          siteSettingsCount: siteSettings.length,
        },
      },
      data: {
        siteSettings: siteSettings.length > 0 ? (siteSettings.length === 1 ? siteSettings[0] : siteSettings) : null,
        regions: regions || [],
        locations: locations || [],
        services: services || [],
      },
    };

    return backupPayload;
  }

  /**
   * Import/Restore database data from a JSON payload
   * Safely replaces collections with rollback support
   */
  static async importAllData(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('ملف النسخة الاحتياطية غير صالح أو فارغ');
    }

    // Support both direct object and wrapped in `data`
    const data = payload.data ? payload.data : payload;

    const hasRegions = Array.isArray(data.regions);
    const hasLocations = Array.isArray(data.locations);
    const hasServices = Array.isArray(data.services);
    const hasSettings = data.siteSettings !== undefined && data.siteSettings !== null;

    if (!hasRegions && !hasLocations && !hasServices && !hasSettings) {
      throw new Error('هيكل ملف النسخة الاحتياطية غير متطابق: لا توجد بيانات لمناطق أو أماكن أو خدمات أو إعدادات.');
    }

    // Snapshot existing data for safe rollback if restoration fails
    const [existingRegions, existingLocations, existingServices, existingSettings] = await Promise.all([
      Region.find().lean(),
      Location.find().lean(),
      Service.find().lean(),
      SiteSettings.find().lean(),
    ]);

    const restoredStats = {
      regions: 0,
      locations: 0,
      services: 0,
      siteSettings: 0,
    };

    try {
      // 1. Restore SiteSettings
      if (hasSettings) {
        await SiteSettings.deleteMany({});
        if (Array.isArray(data.siteSettings)) {
          if (data.siteSettings.length > 0) {
            await SiteSettings.insertMany(data.siteSettings);
            restoredStats.siteSettings = data.siteSettings.length;
          }
        } else if (typeof data.siteSettings === 'object') {
          await SiteSettings.create(data.siteSettings);
          restoredStats.siteSettings = 1;
        }
      }

      // 2. Restore Regions
      if (hasRegions) {
        await Region.deleteMany({});
        if (data.regions.length > 0) {
          await Region.insertMany(data.regions);
          restoredStats.regions = data.regions.length;
        }
      }

      // 3. Restore Locations
      if (hasLocations) {
        await Location.deleteMany({});
        if (data.locations.length > 0) {
          await Location.insertMany(data.locations);
          restoredStats.locations = data.locations.length;
        }
      }

      // 4. Restore Services
      if (hasServices) {
        await Service.deleteMany({});
        if (data.services.length > 0) {
          await Service.insertMany(data.services);
          restoredStats.services = data.services.length;
        }
      }

      // Invalidate memory cache so frontend and public users immediately see restored data
      cacheManager.clear();

      return {
        restored: restoredStats,
        restoredAt: new Date().toISOString(),
      };
    } catch (importError) {
      // Rollback to previous snapshot in case of insertion failure
      console.error('Error during backup restoration, rolling back:', importError);

      try {
        if (hasSettings) {
          await SiteSettings.deleteMany({});
          if (existingSettings.length > 0) await SiteSettings.insertMany(existingSettings);
        }
        if (hasRegions) {
          await Region.deleteMany({});
          if (existingRegions.length > 0) await Region.insertMany(existingRegions);
        }
        if (hasLocations) {
          await Location.deleteMany({});
          if (existingLocations.length > 0) await Location.insertMany(existingLocations);
        }
        if (hasServices) {
          await Service.deleteMany({});
          if (existingServices.length > 0) await Service.insertMany(existingServices);
        }
        cacheManager.clear();
      } catch (rollbackError) {
        console.error('Critical rollback failure:', rollbackError);
      }

      throw new Error(`فشلت استعادة البيانات وتم التراجع عن التغييرات: ${importError.message}`);
    }
  }
}
