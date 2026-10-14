import jwt from 'jsonwebtoken';
import { Admin } from '../models/index.js';

export const parseCookie = (cookieHeader, name) => {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
};

export const requireAdmin = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
      token = parseCookie(req.headers.cookie, 'token');
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح بالدخول، يرجى تسجيل الدخول أولاً',
      });
    }

    const secret = process.env.JWT_SECRET || 'default-jwt-secret';
    const decoded = jwt.verify(token, secret);

    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'الحساب غير موجود أو غير صالح',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'رمز التفويض غير صالح أو منتهي الصلاحية',
    });
  }
};
