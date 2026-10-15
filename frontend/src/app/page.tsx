'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Phone,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { api } from '../lib/api';
import { optimizeImageUrl } from '../lib/image';
import { IRegion, ILocation, IService, ISiteSettings } from '../types';

/* ------------------------------------------------------------------ */
/* Design tokens (one place to control the whole look)                 */
/*   Primary  : amber-600 (hover amber-700)                            */
/*   Dark     : neutral-900                                            */
/*   Light    : white / neutral-50 / amber-50                          */
/*   Text     : neutral-900 (headings) / neutral-600 (body)            */
/* ------------------------------------------------------------------ */
const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';

const btnPrimary = `inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-600 text-white text-sm font-semibold shadow-sm hover:bg-amber-700 transition ${focusRing}`;
const btnOutlineLight = `inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-sm font-semibold shadow-xs hover:border-amber-400 hover:bg-amber-50 transition ${focusRing}`;
const linkAmber = `inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 transition ${focusRing} rounded`;

function SectionHeading({
  title,
  subtitle,
  align = 'right',
  action,
}: {
  title: string;
  subtitle?: string;
  align?: 'right' | 'center';
  action?: React.ReactNode;
}) {
  const centered = align === 'center';
  return (
    <div
      className={`mb-10 flex flex-col gap-4 ${
        centered ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      }`}
    >
      <div className={centered ? 'max-w-xl' : ''}>
        <h2 className="text-2x0.8 sm:text-3xl font-bold text-neutral-900 leading-snug">{title}</h2>
        <span
          className={`mt-3 block h-1 w-12 rounded-full bg-amber-500 ${centered ? 'mx-auto' : ''}`}
        />
        {subtitle && <p className="mt-4 text-sm text-neutral-600 leading-relaxed">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers + cards for the "Featured Locations" section                */
/* ------------------------------------------------------------------ */
function locRegion(loc: ILocation) {
  return typeof loc.regionId === 'object' ? (loc.regionId as any)?.name || '' : '';
}

function locPrice(loc: ILocation, currency: string) {
  if (loc.computedTotalPrice) return `الإجمالي التقديري: ${loc.computedTotalPrice} ${currency}`;
  if (loc.photographyPrice?.type === 'on_request') return 'السعر حسب الاتفاق';
  return `يبدأ من ${loc.photographyPrice?.amount || ''} ${currency}`;
}

/* كارت بصورة كاملة والنص فوقها — للمكان الأبرز */
function FeaturedOverlayCard({
  loc,
  currency,
  large = false,
  className = '',
}: {
  loc: ILocation;
  currency: string;
  large?: boolean;
  className?: string;
}) {
  const regionName = locRegion(loc);
  return (
    <Link
      href={`/locations/${loc.slug}`}
      className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-200 shadow-sm hover:shadow-xl transition-shadow duration-300 ${
        large
          ? 'min-h-[380px] sm:min-h-[440px] lg:min-h-[480px]'
          : 'min-h-[260px] sm:min-h-[280px] lg:min-h-[220px]'
      } ${focusRing} ${className}`}
    >
      {loc.coverImage ? (
        <img
          src={optimizeImageUrl(loc.coverImage, { width: large ? 950 : 600, quality: 'auto' })}
          alt={loc.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out gpu-layer"
        />
      ) : (
        <div className="absolute inset-0 -z-10 flex items-center justify-center text-neutral-400">
          <Camera className="w-10 h-10" />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-900/90 via-neutral-900/35 to-transparent" />

      {regionName && (
        <span className="absolute top-4 right-4 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          <MapPin className="w-3 h-3 text-amber-600" />
          <span>{regionName}</span>
        </span>
      )}
      {large && (
        <span className="absolute top-4 left-4 bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3" />
          <span>الأبرز</span>
        </span>
      )}

      <div className="relative p-5 sm:p-7 text-white space-y-2.5">
        <h3
          className={`font-extrabold leading-snug group-hover:text-amber-300 transition-colors ${
            large ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
          }`}
        >
          {loc.name}
        </h3>
        {large && loc.shortDescription && (
          <p className="text-sm text-neutral-200 leading-relaxed line-clamp-2 max-w-xl">
            {loc.shortDescription}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
            {locPrice(loc, currency)}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-amber-600 group-hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition-colors">
            <span>التفاصيل</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* كارت أبيض عادي — لباقي الأماكن */
function FeaturedLocationCard({ loc, currency }: { loc: ILocation; currency: string }) {
  const regionName = locRegion(loc);
  return (
    <Link
      href={`/locations/${loc.slug}`}
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${focusRing}`}
    >
      <div className="relative aspect-16/10 bg-neutral-200 overflow-hidden">
        {loc.coverImage ? (
          <img
            src={optimizeImageUrl(loc.coverImage, { width: 550, quality: 'auto' })}
            alt={loc.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out gpu-layer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <Camera className="w-8 h-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {regionName && (
          <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3 text-amber-600" />
            <span>{regionName}</span>
          </span>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-neutral-900 group-hover:text-amber-700 transition-colors">
            {loc.name}
          </h3>
          {loc.shortDescription && (
            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed line-clamp-2">
              {loc.shortDescription}
            </p>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3 text-xs">
          <span className="text-neutral-700 font-medium">{locPrice(loc, currency)}</span>
          <span className="shrink-0 w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function HomePage() {
  const [data, setData] = useState<{
    settings: ISiteSettings;
    sections: any[];
    featuredRegions: IRegion[];
    featuredLocations: ILocation[];
    featuredServices: IService[];
    portfolioItems: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    api.public
      .getHomepage()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'فشل في تحميل بيانات الصفحة الرئيسية');
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً');
      })
      .finally(() => setLoading(false));
  }, []);

  const heroImages: string[] = (
    data?.settings?.hero?.images && data.settings.hero.images.length > 0
      ? data.settings.hero.images
      : data?.settings?.hero?.imageUrl
      ? [data.settings.hero.imageUrl]
      : []
  ).filter(Boolean);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white border-b border-neutral-200 pt-28 pb-14 lg:pt-36 lg:pb-20">
          <div className={container}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-5 animate-pulse">
                <div className="h-6 w-44 bg-amber-100 rounded-full" />
                <div className="h-10 w-4/5 bg-neutral-200 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-neutral-100 rounded-md" />
                  <div className="h-4 w-2/3 bg-neutral-100 rounded-md" />
                </div>
                <div className="pt-2 flex gap-3">
                  <div className="h-12 w-44 bg-amber-200/70 rounded-xl" />
                  <div className="h-12 w-40 bg-neutral-200 rounded-xl" />
                </div>
              </div>
              <div className="hidden lg:block lg:col-span-5">
                <div className="aspect-4/5 max-w-[320px] mx-auto rounded-2xl bg-neutral-100 animate-pulse border-4 border-white shadow-xl" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-neutral-200 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">حدث خطأ أثناء تحميل المحتوى</h2>
        <p className="text-sm text-neutral-600">{error}</p>
        <button onClick={() => window.location.reload()} className={btnPrimary}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const { settings, featuredRegions, featuredLocations, featuredServices } = data;

  // تقسيم الأماكن المميزة (بعد ما data بقت جاهزة)
  const [leadLoc, ...otherLocs] = featuredLocations || [];
  const sideLocs = otherLocs.slice(0, 2);
  const restLocs = otherLocs.slice(2);

  const whatsappUrl = `https://wa.me/${(settings.contact.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    settings.contact.defaultWhatsappMessage || ''
  )}`;

  const steps = [
    {
      title: 'اختر مكان التصوير',
      desc: 'تصفح صور الأماكن والقاعات في المناطق المختلفة واختر الأنسب لذوقك.',
    },
    {
      title: 'اطلع على الأسعار',
      desc: 'تعرف على أسعار التصوير وحجز المكان بشفافية تامة وبدون تكاليف مخفية.',
    },
    {
      title: 'تواصل مباشرة',
      desc: 'تواصل مع المصور عبر واتساب أو الهاتف لتحديد الموعد المناسب.',
    },
    {
      title: 'وثق أجمل اللحظات',
      desc: 'عش تجربة تصوير مريحة واحترافية واستلم صورك بأعلى جودة.',
    },
  ];

  return (
    <div className="bg-white">
      {/* 1. Hero — light */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white border-b border-neutral-200 pt-28 pb-14 min-h-[100svh] flex items-center lg:min-h-0 lg:pt-36 lg:pb-20">
        {/* Mobile: خلفية متحركة للسليدر — محملة بذكاء بدون إثقال المعالج */}
        {heroImages.length > 0 && (
          <div className="absolute inset-0 lg:hidden overflow-hidden">
            {heroImages.map((imgUrl, idx) => {
              // لا نحمل في الذاكرة إلا الشريحة الحالية والتالية فقط لتوفير استهلاك البيانات والرام
              const isRelevant =
                idx === currentSlide ||
                idx === (currentSlide + 1) % heroImages.length;
              if (!isRelevant) return null;

              return (
                <div
                  key={imgUrl + idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={optimizeImageUrl(imgUrl, { width: 800, quality: 'auto' })}
                    alt={`${settings.hero.title} ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    {...(idx === 0 ? { fetchPriority: 'high' } : {})}
                    className="w-full h-full object-cover gpu-layer"
                  />
                </div>
              );
            })}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/40" />
          </div>
        )}

        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

        <div className={`relative w-full ${container}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* النص */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-800 text-[11px] sm:text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>تصوير فوتوغرافي محترف للزفاف والسيشن</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.1rem] font-extrabold text-neutral-900 leading-tight">
                {settings.hero.title}
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {settings.hero.description}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3">
                <Link
                  href={settings.hero.primaryCtaUrl || '/locations'}
                  className={`${btnPrimary} w-full sm:w-auto lg:px-5 lg:py-3`}
                >
                  <span>{settings.hero.primaryCtaText || 'استكشف أماكن التصوير'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnOutlineLight} w-full sm:w-auto lg:px-5 lg:py-3`}
                >
                  <MessageCircle className="w-4 h-4 text-amber-600" />
                  <span>{settings.hero.secondaryCtaText || 'تواصل عبر واتساب'}</span>
                </a>
              </div>
            </div>

            {/* Desktop فقط: بطاقة السليدر */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative mx-auto w-full max-w-[320px] xl:max-w-sm">
                <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl border-2 border-amber-400" />
                <div className="relative aspect-4/5 rounded-2xl overflow-hidden shadow-xl bg-neutral-100 border-4 border-white group">
                  {heroImages.length > 0 ? (
                    heroImages.map((imgUrl, idx) => {
                      const isRelevant =
                        idx === currentSlide ||
                        idx === (currentSlide + 1) % heroImages.length;
                      if (!isRelevant) return null;

                      return (
                        <div
                          key={imgUrl + idx}
                          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            idx === currentSlide
                              ? 'opacity-100 z-10'
                              : 'opacity-0 z-0 pointer-events-none'
                          }`}
                        >
                          <img
                            src={optimizeImageUrl(imgUrl, { width: 900, quality: 'auto' })}
                            alt={`${settings.hero.title} ${idx + 1}`}
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            decoding="async"
                            {...(idx === 0 ? { fetchPriority: 'high' } : {})}
                            className="w-full h-full object-cover gpu-layer"
                          />
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-white border border-amber-200 shadow-sm flex items-center justify-center mb-4">
                        <Camera className="w-8 h-8 text-amber-600 stroke-1" />
                      </div>
                      <p className="font-semibold text-base text-neutral-900">{settings.photographerName}</p>
                      <p className="text-xs text-amber-700 mt-1">لحظات تدوم إلى الأبد</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: مؤشر الماوس المتحرك للسكرول لأسفل */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 lg:hidden z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight - 70,
                behavior: 'smooth',
              });
            }}
            aria-label="اسحب لأسفل للاستكشاف"
            className="flex flex-col items-center gap-1 group focus:outline-none"
          >
            <div className="w-5 h-8.5 rounded-full border-2 border-neutral-400/90 group-hover:border-amber-600 flex justify-center pt-1.5 bg-white/70 backdrop-blur-xs transition-colors shadow-xs">
              <span className="w-1 h-2 bg-amber-600 rounded-full animate-mouse-wheel" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-600 animate-bounce -mt-0.5 transition-colors" />
          </button>
        </div>
      </section>

      {/* 2. Featured Regions — white */}
      {featuredRegions && featuredRegions.length > 0 && (
        <section className="bg-white py-10 lg:py-14">
          <div className={container}>
            <SectionHeading
              title="استكشف أماكن التصوير حسب المنطقة"
              subtitle="اختر المنطقة الأقرب إليك وتصفح أجمل المواقع المتاحة فيها."
              action={
                <Link href="/regions" className={`${linkAmber} self-start`}>
                  <span>جميع المناطق</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {featuredRegions.map((region) => (
                <Link
                  key={region._id}
                  href={`/regions/${region.slug}`}
                  className={`group relative rounded-xl overflow-hidden aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/10] bg-neutral-900 flex flex-col justify-end p-4 lg:p-5 shadow-sm hover:shadow-lg transition ${focusRing}`}
                >
                  {region.coverImage && (
                    <img
                      src={optimizeImageUrl(region.coverImage, { width: 600, quality: 'auto' })}
                      alt={region.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 gpu-layer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/30 to-transparent" />
                  <div className="relative z-10 text-white space-y-0.5">
                    <h3 className="text-lg lg:text-xl font-bold group-hover:text-amber-400 transition">
                      {region.name}
                    </h3>
                    {region.description && (
                      <p className="text-xs text-neutral-300 line-clamp-2">{region.description}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium pt-1.5">
                      <span>استكشف الأماكن</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Featured Locations — neutral-50 */}
      {leadLoc && (
        <section className="content-auto bg-neutral-50 border-y border-neutral-200 py-10 lg:py-14">
          <div className={container}>
            <SectionHeading
              title="أشهر مواقع وجلسات تصوير السيشن"
              subtitle="مواقع مختارة بعناية بأسعار واضحة من أول نظرة."
              action={
                <Link href="/locations" className={`${linkAmber} self-start`}>
                  <span>عرض كل الأماكن</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              }
            />

            <div className="space-y-4 sm:space-y-5">
              {/* الأبرز + مكانين جنبه */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
                <FeaturedOverlayCard
                  loc={leadLoc}
                  currency={settings.currencyLabel}
                  large
                  className={sideLocs.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}
                />
                {sideLocs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 sm:gap-5">
                    {sideLocs.map((loc) => (
                      <FeaturedOverlayCard
                        key={loc._id}
                        loc={loc}
                        currency={settings.currencyLabel}
                        className="h-full"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* باقي الأماكن */}
              {restLocs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {restLocs.map((loc) => (
                    <FeaturedLocationCard
                      key={loc._id}
                      loc={loc}
                      currency={settings.currencyLabel}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Services — amber tint */}
      {featuredServices && featuredServices.length > 0 && (
        <section className="content-auto bg-amber-50 py-10 lg:py-14">
          <div className={container}>
            <SectionHeading
              align="center"
              title="باقات وخدمات متكاملة ليومك المميز"
              subtitle="خدمات إضافية تكمل جلسة التصوير وتمنحك تجربة كاملة."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {featuredServices.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service.slug}`}
                  className={`relative bg-white rounded-xl p-5 border border-amber-100 hover:border-amber-300 hover:shadow-md transition text-right group flex flex-col justify-between overflow-hidden ${focusRing}`}
                >
                  <span className="absolute top-0 inset-x-0 h-1 bg-amber-600 group-hover:bg-amber-500 transition" />
                  <div className="space-y-2 pt-1">
                    <h3 className="font-bold text-base lg:text-lg text-neutral-900 group-hover:text-amber-700 transition">
                      {service.name}
                    </h3>
                    {service.shortDescription && (
                      <p className="text-xs lg:text-sm text-neutral-600 leading-relaxed line-clamp-3">
                        {service.shortDescription}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-700">
                      {service.price?.type === 'on_request'
                        ? 'السعر حسب الطلب'
                        : `${service.price?.amount} ${settings.currencyLabel}`}
                    </span>
                    <span className="inline-flex items-center gap-1 text-neutral-500 group-hover:text-neutral-900 transition">
                      <span>عرض التفاصيل</span>
                      <ArrowLeft className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. How it works — white */}
      <section className="content-auto bg-white py-10 lg:py-14">
        <div className={container}>
          <SectionHeading
            align="center"
            title="كيف تنسق جلسة تصويرك؟"
            subtitle="أربع خطوات بسيطة من الاختيار حتى استلام الصور."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {steps.map((item, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 text-right space-y-2"
              >
                <span className="w-9 h-9 rounded-full bg-neutral-900 text-amber-400 text-sm font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <h3 className="font-bold text-base text-neutral-900">{item.title}</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Contact CTA — amber card, sits right above the dark footer */}
      <section id="contact" className="content-auto bg-white pb-10 lg:pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-amber-600 text-white p-6 sm:p-8 text-center space-y-4 shadow-lg">
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-amber-500/60 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-neutral-900/20 blur-2xl" />
            <h2 className="relative text-xl sm:text-2xl font-bold">جاهز لحجز جلسة تصوير لا تُنسى؟</h2>
            <p className="relative text-amber-50 text-sm max-w-xl mx-auto leading-relaxed">
              يسعدنا الرد على جميع استفساراتك حول المواعيد والأسعار والباقات الإضافية مباشرة عبر واتساب
              أو المكالمات الهاتفية.
            </p>
            <div className="relative flex flex-wrap items-center justify-center gap-3 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 shadow-md transition ${focusRing} focus-visible:ring-offset-amber-600`}
              >
                <MessageCircle className="w-5 h-5 text-amber-400" />
                <span>مراسلة عبر واتساب</span>
              </a>
              <a
                href={`tel:${settings.contact.phone}`}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-neutral-900 text-sm font-semibold hover:bg-amber-50 shadow-md transition ${focusRing} focus-visible:ring-offset-amber-600`}
              >
                <Phone className="w-4 h-4 text-amber-600" />
                <span dir="ltr">{settings.contact.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}