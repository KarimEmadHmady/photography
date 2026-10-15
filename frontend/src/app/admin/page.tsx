'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Camera,
  Layers,
  CheckCircle,
  Plus,
  Loader2,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { api } from '../../lib/api';

const quickLinks = [
  { title: 'إدارة المناطق الجغرافية والمدن', href: '/admin/regions' },
  { title: 'إدارة أماكن التصوير ومعارض الصور', href: '/admin/locations' },
  { title: 'إدارة الخدمات الإضافية والباقات', href: '/admin/services' },
  { title: 'تخصيص أقسام الصفحة الرئيسية والمميزات', href: '/admin/homepage' },
  { title: 'إعدادات الهاتف، واتساب وروابط التواصل', href: '/admin/settings' },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalRegions: number;
    totalLocations: number;
    publishedLocations: number;
    draftLocations: number;
    totalServices: number;
  }>({
    totalRegions: 0,
    totalLocations: 0,
    publishedLocations: 0,
    draftLocations: 0,
    totalServices: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.admin.getRegions(),
      api.admin.getLocations(),
      api.admin.getServices(),
    ])
      .then(([regRes, locRes, servRes]) => {
        const regions = regRes.data || [];
        const locations = locRes.data || [];
        const services = servRes.data || [];

        setStats({
          totalRegions: regions.length,
          totalLocations: locations.length,
          publishedLocations: locations.filter((l) => l.status === 'published').length,
          draftLocations: locations.filter((l) => l.status === 'draft').length,
          totalServices: services.filter((s) => s.isActive).length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-500 text-sm">جاري تحميل إحصائيات لوحة التحكم...</p>
      </div>
    );
  }

  const cards = [
    {
      title: 'إجمالي المناطق',
      value: stats.totalRegions,
      desc: 'المناطق الجغرافية المنظمة للأماكن',
      icon: MapPin,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      href: '/admin/regions',
    },
    {
      title: 'أماكن التصوير',
      value: stats.totalLocations,
      desc: `${stats.publishedLocations} منشور • ${stats.draftLocations} مسودة`,
      icon: Camera,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      href: '/admin/locations',
    },
    {
      title: 'الخدمات الإضافية',
      value: stats.totalServices,
      desc: 'ألبومات، تابلوهات، فيديوهات نشطة',
      icon: Layers,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      href: '/admin/services',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4 sm:pb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">نظرة عامة على الموقع</h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            إدارة كافة محتويات موقع التصوير وأماكن السيشن وقاعات الأفراح بدون كتابة كود.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/admin/locations"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مكان</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-neutral-50 text-xs font-medium transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>معاينة الموقع</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md active:scale-[0.99] transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-500">{card.title}</span>
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0 ${card.color}`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-end justify-between gap-3 sm:block">
                <span className="text-3xl font-extrabold text-gray-900 leading-none">
                  {card.value}
                </span>
                <p className="text-xs text-gray-400 sm:mt-1.5 text-left sm:text-right">
                  {card.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
          <h2 className="text-base font-bold text-gray-900">إجراءات سريعة</h2>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:bg-neutral-50 active:bg-neutral-100 transition text-xs font-medium text-gray-700"
              >
                <span className="leading-relaxed">{link.title}</span>
                <span className="shrink-0 inline-flex items-center gap-0.5 text-amber-700 font-semibold">
                  <span>فتح</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-amber-50/50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-amber-200/70 space-y-3 sm:space-y-4">
          <h2 className="text-base font-bold text-amber-900">إرشادات نشر المحتوى</h2>
          <ul className="space-y-3 text-xs text-amber-800 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>التسلسل الهرمي:</strong> أنشئ المنطقة أولاً (مثال: مدينة نصر)، ثم اربط أماكن
                التصوير بها (مثال: حديقة الطفل).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>شفافية الأسعار:</strong> افصل بين سعر جلسة التصوير وسعر حجز القاعة/المكان
                ليكون واضحاً للعميل.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>حماية الأماكن:</strong> لن يسمح النظام بحذف منطقة إذا كانت تحتوي على أماكن
                تصوير لحماية بياناتك من الحذف غير المقصود.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}