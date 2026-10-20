'use client';

import React from 'react';
import { MapPin, ExternalLink, MessageCircle, Phone } from 'lucide-react';
import { ILocation } from '../../../../types';
import { formatPrice, btnPrimary, btnOutline } from './constants';
import { ScrollReveal } from '../../../../components/ui/ScrollReveal';

interface LocationInfoBookingProps {
  location: ILocation;
  currency: string;
  whatsappUrl: string;
  phone?: string;
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-xs sm:text-sm border-b border-neutral-200/70 last:border-0">
      <span className="text-neutral-600">{label}</span>
      <span className="font-bold text-neutral-900 text-left">{value}</span>
    </div>
  );
}

export function LocationInfoBooking({
  location,
  currency,
  whatsappUrl,
  phone,
}: LocationInfoBookingProps) {
  return (
    <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3 sm:space-y-4 bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm">
      <ScrollReveal animation="fade-down" delay={100} duration={700}>
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-900 leading-snug">
            {location.name}
          </h1>
          <span className="block h-1 w-10 rounded-full bg-amber-500" />
          {(location.address || location.mapUrl) && (
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 pt-1">
              {location.address && (
                <div className="flex items-start gap-1.5 text-xs text-neutral-600 min-w-0">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-px" />
                  <span className="leading-relaxed">{location.address}</span>
                </div>
              )}
              {location.mapUrl && (
                <a
                  href={location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold shrink-0"
                >
                  <span>فتح على الخريطة</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Pricing Box */}
      <ScrollReveal animation="fade-up" delay={220} duration={700}>
        <div className="p-3 sm:p-4 bg-neutral-50 rounded-xl border border-neutral-200">
          <h2 className="text-sm font-bold text-neutral-900 mb-0.5">تفاصيل الأسعار</h2>

          <PriceRow
            label="سعر جلسة التصوير"
            value={formatPrice(location.photographyPrice, currency)}
          />
          <PriceRow
            label="سعر حجز المكان / القاعة"
            value={formatPrice(location.venuePrice, currency)}
          />

          {location.showTotal && location.computedTotalPrice && (
            <div className="mt-2 flex items-center justify-between gap-3 bg-amber-100/70 border border-amber-200 text-amber-900 font-bold px-3 py-2 rounded-lg text-xs sm:text-sm">
              <span>الإجمالي التقديري</span>
              <span className="text-sm sm:text-base">
                {location.computedTotalPrice} {currency}
              </span>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* أزرار التواصل — للكمبيوتر فقط، لأن الموبايل فيه شريط الحجز السفلي */}
      <div className="hidden lg:block space-y-2.5">
        <ScrollReveal animation="fade-up" delay={340} duration={700}>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
            <MessageCircle className="w-5 h-5" />
            <span>استفسر أو احجز عبر واتساب</span>
          </a>
          {phone && (
            <a href={`tel:${phone}`} className={`${btnOutline} mt-2.5`}>
              <Phone className="w-4 h-4 text-amber-600" />
              <span>
                اتصال هاتفي: <span dir="ltr">{phone}</span>
              </span>
            </a>
          )}
        </ScrollReveal>
      </div>
    </div>
  );
}
