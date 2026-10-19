import express from 'express';
import { BackupController } from '../controllers/backup.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all backup endpoints with requireAdmin
router.use(requireAdmin);

router.get('/stats', BackupController.getStats);
router.get('/export', BackupController.exportBackup);
router.post('/import', BackupController.importBackup);

export default router;
