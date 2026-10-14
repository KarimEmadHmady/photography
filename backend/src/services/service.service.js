import mongoose from 'mongoose';
import { Service, Location } from '../models/index.js';

export class ServiceService {
  /**
   * Helper: validate price object
   */
  static validatePrice(price, fieldName = 'سعر الخدمة') {
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
        const error = new Error(`${fieldName}: عندما يكون السعر 'حسب الاتفاق'، يجب ألا يحتوي على قيمة رقمية`);
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
   * Helper: validate that all locationIds exist in Location collection (F020)
   */
  static async validateLocationIds(locationIds) {
    if (!locationIds || !Array.isArray(locationIds) || locationIds.length === 0) {
      return;
    }

    for (const locId of locationIds) {
      if (!mongoose.Types.ObjectId.isValid(locId)) {
        const error = new Error(`معرف مكان التصوير غير صالح: ${locId}`);
        error.statusCode = 400;
        throw error;
      }
    }

    const existingCount = await Location.countDocuments({ _id: { $in: locationIds } });
    if (existingCount !== locationIds.length) {
      const error = new Error('واحد أو أكثر من أماكن التصوير المحددة غير موجودة في قاعدة البيانات');
      error.statusCode = 400;
      throw error;
    }
  }

  /**
   * Public: Get published and active services
   * Supports ?homepage=true and ?locationId=...
   */
  static async getPublicServices({ homepage, locationId, page = 1, limit = 20 }) {
    const query = {
      status: 'published',
      isActive: true,
    };

    if (homepage === 'true' || homepage === true) {
      query['visibility.homepage'] = true;
    }

    if (locationId) {
      if (!mongoose.Types.ObjectId.isValid(locationId)) {
        const error = new Error('معرف مكان التصوير غير صالح');
        error.statusCode = 400;
        throw error;
      }

      // Either service applies to all locations OR is linked explicitly (F021)
      query.$or = [
        { 'visibility.allLocations': true },
        { locationIds: new mongoose.Types.ObjectId(locationId) },
      ];
    } else if (!homepage) {
      // Default services page view: visibility.servicesPage should be true
      query['visibility.servicesPage'] = true;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, services] = await Promise.all([
      Service.countDocuments(query),
      Service.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return {
      services,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Public: Get service by slug
   */
  static async getPublicServiceBySlug(slug) {
    const service = await Service.findOne({
      slug,
      status: 'published',
      isActive: true,
    })
      .populate('locationIds', 'name slug coverImage')
      .lean();

    if (!service) {
      const error = new Error('الخدمة المطلوبة غير موجودة أو غير متاحة حالياً');
      error.statusCode = 404;
      throw error;
    }

    return service;
  }

  /**
   * Admin: List all services with filters, pagination
   */
  static async getAllServicesAdmin({ search, status, isActive, page = 1, limit = 20 }) {
    const query = {};

    if (status) query.status = status;
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true' || isActive === true;
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

    const [total, services] = await Promise.all([
      Service.countDocuments(query),
      Service.find(query)
        .populate('locationIds', 'name slug')
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    return {
      services,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  /**
   * Admin: Get service by ID
   */
  static async getServiceByIdAdmin(id) {
    const service = await Service.findById(id).populate('locationIds', 'name slug').lean();
    if (!service) {
      const error = new Error('الخدمة غير موجودة');
      error.statusCode = 404;
      throw error;
    }
    return service;
  }

  /**
   * Admin: Create service (F020)
   */
  static async createService(data) {
    const {
      name,
      slug,
      shortDescription,
      description,
      mainImage,
      gallery,
      videoUrl,
      price,
      variants,
      visibility,
      locationIds,
      isFeatured,
      isActive,
      status,
      sortOrder,
      seoTitle,
      seoDescription,
    } = data;

    if (!name || !name.trim()) {
      const error = new Error('اسم الخدمة مطلوب');
      error.statusCode = 400;
      throw error;
    }

    if (!slug || !slug.trim()) {
      const error = new Error('الرابط المخصص (slug) مطلوب');
      error.statusCode = 400;
      throw error;
    }

    // Check slug uniqueness
    const existing = await Service.findOne({ slug: slug.trim().toLowerCase() });
    if (existing) {
      const error = new Error('الرابط المخصص (slug) مستخدم بالفعل');
      error.statusCode = 409;
      throw error;
    }

    // Validate locationIds
    if (locationIds && locationIds.length > 0) {
      await this.validateLocationIds(locationIds);
    }

    // Validate price
    if (price) {
      this.validatePrice(price, 'سعر الخدمة');
    }

    const service = await Service.create({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      shortDescription: shortDescription ? shortDescription.trim() : undefined,
      description: description ? description.trim() : undefined,
      mainImage,
      gallery: gallery || [],
      videoUrl: videoUrl ? videoUrl.trim() : undefined,
      price: price || { amount: null, type: 'on_request' },
      variants: variants || [],
      visibility: visibility || {
        homepage: false,
        servicesPage: true,
        allLocations: false,
      },
      locationIds: locationIds || [],
      isFeatured: !!isFeatured,
      isActive: isActive !== undefined ? !!isActive : true,
      status: status || 'draft',
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      seoTitle: seoTitle ? seoTitle.trim() : undefined,
      seoDescription: seoDescription ? seoDescription.trim() : undefined,
    });

    return service;
  }

  /**
   * Admin: Update service
   */
  static async updateService(id, data) {
    const service = await Service.findById(id);
    if (!service) {
      const error = new Error('الخدمة غير موجودة');
      error.statusCode = 404;
      throw error;
    }

    if (data.slug && data.slug.trim().toLowerCase() !== service.slug) {
      const existing = await Service.findOne({
        slug: data.slug.trim().toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        const error = new Error('الرابط المخصص (slug) مستخدم بالفعل');
        error.statusCode = 409;
        throw error;
      }
      service.slug = data.slug.trim().toLowerCase();
    }

    if (data.locationIds !== undefined) {
      await this.validateLocationIds(data.locationIds);
      service.locationIds = data.locationIds;
    }

    if (data.price) {
      this.validatePrice(data.price, 'سعر الخدمة');
      service.price = data.price;
    }

    if (data.name !== undefined) service.name = data.name.trim();
    if (data.shortDescription !== undefined) service.shortDescription = data.shortDescription.trim();
    if (data.description !== undefined) service.description = data.description.trim();
    if (data.mainImage !== undefined) service.mainImage = data.mainImage;
    if (data.gallery !== undefined) service.gallery = data.gallery;
    if (data.videoUrl !== undefined) service.videoUrl = data.videoUrl.trim();
    if (data.variants !== undefined) service.variants = data.variants;
    if (data.visibility !== undefined) service.visibility = data.visibility;
    if (data.isFeatured !== undefined) service.isFeatured = !!data.isFeatured;
    if (data.isActive !== undefined) service.isActive = !!data.isActive;
    if (data.status !== undefined) service.status = data.status;
    if (data.sortOrder !== undefined) service.sortOrder = Number(data.sortOrder);
    if (data.seoTitle !== undefined) service.seoTitle = data.seoTitle ? data.seoTitle.trim() : '';
    if (data.seoDescription !== undefined) service.seoDescription = data.seoDescription ? data.seoDescription.trim() : '';

    await service.save();
    return service;
  }

  /**
   * Admin: Delete service
   */
  static async deleteService(id) {
    const service = await Service.findById(id);
    if (!service) {
      const error = new Error('الخدمة غير موجودة');
      error.statusCode = 404;
      throw error;
    }

    // Also pull service from locations referencing it
    await Location.updateMany(
      { relatedServiceIds: id },
      { $pull: { relatedServiceIds: id } }
    );

    await Service.findByIdAndDelete(id);
    return { message: 'تم حذف الخدمة بنجاح' };
  }
}

export default ServiceService;
