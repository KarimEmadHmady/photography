'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { IService, ISiteSettings } from '../../types';

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-600 text-sm">جاري تحميل الخدمات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-16 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="text-right space-y-2 border-b border-gray-200 pb-6">
        <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">
          باقات وخدمات التصوير
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900">الخدمات الإضافية</h1>
        <p className="text-neutral-500 text-sm max-w-2xl">
          ألبومات الصور المطبوعة الفاخرة، التابلوهات، فيديوهات الأفراح، والريلز الاحترافية.
        </p>
      </div>

      {/* Grid */}
      {services.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <Sparkles className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">لا توجد خدمات متاحة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service._id}
              href={`/services/${service.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
                {service.mainImage ? (
                  <img
                    src={service.mainImage}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-50/50 text-amber-700">
                    <Sparkles className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition">
                    {service.name}
                  </h2>
                  {service.shortDescription && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                      {service.shortDescription}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-700">
                    {service.price?.type === 'on_request'
                      ? 'السعر حسب الطلب'
                      : service.price?.type === 'starting_from'
                      ? `يبدأ من ${service.price.amount} ${currency}`
                      : `${service.price?.amount} ${currency}`}
                  </span>
                  <span className="font-semibold text-neutral-600 group-hover:text-neutral-900 flex items-center gap-1">
                    <span>التفاصيل</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
