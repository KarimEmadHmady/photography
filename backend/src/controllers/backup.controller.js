import { BackupService } from '../services/backup.service.js';

export class BackupController {
  /**
   * Get database statistics
   * GET /api/v1/admin/backup/stats
   */
  static async getStats(req, res, next) {
    try {
      const stats = await BackupService.getDatabaseStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export database backup as JSON
   * GET /api/v1/admin/backup/export
   */
  static async exportBackup(req, res, next) {
    try {
      const backupData = await BackupService.exportAllData();
      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `photography_backup_${dateStr}.json`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');

      // If requested directly as a raw file download
      if (req.query.format === 'raw' || req.query.download === 'true' || req.query.download === '1') {
        return res.send(JSON.stringify(backupData, null, 2));
      }

      // Default API response wrapping the data
      return res.status(200).json({
        success: true,
        filename,
        data: backupData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore/Import database backup from JSON
   * POST /api/v1/admin/backup/import
   */
  static async importBackup(req, res, next) {
    try {
      const payload = req.body?.backupData || req.body;
      if (!payload) {
        return res.status(400).json({
          success: false,
          message: 'يرجى إرسال بيانات النسخة الاحتياطية بصيغة JSON صالحة',
        });
      }

      const result = await BackupService.importAllData(payload);

      return res.status(200).json({
        success: true,
        message: 'تم استعادة النسخة الاحتياطية وتحديث قاعدة البيانات بنجاح',
        data: result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'فشلت عملية استعادة النسخة الاحتياطية',
      });
    }
  }
}
