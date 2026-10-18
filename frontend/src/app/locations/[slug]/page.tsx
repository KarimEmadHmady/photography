'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  Camera,
  ExternalLink,
  Phone,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { optimizeImageUrl } from '../../../lib/image';
import { ILocation, ISiteSettings } from '../../../types';

/* الـ Navbar ثابت (fixed) فنسيب مسافة من فوق */
const shell = 'min-h-screen bg-neutral-50 pt-24 sm:pt-28';
const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
const noScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';

/* Mosaic كريتيف: كل 9 صور = 16 خانة (4×4) من غير فراغات
   ترتيب الخانات: 0 كبيرة 2×2 | 2 طويلة | 4 طويلة | 5 عريضة | 6 طويلة | الباقي عادي
   الصور الطويلة (portrait) الأفضل تقع في خانات 2 و 4 و 6، والعريضة في خانة 5 */
const MOSAIC_CYCLE = [
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
const INITIAL_VISIBLE = 18; // دورتين كاملتين من الـ mosaic

const btnPrimary = `w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 text-white text-sm font-semibold shadow-sm hover:bg-amber-700 transition ${focusRing}`;
const btnOutline = `w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-sm font-medium hover:border-amber-400 hover:bg-amber-50 transition ${focusRing}`;

function SectionTitle({ children, count }: { children: React.ReactNode; count?: string }) {
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

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-xs sm:text-sm border-b border-neutral-200/70 last:border-0">
      <span className="text-neutral-600">{label}</span>
      <span className="font-bold text-neutral-900 text-left">{value}</span>
    </div>
  );
}

