import express from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('الملف المرفوع يجب أن يكون صورة صالحة (PNG, JPG, WebP)'));
    }
  },
});

const router = express.Router();

router.use(requireAdmin);
router.post('/', upload.single('image'), UploadController.uploadImage);
router.delete('/:publicId', UploadController.deleteImage);

export default router;
