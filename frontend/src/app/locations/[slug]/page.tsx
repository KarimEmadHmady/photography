'use client';

import React, { useEffect, useState } from 'react';
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
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { ILocation, ISiteSettings } from '../../../types';

export default function LocationDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [location, setLocation] = useState<ILocation | null>(null);
  const [related, setRelated] = useState<ILocation[]>([]);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

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
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-600 text-sm">جاري تحميل تفاصيل مكان التصوير...</p>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="max-w-xl mx-auto my-20 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-red-900">مكان التصوير غير متاح</h2>
        <p className="text-sm text-red-700">{error || 'لم يتم العثور على مكان التصوير المطلوب'}</p>
        <Link
          href="/locations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لكل الأماكن</span>
        </Link>
      </div>
    );
  }

  const regionObj = typeof location.regionId === 'object' ? (location.regionId as any) : null;
  const regionName = regionObj?.name || 'المنطقة';
  const regionSlug = regionObj?.slug || '';
  const currency = settings?.currencyLabel || 'جنيه';

  const defaultMsg = `مرحباً، أود الاستفسار عن تفاصيل وحجز جلسة تصوير في (${location.name}).`;
  const whatsappUrl = `https://wa.me/${(settings?.contact?.whatsappNumber || '201000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    defaultMsg
  )}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-amber-700 transition">
          الرئيسية
        </Link>
        <span>←</span>
        <Link href="/regions" className="hover:text-amber-700 transition">
          المناطق
        </Link>
        <span>←</span>
        {regionSlug ? (
          <Link href={`/regions/${regionSlug}`} className="hover:text-amber-700 transition">
            {regionName}
          </Link>
        ) : (
          <span>{regionName}</span>
        )}
        <span>←</span>
        <span className="text-neutral-900 font-bold">{location.name}</span>
      </nav>

      {/* 2. Main Hero / Cover Image & Title */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cover Photo */}
        <div className="lg:col-span-7">
          <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-neutral-900 shadow-md border border-neutral-100">
            {location.coverImage ? (
              <img
                src={location.coverImage}
                alt={location.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <Camera className="w-12 h-12" />
              </div>
            )}
            {regionName && (
              <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-xs text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{regionName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Info & Booking Box */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">{location.name}</h1>
            {location.address && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{location.address}</span>
              </div>
            )}
            {location.mapUrl && (
              <a
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-medium mt-1"
              >
                <span>فتح على خرائط Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Pricing Box (Photography Price & Venue Reservation Price Stored Separately) */}
          <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/60 space-y-3">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">تفاصيل الأسعار</h2>

            <div className="flex items-center justify-between text-sm py-1 border-b border-neutral-200/50">
              <span className="text-neutral-700 font-medium">سعر جلسة التصوير:</span>
              <span className="font-bold text-neutral-900">
                {location.photographyPrice?.type === 'on_request'
                  ? 'السعر حسب الاتفاق'
                  : location.photographyPrice?.type === 'starting_from'
                  ? `يبدأ من ${location.photographyPrice.amount} ${currency}`
                  : `${location.photographyPrice?.amount} ${currency}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1 border-b border-neutral-200/50">
              <span className="text-neutral-700 font-medium">سعر حجز المكان / القاعة:</span>
              <span className="font-bold text-neutral-900">
                {location.venuePrice?.type === 'on_request'
                  ? 'السعر حسب الاتفاق'
                  : location.venuePrice?.type === 'starting_from'
                  ? `يبدأ من ${location.venuePrice.amount} ${currency}`
                  : `${location.venuePrice?.amount} ${currency}`}
              </span>
            </div>

            {location.showTotal && location.computedTotalPrice && (
              <div className="flex items-center justify-between text-sm pt-2 text-amber-800 font-bold bg-amber-100/60 p-2.5 rounded-xl">
                <span>الإجمالي التقديري للتصوير والمكان:</span>
                <span className="text-base">
                  {location.computedTotalPrice} {currency}
                </span>
              </div>
            )}
          </div>

          {/* Contact Action Buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>استفسر أو احجز عبر واتساب</span>
            </a>
            {settings?.contact?.phone && (
              <a
                href={`tel:${settings.contact.phone}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition"
              >
                <Phone className="w-4 h-4 text-amber-600" />
                <span>اتصال هاتفي: {settings.contact.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Description */}
      {location.description && (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-neutral-900">عن هذا المكان</h2>
          <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line">
            {location.description}
          </p>
        </div>
      )}

      {/* 4. Photo Gallery with Lightbox */}
      {location.gallery && location.gallery.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-neutral-900">معرض صور الجلسات في هذا المكان</h2>
            <span className="text-xs text-neutral-500">{location.gallery.length} صورة</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {location.gallery.map((img, idx) => (
              <div
                key={img.publicId || idx}
                onClick={() => setActiveImageIndex(idx)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-gray-100 cursor-pointer shadow-xs hover:shadow-md transition"
              >
                <img
                  src={img.url}
                  alt={img.alt || location.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <span className="text-xs bg-black/60 px-2 py-1 rounded-md">تكبير الصورة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeImageIndex !== null && location.gallery && location.gallery[activeImageIndex] && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            onClick={() => setActiveImageIndex(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2"
          >
            <X className="w-7 h-7" />
          </button>

          {/* Prev/Next buttons */}
          {activeImageIndex > 0 && (
            <button
              onClick={() => setActiveImageIndex(activeImageIndex - 1)}
              className="absolute right-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {activeImageIndex < location.gallery.length - 1 && (
            <button
              onClick={() => setActiveImageIndex(activeImageIndex + 1)}
              className="absolute left-4 text-white p-3 rounded-full bg-white/10 hover:bg-white/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={location.gallery[activeImageIndex].url}
              alt={location.gallery[activeImageIndex].alt || location.name}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
            {location.gallery[activeImageIndex].alt && (
              <p className="text-white text-xs mt-3 text-center">
                {location.gallery[activeImageIndex].alt}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5. Additional Photography Services */}
      {location.relatedServices && location.relatedServices.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2 text-amber-800">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold">خدمات إضافية يمكنك طلبها مع هذه الجلسة</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {location.relatedServices.map((service) => (
              <Link
                key={service._id}
                href={`/services/${service.slug}`}
                className="bg-white p-4 rounded-xl border border-amber-200/60 shadow-xs hover:shadow-md transition flex items-center justify-between"
              >
                <div>
                  <h3 className="font-bold text-sm text-gray-900">{service.name}</h3>
                  <span className="text-xs text-amber-700 font-medium">
                    {service.price?.type === 'on_request'
                      ? 'السعر حسب الطلب'
                      : `${service.price?.amount} ${currency}`}
                  </span>
                </div>
                <span className="text-xs text-gray-400">التفاصيل ←</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 6. Related Locations (Admin-selected or same-region fallback) */}
      {related && related.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="text-2xl font-bold text-neutral-900">أماكن تصوير أخرى قد تنال إعجابك</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((rel) => (
              <Link
                key={rel._id}
                href={`/locations/${rel.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col"
              >
                <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
                  {rel.coverImage ? (
                    <img
                      src={rel.coverImage}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-amber-700 transition">
                    {rel.name}
                  </h3>
                  <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                    <span>
                      {rel.photographyPrice?.type === 'on_request'
                        ? 'حسب الاتفاق'
                        : `${rel.photographyPrice?.amount || ''} ${currency}`}
                    </span>
                    <span className="text-amber-700 font-semibold">التفاصيل ←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
