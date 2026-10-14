'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Sparkles, MessageCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { IService, ISiteSettings } from '../../../types';

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [service, setService] = useState<IService | null>(null);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      api.public.getServiceBySlug(slug),
      api.public.getSettings().catch(() => ({ success: false, data: null })),
    ])
      .then(([sRes, setRes]) => {
        if (sRes.success && sRes.data) {
          setService(sRes.data);
        } else {
          setError(sRes.message || 'الخدمة غير موجودة');
        }
        if (setRes.success && setRes.data) {
          setSettings(setRes.data);
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر تحميل بيانات الخدمة');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-600 text-sm">جاري تحميل تفاصيل الخدمة...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-xl mx-auto my-20 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-red-900">الخدمة غير متاحة</h2>
        <p className="text-sm text-red-700">{error || 'لم يتم العثور على الخدمة المطلوبة'}</p>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لكل الخدمات</span>
        </Link>
      </div>
    );
  }

  const currency = settings?.currencyLabel || 'جنيه';
  const defaultMsg = `مرحباً، أود الاستفسار عن تفاصيل (${service.name}).`;
  const whatsappUrl = `https://wa.me/${(settings?.contact?.whatsappNumber || '201000000000').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    defaultMsg
  )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-amber-700 transition">
          الرئيسية
        </Link>
        <span>←</span>
        <Link href="/services" className="hover:text-amber-700 transition">
          الخدمات
        </Link>
        <span>←</span>
        <span className="text-neutral-900 font-bold">{service.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Image */}
        <div className="lg:col-span-6">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-neutral-100 shadow-md border border-neutral-100">
            {service.mainImage ? (
              <img
                src={service.mainImage}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-700 bg-amber-50">
                <Sparkles className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>

        {/* Content & Action */}
        <div className="lg:col-span-6 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">{service.name}</h1>
            {service.shortDescription && (
              <p className="text-neutral-600 text-sm mt-3 leading-relaxed">
                {service.shortDescription}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900">سعر الخدمة:</span>
            <span className="text-base font-bold text-amber-800">
              {service.price?.type === 'on_request'
                ? 'السعر حسب الطلب والاتفاق'
                : service.price?.type === 'starting_from'
                ? `يبدأ من ${service.price.amount} ${currency}`
                : `${service.price?.amount} ${currency}`}
            </span>
          </div>

          {/* Variants */}
          {service.variants && service.variants.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                خيارات ومقاسات متوفرة
              </h2>
              <div className="space-y-2">
                {service.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-neutral-900">{variant.name}</span>
                      {variant.description && (
                        <p className="text-neutral-500 mt-0.5">{variant.description}</p>
                      )}
                    </div>
                    {variant.price?.amount && (
                      <span className="font-bold text-amber-700">
                        {variant.price.amount} {currency}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {service.description && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h2 className="text-sm font-bold text-neutral-900">تفاصيل إضافية عن الخدمة</h2>
              <p className="text-neutral-600 text-xs leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>
          )}

          {/* WhatsApp CTA */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>طلب أو استفسار عبر واتساب</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
