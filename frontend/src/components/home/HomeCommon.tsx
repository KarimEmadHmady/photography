import React from 'react';

/* ------------------------------------------------------------------ */
/* Design tokens (one place to control the whole look)                 */
/*   Primary  : amber-600 (hover amber-700)                            */
/*   Dark     : neutral-900                                            */
/*   Light    : white / neutral-50 / amber-50                          */
/*   Text     : neutral-900 (headings) / neutral-600 (body)            */
/* ------------------------------------------------------------------ */
export const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';

export const btnPrimary = `inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 text-white text-sm font-semibold shadow-sm hover:bg-amber-700 transition ${focusRing}`;
export const btnOutlineLight = `inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-sm font-semibold shadow-xs hover:border-amber-400 hover:bg-amber-50 transition ${focusRing}`;
export const linkAmber = `inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 transition ${focusRing} rounded`;

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'right' | 'center';
  action?: React.ReactNode;
}

export function SectionHeading({
  title,
  subtitle,
  align = 'right',
  action,
}: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <div
      className={`mb-10 flex flex-col gap-4 ${
        centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      }`}
    >
      <div className={centered ? 'max-w-xl' : ''}>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug">{title}</h2>
        <span
          className={`mt-3 block h-1 w-12 rounded-full bg-amber-500 ${centered ? 'mx-auto' : ''}`}
        />
        {subtitle && <p className="mt-4 text-sm text-neutral-600 leading-relaxed">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
