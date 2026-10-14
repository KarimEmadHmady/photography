'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Camera,
  MapPin,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../lib/api';
import { IRegion, ILocation, IService, ISiteSettings } from '../types';

export default function HomePage() {
  const [data, setData] = useState<{
    settings: ISiteSettings;
    sections: any[];
    featuredRegions: IRegion[];
    featuredLocations: ILocation[];
    featuredServices: IService[];
    portfolioItems: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.public
      .getHomepage()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'فشل في تحميل بيانات الصفحة الرئيسية');
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-600 text-sm">جاري تحميل الموقع...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-20 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-red-900">حدث خطأ أثناء تحميل المحتوى</h2>
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const { settings, featuredRegions, featuredLocations, featuredServices, portfolioItems } = data;
  const whatsappUrl = `https://wa.me/${(settings.contact.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    settings.contact.defaultWhatsappMessage || ''
  )}`;

  return (
    <div className="space-y-24 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-neutral-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>تصوير فوتوغرافي محترف للزفاف والسيشن</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight">
                {settings.hero.title}
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl">
                {settings.hero.description}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={settings.hero.primaryCtaUrl || '/locations'}
                  className="px-6 py-3.5 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 shadow-md transition flex items-center gap-2"
                >
                  <span>{settings.hero.primaryCtaText || 'استكشف أماكن التصوير'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold text-sm transition flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{settings.hero.secondaryCtaText || 'تواصل عبر واتساب'}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/5 rounded-2xl overflow-hidden shadow-2xl bg-neutral-200 border-4 border-white">
                {settings.hero.imageUrl ? (
                  <img
                    src={settings.hero.imageUrl}
                    alt={settings.hero.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-amber-100 to-amber-50 text-amber-800 p-8 text-center">
                    <Camera className="w-16 h-16 mb-4 text-amber-600 stroke-1" />
                    <p className="font-semibold text-lg">{settings.photographerName}</p>
                    <p className="text-xs text-amber-700 mt-1">لحظات تدوم إلى الأبد</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Regions Section */}
      {featuredRegions && featuredRegions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-amber-700 text-xs font-bold uppercase tracking-wider block mb-1">
                المناطق الجغرافية
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                استكشف أماكن التصوير حسب المنطقة
              </h2>
            </div>
            <Link
              href="/regions"
              className="text-amber-700 hover:text-amber-800 font-semibold text-sm inline-flex items-center gap-1.5 self-start"
            >
              <span>جميع المناطق</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRegions.map((region) => (
              <Link
                key={region._id}
                href={`/regions/${region.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-4/3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-end p-6 bg-neutral-900"
              >
                {region.coverImage && (
                  <img
                    src={region.coverImage}
                    alt={region.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="relative z-10 text-white space-y-1">
                  <h3 className="text-xl font-bold group-hover:text-amber-300 transition">
                    {region.name}
                  </h3>
                  {region.description && (
                    <p className="text-xs text-neutral-300 line-clamp-2">{region.description}</p>
                  )}
                  <span className="inline-block text-xs text-amber-400 font-medium pt-2">
                    استكشف الأماكن ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Featured Locations Section */}
      {featuredLocations && featuredLocations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-amber-700 text-xs font-bold uppercase tracking-wider block mb-1">
                أماكن مميزة
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                أشهر مواقع وجلسات تصوير السيشن
              </h2>
            </div>
            <Link
              href="/locations"
              className="text-amber-700 hover:text-amber-800 font-semibold text-sm inline-flex items-center gap-1.5 self-start"
            >
              <span>عرض كل الأماكن</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredLocations.map((loc) => {
              const regionName = typeof loc.regionId === 'object' ? (loc.regionId as any).name : '';
              return (
                <Link
                  key={loc._id}
                  href={`/locations/${loc.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col"
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
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base text-gray-900 group-hover:text-amber-700 transition">
                        {loc.name}
                      </h3>
                      {loc.shortDescription && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                          {loc.shortDescription}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {loc.computedTotalPrice
                          ? `الإجمالي التقديري: ${loc.computedTotalPrice} ${settings.currencyLabel}`
                          : loc.photographyPrice?.type === 'on_request'
                          ? 'السعر حسب الاتفاق'
                          : `يبدأ من: ${loc.photographyPrice?.amount || ''} ${settings.currencyLabel}`}
                      </span>
                      <span className="text-amber-700 font-semibold group-hover:underline">
                        التفاصيل
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Featured Services Section */}
      {featuredServices && featuredServices.length > 0 && (
        <section className="bg-neutral-100/70 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-amber-700 text-xs font-bold uppercase tracking-wider block mb-1">
                خدمات إضافية
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                باقات وخدمات متكاملة ليومك المميز
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredServices.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service.slug}`}
                  className="bg-white rounded-2xl p-6 border border-gray-200/60 shadow-xs hover:shadow-md transition text-right group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-amber-700 transition">
                      {service.name}
                    </h3>
                    {service.shortDescription && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {service.shortDescription}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-700">
                      {service.price?.type === 'on_request'
                        ? 'السعر حسب الطلب'
                        : `${service.price?.amount} ${settings.currencyLabel}`}
                    </span>
                    <span className="text-gray-400 group-hover:text-gray-700">عرض التفاصيل ←</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-amber-700 text-xs font-bold uppercase tracking-wider block mb-1">
            خطوات بسيطة
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900">كيف تنسق جلسة تصويرك؟</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: '٠١',
              title: 'اختر مكان التصوير',
              desc: 'تصفح صور الأماكن والقاعات في المناطق المختلفة واختر الأنسب لذوقك.',
            },
            {
              step: '٠٢',
              title: 'اطلع على الأسعار',
              desc: 'تعرف على أسعار التصوير وحجز المكان بشفافية تامة وبدون تكاليف مخفية.',
            },
            {
              step: '٠٣',
              title: 'تواصل مباشرة',
              desc: 'تواصل مع المصور عبر واتساب أو الهاتف لتحديد الموعد المناسب.',
            },
            {
              step: '٠٤',
              title: 'وثق أجمل اللحظات',
              desc: 'عش تجربة تصوير مريحة واحترافية واستلم صورك بأعلى جودة.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs relative text-right space-y-3"
            >
              <span className="text-3xl font-extrabold text-amber-200 block">{item.step}</span>
              <h3 className="font-bold text-base text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Contact CTA Section */}
      <section id="contact" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-neutral-900 text-white p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-bold">جاهز لحجز جلسة تصوير لا تُنسى؟</h2>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto leading-relaxed">
            يسعدنا الرد على جميع استفساراتك حول المواعيد والأسعار والباقات الإضافية مباشرة عبر واتساب
            أو المكالمات الهاتفية.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition flex items-center gap-2 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>مراسلة عبر واتساب</span>
            </a>
            <a
              href={`tel:${settings.contact.phone}`}
              className="px-6 py-3.5 rounded-xl border border-neutral-700 text-white hover:bg-neutral-800 font-semibold text-sm transition flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span dir="ltr">{settings.contact.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
