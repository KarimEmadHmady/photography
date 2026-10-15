import mongoose from 'mongoose';
import { SiteSettings, Region, Location, Service } from '../models/index.js';

export class SiteSettingsService {
  /**
   * Get or create the singleton SiteSettings document (F022)
   */
  static async getOrCreateSettings() {
    let settings = await SiteSettings.findOne({ key: 'main' });
    if (!settings) {
      settings = await SiteSettings.create({
        key: 'main',
        photographerName: 'المصور الفوتوغرافي',
        hero: {
          title: 'توثيق أجمل لحظات العمر بلمسة فنية مميزة',
          description: 'متخصصون في تصوير حفلات الزفاف، جلسات العروسين، وأرقى أماكن التصوير الخارجية والقاعات الفاخرة.',
          imageUrl: '',
          images: [],
          primaryCtaText: 'استكشف أماكن التصوير',
          primaryCtaUrl: '/locations',
          secondaryCtaText: 'تواصل عبر واتساب',
          secondaryCtaUrl: 'https://wa.me/',
        },
        about: {
          bio: 'مصور فوتوغرافي محترف متخصص في توثيق حفلات الزفاف والسيشن بأعلى درجات الاحترافية والإبداع.',
          imageUrl: '',
        },
        contact: {
          phone: '01000000000',
          whatsappNumber: '201000000000',
          defaultWhatsappMessage: 'مرحباً، أود الاستفسار عن تفاصيل جلسات التصوير والأسعار.',
        },
        defaultSeo: {
          title: 'موقع تصوير الأفراح - أرقى أماكن وجلسات التصوير',
          description: 'استكشف أفضل أماكن تصوير الأفراح وجلسات الزفاف والخدمات الإضافية.',
        },
        footer: {
          copyrightText: 'جميع الحقوق محفوظة ©',
        },
        currencyLabel: 'جنيه',
      });
    }
    return settings;
  }

  /**
   * Public: Get public site settings (excludes any private data)
   */
  static async getPublicSettings() {
    const settings = await this.getOrCreateSettings();
    return {
      photographerName: settings.photographerName,
      logo: settings.logo,
      favicon: settings.favicon,
      hero: settings.hero,
      about: settings.about,
      contact: settings.contact,
      socialLinks: settings.socialLinks,
      defaultSeo: settings.defaultSeo,
      footer: settings.footer,
      currencyLabel: settings.currencyLabel,
    };
  }

  /**
   * Public: Get composed homepage data (F023)
   * Returns enabled sections in order, featured regions, locations, services, and portfolio items
   * Skips dangling/deleted references
   */
  static async getPublicHomepage() {
    const settings = await this.getOrCreateSettings();

    // 1. Sort enabled homepage sections by order
    const enabledSections = (settings.homepageSections || [])
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order);

    // 2. Fetch featured published regions (skipping dangling)
    let featuredRegions = [];
    if (settings.featuredRegionIds && settings.featuredRegionIds.length > 0) {
      featuredRegions = await Region.find({
        _id: { $in: settings.featuredRegionIds },
        status: 'published',
      })
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();
    }

    // 3. Fetch featured published locations whose region is published (skipping dangling)
    let featuredLocations = [];
    const publishedRegions = await Region.find({ status: 'published' }).select('_id').lean();
    const publishedRegionIds = publishedRegions.map((r) => r._id);

    if (settings.featuredLocationIds && settings.featuredLocationIds.length > 0) {
      featuredLocations = await Location.find({
        _id: { $in: settings.featuredLocationIds },
        status: 'published',
        regionId: { $in: publishedRegionIds },
      })
        .populate('regionId', 'name slug')
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();
    }

    // 4. Fetch featured published & active services (skipping dangling)
    let featuredServices = [];
    if (settings.featuredServiceIds && settings.featuredServiceIds.length > 0) {
      featuredServices = await Service.find({
        _id: { $in: settings.featuredServiceIds },
        status: 'published',
        isActive: true,
      })
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();
    }

    // 5. Portfolio items - resolve location details and image
    let portfolioItems = [];
    if (settings.portfolioItems && settings.portfolioItems.length > 0) {
      const locIds = settings.portfolioItems.map((p) => p.locationId);
      const locations = await Location.find({
        _id: { $in: locIds },
        status: 'published',
        regionId: { $in: publishedRegionIds },
      }).lean();

      const locMap = {};
      locations.forEach((loc) => {
        locMap[loc._id.toString()] = loc;
      });

      portfolioItems = settings.portfolioItems
        .map((p) => {
          const loc = locMap[p.locationId.toString()];
          if (!loc) return null; // skip dangling
          const img = (loc.gallery || []).find((g) => g.publicId === p.imagePublicId);
          return {
            locationId: loc._id,
            locationName: loc.name,
            locationSlug: loc.slug,
            imagePublicId: p.imagePublicId,
            imageUrl: img ? img.url : null,
            alt: img ? img.alt : loc.name,
          };
        })
        .filter((item) => item !== null && item.imageUrl !== null);
    }

