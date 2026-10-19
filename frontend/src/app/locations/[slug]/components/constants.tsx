import React from 'react';
import { IPrice } from '../../../../types';

export const shell = 'min-h-screen bg-neutral-50 pt-24 sm:pt-28';
export const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
export const noScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';

/* Mosaic كريتيف: كل 9 صور = 16 خانة (4×4) من غير فراغات */
export const MOSAIC_CYCLE = [
  'col-span-2 row-span-2', // 0 كبيرة
  '', // 1
  'row-span-2', // 2 طويلة
  '', // 3
  'row-span-2', // 4 طويلة
  'col-span-2', // 5 عريضة
  'row-span-2', // 6 طويلة
  '', // 7
  '', // 8
];

export const INITIAL_VISIBLE = 18; // دورتين كاملتين من الـ mosaic

export const btnPrimary = `w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 text-white text-sm font-semibold shadow-sm hover:bg-amber-700 transition ${focusRing}`;
export const btnOutline = `w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-sm font-medium hover:border-amber-400 hover:bg-amber-50 transition ${focusRing}`;

export function SectionTitle({ children, count }: { children: React.ReactNode; count?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="text-right">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 leading-snug">
          {children}
        </h2>
        <span className="mt-2 block h-1 w-10 rounded-full bg-amber-500" />
      </div>
      {count && <span className="shrink-0 text-xs text-neutral-500 pb-1">{count}</span>}
    </div>
  );
}

export function formatPrice(p: IPrice | undefined | null, currency: string = 'جنيه') {
  if (!p) return '—';
  if (p.type === 'on_request') return 'السعر حسب الاتفاق';
  if (p.type === 'starting_from') return `يبدأ من ${p.amount} ${currency}`;
  return `${p.amount} ${currency}`;
}
