'use client';

import { Loader2 } from 'lucide-react';

interface LocationsInfiniteFooterProps {
  loadingMore: boolean;
  loadMoreError: boolean;
  hasMore: boolean;
  loadedCount: number;
  totalLocations: number;
  pageSize: number;
  onRetry: () => void;
}

export function LocationsInfiniteFooter({
  loadingMore,
  loadMoreError,
  hasMore,
  loadedCount,
  totalLocations,
  pageSize,
  onRetry,
}: LocationsInfiniteFooterProps) {
  return (
    <>
      {/* مؤشر تحميل المزيد */}
      {loadingMore && (
        <div className="flex flex-col items-center justify-center py-6 gap-2 text-neutral-600">
          <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
          <span className="text-xs font-medium">جاري تحميل المزيد من أماكن التصوير...</span>
        </div>
      )}

      {/* فشل تحميل المزيد */}
      {loadMoreError && (
        <div className="text-center py-6 space-y-2">
          <p className="text-xs text-neutral-600">تعذر تحميل المزيد من الأماكن.</p>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* نهاية النتائج */}
      {!hasMore && !loadMoreError && loadedCount > 0 && totalLocations > pageSize && (
        <div className="text-center py-6 border-t border-neutral-200 mt-6">
          <p className="text-xs text-neutral-400">
            تم عرض جميع أماكن التصوير المتاحة ({loadedCount})
          </p>
        </div>
      )}
    </>
  );
}
