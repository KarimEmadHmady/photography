'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MapPin, ArrowRight, Camera, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../../lib/api';
import { IRegion, ILocation } from '../../../types';

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-600 text-sm">جاري تحميل المنطقة...</p>
      </div>
    );
  }

  if (error || !region) {
    return (
      <div className="max-w-xl mx-auto my-20 p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-red-900">المنطقة غير متاحة</h2>
        <p className="text-sm text-red-700">{error || 'لم يتم العثور على المنطقة المطلوبة'}</p>
        <Link
          href="/regions"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة لكل المناطق</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500">
        <Link href="/" className="hover:text-amber-700 transition">
          الرئيسية
        </Link>
        <span>←</span>
        <Link href="/regions" className="hover:text-amber-700 transition">
          المناطق
        </Link>
        <span>←</span>
        <span className="text-neutral-900 font-semibold">{region.name}</span>
      </nav>

      {/* Region Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white p-8 sm:p-12 border border-neutral-800 shadow-md">
        {region.coverImage && (
          <img
            src={region.coverImage}
            alt={region.name}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        <div className="relative z-10 max-w-2xl space-y-3 text-right">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>منطقة تصوير</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold">{region.name}</h1>
          {region.description && (
            <p className="text-neutral-300 text-sm leading-relaxed">{region.description}</p>
          )}
          <p className="text-xs text-amber-400 font-medium pt-2">
            يتوفر {region.locations?.length || 0} مكان تصوير في هذه المنطقة
          </p>
        </div>
      </div>

      {/* Locations in this region */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-neutral-900">
          أماكن التصوير المتاحة في {region.name}
        </h2>

        {!region.locations || region.locations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">لا توجد أماكن تصوير مضافة لهذه المنطقة حالياً.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {region.locations.map((loc) => (
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
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-amber-700 transition">
                      {loc.name}
                    </h3>
                    {loc.shortDescription && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {loc.shortDescription}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {loc.photographyPrice?.type === 'on_request'
                        ? 'السعر حسب الاتفاق'
                        : `سعر التصوير: ${loc.photographyPrice?.amount || ''}`}
                    </span>
                    <span className="text-amber-700 font-semibold group-hover:underline">
                      عرض التفاصيل ←
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
