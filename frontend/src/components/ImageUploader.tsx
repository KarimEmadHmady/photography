'use client';

import React, { useState } from 'react';
import { UploadCloud, Loader2, X, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

export interface UploadedImageData {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  alt?: string;
}

interface ImageUploaderProps {
  onUploaded?: (imageData: UploadedImageData) => void;
  onMultipleUploaded?: (imagesData: UploadedImageData[]) => void;
  multiple?: boolean;
  folder?: string;
  label?: string;
  defaultAlt?: string;
}

export default function ImageUploader({
  onUploaded,
  onMultipleUploaded,
  multiple = false,
  folder = 'wedding_portfolio',
  label = 'رفع صورة جديدة',
  defaultAlt = '',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>('تم الرفع بنجاح!');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files ? Array.from(e.target.files) : [];
    if (rawFiles.length === 0) return;

    setError(null);
    setSuccess(false);

    // Validate files
    const validFiles: File[] = [];
    let invalidTypeCount = 0;
    let oversizedCount = 0;

    for (const file of rawFiles) {
      if (!file.type.startsWith('image/')) {
        invalidTypeCount++;
      } else if (file.size > 10 * 1024 * 1024) {
        oversizedCount++;
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      if (invalidTypeCount > 0) {
        setError('يرجى اختيار ملفات صور صالحة (JPEG, PNG, WebP)');
      } else if (oversizedCount > 0) {
        setError('حجم الصورة كبير جداً، الحد الأقصى هو 10 ميجابايت لكل صورة');
      }
      e.target.value = '';
      return;
    }

    let validationWarning = '';
    if (invalidTypeCount > 0 || oversizedCount > 0) {
      validationWarning = `تم استبعاد ${invalidTypeCount + oversizedCount} ملفات لعدم مطابقة الشروط (نوع الملف أو الحجم > 10MB).`;
    }

    setUploading(true);
    setProgress({ current: 0, total: validFiles.length });

    const CONCURRENCY = 3;
    const successfulResults: UploadedImageData[] = [];
    const failedFiles: string[] = [];
    let processedCount = 0;
    let nextIndex = 0;

    const runWorker = async () => {
      while (nextIndex < validFiles.length) {
        const file = validFiles[nextIndex++];
        try {
          const res = await api.admin.uploadImage(file, folder);
          if (res.success && res.data) {
            const item: UploadedImageData = {
              ...res.data,
              alt: defaultAlt || file.name.split('.')[0] || 'صورة',
            };
            successfulResults.push(item);
          } else {
            failedFiles.push(file.name);
          }
        } catch {
          failedFiles.push(file.name);
        } finally {
          processedCount++;
          setProgress({ current: processedCount, total: validFiles.length });
        }
      }
    };

    try {
      const workers = Array.from(
        { length: Math.min(CONCURRENCY, validFiles.length) },
        () => runWorker()
      );
      await Promise.all(workers);

      if (successfulResults.length > 0) {
        if (onMultipleUploaded) {
          onMultipleUploaded(successfulResults);
        } else if (onUploaded) {
          successfulResults.forEach((img) => onUploaded(img));
        }

        const msg =
          successfulResults.length > 1
            ? `تم رفع ${successfulResults.length} صور بنجاح!`
            : 'تم الرفع بنجاح!';
        setSuccessMsg(msg);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3500);
      }

      if (failedFiles.length > 0) {
        setError(
          `فشل رفع ${failedFiles.length} صورة (${failedFiles.slice(0, 3).join(', ')}${
            failedFiles.length > 3 ? '...' : ''
          }). ${validationWarning}`
        );
      } else if (validationWarning) {
        setError(validationWarning);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء رفع الصور، يرجى المحاولة مرة أخرى');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-neutral-700">{label}</label>
      <div
        className={`relative rounded-xl border-2 border-dashed p-5 text-center transition focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 ${
          success
            ? 'border-emerald-400 bg-emerald-50'
            : 'border-neutral-300 bg-neutral-50 hover:border-amber-500 hover:bg-amber-50'
        } ${uploading ? 'cursor-wait' : 'cursor-pointer'}`}
      >
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
              <span className="text-xs text-neutral-700 font-medium">
                {progress.total > 1
                  ? `جاري رفع الصور... (${progress.current} من ${progress.total})`
                  : 'جاري الرفع إلى السحابة...'}
              </span>
              {progress.total > 1 && (
                <div className="w-48 bg-neutral-200 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className="bg-amber-600 h-full transition-all duration-300"
                    style={{
                      width: `${Math.round((progress.current / progress.total) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-7 h-7 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">{successMsg}</span>
            </>
          ) : (
            <>
              <div className="w-11 h-11 rounded-full bg-white border border-neutral-200 flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs text-neutral-800 font-semibold">
                {multiple
                  ? 'اضغط أو اسحب صور للرفع (يمكنك اختيار أكثر من صورة)'
                  : 'اضغط أو اسحب صورة للرفع'}
              </span>
              <span className="text-[11px] text-neutral-500">
                {multiple
                  ? 'PNG, JPG, WebP حتى 10 ميجابايت لكل صورة'
                  : 'PNG, JPG, WebP حتى 10 ميجابايت'}
              </span>
            </>
          )}
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-100 p-2.5 rounded-lg"
        >
          <X className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}