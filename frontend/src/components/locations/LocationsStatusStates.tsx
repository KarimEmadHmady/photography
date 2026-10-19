'use client';

import { Camera, AlertCircle } from 'lucide-react';

export function LocationsEmptyState() {
  return (
    <div className="text-center py-14 bg-white rounded-xl border border-dashed border-neutral-300">
      <Camera className="w-9 h-9 text-neutral-400 mx-auto mb-2" />
      <p className="text-neutral-500 text-sm">لا توجد أماكن تصوير مطابقة في هذه المنطقة.</p>
    </div>
  );
}

interface LocationsErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export function LocationsErrorState({ error, onRetry }: LocationsErrorStateProps) {
  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white border border-neutral-200 rounded-xl text-center space-y-3 shadow-sm">
      <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm text-neutral-700">{error || 'حدث خطأ أثناء تحميل أماكن التصوير'}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
