'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { optimizeImageUrl } from '../../lib/image';
import { IRegion } from '../../types';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

/* الـ Navbar ثابت (fixed) فنسيب مسافة من فوق pt-24 / sm:pt-28 */
const shell = 'min-h-screen bg-neutral-50 pt-24 sm:pt-28 pb-12 lg:pb-16';
const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

export default function RegionsPage() {
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.public
      .getRegions()
      .then((res) => {
        if (res.success && res.data) {
          setRegions(res.data);
        } else {
          setError(res.message || 'فشل في تحميل قائمة المناطق');
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر الاتصال بالسيرفر');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={shell}>
        <div className={`${container} space-y-6 lg:space-y-8 animate-pulse`}>
          <div className="space-y-2">
            <div className="h-8 w-64 bg-neutral-200 rounded-xl" />
            <div className="h-4 w-96 max-w-full bg-neutral-100 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border border-neutral-200 shadow-xs">
                <div className="aspect-[16/10] bg-neutral-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-1/2 bg-neutral-200 rounded" />
                  <div className="h-3.5 w-3/4 bg-neutral-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={shell}>
        <div className={container}>
          <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white border border-neutral-200 rounded-xl text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-neutral-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className={`${container} space-y-6 lg:space-y-8`}>
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <ScrollReveal animation="fade-down" duration={750} delay={50}>
            <div className="text-right">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-snug">
                المناطق الجغرافية للتصوير
              </h1>
              <span className="mt-2 block h-1 w-10 rounded-full bg-amber-500" />
              <p className="mt-3 text-neutral-600 text-sm max-w-2xl leading-relaxed">
                اختر منطقتك المفضلة لاستكشاف أفضل الحدائق، القاعات، وأماكن جلسات التصوير المتاحة بها.
              </p>
            </div>
          </ScrollReveal>
          {regions.length > 0 && (
            <ScrollReveal animation="fade-left" duration={750} delay={150}>
              <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {regions.length} منطقة
              </span>
            </ScrollReveal>
          )}
        </header>

        {/* Grid */}
        {regions.length === 0 ? (
          <ScrollReveal animation="fade-up" duration={700}>
            <div className="text-center py-14 bg-white rounded-xl border border-dashed border-neutral-300">
              <MapPin className="w-9 h-9 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">لا توجد مناطق منشورة حالياً.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="content-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {regions.map((region, idx) => (
              <ScrollReveal
                key={region._id}
                animation="fade-up"
                delay={100 + (idx % 6) * 90}
                duration={750}
                distance={28}
                className="h-full"
              >
                <Link
                  href={`/regions/${region.slug}`}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-amber-300 shadow-xs hover:shadow-lg lg:hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 h-full"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] sm:aspect-[16/10] bg-neutral-200 overflow-hidden">
                    {region.coverImage ? (
                      <img
                        src={optimizeImageUrl(region.coverImage, { width: 600, quality: 'auto' })}
                        alt={region.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out gpu-layer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <MapPin className="w-9 h-9 stroke-1" />
                      </div>
                    )}

                    {/* Hover overlay (ديسكتوب بس) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/5 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Glass badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{region.locationCount || 0} مكان تصوير</span>
                    </div>

                    {/* Pill: ظاهر دايمًا في الموبايل، وبيطلع بالـ hover في الديسكتوب */}
                    <span className="hidden lg:inline-flex absolute bottom-3 right-3 items-center gap-1.5 bg-amber-600 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <span>استعرض الأماكن</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-4 lg:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg lg:text-xl font-bold text-neutral-900 group-hover:text-amber-700 transition-colors">
                        {region.name}
                      </h2>
                      {region.description && (
                        <p className="text-xs text-neutral-600 mt-1.5 line-clamp-2 leading-relaxed">
                          {region.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-800">
                      <span>استكشف أماكن المنطقة</span>
                      <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}