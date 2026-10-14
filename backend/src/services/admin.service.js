import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/index.js';

export class AdminService {
  /**
   * Admin login with phone/email and password
   */
  static async login({ phone, email, password }) {
    const identifier = phone || email;
    if (!identifier || !password) {
      const error = new Error('رقم الهاتف/البريد الإلكتروني وكلمة المرور مطلوبة');
      error.statusCode = 400;
      throw error;
    }

    const admin = await Admin.findOne({
      $or: [{ phone: identifier }, { email: identifier }],
    });

    if (!admin) {
      const error = new Error('بيانات الاعتماد غير صحيحة');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      const error = new Error('بيانات الاعتماد غير صحيحة');
      error.statusCode = 401;
      throw error;
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    const secret = process.env.JWT_SECRET || 'default-jwt-secret';
    const token = jwt.sign(
      {
        id: admin._id,
        phone: admin.phone,
        email: admin.email,
        role: 'admin',
      },
      secret,
      { expiresIn: '7d' }
    );

    const adminData = admin.toObject();
    delete adminData.passwordHash;

    return { admin: adminData, token };
  }

  /**
   * Get Admin Profile by ID
   */
  static async getAdminById(id) {
    const admin = await Admin.findById(id).select('-passwordHash');
    if (!admin) {
      const error = new Error('المسؤول غير موجود');
      error.statusCode = 404;
      throw error;
    }
    return admin;
  }

  /**
   * Change Admin Password
   */
  static async changePassword(adminId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      const error = new Error('كلمة المرور الحالية وكلمة المرور الجديدة مطلوبة');
      error.statusCode = 400;
      throw error;
    }

    if (newPassword.length < 8) {
      const error = new Error('يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف');
      error.statusCode = 400;
      throw error;
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      const error = new Error('المسؤول غير موجود');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      const error = new Error('كلمة المرور الحالية غير صحيحة');
      error.statusCode = 400;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    admin.passwordHash = await bcrypt.hash(newPassword, salt);
    await admin.save();

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  /**
   * Update Admin Profile (name, phone, email)
   */
  static async updateProfile(adminId, updateData) {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      const error = new Error('المسؤول غير موجود');
      error.statusCode = 404;
      throw error;
    }

    if (updateData.phone && updateData.phone !== admin.phone) {
      const existing = await Admin.findOne({ phone: updateData.phone, _id: { $ne: adminId } });
      if (existing) {
        const error = new Error('رقم الهاتف مسجل بالفعل لحساب آخر');
        error.statusCode = 409;
        throw error;
      }
      admin.phone = updateData.phone;
    }

    if (updateData.email && updateData.email !== admin.email) {
      admin.email = updateData.email;
    }

    if (updateData.name) {
      admin.name = updateData.name;
    }

    await admin.save();
    const adminData = admin.toObject();
    delete adminData.passwordHash;
    return adminData;
  }

  /**
   * Create Initial Admin (for setup/seeding)
   */
  static async createInitialAdmin({ phone, password, name, email }) {
    const existing = await Admin.findOne({ phone });
    if (existing) {
      const error = new Error('المسؤول مسجل بالفعل بهذا الهاتف');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      phone,
      passwordHash,
      name: name || 'Admin',
      email: email || '',
    });

    const adminData = admin.toObject();
    delete adminData.passwordHash;
    return adminData;
  }
}

export default AdminService;
