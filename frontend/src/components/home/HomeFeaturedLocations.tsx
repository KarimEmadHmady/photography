'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, MapPin, Sparkles, ArrowLeft } from 'lucide-react';
import { ILocation } from '../../types';
import { optimizeImageUrl } from '../../lib/image';
import { container, focusRing, linkAmber, SectionHeading } from './HomeCommon';
import { ScrollReveal } from '../ui/ScrollReveal';

interface HomeFeaturedLocationsProps {
  locations: ILocation[];
  currency: string;
}

function locRegion(loc: ILocation) {
  return typeof loc.regionId === 'object' ? (loc.regionId as any)?.name || '' : '';
}

function locPrice(loc: ILocation, currency: string) {
  if (loc.computedTotalPrice) return `الإجمالي التقديري: ${loc.computedTotalPrice} ${currency}`;
  if (loc.photographyPrice?.type === 'on_request') return 'السعر حسب الاتفاق';
  return `يبدأ من ${loc.photographyPrice?.amount || ''} ${currency}`;
}

/* كارت بصورة كاملة والنص فوقها — للمكان الأبرز */
export function FeaturedOverlayCard({
  loc,
  currency,
  large = false,
  className = '',
}: {
  loc: ILocation;
  currency: string;
  large?: boolean;
  className?: string;
}) {
  const regionName = locRegion(loc);
  return (
    <Link
      href={`/locations/${loc.slug}`}
      className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-200 shadow-sm hover:shadow-xl transition-shadow duration-300 ${
        large
          ? 'min-h-[200px] sm:min-h-[280px] lg:min-h-[480px]'
          : 'min-h-[200px] sm:min-h-[270px] lg:min-h-[228px]'
      } ${focusRing} ${className}`}
    >
      {loc.coverImage ? (
        <img
          src={optimizeImageUrl(loc.coverImage, { width: large ? 950 : 600, quality: 'auto' })}
          alt={loc.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out gpu-layer"
        />
      ) : (
        <div className="absolute inset-0 -z-10 flex items-center justify-center text-neutral-400">
          <Camera className="w-10 h-10" />
        </div>
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-900/90 via-neutral-900/35 to-transparent" />

      {regionName && (
        <span className="absolute top-4 right-4 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          <MapPin className="w-3 h-3 text-amber-600" />
          <span>{regionName}</span>
        </span>
      )}
      {large && (
        <span className="absolute top-4 left-4 bg-amber-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          <Sparkles className="w-3 h-3" />
          <span>الأبرز</span>
        </span>
      )}

      <div className="relative p-5 sm:p-7 text-white space-y-2.5">
        <h3
          className={`font-extrabold leading-snug group-hover:text-amber-300 transition-colors ${
            large ? 'text-lg sm:text-xl lg:text-3xl' : 'text-lg sm:text-xl'
          }`}
        >
          {loc.name}
        </h3>
        {large && loc.shortDescription && (
          <p className="hidden lg:block text-sm text-neutral-200 leading-relaxed line-clamp-2 max-w-xl">
            {loc.shortDescription}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
            {locPrice(loc, currency)}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-amber-600 group-hover:bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition-colors">
            <span>التفاصيل</span>
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}


export function HomeFeaturedLocations({ locations, currency }: HomeFeaturedLocationsProps) {
  if (!locations || locations.length === 0) return null;

  const [leadLoc, ...otherLocs] = locations;
  const sideLocs = otherLocs.slice(0, 2);
  const restLocs = otherLocs.slice(2);

  if (!leadLoc) return null;

  return (
    <section className="content-auto bg-neutral-50 border-y border-neutral-200 py-10 lg:py-14">
      <div className={container}>
        <ScrollReveal animation="fade-up" duration={750} distance={24}>
          <SectionHeading
            title="أشهر مواقع وجلسات تصوير السيشن"
            subtitle="مواقع مختارة بعناية بأسعار واضحة من أول نظرة."
            action={
              <Link href="/locations" className={`${linkAmber} self-start`}>
                <span>عرض كل الأماكن</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            }
          />
        </ScrollReveal>

        <div className="space-y-4 sm:space-y-5">
          {/* الأبرز + مكانين جنبه */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <ScrollReveal
              animation="fade-up"
              delay={100}
              duration={800}
              distance={28}
              className={sideLocs.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}
            >
              <FeaturedOverlayCard
                loc={leadLoc}
                currency={currency}
                large
                className="w-full h-full"
              />
            </ScrollReveal>
            {sideLocs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-4 sm:gap-5">
                {sideLocs.map((loc, idx) => (
                  <ScrollReveal
                    key={loc._id}
                    animation="fade-up"
                    delay={200 + idx * 100}
                    duration={750}
                    distance={24}
                    className="h-full"
                  >
                    <FeaturedOverlayCard
                      loc={loc}
                      currency={currency}
                      className="h-full"
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>

          {/* باقي الأماكن - نفس استايل الأماكن الجانبية */}
          {restLocs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {restLocs.map((loc, idx) => (
                <ScrollReveal
                  key={loc._id}
                  animation="fade-up"
                  delay={100 + (idx % 3) * 100}
                  duration={750}
                  distance={24}
                >
                  <FeaturedOverlayCard loc={loc} currency={currency} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
