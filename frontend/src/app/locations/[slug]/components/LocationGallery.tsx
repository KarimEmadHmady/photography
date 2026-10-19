'use client';

import React, { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { IGalleryImage } from '../../../../types';
import { optimizeImageUrl } from '../../../../lib/image';
import { SectionTitle, MOSAIC_CYCLE, INITIAL_VISIBLE, focusRing } from './constants';

interface LocationGalleryProps {
  gallery: IGalleryImage[];
  locationName: string;
  onOpenLightbox: (index: number) => void;
}

export function LocationGallery({
  gallery,
  locationName,
  onOpenLightbox,
}: LocationGalleryProps) {
  const [showAllGallery, setShowAllGallery] = useState(false);

  if (!gallery || gallery.length === 0) return null;

  const visibleGallery = showAllGallery ? gallery : gallery.slice(0, INITIAL_VISIBLE);
  const fullCycleCount =
    Math.floor(visibleGallery.length / MOSAIC_CYCLE.length) * MOSAIC_CYCLE.length;

  return (
    <section className="content-auto space-y-4">
      <SectionTitle count={`${gallery.length} صورة`}>
        معرض صور الجلسات في هذا المكان
      </SectionTitle>

      <div className="grid grid-flow-dense grid-cols-2 md:grid-cols-4 auto-rows-[110px] sm:auto-rows-[150px] lg:auto-rows-[190px] gap-2 sm:gap-3">
        {visibleGallery.map((img, idx) => {
          const span = idx < fullCycleCount ? MOSAIC_CYCLE[idx % MOSAIC_CYCLE.length] : '';
          const isFeature = idx === 0;

          return (
            <button
              type="button"
              key={img.publicId || idx}
              onClick={() => onOpenLightbox(idx)}
              aria-label={`تكبير الصورة ${idx + 1}`}
              className={`group relative overflow-hidden rounded-lg sm:rounded-xl bg-neutral-200 border border-neutral-200 shadow-xs hover:shadow-xl hover:z-10 transition-shadow duration-300 ${span} ${focusRing}`}
            >
              <img
                src={optimizeImageUrl(img.url, { width: 500, quality: 'auto' })}
                alt={img.alt || locationName}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out gpu-layer"
              />

              {/* overlay + caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <span className="absolute top-2 left-2 w-8 h-8 max-lg:w-6 max-lg:h-6 rounded-full bg-white/85 backdrop-blur-md text-amber-700 flex items-center justify-center shadow-sm opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 max-lg:opacity-100 max-lg:translate-y-0 max-lg:transition-none">
                <ZoomIn className="w-4 h-4 max-lg:w-3 max-lg:h-3" />
              </span>

              {isFeature && (
                <span className="absolute top-2 right-2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  الأبرز
                </span>
              )}

              {img.alt && (
                <span className="absolute bottom-0 inset-x-0 p-2.5 text-right text-xs font-medium text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 line-clamp-1">
                  {img.alt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {gallery.length > INITIAL_VISIBLE && (
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => setShowAllGallery((v) => !v)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-300 bg-white text-amber-700 text-sm font-semibold hover:bg-amber-600 hover:text-white hover:border-amber-600 transition ${focusRing}`}
          >
            {showAllGallery ? 'عرض أقل' : `عرض كل الصور (${gallery.length})`}
          </button>
        </div>
      )}
    </section>
  );
}
