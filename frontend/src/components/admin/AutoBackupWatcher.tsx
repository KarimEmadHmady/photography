'use client';

import React, { useEffect, useState } from 'react';
import { DownloadCloud, CheckCircle2, X } from 'lucide-react';
import { api } from '../../lib/api';

export const triggerJsonDownload = (data: any, defaultFilename: string) => {
  try {
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to download file:', err);
    return false;
  }
};

export default function AutoBackupWatcher() {
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    filename?: string;
  }>({ show: false, message: '' });

  const executeAutoBackup = async (force: boolean = false) => {
    const today = new Date();
    const day = today.getDate();
    const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const storedMonth = localStorage.getItem('last_auto_backup_month');

    // Only auto-download if it's day 1 of the month AND has not run this month yet (or if forced for testing)
    if ((day === 1 && storedMonth !== monthKey) || force) {
      try {
        const res = await api.admin.backup.export();
        if (res?.data) {
          const filename = `photography_backup_monthly_${monthKey}-01.json`;
          const success = triggerJsonDownload(res.data, filename);
          if (success) {
            if (!force) {
              localStorage.setItem('last_auto_backup_month', monthKey);
            }
            setNotification({
              show: true,
              message: `تم تنزيل النسخة الاحتياطية التلقائية لشهر ${monthKey} بنجاح على جهازك (اليوم الأول من الشهر).`,
              filename,
            });
          }
        }
      } catch (error) {
        console.error('Auto backup on day 1 failed:', error);
      }
    }
  };

  useEffect(() => {
    // Run check on mount
    executeAutoBackup(false);

    // Listen for manual test trigger from Backup management page
    const handleTestTrigger = () => executeAutoBackup(true);
    window.addEventListener('trigger-auto-backup-test', handleTestTrigger);

    return () => {
      window.removeEventListener('trigger-auto-backup-test', handleTestTrigger);
    };
  }, []);

  if (!notification.show) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-6 z-50 max-w-md w-full bg-neutral-900/95 backdrop-blur-md text-white border border-amber-500/30 rounded-2xl p-4 shadow-2xl flex items-start gap-3.5 transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
      dir="rtl"
    >
      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
        <DownloadCloud className="w-5 h-5 animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>تنزيل النسخة الاحتياطية التلقائية</span>
        </div>
        <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
          {notification.message}
        </p>
        {notification.filename && (
          <span className="inline-block mt-2 px-2.5 py-1 rounded-md bg-neutral-800 text-[11px] font-mono text-neutral-300 border border-neutral-700/60 truncate max-w-full">
            📁 {notification.filename}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setNotification({ show: false, message: '' })}
        aria-label="إغلاق التنبيه"
        className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