    return {
      settings: {
        photographerName: settings.photographerName,
        logo: settings.logo,
        favicon: settings.favicon,
        hero: settings.hero,
        about: settings.about,
        contact: settings.contact,
        socialLinks: settings.socialLinks,
        defaultSeo: settings.defaultSeo,
        footer: settings.footer,
        currencyLabel: settings.currencyLabel,
      },
      sections: enabledSections,
      featuredRegions,
      featuredLocations,
      featuredServices,
      portfolioItems,
    };
  }

  /**
   * Admin: Get all settings
   */
  static async getAdminSettings() {
    return await this.getOrCreateSettings();
  }

  /**
   * Admin: Update General Site Settings (F022)
   */
  static async updateSettings(data) {
    const settings = await this.getOrCreateSettings();

    if (data.photographerName !== undefined) settings.photographerName = data.photographerName.trim();
    if (data.logo !== undefined) settings.logo = data.logo;
    if (data.favicon !== undefined) settings.favicon = data.favicon;
    if (data.currencyLabel !== undefined) settings.currencyLabel = data.currencyLabel.trim();

    if (data.hero) {
      const heroPayload = { ...data.hero };
      if (Array.isArray(heroPayload.images)) {
        heroPayload.images = heroPayload.images.filter(Boolean);
        if (heroPayload.images.length > 0 && !heroPayload.imageUrl) {
          heroPayload.imageUrl = heroPayload.images[0];
        }
      }
      settings.hero = {
        ...settings.hero.toObject(),
        ...heroPayload,
      };
      if (Array.isArray(heroPayload.images)) {
        settings.hero.images = heroPayload.images;
      }
    }

    if (data.about) {
      settings.about = {
        ...settings.about.toObject(),
        ...data.about,
      };
    }

    if (data.contact) {
      settings.contact = {
        ...settings.contact.toObject(),
        ...data.contact,
      };
    }

    if (data.socialLinks) {
      settings.socialLinks = {
        ...settings.socialLinks.toObject(),
        ...data.socialLinks,
      };
    }

    if (data.defaultSeo) {
      settings.defaultSeo = {
        ...settings.defaultSeo.toObject(),
        ...data.defaultSeo,
      };
    }

    if (data.footer) {
      settings.footer = {
        ...settings.footer.toObject(),
        ...data.footer,
      };
    }

    await settings.save();
    return settings;
  }

  /**
   * Admin: Get Homepage Configuration
   */
  static async getAdminHomepage() {
    const settings = await this.getOrCreateSettings();
    return {
      homepageSections: settings.homepageSections,
      featuredRegionIds: settings.featuredRegionIds,
      featuredLocationIds: settings.featuredLocationIds,
      featuredServiceIds: settings.featuredServiceIds,
      portfolioItems: settings.portfolioItems,
    };
  }

  /**
   * Admin: Update Homepage Configuration (F023)
   * Validates that referenced IDs exist in their respective collections
   */
  static async updateHomepageConfig(data) {
    const settings = await this.getOrCreateSettings();

    // 1. Validate featuredRegionIds
    if (data.featuredRegionIds) {
      for (const rId of data.featuredRegionIds) {
        if (!mongoose.Types.ObjectId.isValid(rId)) {
          const error = new Error(`معرف المنطقة المميزة غير صالح: ${rId}`);
          error.statusCode = 400;
          throw error;
        }
      }
      const count = await Region.countDocuments({ _id: { $in: data.featuredRegionIds } });
      if (count !== data.featuredRegionIds.length) {
        const error = new Error('إحدى المناطق المميزة المحددة غير موجودة');
        error.statusCode = 400;
        throw error;
      }
      settings.featuredRegionIds = data.featuredRegionIds;
    }

    // 2. Validate featuredLocationIds
    if (data.featuredLocationIds) {
      for (const lId of data.featuredLocationIds) {
        if (!mongoose.Types.ObjectId.isValid(lId)) {
          const error = new Error(`معرف مكان التصوير المميز غير صالح: ${lId}`);
          error.statusCode = 400;
          throw error;
        }
      }
      const count = await Location.countDocuments({ _id: { $in: data.featuredLocationIds } });
      if (count !== data.featuredLocationIds.length) {
        const error = new Error('أحد أماكن التصوير المميزة المحددة غير موجود');
        error.statusCode = 400;
        throw error;
      }
      settings.featuredLocationIds = data.featuredLocationIds;
    }

    // 3. Validate featuredServiceIds
    if (data.featuredServiceIds) {
      for (const sId of data.featuredServiceIds) {
        if (!mongoose.Types.ObjectId.isValid(sId)) {
          const error = new Error(`معرف الخدمة المميزة غير صالح: ${sId}`);
          error.statusCode = 400;
          throw error;
        }
      }
      const count = await Service.countDocuments({ _id: { $in: data.featuredServiceIds } });
      if (count !== data.featuredServiceIds.length) {
        const error = new Error('إحدى الخدمات المميزة المحددة غير موجودة');
        error.statusCode = 400;
        throw error;
      }
      settings.featuredServiceIds = data.featuredServiceIds;
    }

    // 4. Update homepageSections
    if (data.homepageSections) {
      if (!Array.isArray(data.homepageSections)) {
        const error = new Error('أقسام الصفحة الرئيسية يجب أن تكون مصفوفة');
        error.statusCode = 400;
        throw error;
      }
      settings.homepageSections = data.homepageSections;
    }

    // 5. Update portfolioItems
    if (data.portfolioItems) {
      if (!Array.isArray(data.portfolioItems)) {
        const error = new Error('عناصر معرض الأعمال يجب أن تكون مصفوفة');
        error.statusCode = 400;
        throw error;
      }
      for (const item of data.portfolioItems) {
        if (!mongoose.Types.ObjectId.isValid(item.locationId) || !item.imagePublicId) {
          const error = new Error('بيانات عنصر معرض الأعمال غير صالحة');
          error.statusCode = 400;
          throw error;
        }
      }
      settings.portfolioItems = data.portfolioItems;
    }

    await settings.save();
    return settings;
  }
}

export default SiteSettingsService;
