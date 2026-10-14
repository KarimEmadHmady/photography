import { UploadService } from '../services/upload.service.js';

export class UploadController {
  /**
   * POST /api/v1/admin/uploads
   */
  static async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'يرجى اختيار صورة للرفع',
        });
      }

      // Check mime type
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'الملف المرفوع يجب أن يكون صورة صالحة',
        });
      }

      const folder = req.body.folder || 'wedding_portfolio';
      const result = await UploadService.uploadImage(req.file.buffer, folder);

      return res.status(201).json({
        success: true,
        message: 'تم رفع الصورة بنجاح',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/uploads/:publicId
   */
  static async deleteImage(req, res, next) {
    try {
      const publicId = req.params.publicId || req.query.publicId;
      const result = await UploadService.safeDeleteImage(publicId);
      return res.status(200).json({
        success: true,
        message: result.message,
        deleted: result.deleted,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UploadController;
