'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Camera,
  Layers,
  CheckCircle,
  Clock,
  Plus,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../lib/api';

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
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">نظرة عامة على الموقع</h1>
          <p className="text-xs text-gray-500 mt-1">
            إدارة كافة محتويات موقع التصوير وأماكن السيشن وقاعات الأفراح بدون كتابة كود.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/locations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مكان تصوير</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-white text-xs font-medium transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>معاينة الموقع</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">{card.title}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-gray-900">{card.value}</span>
                <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900">إجراءات سريعة</h2>
          <div className="space-y-2.5">
            <Link
              href="/admin/regions"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-neutral-50 transition text-xs font-medium text-gray-700"
            >
              <span>إدارة المناطق الجغرافية والمدن</span>
              <span className="text-amber-700">فتح ←</span>
            </Link>
            <Link
              href="/admin/locations"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-neutral-50 transition text-xs font-medium text-gray-700"
            >
              <span>إدارة أماكن التصوير ومعارض الصور</span>
              <span className="text-amber-700">فتح ←</span>
            </Link>
            <Link
              href="/admin/services"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-neutral-50 transition text-xs font-medium text-gray-700"
            >
              <span>إدارة الخدمات الإضافية والباقات</span>
              <span className="text-amber-700">فتح ←</span>
            </Link>
            <Link
              href="/admin/homepage"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-neutral-50 transition text-xs font-medium text-gray-700"
            >
              <span>تخصيص أقسام الصفحة الرئيسية والمميزات</span>
              <span className="text-amber-700">فتح ←</span>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-neutral-50 transition text-xs font-medium text-gray-700"
            >
              <span>إعدادات الهاتف، واتساب وروابط التواصل</span>
              <span className="text-amber-700">فتح ←</span>
            </Link>
          </div>
        </div>

        <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200/70 space-y-4">
          <h2 className="text-base font-bold text-amber-900">إرشادات نشر المحتوى</h2>
          <ul className="space-y-2.5 text-xs text-amber-800 leading-relaxed">
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
