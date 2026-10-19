'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  MapPin,
  Camera,
  Settings2,
  Info,
  Clock,
  ArrowDownToLine,
  FileCheck,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { IBackupStats, IBackupPayload } from '../../../types';
import { triggerJsonDownload } from '../../../components/admin/AutoBackupWatcher';
import AdminNotifications from '../../../components/admin/AdminNotifications';

export default function AdminBackupPage() {
  const [stats, setStats] = useState<IBackupStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File import state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<IBackupPayload | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-backup month tracking state
  const [autoBackupMonth, setAutoBackupMonth] = useState<string | null>(null);

  // Load database stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.admin.backup.getStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load backup stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('last_auto_backup_month');
      setAutoBackupMonth(stored);
    }
  }, []);

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'غير محدد';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Next 1st of month calculation
  const getNextAutoBackupDate = () => {
    const now = new Date();
    let nextMonth = now.getMonth() + 1;
    let nextYear = now.getFullYear();
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }
    const nextDate = new Date(nextYear, nextMonth, 1);
    return nextDate.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 1. Export Backup Manually
  const handleExportBackup = async () => {
    setExporting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.admin.backup.export();
      if (res?.data) {
        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = res.filename || `photography_backup_${dateStr}.json`;
        const success = triggerJsonDownload(res.data, filename);
        if (success) {
          setSuccessMsg(`تم إنشاء وتنزيل النسخة الاحتياطية بنجاح باسم (${filename})`);
        } else {
          setErrorMsg('تعذر تنزيل الملف تلقائياً إلى المتصفح.');
        }
      } else {
        setErrorMsg('لم يتم استلام أي بيانات صالحة من السيرفر.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تصدير النسخة الاحتياطية');
    } finally {
      setExporting(false);
    }
  };

  // 2. Trigger Auto-Backup test download
  const handleTestAutoBackup = () => {
    window.dispatchEvent(new CustomEvent('trigger-auto-backup-test'));
    setSuccessMsg('تم إرسال إشعار التنزيل التلقائي لتجربة سلوك النسخ الاحتياطي في اليوم الأول من الشهر.');
  };

  // 3. Handle File Selection
  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setParsedBackup(null);

    if (!file.name.endsWith('.json')) {
      setParseError('يرجى اختيار ملف بامتداد .json صالح');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);

        // Validation: verify structure
        const data = json.data || json;
        const hasAnyData =
          Array.isArray(data.regions) ||
          Array.isArray(data.locations) ||
          Array.isArray(data.services) ||
          data.siteSettings;

        if (!hasAnyData) {
          setParseError('الملف لا يحتوي على بيانات صالحة (مناطق، أماكن، خدمات، أو إعدادات).');
          return;
        }

        setParsedBackup(json);
      } catch (err) {
        setParseError('فشل تحليل ملف JSON. تأكد من أن الملف سليم وغير تالف.');
      }
    };
    reader.onerror = () => {
      setParseError('تعذر قراءة الملف المختار.');
    };
    reader.readAsText(file);
  };

  // 4. Submit Import Backup
  const handleExecuteImport = async () => {
    if (!parsedBackup) return;
    setImporting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowConfirmModal(false);

    try {
      const res = await api.admin.backup.import(parsedBackup);
      if (res?.success) {
        const counts = res.data?.restored;
        const summary = counts
          ? `(مناطق: ${counts.regions}، أماكن: ${counts.locations}، خدمات: ${counts.services})`
          : '';
        setSuccessMsg(`تمت استعادة النسخة الاحتياطية بنجاح ${summary}`);
        setSelectedFile(null);
        setParsedBackup(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        // Refresh database statistics
        await fetchStats();
      } else {
        setErrorMsg(res?.message || 'فشلت استعادة النسخة الاحتياطية');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء استعادة النسخة الاحتياطية');
    } finally {
      setImporting(false);
    }
  };

  const currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const isMonthBackedUp = autoBackupMonth === currentMonthKey;

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              النسخ الاحتياطي واستعادة البيانات
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            تصدير كافة بيانات الموقع وقواعد البيانات في ملف JSON موحد، الاستعادة الفورية في أي وقت، والتنزيل التلقائي الشهري.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loadingStats}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-neutral-50 text-xs font-semibold shadow-2xs transition disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-amber-600' : ''}`} />
          <span>تحديث الإحصائيات</span>
        </button>
      </div>

      {/* Notifications Banner */}
      <AdminNotifications
        successMsg={successMsg}
        error={errorMsg}
        onDismissError={() => setErrorMsg(null)}
      />

      {/* Database Statistics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">المناطق الجغرافية</span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {loadingStats ? '...' : stats?.regions.total ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">مسجلة في قاعدة البيانات</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">أماكن التصوير</span>
            <Camera className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {loadingStats ? '...' : stats?.locations.total ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {stats ? `${stats.locations.published} منشور • ${stats.locations.draft} مسودة` : '—'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">الخدمات الإضافية</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {loadingStats ? '...' : stats?.services.total ?? 0}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {stats ? `${stats.services.active} خدمة نشطة` : '—'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold">إعدادات الموقع</span>
            <Settings2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-gray-900 truncate">
            {loadingStats ? '...' : stats?.settings.photographerName || 'المصور'}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 truncate">
            {stats?.settings.lastUpdated ? `تحديث: ${formatDate(stats.settings.lastUpdated)}` : 'جاهزة ومحفوظة'}
          </p>
        </div>
      </div>

      {/* Auto Backup Banner (Day 1 Feature) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  خدمة التنزيل التلقائي في اليوم الأول من كل شهر
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  مفعّل تلقائياً
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                بمجرد فتح لوحة التحكم في يوم <strong>1</strong> من أي شهر، يقوم المتصفح تلقائياً بتحميل ملف JSON
                كامل بالنسخة الاحتياطية على جهازك دون أي تدخل منك.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestAutoBackup}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-50 text-amber-800 text-xs font-bold shadow-2xs transition shrink-0"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>تجربة التنزيل التلقائي الآن</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60 text-xs">
          <div className="flex items-center gap-2 text-gray-700">
            <span className="font-semibold text-gray-500">حالة هذا الشهر ({currentMonthKey}):</span>
            {isMonthBackedUp ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                تم التنزيل التلقائي لهذا الشهر
              </span>
            ) : (
              <span className="text-amber-800 font-medium">
                بانتظار زيارة لوحة التحكم يوم 1 من الشهر
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-700 sm:justify-end">
            <span className="font-semibold text-gray-500">الموعد التلقائي القادم:</span>
            <span className="font-bold text-gray-900">{getNextAutoBackupDate()}</span>
          </div>
        </div>
      </div>

      {/* Main Two Columns: Export & Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Export Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">تصدير وتنزيل نسخة يدوية</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  حفظ نسخة JSON كاملة من قاعدة البيانات على جهازك
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-2">
              <p className="font-semibold text-gray-800">تشمل النسخة المصدّرة حرفياً:</p>
              <ul className="space-y-1.5 list-disc list-inside text-gray-600">
                <li>كافة المناطق الجغرافية والمدن وإعدادات الـ SEO الخاصة بها.</li>
                <li>جميع أماكن التصوير والقاعات وصور المعارض والأسعار والارتباطات.</li>
                <li>كافة الخدمات الإضافية والباقات وتفاصيل الأسعار.</li>
                <li>إعدادات الموقع بالكامل (اللوجو، أرقام التواصل، الواتساب، والفوتر).</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleExportBackup}
              disabled={exporting}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-sm shadow-xs transition disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
              <span>{exporting ? 'جاري تجهيز النسخة وتنزيلها...' : 'تحميل النسخة الاحتياطية الآن (JSON)'}</span>
            </button>
          </div>
        </div>

        {/* 2. Import & Restore Card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">استعادة ورفع نسخة احتياطية</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  رفع ملف JSON تم تصديره مسبقاً لاسترجاع كافة البيانات
                </p>
              </div>
            </div>

            {/* Dropzone / File Picker */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                isDragOver
                  ? 'border-amber-500 bg-amber-50/50'
                  : selectedFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : 'border-gray-300 hover:border-gray-400 bg-neutral-50/60'
              }`}
            >
              <FileJson className={`w-8 h-8 ${selectedFile ? 'text-emerald-600' : 'text-gray-400'}`} />
              <div className="text-xs text-gray-700">
                {selectedFile ? (
                  <span className="font-bold text-emerald-800">{selectedFile.name}</span>
                ) : (
                  <span>
                    اسحب وأفلت ملف <strong>JSON</strong> هنا، أو اضغط للتصفح
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                {selectedFile
                  ? `حجم الملف: ${(selectedFile.size / 1024).toFixed(1)} كيلوبايت`
                  : 'يقبل فقط ملفات النسخ الاحتياطي بصيغة JSON'}
              </p>
            </div>

            {/* Parse Error */}
            {parseError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Parsed File Preview */}
            {parsedBackup && !parseError && (
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-gray-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>معاينة محتويات الملف الجاهزة للاستعادة:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-gray-600 pt-1">
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    مناطق:{' '}
                    <strong className="text-gray-900">
                      {Array.isArray(parsedBackup.data?.regions)
                        ? parsedBackup.data.regions.length
                        : Array.isArray((parsedBackup as any).regions)
                        ? (parsedBackup as any).regions.length
                        : 0}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    أماكن:{' '}
                    <strong className="text-gray-900">
                      {Array.isArray(parsedBackup.data?.locations)
                        ? parsedBackup.data.locations.length
                        : Array.isArray((parsedBackup as any).locations)
                        ? (parsedBackup as any).locations.length
                        : 0}
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    خدمات:{' '}
                    <strong className="text-gray-900">
                      {Array.isArray(parsedBackup.data?.services)
                        ? parsedBackup.data.services.length
                        : Array.isArray((parsedBackup as any).services)
                        ? (parsedBackup as any).services.length
                        : 0}
                    </strong>
                  </div>
                </div>
                {parsedBackup.meta?.exportedAt && (
                  <p className="text-[10px] text-gray-400">
                    تاريخ التصدير الأصلي: {formatDate(parsedBackup.meta.exportedAt)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={!parsedBackup || !!parseError || importing}
              onClick={() => setShowConfirmModal(true)}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm shadow-xs transition disabled:opacity-40"
            >
              <Upload className={`w-4 h-4 ${importing ? 'animate-bounce' : ''}`} />
              <span>{importing ? 'جاري استعادة البيانات...' : 'استعادة النسخة الاحتياطية'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">أمان الحساب والبيانات:</strong>{' '}
          عملية استعادة النسخة الاحتياطية محمية بحماية تراجع تلقائية (Rollback) في حال حدوث أي خطأ، ولا تقوم
          بمسح حساب المدير النشط لضمان عدم انقطاع الاتصال أو تسجيل الخروج.
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-gray-900">تأكيد استعادة النسخة الاحتياطية</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                هل أنت متأكد من استعادة هذه النسخة؟ سيتم تحديث وتطبيق محتويات ملف JSON بالكامل على قاعدة البيانات
                (المناطق، الأماكن، الخدمات، وإعدادات الموقع).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-neutral-50 text-xs font-semibold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition"
              >
                نعم، استعادة الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