function CoverSlider({
  images,
  alt,
  regionName,
}: {
  images: string[];
  alt: string;
  regionName: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  // تغيير تلقائي كل 4 ثواني (لف مستمر). بيتوقف مع الـ hover/اللمس، ومع reduced-motion
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), 4000);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    setPaused(false);
    // RTL: السحب لليسار = التالي
    if (dx < -40) next();
    if (dx > 40) prev();
  };

  return (
    <div
      className="relative w-full aspect-[16/11] max-h-[38vh] sm:max-h-[50vh] lg:max-h-[62vh] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-200 shadow-sm border border-neutral-200"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label={alt}
    >
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* خلفية ضبابية تملا أي فراغ على الجوانب */}
          <img
            src={optimizeImageUrl(src, { width: 300, quality: 'eco' })}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-70"
          />
          {/* الصورة كاملة من غير قص */}
          <img
            src={optimizeImageUrl(src, { width: 950, quality: 'auto' })}
            alt={i === index ? alt : ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            {...(i === 0 ? ({ fetchPriority: 'high' } as any) : {})}
            className="relative z-10 w-full h-full object-cover gpu-layer"
          />
        </div>
      ))}

      {/* بادج المنطقة */}
      <span className="absolute z-20 top-2.5 right-2.5 sm:top-3 sm:right-3 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-amber-600" />
        <span>{regionName}</span>
      </span>

      {count > 1 && (
        <>
          {/* نقاط (لحد 8 صور) أو عداد لو أكتر */}
          {count <= 8 ? (
            <div className="absolute z-20 bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`الصورة ${i + 1}`}
                  aria-current={i === index}
                  className="p-1.5"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? 'w-5 bg-amber-500' : 'w-1.5 bg-white/80'
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : (
            <span className="absolute z-20 bottom-2.5 left-1/2 -translate-x-1/2 text-[11px] text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {index + 1} / {count}
            </span>
          )}

          {/* أسهم — للكمبيوتر بس (الموبايل بالسحب) */}
          <button
            type="button"
            onClick={next}
            aria-label="الصورة التالية"
            className="hidden sm:flex absolute z-20 left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-800 items-center justify-center shadow-sm transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={prev}
            aria-label="الصورة السابقة"
            className="hidden sm:flex absolute z-20 right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-800 items-center justify-center shadow-sm transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

export default function LocationDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [location, setLocation] = useState<ILocation | null>(null);
  const [related, setRelated] = useState<ILocation[]>([]);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationData = () => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.public.getLocationBySlug(slug),
      api.public.getRelatedLocations(slug).catch(() => ({ success: false, data: [] })),
      api.public.getSettings().catch(() => ({ success: false, data: null })),
    ])
      .then(([locRes, relRes, setRes]) => {
        if (locRes.success && locRes.data) {
          setLocation(locRes.data);
        } else {
          setError(locRes.message || 'مكان التصوير غير موجود');
        }

        if (relRes.success && relRes.data) {
          setRelated(relRes.data);
        }

        if (setRes.success && setRes.data) {
          setSettings(setRes.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر تحميل بيانات مكان التصوير');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLocationData();
  }, [slug]);

  const galleryLength = location?.gallery?.length || 0;
  const lightboxOpen = activeImageIndex !== null;

  // Lightbox: قفل السكرول + الكيبورد (Esc / الأسهم)
  useEffect(() => {
    if (!lightboxOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveImageIndex(null);
      // RTL: السهم الشمال = التالي، السهم اليمين = السابق
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((i) => (i !== null && i < galleryLength - 1 ? i + 1 : i));
      }
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      }
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen, galleryLength]);

  if (loading) {
    return (
      <div className={shell}>
        <div className={`${container} space-y-6 sm:space-y-8 animate-pulse pb-12`}>
          <div className="h-4 w-48 bg-neutral-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-72 sm:h-96 rounded-2xl bg-neutral-200" />
            <div className="lg:col-span-5 space-y-3 bg-white p-6 rounded-2xl border border-neutral-200">
              <div className="h-7 w-3/4 bg-neutral-200 rounded-lg" />
              <div className="h-4 w-1/2 bg-neutral-100 rounded" />
              <div className="h-32 bg-neutral-100 rounded-xl mt-4" />
              <div className="h-11 bg-amber-200/70 rounded-xl mt-4" />
            </div>
          </div>
          <div className="space-y-4 pt-4">
            <div className="h-6 w-52 bg-neutral-200 rounded" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-64 bg-neutral-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !location) {
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
                onClick={fetchLocationData}
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

  const regionObj = typeof location.regionId === 'object' ? (location.regionId as any) : null;
  const regionName = regionObj?.name || 'المنطقة';
  const regionSlug = regionObj?.slug || '';
  const currency = settings?.currencyLabel || 'جنيه';
  const phone = settings?.contact?.phone;

  const formatPrice = (p: any) => {
    if (!p) return '—';
    if (p.type === 'on_request') return 'السعر حسب الاتفاق';
    if (p.type === 'starting_from') return `يبدأ من ${p.amount} ${currency}`;
    return `${p.amount} ${currency}`;
  };

  const defaultMsg = `مرحباً، أود الاستفسار عن تفاصيل وحجز جلسة تصوير في (${location.name}).`;
  const whatsappUrl = `https://wa.me/${(settings?.contact?.whatsappNumber || '201000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    defaultMsg
  )}`;

  const gallery = location.gallery || [];
    const sliderImages = Array.from(
    new Set([location.coverImage, ...gallery.map((g) => g.url)].filter(Boolean) as string[])
  );
  const visibleGallery = showAllGallery ? gallery : gallery.slice(0, INITIAL_VISIBLE);
  const fullCycleCount = Math.floor(visibleGallery.length / MOSAIC_CYCLE.length) * MOSAIC_CYCLE.length;
  const activeImage = activeImageIndex !== null ? gallery[activeImageIndex] : null;

  const goPrev = () => setActiveImageIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  const goNext = () =>
    setActiveImageIndex((i) => (i !== null && i < gallery.length - 1 ? i + 1 : i));

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    // RTL: السحب لليسار = التالي
    if (dx < -50) goNext();
    if (dx > 50) goPrev();
  };

  const summaryPrice =
    location.showTotal && location.computedTotalPrice
      ? { label: 'الإجمالي التقديري', value: `${location.computedTotalPrice} ${currency}` }
      : { label: 'سعر التصوير', value: formatPrice(location.photographyPrice) };

  return (
    <div className={shell}>
      <div className={`${container} space-y-6 sm:space-y-8 lg:space-y-10 pb-10 lg:pb-16`}>
        {/* 1. Breadcrumbs */}
        <nav
          className={`flex items-center gap-1.5 text-xs text-neutral-500 overflow-x-auto whitespace-nowrap ${noScrollbar}`}
          aria-label="مسار التنقل"
        >
          <Link href="/" className="hover:text-amber-700 transition shrink-0">
            الرئيسية
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <Link href="/regions" className="hover:text-amber-700 transition shrink-0">
            المناطق
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          {regionSlug ? (
            <Link
              href={`/regions/${regionSlug}`}
              className="hover:text-amber-700 transition shrink-0"
            >
              {regionName}
            </Link>
          ) : (
            <span className="shrink-0">{regionName}</span>
          )}
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-neutral-900 font-bold shrink-0">{location.name}</span>
        </nav>

        {/* 2. Cover + Info/Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Cover Photo */}
          {/* Cover Slider */}
          <div className="lg:col-span-7">
            {sliderImages.length > 0 ? (
              <CoverSlider
                key={location._id}
                images={sliderImages}
                alt={location.name}
                regionName={regionName}
              />
            ) : (
              <div className="relative aspect-[16/10] w-full rounded-xl sm:rounded-2xl bg-neutral-200 border border-neutral-200 flex items-center justify-center text-neutral-400">
                <Camera className="w-10 h-10" />
              </div>
            )}
          </div>

          {/* Info & Booking Box */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3 sm:space-y-4 bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 shadow-sm">
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

            {/* Pricing Box */}
            <div className="p-3 sm:p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <h2 className="text-sm font-bold text-neutral-900 mb-0.5">تفاصيل الأسعار</h2>

              <PriceRow label="سعر جلسة التصوير" value={formatPrice(location.photographyPrice)} />
              <PriceRow label="سعر حجز المكان / القاعة" value={formatPrice(location.venuePrice)} />

              {location.showTotal && location.computedTotalPrice && (
                <div className="mt-2 flex items-center justify-between gap-3 bg-amber-100/70 border border-amber-200 text-amber-900 font-bold px-3 py-2 rounded-lg text-xs sm:text-sm">
                  <span>الإجمالي التقديري</span>
                  <span className="text-sm sm:text-base">
                    {location.computedTotalPrice} {currency}
                  </span>
                </div>
              )}
            </div>

            {/* أزرار التواصل — للكمبيوتر بس، لأن الموبايل فيه شريط الحجز السفلي */}
            <div className="hidden lg:block space-y-2.5">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                <MessageCircle className="w-5 h-5" />
                <span>استفسر أو احجز عبر واتساب</span>
              </a>
              {phone && (
                <a href={`tel:${phone}`} className={btnOutline}>
                  <Phone className="w-4 h-4 text-amber-600" />
                  <span>
                    اتصال هاتفي: <span dir="ltr">{phone}</span>
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 3. Description */}
        {location.description && (
          <section className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <SectionTitle>عن هذا المكان</SectionTitle>
            <p className="text-neutral-600 text-sm leading-relaxed sm:leading-loose whitespace-pre-line max-w-3xl">
              {location.description}
            </p>
          </section>
        )}

        {/* 4. Photo Gallery */}
        {gallery.length > 0 && (
          <section className="content-auto space-y-4">
            <SectionTitle count={`${gallery.length} صورة`}>معرض صور الجلسات في هذا المكان</SectionTitle>

            <div className="grid grid-flow-dense grid-cols-2 md:grid-cols-4 auto-rows-[110px] sm:auto-rows-[150px] lg:auto-rows-[190px] gap-2 sm:gap-3">
              {visibleGallery.map((img, idx) => {
                const span = idx < fullCycleCount ? MOSAIC_CYCLE[idx % MOSAIC_CYCLE.length] : '';
                const isFeature = idx === 0;
                return (
                  <button
                    type="button"
                    key={img.publicId || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`تكبير الصورة ${idx + 1}`}
                    className={`group relative overflow-hidden rounded-lg sm:rounded-xl bg-neutral-200 border border-neutral-200 shadow-xs hover:shadow-xl hover:z-10 transition-shadow duration-300 ${span} ${focusRing}`}
                  >
                    <img
                      src={optimizeImageUrl(img.url, { width: 500, quality: 'auto' })}
                      alt={img.alt || location.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out gpu-layer"
                    />

                    {/* overlay + caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

<span className="absolute top-2 left-2 w-8 h-8 max-lg:w-6 max-lg:h-6 rounded-full bg-white/85 backdrop-blur-md text-amber-700 flex items-center justify-center shadow-sm opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 max-lg:opacity-100 max-lg:translate-y-0 max-lg:transition-none">
  <ZoomIn className="w-4 h-4 max-lg:w-3 max-lg:h-3" />
</span>

                    {isFeature && (
                      <span className="absolute top-2 right-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        الأبرز
                      </span>
                    )}

                    {img.alt && (
                      <span className="absolute bottom-0 inset-x-0 p-2.5 text-right text-xs font-medium text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 line-clamp-1">
                        {img.alt}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {gallery.length > INITIAL_VISIBLE && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllGallery((v) => !v)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-300 bg-white text-amber-700 text-sm font-semibold hover:bg-amber-600 hover:text-white hover:border-amber-600 transition ${focusRing}`}
                >
                  {showAllGallery ? 'عرض أقل' : `عرض كل الصور (${gallery.length})`}
                </button>
              </div>
            )}
          </section>
        )}

        {/* 5. Additional Photography Services */}
        {location.relatedServices && location.relatedServices.length > 0 && (
          <section className="bg-amber-50 border border-amber-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-neutral-900">
                خدمات إضافية يمكنك طلبها مع هذه الجلسة
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              {location.relatedServices.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service.slug}`}
                  className={`group bg-white p-3 sm:p-4 rounded-xl border border-amber-100 hover:border-amber-300 hover:shadow-md lg:hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 ${focusRing}`}
                >
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-amber-700 transition-colors truncate">
                      {service.name}
                    </h3>
                    <span className="text-xs text-amber-700 font-medium">
                      {service.price?.type === 'on_request'
                        ? 'السعر حسب الطلب'
                        : `${service.price?.amount} ${currency}`}
                    </span>
                  </div>
                  <span className="shrink-0 w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <ArrowLeft className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 6. Related Locations */}
        {related && related.length > 0 && (
          <section className="content-auto space-y-4">
            <SectionTitle>أماكن تصوير أخرى قد تنال إعجابك</SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
              {related.map((rel) => (
                <Link
                  key={rel._id}
                  href={`/locations/${rel.slug}`}
                  className={`group flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-amber-300 shadow-xs hover:shadow-lg lg:hover:-translate-y-1 transition-all duration-300 ${focusRing}`}
                >
                  <div className="relative aspect-[16/10] bg-neutral-200 overflow-hidden">
                    {rel.coverImage ? (
                      <img
                        src={optimizeImageUrl(rel.coverImage, { width: 500, quality: 'auto' })}
                        alt={rel.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out gpu-layer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h3 className="font-bold text-sm text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                      {rel.name}
                    </h3>
                    <div className="mt-2 pt-2 border-t border-neutral-100 text-xs text-neutral-600 flex items-center justify-between gap-2">
                      <span className="truncate">
                        {rel.photographyPrice?.type === 'on_request'
                          ? 'حسب الاتفاق'
                          : `${rel.photographyPrice?.amount || ''} ${currency}`}
                      </span>
                      <span className="shrink-0 w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 7. شريط الحجز السفلي — موبايل فقط
          sticky مش fixed، فبيقف عند نهاية الصفحة ومبيغطيش الفوتر */}
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

      {/* Lightbox Modal */}
      {activeImage && activeImageIndex !== null && (
        <div
          className="fixed inset-0 z-[60] bg-neutral-900/95 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="معرض الصور"
          onClick={() => setActiveImageIndex(null)}
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          <button
            onClick={() => setActiveImageIndex(null)}
            aria-label="إغلاق"
            className="absolute top-3 right-3 sm:top-5 sm:right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-6 h-6" />
          </button>

          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
            {activeImageIndex + 1} / {gallery.length}
          </span>

          {/* السابق (يمين في RTL) */}
          {activeImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="الصورة السابقة"
              className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* التالي (شمال في RTL) */}
          {activeImageIndex < gallery.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="الصورة التالية"
              className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div
            className="max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={optimizeImageUrl(activeImage.url, { width: 1400, quality: 'auto' })}
              alt={activeImage.alt || location.name}
              decoding="async"
              className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl gpu-layer"
            />
            {activeImage.alt && (
              <p className="text-white/90 text-xs mt-3 text-center px-8">{activeImage.alt}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}