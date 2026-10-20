'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Sparkles,
  MessageCircle,
  ArrowRight,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { optimizeImageUrl } from '../../../lib/image';
import { IService, ISiteSettings } from '../../../types';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';

/* الـ Navbar ثابت (fixed) فنسيب مسافة من فوق */
const shell = 'min-h-screen bg-neutral-50 pt-28 sm:pt-32';
const container = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8';
const noScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [service, setService] = useState<IService | null>(null);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      api.public.getServiceBySlug(slug),
      api.public.getSettings().catch(() => ({ success: false, data: null })),
    ])
      .then(([sRes, setRes]) => {
        if (sRes.success && sRes.data) {
          setService(sRes.data);
        } else {
          setError(sRes.message || 'الخدمة غير موجودة');
        }
        if (setRes.success && setRes.data) {
          setSettings(setRes.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر تحميل بيانات الخدمة');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className={shell}>
        <div className={`${container} space-y-8 sm:space-y-10 pb-12 lg:pb-20 animate-pulse`}>
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-48 bg-neutral-200 rounded" />

          {/* Main Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-6">
              <div className="aspect-4/3 rounded-2xl sm:rounded-3xl bg-neutral-200 border border-neutral-200" />
            </div>

            <div className="lg:col-span-6 space-y-6 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-neutral-200">
              <div className="space-y-2">
                <div className="h-8 w-56 bg-neutral-200 rounded-lg" />
                <div className="h-1 w-12 rounded-full bg-amber-500/50" />
                <div className="h-4 w-full bg-neutral-100 rounded" />
                <div className="h-4 w-2/3 bg-neutral-100 rounded" />
              </div>
              <div className="h-12 bg-neutral-100 rounded-2xl border border-neutral-200" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-neutral-200 rounded" />
                <div className="h-14 bg-neutral-50 rounded-xl border border-neutral-200" />
                <div className="h-14 bg-neutral-50 rounded-xl border border-neutral-200" />
              </div>
              <div className="h-12 bg-neutral-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className={shell}>
        <div className={container}>
          <div className="max-w-xl mx-auto p-8 bg-white border border-neutral-200 rounded-2xl text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">الخدمة غير متاحة</h2>
            <p className="text-sm text-neutral-600">
              {error || 'لم يتم العثور على الخدمة المطلوبة'}
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لكل الخدمات</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currency = settings?.currencyLabel || 'جنيه';
  const defaultMsg = `مرحباً، أود الاستفسار عن تفاصيل (${service.name}).`;
  const whatsappUrl = `https://wa.me/${(settings?.contact?.whatsappNumber || '201000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    defaultMsg
  )}`;

  const priceText =
    service.price?.type === 'on_request'
      ? 'السعر حسب الطلب والاتفاق'
      : service.price?.type === 'starting_from'
      ? `يبدأ من ${service.price.amount} ${currency}`
      : `${service.price?.amount} ${currency}`;

  return (
    <div className={shell}>
      <div className={`${container} space-y-8 sm:space-y-10 pb-12 lg:pb-20`}>
        {/* Breadcrumb */}
        <ScrollReveal animation="fade-down" delay={50} duration={650}>
          <nav
            className={`flex items-center gap-1.5 text-xs text-neutral-500 overflow-x-auto whitespace-nowrap ${noScrollbar}`}
            aria-label="مسار التنقل"
          >
            <Link href="/" className="hover:text-amber-700 transition shrink-0">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <Link href="/services" className="hover:text-amber-700 transition shrink-0">
              الخدمات
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="text-neutral-900 font-bold shrink-0">{service.name}</span>
          </nav>
        </ScrollReveal>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start content-auto">
          {/* Main Image — كاملة من غير قص */}
          <ScrollReveal animation="fade-left" delay={100} duration={800} className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="relative min-h-[220px] rounded-2xl sm:rounded-3xl overflow-hidden bg-amber-50 shadow-md border border-neutral-200">
              {service.mainImage ? (
                <>
                  <img
                    src={optimizeImageUrl(service.mainImage, { width: 300, quality: 'eco' })}
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-70 pointer-events-none"
                  />
                  <img
                    src={optimizeImageUrl(service.mainImage, { width: 950, quality: 'auto' })}
                    alt={service.name}
                    loading="eager"
                    decoding="async"
                    // @ts-ignore
                    fetchPriority="high"
                    className="relative z-10 block w-full h-auto max-h-[78vh] object-contain mx-auto gpu-layer"
                  />
                </>
              ) : (
                <div className="aspect-4/3 w-full flex items-center justify-center text-amber-600">
                  <span className="w-20 h-20 rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-10 h-10" />
                  </span>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Content & Action */}
          <div className="lg:col-span-6 space-y-6 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-sm">
            <ScrollReveal animation="fade-down" delay={150} duration={700}>
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-snug">
                  {service.name}
                </h1>
                <span className="block h-1 w-12 rounded-full bg-amber-500" />
                {service.shortDescription && (
                  <p className="text-neutral-600 text-sm pt-2 leading-relaxed">
                    {service.shortDescription}
                  </p>
                )}
              </div>
            </ScrollReveal>

            {/* Price */}
            <ScrollReveal animation="fade-up" delay={250} duration={700}>
              <div className="p-4 bg-amber-100/60 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-amber-900">سعر الخدمة</span>
                <span className="text-base font-bold text-amber-900 text-left">{priceText}</span>
              </div>
            </ScrollReveal>

            {/* Variants */}
            {service.variants && service.variants.length > 0 && (
              <ScrollReveal animation="fade-up" delay={350} duration={700}>
                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-neutral-900">خيارات ومقاسات متوفرة</h2>
                  <div className="space-y-2">
                    {service.variants.map((variant, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-amber-300 transition flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-neutral-900 text-sm">
                            {variant.name}
                          </span>
                          {variant.description && (
                            <p className="text-neutral-600 mt-0.5 leading-relaxed">
                              {variant.description}
                            </p>
                          )}
                        </div>
                        {variant.price?.amount && (
                          <span className="shrink-0 font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-full">
                            {variant.price.amount} {currency}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Description */}
            {service.description && (
              <ScrollReveal animation="fade-up" delay={450} duration={700}>
                <div className="space-y-2 pt-4 border-t border-neutral-100">
                  <h2 className="text-sm font-bold text-neutral-900">تفاصيل إضافية عن الخدمة</h2>
                  <p className="text-neutral-600 text-sm leading-loose whitespace-pre-line">
                    {service.description}
                  </p>
                </div>
              </ScrollReveal>
            )}

            {/* WhatsApp CTA — على الموبايل في الشريط السفلي كمان */}
            <ScrollReveal animation="fade-up" delay={550} duration={700}>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-600 text-white text-sm font-semibold shadow-sm hover:bg-amber-700 transition ${focusRing}`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>طلب أو استفسار عبر واتساب</span>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* شريط الطلب السفلي — موبايل فقط (sticky مش fixed عشان ميغطيش الفوتر) */}
      <div className="lg:hidden sticky bottom-0 z-40 bg-white/85 backdrop-blur-xl border-t border-neutral-200 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="min-w-0 text-right leading-tight">
            <span className="block text-[11px] text-neutral-500">سعر الخدمة</span>
            <span className="block text-sm font-bold text-neutral-900 truncate">{priceText}</span>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mr-auto shrink-0 h-11 px-5 rounded-xl bg-amber-600 text-white text-sm font-semibold flex items-center gap-2 hover:bg-amber-700 shadow-sm transition ${focusRing}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>اطلب واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
}