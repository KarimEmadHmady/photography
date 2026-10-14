import { Region, Location } from '../models/index.js';

export class RegionService {
  /**
   * Public: Get all published regions ordered by sortOrder
   * Includes count of published locations
   */
  static async getPublicRegions() {
    const regions = await Region.find({ status: 'published' })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    // Attach published locations count to each region
    const regionIds = regions.map((r) => r._id);
    const locationCounts = await Location.aggregate([
      {
        $match: {
          regionId: { $in: regionIds },
          status: 'published',
        },
      },
      {
        $group: {
          _id: '$regionId',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    locationCounts.forEach((lc) => {
      countMap[lc._id.toString()] = lc.count;
    });

    return regions.map((region) => ({
      ...region,
      locationCount: countMap[region._id.toString()] || 0,
    }));
  }

  /**
   * Public: Get published region by slug
   * Returns 404 if not found or draft
   */
  static async getPublicRegionBySlug(slug) {
    const region = await Region.findOne({ slug, status: 'published' }).lean();
    if (!region) {
      const error = new Error('المنطقة المطلوبة غير موجودة أو غير منشورة');
      error.statusCode = 404;
      throw error;
    }

    const locations = await Location.find({
      regionId: region._id,
      status: 'published',
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return {
      ...region,
      locationCount: locations.length,
      locations,
    };
  }

  /**
   * Admin: List all regions with search, status filter, pagination
   */
  static async getAllRegionsAdmin({ search, status, page = 1, limit = 20 }) {
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, regions] = await Promise.all([
      Region.countDocuments(query),
      Region.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    // Attach total locations count
    const regionIds = regions.map((r) => r._id);
    const locationCounts = await Location.aggregate([
      {
        $match: {
          regionId: { $in: regionIds },
        },
      },
      {
        $group: {
          _id: '$regionId',
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    locationCounts.forEach((lc) => {
      countMap[lc._id.toString()] = lc.count;
    });

    const regionsWithCount = regions.map((region) => ({
      ...region,
      locationCount: countMap[region._id.toString()] || 0,
    }));

    return {
      regions: regionsWithCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Admin: Get region by ID
   */
  static async getRegionById(id) {
    const region = await Region.findById(id).lean();
    if (!region) {
      const error = new Error('المنطقة غير موجودة');
      error.statusCode = 404;
      throw error;
    }

    const locationCount = await Location.countDocuments({ regionId: id });
    return {
      ...region,
      locationCount,
    };
  }

  /**
   * Admin: Create new region
   */
  static async createRegion(data) {
    const { name, slug, description, coverImage, seoTitle, seoDescription, status, sortOrder } = data;

    if (!name || !name.trim()) {
      const error = new Error('اسم المنطقة مطلوب');
      error.statusCode = 400;
      throw error;
    }

    if (!slug || !slug.trim()) {
      const error = new Error('الرابط المخصص (slug) مطلوب');
      error.statusCode = 400;
      throw error;
    }

    // Check slug uniqueness
    const existing = await Region.findOne({ slug: slug.trim().toLowerCase() });
    if (existing) {
      const error = new Error('الرابط المخصص (slug) مستخدم بالفعل');
      error.statusCode = 409;
      throw error;
    }

    const region = await Region.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      description: description ? description.trim() : undefined,
      coverImage,
      seoTitle: seoTitle ? seoTitle.trim() : undefined,
      seoDescription: seoDescription ? seoDescription.trim() : undefined,
      status: status || 'draft',
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
    });

    return region;
  }

  /**
   * Admin: Update region
   */
  static async updateRegion(id, data) {
    const region = await Region.findById(id);
    if (!region) {
      const error = new Error('المنطقة غير موجودة');
      error.statusCode = 404;
      throw error;
    }

    if (data.slug && data.slug.trim().toLowerCase() !== region.slug) {
      const existing = await Region.findOne({
        slug: data.slug.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        const error = new Error('الرابط المخصص (slug) مستخدم بالفعل');
        error.statusCode = 409;
        throw error;
      }
      region.slug = data.slug.trim().toLowerCase();
    }

    if (data.name !== undefined) region.name = data.name.trim();
    if (data.description !== undefined) region.description = data.description ? data.description.trim() : '';
    if (data.coverImage !== undefined) region.coverImage = data.coverImage;
    if (data.seoTitle !== undefined) region.seoTitle = data.seoTitle ? data.seoTitle.trim() : '';
    if (data.seoDescription !== undefined) region.seoDescription = data.seoDescription ? data.seoDescription.trim() : '';
    if (data.status !== undefined) region.status = data.status;
    if (data.sortOrder !== undefined) region.sortOrder = Number(data.sortOrder);

    await region.save();
    return region;
  }

  /**
   * Admin: Delete region
   * Must block deletion if locations reference this region (F013)
   */
  static async deleteRegion(id) {
    const region = await Region.findById(id);
    if (!region) {
      const error = new Error('المنطقة غير موجودة');
      error.statusCode = 404;
      throw error;
    }

    // Check for associated locations
    const associatedLocations = await Location.find({ regionId: id }).select('name slug').lean();
    if (associatedLocations.length > 0) {
      const locationNames = associatedLocations.map((loc) => loc.name);
      const error = new Error(
        `لا يمكن حذف المنطقة لأنها تحتوي على ${associatedLocations.length} مكان تصوير مرتبط بها (${locationNames.slice(0, 3).join(', ')}${locationNames.length > 3 ? '...' : ''}). يرجى نقل أو حذف الأماكن أولاً.`
      );
      error.statusCode = 409;
      error.data = {
        count: associatedLocations.length,
        locations: locationNames,
      };
      throw error;
    }

    await Region.findByIdAndDelete(id);
    return {
      message: 'تم حذف المنطقة بنجاح',
    };
  }
}

export default RegionService;
