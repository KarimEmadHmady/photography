'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MapPin, Camera, Loader2, AlertCircle, Filter } from 'lucide-react';
import { api } from '../../lib/api';
import { ILocation, IRegion, ISiteSettings } from '../../types';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-right space-y-2 border-b border-gray-200 pb-6">
        <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">
          دليل الأماكن
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900">مواقع وجلسات التصوير</h1>
        <p className="text-neutral-500 text-sm max-w-2xl">
          تصفح أرقى الأماكن الخارجية والقاعات الفاخرة المعتمدة لتصوير جلسات العروسين وسيشن الزفاف.
        </p>
      </div>

      {/* Region Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 ml-2">
          <Filter className="w-3.5 h-3.5" />
          <span>تصفية بالمنطقة:</span>
        </span>
        <button
          onClick={() => setSelectedRegion('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
            selectedRegion === ''
              ? 'bg-amber-600 text-white shadow-xs font-semibold'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          كل المناطق
        </button>
        {regions.map((reg) => (
          <button
            key={reg._id}
            onClick={() => setSelectedRegion(reg.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              selectedRegion === reg.slug
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {reg.name}
          </button>
        ))}
      </div>

      {/* Content State */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-gray-600 text-sm">جاري جلب أماكن التصوير...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">لا توجد أماكن تصوير مطابقة في هذه المنطقة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => {
            const regionName = typeof loc.regionId === 'object' ? (loc.regionId as any).name : '';
            return (
              <Link
                key={loc._id}
                href={`/locations/${loc.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
                  {loc.coverImage ? (
                    <img
                      src={loc.coverImage}
                      alt={loc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                  {regionName && (
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{regionName}</span>
                    </span>
                  )}
                  {loc.isFeatured && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      مميز
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-bold text-base text-gray-900 group-hover:text-amber-700 transition">
                      {loc.name}
                    </h2>
                    {loc.shortDescription && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {loc.shortDescription}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {loc.computedTotalPrice
                        ? `الإجمالي: ${loc.computedTotalPrice} ${settings?.currencyLabel || 'جنيه'}`
                        : loc.photographyPrice?.type === 'on_request'
                        ? 'السعر حسب الاتفاق'
                        : `سعر التصوير: ${loc.photographyPrice?.amount || ''} ${settings?.currencyLabel || 'جنيه'}`}
                    </span>
                    <span className="text-amber-700 font-semibold group-hover:underline">
                      التفاصيل ←
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LocationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
      }
    >
      <LocationsContent />
    </Suspense>
  );
}
