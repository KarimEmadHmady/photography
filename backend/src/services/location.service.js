import mongoose from 'mongoose';
import { Location, Region, Service } from '../models/index.js';

export class LocationService {
  /**
   * Helper: compute total price if conditions are met (F019)
   */
  static computeTotalPrice(location) {
    if (!location.showTotal) return null;
    const photoPrice = location.photographyPrice;
    const venuePrice = location.venuePrice;

    if (!photoPrice || !venuePrice) return null;
    if (photoPrice.type === 'on_request' || venuePrice.type === 'on_request') return null;

    if (
      typeof photoPrice.amount === 'number' &&
      photoPrice.amount > 0 &&
      typeof venuePrice.amount === 'number' &&
      venuePrice.amount > 0
    ) {
      return photoPrice.amount + venuePrice.amount;
    }
    return null;
  }

  /**
   * Helper: validate price object (F016)
   */
  static validatePrice(price, fieldName = 'السعر') {
    if (!price || !price.type) {
      const error = new Error(`${fieldName}: يجب تحديد نوع السعر`);
      error.statusCode = 400;
      throw error;
    }

    const validTypes = ['fixed', 'starting_from', 'on_request'];
    if (!validTypes.includes(price.type)) {
      const error = new Error(`${fieldName}: نوع السعر غير صالح. الخيارات المتاحة: ${validTypes.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    if (price.type === 'on_request') {
      if (price.amount !== null && price.amount !== undefined) {
        const error = new Error(`${fieldName}: عندما يكون السعر 'حسب الاتفاق' (on_request)، يجب ألا يحتوي على قيمة رقمية`);
        error.statusCode = 400;
        throw error;
      }
    } else {
      if (typeof price.amount !== 'number' || price.amount <= 0) {
        const error = new Error(`${fieldName}: يجب تحديد قيمة عددية أكبر من الصفر لنوع السعر المحدد`);
        error.statusCode = 400;
        throw error;
      }
    }
  }

  /**
   * Public: Get published locations in published regions with filters, pagination, deterministic sort
   */
  static async getPublicLocations({ region, featured, page = 1, limit = 12 }) {
    // 1. Find all published regions
    const publishedRegions = await Region.find({ status: 'published' }).select('_id slug').lean();
    const publishedRegionIds = publishedRegions.map((r) => r._id);

    const query = {
      status: 'published',
      regionId: { $in: publishedRegionIds },
    };

    // Filter by specific region (slug or ID)
    if (region) {
      const targetRegion = publishedRegions.find(
        (r) => r.slug === region || r._id.toString() === region
      );
      if (targetRegion) {
        query.regionId = targetRegion._id;
      } else {
        // If specified region is not published or not found, return empty list
        return {
          locations: [],
          pagination: {
            total: 0,
            page: Number(page),
            limit: Number(limit),
            totalPages: 0,
          },
        };
      }
    }

    // Filter by featured
    if (featured === 'true' || featured === true) {
      query.isFeatured = true;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, locations] = await Promise.all([
      Location.countDocuments(query),
      Location.find(query)
        .populate('regionId', 'name slug coverImage')
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const locationsWithTotal = locations.map((loc) => ({
      ...loc,
      computedTotalPrice: this.computeTotalPrice(loc),
    }));

    return {
      locations: locationsWithTotal,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Public: Get published location details by slug
   */
  static async getPublicLocationBySlug(slug) {
    const location = await Location.findOne({ slug, status: 'published' })
      .populate({
        path: 'regionId',
        select: 'name slug coverImage status',
      })
      .populate({
        path: 'relatedServiceIds',
        match: { status: 'published', isActive: true },
        select: 'name slug shortDescription mainImage price',
      })
      .lean();

    if (!location) {
      const error = new Error('مكان التصوير غير موجود أو غير منشور');
      error.statusCode = 404;
      throw error;
    }

    // Check if parent region is published (F017)
    if (!location.regionId || location.regionId.status !== 'published') {
      const error = new Error('مكان التصوير يتبع منطقة غير منشورة حالياً');
      error.statusCode = 404;
      throw error;
    }

    // Also fetch services that apply to all locations (visibility.allLocations = true)
    const allLocationServices = await Service.find({
      status: 'published',
      isActive: true,
      'visibility.allLocations': true,
      _id: { $nin: location.relatedServiceIds.map((s) => s._id) },
    })
      .select('name slug shortDescription mainImage price')
      .lean();

    const mergedServices = [...location.relatedServiceIds, ...allLocationServices];

    return {
      ...location,
      relatedServices: mergedServices,
      computedTotalPrice: this.computeTotalPrice(location),
    };
  }

  /**
   * Public: Get related locations (F018)
   */
  static async getRelatedLocations(slugOrId) {
    let location = null;
    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      location = await Location.findById(slugOrId).lean();
    }
    if (!location) {
      location = await Location.findOne({ slug: slugOrId }).lean();
    }

    if (!location) {
      const error = new Error('مكان التصوير غير موجود');
      error.statusCode = 404;
      throw error;
    }

    // 1. If admin-selected relatedLocationIds exist, fetch published ones
    if (location.relatedLocationIds && location.relatedLocationIds.length > 0) {
      const publishedRegions = await Region.find({ status: 'published' }).select('_id');
      const publishedRegionIds = publishedRegions.map((r) => r._id);

      const adminRelated = await Location.find({
        _id: { $in: location.relatedLocationIds },
        status: 'published',
        regionId: { $in: publishedRegionIds },
      })
        .populate('regionId', 'name slug')
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();

      if (adminRelated.length > 0) {
        return adminRelated.map((loc) => ({
          ...loc,
          computedTotalPrice: this.computeTotalPrice(loc),
        }));
      }
    }

    // 2. Fallback: same region excluding self and drafts (F018)
    const fallbackLocations = await Location.find({
      regionId: location.regionId,
      _id: { $ne: location._id },
      status: 'published',
    })
      .populate('regionId', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(4)
      .lean();

    return fallbackLocations.map((loc) => ({
      ...loc,
      computedTotalPrice: this.computeTotalPrice(loc),
    }));
  }

  /**
   * Admin: List all locations with search, region filter, status filter, pagination
   */
  static async getAllLocationsAdmin({ search, regionId, status, isFeatured, page = 1, limit = 20 }) {
    const query = {};

    if (regionId) {
      query.regionId = regionId;
    }
    if (status) {
      query.status = status;
    }
    if (isFeatured !== undefined && isFeatured !== '') {
      query.isFeatured = isFeatured === 'true' || isFeatured === true;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { address: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, locations] = await Promise.all([
      Location.countDocuments(query),
      Location.find(query)
        .populate('regionId', 'name slug')
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const locationsWithTotal = locations.map((loc) => ({
      ...loc,
      computedTotalPrice: this.computeTotalPrice(loc),
    }));

    return {
      locations: locationsWithTotal,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Admin: Get location by ID
   */
  static async getLocationByIdAdmin(id) {
    const location = await Location.findById(id)
      .populate('regionId', 'name slug')
      .populate('relatedServiceIds', 'name slug')
      .populate('relatedLocationIds', 'name slug')
      .lean();

    if (!location) {
      const error = new Error('مكان التصوير غير موجود');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...location,
      computedTotalPrice: this.computeTotalPrice(location),
    };
  }

  /**
   * Admin: Create location (F015, F016)
   */
  static async createLocation(data) {
    const {
      regionId,
      name,
      slug,
      shortDescription,
      description,
      address,
      mapUrl,
      coverImage,
      gallery,
      photographyPrice,
      venuePrice,
      showTotal,
      relatedServiceIds,
      relatedLocationIds,
      isFeatured,
      status,
      sortOrder,
      seoTitle,
      seoDescription,
    } = data;

    // Validate regionId
    if (!regionId || !mongoose.Types.ObjectId.isValid(regionId)) {
      const error = new Error('معرف المنطقة غير صالح أو مطلوب');
      error.statusCode = 400;
      throw error;
    }

    const region = await Region.findById(regionId);
    if (!region) {
      const error = new Error('المنطقة المحددة غير موجودة');
      error.statusCode = 400;
      throw error;
    }

    if (!name || !name.trim()) {
      const error = new Error('اسم مكان التصوير مطلوب');
      error.statusCode = 400;
      throw error;
    }

    if (!slug || !slug.trim()) {
      const error = new Error('الرابط المخصص (slug) مطلوب');
      error.statusCode = 400;
      throw error;
    }

    // Slug uniqueness
    const existing = await Location.findOne({ slug: slug.trim().toLowerCase() });
    if (existing) {
      const error = new Error('الرابط المخصص (slug) مستخدم بالفعل');
      error.statusCode = 409;
      throw error;
    }

    // Validate prices
    if (photographyPrice) {
      this.validatePrice(photographyPrice, 'سعر التصوير');
    }
    if (venuePrice) {
      this.validatePrice(venuePrice, 'سعر حجز المكان');
    }

    // If relatedServiceIds provided, validate they are valid ObjectIds
    if (relatedServiceIds && Array.isArray(relatedServiceIds)) {
      for (const sId of relatedServiceIds) {
        if (!mongoose.Types.ObjectId.isValid(sId)) {
          const error = new Error(`معرف الخدمة المرتبطة غير صالح: ${sId}`);
          error.statusCode = 400;
          throw error;
        }
      }
    }

    const location = await Location.create({
      regionId,
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      shortDescription: shortDescription ? shortDescription.trim() : undefined,
      description: description ? description.trim() : undefined,
      address: address ? address.trim() : undefined,
      mapUrl: mapUrl ? mapUrl.trim() : undefined,
      coverImage,
      gallery: gallery || [],
      photographyPrice: photographyPrice || { amount: null, type: 'on_request' },
      venuePrice: venuePrice || { amount: null, type: 'on_request' },
      showTotal: !!showTotal,
      relatedServiceIds: relatedServiceIds || [],
      relatedLocationIds: relatedLocationIds || [],
      isFeatured: !!isFeatured,
      status: status || 'draft',
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      seoTitle: seoTitle ? seoTitle.trim() : undefined,
      seoDescription: seoDescription ? seoDescription.trim() : undefined,
    });

    return location;
  }

  /**
   * Admin: Update location
   */
  static async updateLocation(id, data) {
    const location = await Location.findById(id);
    if (!location) {
      const error = new Error('مكان التصوير غير موجود');
      error.statusCode = 404;
      throw error;
    }

    if (data.regionId) {
      if (!mongoose.Types.ObjectId.isValid(data.regionId)) {
        const error = new Error('معرف المنطقة غير صالح');
        error.statusCode = 400;
        throw error;
      }
      const region = await Region.findById(data.regionId);
      if (!region) {
        const error = new Error('المنطقة المحددة غير موجودة');
        error.statusCode = 400;
        throw error;
      }
      location.regionId = data.regionId;
    }

    if (data.slug && data.slug.trim().toLowerCase() !== location.slug) {
      const existing = await Location.findOne({
        slug: data.slug.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        const error = new Error('الرابط المخصص (slug) مستخدم بالفعل');
        error.statusCode = 409;
        throw error;
      }
      location.slug = data.slug.trim().toLowerCase();
    }

    if (data.photographyPrice) {
      this.validatePrice(data.photographyPrice, 'سعر التصوير');
      location.photographyPrice = data.photographyPrice;
    }

    if (data.venuePrice) {
      this.validatePrice(data.venuePrice, 'سعر حجز المكان');
      location.venuePrice = data.venuePrice;
    }

    if (data.name !== undefined) location.name = data.name.trim();
    if (data.shortDescription !== undefined) location.shortDescription = data.shortDescription.trim();
    if (data.description !== undefined) location.description = data.description.trim();
    if (data.address !== undefined) location.address = data.address.trim();
    if (data.mapUrl !== undefined) location.mapUrl = data.mapUrl.trim();
    if (data.coverImage !== undefined) location.coverImage = data.coverImage;
    if (data.gallery !== undefined) location.gallery = data.gallery;
    if (data.showTotal !== undefined) location.showTotal = !!data.showTotal;
    if (data.relatedServiceIds !== undefined) location.relatedServiceIds = data.relatedServiceIds;
    if (data.relatedLocationIds !== undefined) location.relatedLocationIds = data.relatedLocationIds;
    if (data.isFeatured !== undefined) location.isFeatured = !!data.isFeatured;
    if (data.status !== undefined) location.status = data.status;
    if (data.sortOrder !== undefined) location.sortOrder = Number(data.sortOrder);
    if (data.seoTitle !== undefined) location.seoTitle = data.seoTitle ? data.seoTitle.trim() : '';
    if (data.seoDescription !== undefined) location.seoDescription = data.seoDescription ? data.seoDescription.trim() : '';

    await location.save();
    return location;
  }

  /**
   * Admin: Delete location
   */
  static async deleteLocation(id) {
    const location = await Location.findById(id);
    if (!location) {
      const error = new Error('مكان التصوير غير موجود');
      error.statusCode = 404;
      throw error;
    }

    await Location.findByIdAndDelete(id);
    return { message: 'تم حذف مكان التصوير بنجاح' };
  }

  /**
   * Admin: Reorder Gallery Images (F027)
   */
  static async updateGalleryOrder(id, images) {
    const location = await Location.findById(id);
    if (!location) {
      const error = new Error('مكان التصوير غير موجود');
      error.statusCode = 404;
      throw error;
    }

    if (!Array.isArray(images)) {
      const error = new Error('يجب إرسال مصفوفة الصور الجديدة بالترتيب المطلوب');
      error.statusCode = 400;
      throw error;
    }

    location.gallery = images;
    await location.save();

    return {
      message: 'تم تحديث ترتيب معرض الصور بنجاح',
      gallery: location.gallery,
    };
  }
}

export default LocationService;
