'use client';

import Link from 'next/link';
import { MapPin, Camera, Star, ArrowLeft } from 'lucide-react';
import { ILocation } from '../../types';
import { optimizeImageUrl } from '../../lib/image';
import { EAGER_IMAGES } from './constants';
import { ScrollReveal } from '../ui/ScrollReveal';

interface LocationCardProps {
  location: ILocation;
  index: number;
  currency: string;
}

export function LocationCard({ location, index, currency }: LocationCardProps) {
  const regionName =
    typeof location.regionId === 'object' ? (location.regionId as any).name : '';

  return (
    <ScrollReveal
      animation="fade-up"
      delay={80 + (index % 6) * 80}
      duration={750}
      distance={28}
      className="h-full"
    >
      <Link
        href={`/locations/${location.slug}`}
        className="group flex flex-col bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-amber-300 shadow-xs hover:shadow-lg lg:hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 h-full"
      >
      <div className="relative aspect-[16/9] sm:aspect-[16/10] bg-neutral-200 overflow-hidden">
        {location.coverImage ? (
          <img
            src={optimizeImageUrl(location.coverImage, { width: 550, quality: 'auto' })}
            alt={location.name}
            loading={index < EAGER_IMAGES ? 'eager' : 'lazy'}
            decoding="async"
            className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out gpu-layer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <Camera className="w-8 h-8" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/5 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-500" />

        {regionName && (
          <span className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>{regionName}</span>
          </span>
        )}

        {location.isFeatured && (
          <span className="absolute top-2.5 left-2.5 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-current" />
            <span>مميز</span>
          </span>
        )}

        <span className="hidden lg:inline-flex absolute bottom-3 right-3 items-center gap-1.5 bg-amber-600 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          <span>عرض التفاصيل</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="font-bold text-base text-neutral-900 group-hover:text-amber-700 transition-colors">
            {location.name}
          </h2>
          {location.shortDescription && (
            <p className="text-xs text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
              {location.shortDescription}
            </p>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3 text-xs">
          <span className="text-neutral-700 font-medium">
            {location.computedTotalPrice
              ? `الإجمالي: ${location.computedTotalPrice} ${currency}`
              : location.photographyPrice?.type === 'on_request'
              ? 'السعر حسب الاتفاق'
              : `سعر التصوير: ${location.photographyPrice?.amount || ''} ${currency}`}
          </span>
          <span className="shrink-0 w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
    </ScrollReveal>
  );
}
