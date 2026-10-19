'use client';

import { Phone, MessageCircle } from 'lucide-react';
import { focusRing } from './constants';

interface LocationMobileBarProps {
  summaryPrice: { label: string; value: string };
  whatsappUrl: string;
  phone?: string;
}

export function LocationMobileBar({
  summaryPrice,
  whatsappUrl,
  phone,
}: LocationMobileBarProps) {
  return (
    <div className="lg:hidden sticky bottom-0 z-40 bg-white/85 backdrop-blur-xl border-t border-neutral-200 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="min-w-0 text-right leading-tight">
          <span className="block text-[11px] text-neutral-500">{summaryPrice.label}</span>
          <span className="block text-sm font-bold text-neutral-900 truncate">
            {summaryPrice.value}
          </span>
        </div>
        <div className="flex items-center gap-2 mr-auto shrink-0">
          {phone && (
            <a
              href={`tel:${phone}`}
              aria-label="اتصال هاتفي"
              className={`w-10 h-10 rounded-xl border border-neutral-300 bg-white text-amber-700 flex items-center justify-center hover:bg-amber-50 transition ${focusRing}`}
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`h-10 px-4 rounded-xl bg-amber-600 text-white text-sm font-semibold flex items-center gap-2 hover:bg-amber-700 shadow-sm transition ${focusRing}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>احجز واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
}
