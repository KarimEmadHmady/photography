'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { optimizeImageUrl } from '../../lib/image';
import { IService, ISiteSettings } from '../../types';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

/* الـ Navbar ثابت (fixed) فنسيب مسافة من فوق */
const shell = 'min-h-screen bg-neutral-50 pt-28 sm:pt-32 pb-20';
const container = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

export default function ServicesPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.public.getServices(), api.public.getSettings()])
      .then(([sRes, setRes]) => {
        if (sRes.success && sRes.data) setServices(sRes.data);
        if (setRes.success && setRes.data) setSettings(setRes.data);
      })
      .catch((err) => {
        setError(err.message || 'تعذر تحميل الخدمات');
      })
      .finally(() => setLoading(false));
  }, []);

  const currency = settings?.currencyLabel || 'جنيه';

  const formatPrice = (price: any) => {
    if (!price) return '';
    if (price.type === 'on_request') return 'السعر حسب الطلب';
    if (price.type === 'starting_from') return `يبدأ من ${price.amount} ${currency}`;
    return `${price.amount} ${currency}`;
  };

  if (loading) {
    return (
      <div className={shell}>
        <div className={`${container} space-y-10 animate-pulse`}>
          <div className="text-right space-y-3">
            <div className="h-9 w-48 bg-neutral-200 rounded-lg" />
            <div className="h-1 w-12 rounded-full bg-amber-500/50" />
            <div className="h-4 w-96 max-w-full bg-neutral-200 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-neutral-200">
                <div className="aspect-16/10 bg-neutral-200" />
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="h-5 w-3/4 bg-neutral-200 rounded" />
                  <div className="h-3 w-full bg-neutral-100 rounded" />
                  <div className="h-3 w-2/3 bg-neutral-100 rounded" />
                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div className="h-4 w-20 bg-neutral-200 rounded" />
                    <div className="w-8 h-8 rounded-full bg-neutral-200" />
                  </div>
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
        <div className="max-w-xl mx-auto p-8 bg-white border border-neutral-200 rounded-2xl text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm text-neutral-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className={`${container} space-y-10`}>
        {/* Header */}
        <header className="text-right">
          <ScrollReveal animation="fade-down" delay={50} duration={750}>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 leading-snug">
              الخدمات الإضافية
            </h1>
            <span className="mt-3 block h-1 w-12 rounded-full bg-amber-500" />
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={180} duration={750}>
            <p className="mt-4 text-neutral-600 text-sm max-w-2xl leading-relaxed">
              ألبومات الصور المطبوعة الفاخرة، التابلوهات، فيديوهات الأفراح، والريلز الاحترافية.
            </p>
          </ScrollReveal>
        </header>

        {/* Grid */}
        {services.length === 0 ? (
          <ScrollReveal animation="fade-up" duration={700}>
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-neutral-300">
              <Sparkles className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500 text-sm">لا توجد خدمات متاحة حالياً.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 content-auto">
            {services.map((service, idx) => (
              <ScrollReveal
                key={service._id}
                animation="fade-up"
                delay={100 + (idx % 6) * 90}
                duration={750}
                distance={28}
                className="h-full"
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-200 hover:border-amber-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 h-full"
                >
                  <div className="relative aspect-16/10 bg-amber-50 overflow-hidden">
                    {service.mainImage ? (
                      <img
                        src={optimizeImageUrl(service.mainImage, { width: 600, quality: 'auto' })}
                        alt={service.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100 gpu-layer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-amber-600">
                        <span className="w-16 h-16 rounded-2xl bg-white border border-amber-200 flex items-center justify-center shadow-sm">
                          <Sparkles className="w-8 h-8" />
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {service.price && (
                      <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {formatPrice(service.price)}
                      </span>
                    )}

                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-amber-600 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                      <span>عرض التفاصيل</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 group-hover:text-amber-700 transition-colors">
                        {service.name}
                      </h2>
                      {service.shortDescription && (
                        <p className="text-xs text-neutral-600 mt-2 line-clamp-3 leading-relaxed">
                          {service.shortDescription}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-amber-700">{formatPrice(service.price)}</span>
                      <span className="shrink-0 w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
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