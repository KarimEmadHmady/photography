'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  Camera,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { optimizeImageUrl } from '../../../lib/image';
import { IRegion, ILocation } from '../../../types';

/* الـ Navbar ثابت (fixed) فنسيب مسافة من فوق pt-24 / sm:pt-28 */
const shell = 'min-h-screen bg-neutral-50 pt-24 sm:pt-28 pb-12 lg:pb-16';
const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

export default function RegionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [region, setRegion] = useState<(IRegion & { locations: ILocation[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    api.public
      .getRegionBySlug(slug)
      .then((res) => {
        if (res.success && res.data) {
          setRegion(res.data);
        } else {
          setError(res.message || 'المنطقة غير موجودة');
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر تحميل بيانات المنطقة');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className={shell}>
        <div className={`${container} space-y-6 lg:space-y-8 animate-pulse`}>
          <div className="h-4 w-48 bg-neutral-200 rounded" />
          <div className="h-52 sm:h-60 rounded-2xl bg-neutral-200" />
          <div className="space-y-4">
            <div className="h-7 w-56 bg-neutral-200 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border border-neutral-200">
                  <div className="aspect-[16/10] bg-neutral-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 w-2/3 bg-neutral-200 rounded" />
                    <div className="h-4 w-1/2 bg-neutral-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className={shell}>
        <div className={container}>
          <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white border border-neutral-200 rounded-xl text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">المنطقة غير متاحة</h2>
            <p className="text-sm text-neutral-600">
              {error || 'لم يتم العثور على المنطقة المطلوبة'}
            </p>
            <Link
              href="/regions"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لكل المناطق</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const locationsCount = region.locations?.length || 0;

  return (
    <div className={shell}>
      <div className={`${container} space-y-6 lg:space-y-8`}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500" aria-label="مسار التنقل">
          <Link href="/" className="hover:text-amber-700 transition">
            الرئيسية
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
          <Link href="/regions" className="hover:text-amber-700 transition">
            المناطق
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-900 font-semibold">{region.name}</span>
        </nav>

        {/* Region banner — موبايل: نص فوق الصورة | كمبيوتر: نص + صورة جنب بعض */}
        <section className="relative lg:grid lg:grid-cols-5 bg-neutral-900 lg:bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
          {/* الصورة: خلفية كاملة في الموبايل، عمود جانبي في الكمبيوتر */}
          <div className="absolute inset-0 lg:static lg:col-span-2 lg:order-2 bg-neutral-200 overflow-hidden lg:min-h-[180px] lg:max-h-[240px]">
            {region.coverImage ? (
              <img
                src={optimizeImageUrl(region.coverImage, { width: 950, quality: 'auto' })}
                alt={region.name}
                loading="eager"
                decoding="async"
                {...({ fetchPriority: 'high' } as any)}
                className="absolute inset-0 w-full h-full object-cover gpu-layer"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
                <MapPin className="w-10 h-10 stroke-1" />
              </div>
            )}
            {/* طبقة شفافة بسيطة — موبايل فقط */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/50 to-neutral-900/30 " />
          </div>

          {/* النص */}
          <div className="relative z-10 lg:col-span-3 lg:order-1 min-h-[200px] sm:min-h-[220px] lg:min-h-0 p-5 sm:p-6 lg:p-6 flex flex-col justify-end lg:justify-center space-y-2.5 lg:space-y-3 text-right">
            <span className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white lg:bg-amber-50 lg:border-amber-200 lg:text-amber-800 lg:backdrop-blur-none text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>منطقة تصوير</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              {region.name}
            </h1>
            <span className="block h-1 w-10 rounded-full bg-amber-500" />
            {region.description && (
              <p className="text-neutral-100  text-sm leading-relaxed max-w-xl line-clamp-3 ">
                {region.description}
              </p>
            )}
            <div className="pt-1">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/15 backdrop-blur-sm border border-white/25 text-white  text-xs font-semibold">
                <Camera className="w-4 h-4 text-amber-400 lg:text-amber-600" />
                يتوفر {locationsCount} مكان تصوير في هذه المنطقة
              </span>
            </div>
          </div>
        </section>

        {/* Locations in this region */}
        <section className="space-y-4 lg:space-y-5">
          <div className="text-right">
            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">
              أماكن التصوير المتاحة في {region.name}
            </h2>
            <span className="mt-2 block h-1 w-10 rounded-full bg-amber-500" />
          </div>

          {!region.locations || region.locations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-neutral-300">
              <Camera className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">لا توجد أماكن تصوير مضافة لهذه المنطقة حالياً.</p>
            </div>
          ) : (
            <div className="content-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {region.locations.map((loc) => (
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

                    <span className="hidden lg:inline-flex absolute bottom-3 right-3 items-center gap-1.5 bg-amber-600 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <span>عرض التفاصيل</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-neutral-900 group-hover:text-amber-700 transition-colors">
                        {loc.name}
                      </h3>
                      {loc.shortDescription && (
                        <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                          {loc.shortDescription}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <span className="text-neutral-600">
                        {loc.photographyPrice?.type === 'on_request'
                          ? 'السعر حسب الاتفاق'
                          : `سعر التصوير: ${loc.photographyPrice?.amount || ''}`}
                      </span>
                      <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}