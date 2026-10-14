'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { IRegion } from '../../types';

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-600 text-sm">جاري تحميل المناطق...</p>
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
          دليل المناطق
        </span>
        <h1 className="text-3xl font-extrabold text-neutral-900">المناطق الجغرافية للتصوير</h1>
        <p className="text-neutral-500 text-sm max-w-2xl">
          اختر منطقتك المفضلة لاستكشاف أفضل الحدائق، القاعات، وأماكن جلسات التصوير المتاحة بها.
        </p>
      </div>

      {/* Grid */}
      {regions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">لا توجد مناطق منشورة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regions.map((region) => (
            <Link
              key={region._id}
              href={`/regions/${region.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-16/10 bg-neutral-900 overflow-hidden">
                {region.coverImage ? (
                  <img
                    src={region.coverImage}
                    alt={region.name}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <MapPin className="w-10 h-10 stroke-1" />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {region.locationCount || 0} مكان تصوير
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition">
                    {region.name}
                  </h2>
                  {region.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                      {region.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                  <span>استكشف أماكن المنطقة</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
