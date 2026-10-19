'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Camera } from 'lucide-react';
import { api } from '../../../lib/api';
import { ILocation, ISiteSettings } from '../../../types';
import {
  shell,
  container,
  formatPrice,
  SectionTitle,
  CoverSlider,
  LocationBreadcrumbs,
  LocationInfoBooking,
  LocationGallery,
  LocationRelatedServices,
  LocationRelatedGrid,
  LocationMobileBar,
  LocationLightbox,
  LocationSkeleton,
  LocationErrorState,
} from './components';

export default function LocationDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [location, setLocation] = useState<ILocation | null>(null);
  const [related, setRelated] = useState<ILocation[]>([]);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
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

  if (loading) {
    return <LocationSkeleton />;
  }

  if (error || !location) {
    return <LocationErrorState error={error} onRetry={fetchLocationData} />;
  }

  const regionObj = typeof location.regionId === 'object' ? (location.regionId as any) : null;
  const regionName = regionObj?.name || 'المنطقة';
  const regionSlug = regionObj?.slug || '';
  const currency = settings?.currencyLabel || 'جنيه';
  const phone = settings?.contact?.phone;

  const defaultMsg = `مرحباً، أود الاستفسار عن تفاصيل وحجز جلسة تصوير في (${location.name}).`;
  const whatsappUrl = `https://wa.me/${(settings?.contact?.whatsappNumber || '201000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    defaultMsg
  )}`;

  const gallery = location.gallery || [];
  const sliderImages = Array.from(
    new Set([location.coverImage, ...gallery.map((g) => g.url)].filter(Boolean) as string[])
  );

  const summaryPrice =
    location.showTotal && location.computedTotalPrice
      ? { label: 'الإجمالي التقديري', value: `${location.computedTotalPrice} ${currency}` }
      : { label: 'سعر التصوير', value: formatPrice(location.photographyPrice, currency) };

  return (
    <div className={shell}>
      <div className={`${container} space-y-6 sm:space-y-8 lg:space-y-10 pb-10 lg:pb-16`}>
        {/* 1. مسار التنقل (Breadcrumbs) */}
        <LocationBreadcrumbs
          locationName={location.name}
          regionName={regionName}
          regionSlug={regionSlug}
        />

        {/* 2. سلايدر الغلاف + صندوق التفاصيل والأسعار والحجز */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
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

          <LocationInfoBooking
            location={location}
            currency={currency}
            whatsappUrl={whatsappUrl}
            phone={phone}
          />
        </div>

        {/* 3. تفاصيل "عن هذا المكان" */}
        {location.description && (
          <section className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <SectionTitle>عن هذا المكان</SectionTitle>
            <p className="text-neutral-600 text-sm leading-relaxed sm:leading-loose whitespace-pre-line max-w-3xl">
              {location.description}
            </p>
          </section>
        )}

        {/* 4. معرض صور الجلسات */}
        <LocationGallery
          gallery={gallery}
          locationName={location.name}
          onOpenLightbox={(idx) => setActiveImageIndex(idx)}
        />

        {/* 5. خدمات إضافية يمكن طلبها مع الجلسة */}
        {location.relatedServices && (
          <LocationRelatedServices
            services={location.relatedServices}
            currency={currency}
          />
        )}

        {/* 6. أماكن تصوير أخرى مقترحة */}
        <LocationRelatedGrid locations={related} currency={currency} />
      </div>

      {/* 7. شريط الحجز السفلي — للموبايل فقط */}
      <LocationMobileBar
        summaryPrice={summaryPrice}
        whatsappUrl={whatsappUrl}
        phone={phone}
      />

      {/* 8. نافذة عرض وتكبير الصور (Lightbox Modal) */}
      <LocationLightbox
        gallery={gallery}
        activeImageIndex={activeImageIndex}
        locationName={location.name}
        onClose={() => setActiveImageIndex(null)}
        onNavigate={(idx) => setActiveImageIndex(idx)}
      />
    </div>
  );
}