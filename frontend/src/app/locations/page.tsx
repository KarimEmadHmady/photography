'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MapPin, Camera, Loader2, AlertCircle, Filter, ArrowLeft, Star } from 'lucide-react';
import { api } from '../../lib/api';
import { optimizeImageUrl } from '../../lib/image';
import { ILocation, IRegion, ISiteSettings } from '../../types';

/* الـ Navbar ثابت (fixed) فنسيب مسافة من فوق */
const shell = 'min-h-screen bg-neutral-50 pt-24 sm:pt-28 pb-12 lg:pb-16';
const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

function LocationsContent() {
  const searchParams = useSearchParams();
  const initialRegion = searchParams.get('region') || '';

  const [locations, setLocations] = useState<ILocation[]>([]);
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load regions and settings once
  useEffect(() => {
    Promise.all([api.public.getRegions(), api.public.getSettings()])
      .then(([regRes, setRes]) => {
        if (regRes.success && regRes.data) setRegions(regRes.data);
        if (setRes.success && setRes.data) setSettings(setRes.data);
      })
      .catch(() => {});
  }, []);

  // Fetch locations whenever selectedRegion changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    api.public
      .getLocations({ region: selectedRegion || undefined })
      .then((res) => {
        if (res.success && res.data) {
          setLocations(res.data);
        } else {
          setError(res.message || 'فشل في تحميل أماكن التصوير');
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر الاتصال بالسيرفر');
      })
      .finally(() => setLoading(false));
  }, [selectedRegion]);

  const currency = settings?.currencyLabel || 'جنيه';

  const chip = (active: boolean) =>
    `px-3.5 py-2 rounded-full text-xs font-medium transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
      active
        ? 'bg-amber-600 text-white shadow-sm font-semibold'
        : 'bg-white border border-neutral-200 text-neutral-700 hover:border-amber-300 hover:text-amber-700'
    }`;

  return (
    <div className={shell}>
      <div className={`${container} space-y-5 lg:space-y-6`}>
        {/* Header */}
        <header className="text-right">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-snug">
            مواقع وجلسات التصوير
          </h1>
          <span className="mt-2 block h-1 w-10 rounded-full bg-amber-500" />
          <p className="mt-3 text-neutral-600 text-sm max-w-2xl leading-relaxed">
            تصفح أرقى الأماكن الخارجية والقاعات الفاخرة المعتمدة لتصوير جلسات العروسين وسيشن الزفاف.
          </p>
        </header>

        {/* Region filter — الأزرار بتنزل سطر تحت سطر فكلها ظاهرة في الموبايل */}
        <div className="bg-white border border-neutral-200 rounded-xl p-3 sm:p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
              <Filter className="w-3.5 h-3.5 text-amber-600" />
              <span>تصفية بالمنطقة</span>
            </span>
            {selectedRegion && (
              <button
                onClick={() => setSelectedRegion('')}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition"
              >
                مسح الفلتر
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={() => setSelectedRegion('')}
              aria-pressed={selectedRegion === ''}
              className={chip(selectedRegion === '')}
            >
              كل المناطق
            </button>
            {regions.map((reg) => (
              <button
                key={reg._id}
                type="button"
                onClick={() => setSelectedRegion(reg.slug)}
                aria-pressed={selectedRegion === reg.slug}
                className={chip(selectedRegion === reg.slug)}
              >
                {reg.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-xs">
                <div className="aspect-[16/10] bg-neutral-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-2/3 bg-neutral-200 rounded" />
                  <div className="h-3.5 w-1/2 bg-neutral-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white border border-neutral-200 rounded-xl text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-neutral-700">{error}</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-xl border border-dashed border-neutral-300">
            <Camera className="w-9 h-9 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">لا توجد أماكن تصوير مطابقة في هذه المنطقة.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-neutral-500 text-right">
              {locations.length} مكان تصوير
            </p>
            <div className="content-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {locations.map((loc) => {
                const regionName =
                  typeof loc.regionId === 'object' ? (loc.regionId as any).name : '';
                return (
                  <Link
                    key={loc._id}
                    href={`/locations/${loc.slug}`}
                    className="group flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-amber-300 shadow-xs hover:shadow-lg lg:hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[16/9] sm:aspect-[16/10] bg-neutral-200 overflow-hidden">
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

                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/5 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />

                      {regionName && (
                        <span className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>{regionName}</span>
                        </span>
                      )}
                      {loc.isFeatured && (
                        <span className="absolute top-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                          <span>مميز</span>
                        </span>
                      )}

                      <span className="hidden lg:inline-flex absolute bottom-3 right-3 items-center gap-1.5 bg-amber-600 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                        <span>عرض التفاصيل</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h2 className="font-bold text-base text-neutral-900 group-hover:text-amber-700 transition-colors">
                          {loc.name}
                        </h2>
                        {loc.shortDescription && (
                          <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                            {loc.shortDescription}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3 text-xs">
                        <span className="text-neutral-700 font-medium">
                          {loc.computedTotalPrice
                            ? `الإجمالي: ${loc.computedTotalPrice} ${currency}`
                            : loc.photographyPrice?.type === 'on_request'
                            ? 'السعر حسب الاتفاق'
                            : `سعر التصوير: ${loc.photographyPrice?.amount || ''} ${currency}`}
                        </span>
                        <span className="shrink-0 w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LocationsPage() {
  return (
    <Suspense
      fallback={
        <div className={shell}>
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        </div>
      }
    >
      <LocationsContent />
    </Suspense>
  );
}