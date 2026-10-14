import { AdminService } from '../services/admin.service.js';

export class AdminController {
  /**
   * POST /api/v1/auth/login
   */
  static async login(req, res, next) {
    try {
      const { phone, email, password } = req.body;
      const { admin, token } = await AdminService.login({ phone, email, password });

      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: {
          admin,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  static async logout(req, res, next) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      return res.status(200).json({
        success: true,
        message: 'تم تسجيل الخروج بنجاح',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  static async getMe(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: req.admin,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/change-password
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AdminService.changePassword(req.admin._id, currentPassword, newPassword);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/profile
   */
  static async updateProfile(req, res, next) {
    try {
      const updatedAdmin = await AdminService.updateProfile(req.admin._id, req.body);
      return res.status(200).json({
        success: true,
        message: 'تم تحديث الملف الشخصي بنجاح',
        data: updatedAdmin,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;
