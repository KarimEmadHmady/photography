export const shell = 'min-h-screen bg-neutral-50 pt-24 sm:pt-28 pb-12 lg:pb-16';
export const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
export const PAGE_SIZE = 10;
export const EAGER_IMAGES = 3; // أول صور تتحمل فوراً لتحسين LCP

/** هل فيه صفحة تالية؟ الاعتماد على totalPages لو موجود، وإلا نقارن بحجم الصفحة */
export const computeHasMore = (
  pagination: { totalPages?: number } | undefined,
  currentPage: number,
  receivedCount: number
) => {
  if (pagination?.totalPages != null) return currentPage < pagination.totalPages;
  return receivedCount === PAGE_SIZE;
};

export const chip = (active: boolean) =>
  `px-3.5 py-2 rounded-full text-xs font-medium transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
    active
      ? 'bg-amber-600 text-white shadow-sm font-semibold'
      : 'bg-white border border-neutral-200 text-neutral-700 hover:border-amber-300 hover:text-amber-700'
  }`;
