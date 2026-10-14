import cloudinary from '../config/cloudinary.js';
import { Region, Location, Service, SiteSettings } from '../models/index.js';

export class UploadService {
  /**
   * Upload image buffer to Cloudinary
   */
  static async uploadImage(fileBuffer, folder = 'wedding_portfolio') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Safe image deletion (F026):
   * Deletes from Cloudinary only if not referenced by any region, location, service, or site settings
   */
  static async safeDeleteImage(publicId) {
    if (!publicId) {
      const error = new Error('معرف الصورة (publicId) مطلوب');
      error.statusCode = 400;
      throw error;
    }

    // Check if image is referenced in Location gallery or cover
    const locationReferenced = await Location.findOne({
      $or: [
        { coverImage: { $regex: publicId } },
        { 'gallery.publicId': publicId },
      ],
    });

    if (locationReferenced) {
      return {
        deleted: false,
        message: 'تم الاحتفاظ بالصورة في السحابة لأنها لا تزال مستخدمة في مكان تصوير',
      };
    }

    // Check if referenced in Region coverImage
    const regionReferenced = await Region.findOne({
      coverImage: { $regex: publicId },
    });

    if (regionReferenced) {
      return {
        deleted: false,
        message: 'تم الاحتفاظ بالصورة في السحابة لأنها مستخدمة كغلاف لمنطقة',
      };
    }

    // Check if referenced in Service
    const serviceReferenced = await Service.findOne({
      $or: [
        { mainImage: { $regex: publicId } },
        { 'gallery.publicId': publicId },
      ],
    });

    if (serviceReferenced) {
      return {
        deleted: false,
        message: 'تم الاحتفاظ بالصورة في السحابة لأنها مستخدمة في إحدى الخدمات',
      };
    }

    // Check SiteSettings portfolio or hero/logo
    const settingsReferenced = await SiteSettings.findOne({
      $or: [
        { 'portfolioItems.imagePublicId': publicId },
        { 'hero.imageUrl': { $regex: publicId } },
        { logo: { $regex: publicId } },
      ],
    });

    if (settingsReferenced) {
      return {
        deleted: false,
        message: 'تم الاحتفاظ بالصورة في السحابة لأنها مستخدمة في إعدادات الموقع/معرض الأعمال',
      };
    }

    // Not referenced anywhere, safe to delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);
    return {
      deleted: true,
      message: 'تم حذف الصورة من السحابة بنجاح',
    };
  }
}

export default UploadService;
