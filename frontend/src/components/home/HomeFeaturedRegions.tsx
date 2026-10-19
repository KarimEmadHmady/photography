'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { IRegion } from '../../types';
import { optimizeImageUrl } from '../../lib/image';
import { container, focusRing, linkAmber, SectionHeading } from './HomeCommon';

interface HomeFeaturedRegionsProps {
  regions: IRegion[];
}

export function HomeFeaturedRegions({ regions }: HomeFeaturedRegionsProps) {
  if (!regions || regions.length === 0) return null;

  return (
    <section className="bg-white py-10 lg:py-14">
      <div className={container}>
        <SectionHeading
          title="استكشف أماكن التصوير حسب المنطقة"
          subtitle="اختر المنطقة الأقرب إليك وتصفح أجمل المواقع المتاحة فيها."
          action={
            <Link href="/regions" className={`${linkAmber} self-start`}>
              <span>جميع المناطق</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {regions.map((region) => (
            <Link
              key={region._id}
              href={`/regions/${region.slug}`}
              className={`group relative rounded-xl overflow-hidden aspect-[16/10] sm:aspect-[4/3] lg:aspect-[16/10] bg-neutral-900 flex flex-col justify-end p-4 lg:p-5 shadow-sm hover:shadow-lg transition ${focusRing}`}
            >
              {region.coverImage && (
                <img
                  src={optimizeImageUrl(region.coverImage, { width: 600, quality: 'auto' })}
                  alt={region.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 gpu-layer"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/30 to-transparent" />
              <div className="relative z-10 text-white space-y-0.5">
                <h3 className="text-lg lg:text-xl font-bold group-hover:text-amber-400 transition">
                  {region.name}
                </h3>
                {region.description && (
                  <p className="text-xs text-neutral-300 line-clamp-2">{region.description}</p>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium pt-1.5">
                  <span>استكشف الأماكن</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
