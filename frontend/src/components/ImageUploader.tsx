'use client';

import React, { useState } from 'react';
import { UploadCloud, Loader2, X, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';

interface ImageUploaderProps {
  onUploaded: (imageData: {
    publicId: string;
    url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    alt?: string;
  }) => void;
  folder?: string;
  label?: string;
  defaultAlt?: string;
}

export default function ImageUploader({
  onUploaded,
  folder = 'wedding_portfolio',
  label = 'رفع صورة جديدة',
  defaultAlt = '',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('حجم الصورة كبير جداً، الحد الأقصى هو 10 ميجابايت');
      return;
    }

    setError(null);
    setUploading(true);
    setSuccess(false);

    try {
      const res = await api.admin.uploadImage(file, folder);
      if (res.success && res.data) {
        setSuccess(true);
        onUploaded({
          ...res.data,
          alt: defaultAlt || file.name.split('.')[0] || 'صورة',
        });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'فشل رفع الصورة، يرجى التحقق من الاتصال بالسيرفر');
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
          onChange={handleFileChange}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
              <span className="text-xs text-neutral-600">جاري الرفع إلى السحابة...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-7 h-7 text-emerald-600" />
              <span className="text-xs text-emerald-700 font-medium">تم الرفع بنجاح!</span>
            </>
          ) : (
            <>
              <div className="w-11 h-11 rounded-full bg-white border border-neutral-200 flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs text-neutral-800 font-semibold">اضغط أو اسحب صورة للرفع</span>
              <span className="text-[11px] text-neutral-500">PNG, JPG, WebP حتى 10 ميجابايت</span>
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