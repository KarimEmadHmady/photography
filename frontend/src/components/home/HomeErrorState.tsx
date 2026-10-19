'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { btnPrimary } from './HomeCommon';

interface HomeErrorStateProps {
  error: string | null;
  onRetry?: () => void;
}

export function HomeErrorState({ error, onRetry }: HomeErrorStateProps) {
  return (
    <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-neutral-200 rounded-2xl text-center space-y-4 shadow-sm">
      <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <h2 className="text-lg font-bold text-neutral-900">حدث خطأ أثناء تحميل المحتوى</h2>
      <p className="text-sm text-neutral-600">{error || 'تعذر الاتصال بالسيرفر'}</p>
      <button
        onClick={onRetry || (() => window.location.reload())}
        className={btnPrimary}
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
