'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { shell, container } from './constants';

interface LocationErrorStateProps {
  error?: string | null;
  onRetry: () => void;
}

export function LocationErrorState({ error, onRetry }: LocationErrorStateProps) {
  return (
    <div className={shell}>
      <div className={container}>
        <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white border border-neutral-200 rounded-xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">مكان التصوير غير متاح</h2>
          <p className="text-sm text-neutral-600">
            {error || 'لم يتم العثور على مكان التصوير المطلوب'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition"
            >
              <span>إعادة المحاولة</span>
            </button>
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 text-neutral-800 rounded-xl text-sm font-semibold hover:bg-neutral-200 transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لكل الأماكن</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
