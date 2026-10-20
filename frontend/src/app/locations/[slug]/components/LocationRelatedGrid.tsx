'use client';

import Link from 'next/link';
import { Camera, ArrowLeft } from 'lucide-react';
import { ILocation } from '../../../../types';
import { optimizeImageUrl } from '../../../../lib/image';
import { SectionTitle, focusRing } from './constants';
import { ScrollReveal } from '../../../../components/ui/ScrollReveal';

interface LocationRelatedGridProps {
  locations: ILocation[];
  currency: string;
}

export function LocationRelatedGrid({ locations, currency }: LocationRelatedGridProps) {
  if (!locations || locations.length === 0) return null;

  return (
    <section className="content-auto space-y-4">
      <ScrollReveal animation="fade-up" duration={700} delay={50}>
        <SectionTitle>أماكن تصوير أخرى قد تنال إعجابك</SectionTitle>
      </ScrollReveal>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        {locations.map((rel, idx) => (
          <ScrollReveal
            key={rel._id}
            animation="fade-up"
            delay={80 + idx * 80}
            duration={700}
            distance={24}
            className="h-full"
          >
            <Link
              href={`/locations/${rel.slug}`}
              className={`group flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-amber-300 shadow-xs hover:shadow-lg lg:hover:-translate-y-1 transition-all duration-300 h-full ${focusRing}`}
            >
              <div className="relative aspect-[16/10] bg-neutral-200 overflow-hidden">
                {rel.coverImage ? (
                  <img
                    src={optimizeImageUrl(rel.coverImage, { width: 500, quality: 'auto' })}
                    alt={rel.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out gpu-layer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/50 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-sm text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                  {rel.name}
                </h3>
                <div className="mt-2 pt-2 border-t border-neutral-100 text-xs text-neutral-600 flex items-center justify-between gap-2">
                  <span className="truncate">
                    {rel.photographyPrice?.type === 'on_request'
                      ? 'حسب الاتفاق'
                      : `${rel.photographyPrice?.amount || ''} ${currency}`}
                  </span>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
