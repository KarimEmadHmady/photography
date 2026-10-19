'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { optimizeImageUrl } from '../../../../lib/image';

interface CoverSliderProps {
  images: string[];
  alt: string;
  regionName: string;
}

export function CoverSlider({ images, alt, regionName }: CoverSliderProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  // تغيير تلقائي كل 4 ثواني (لف مستمر). بيتوقف مع الـ hover/اللمس، ومع reduced-motion
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), 4000);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    setPaused(false);
    // RTL: السحب لليسار = التالي
    if (dx < -40) next();
    if (dx > 40) prev();
  };

  return (
    <div
      className="relative w-full aspect-[16/11] max-h-[38vh] sm:max-h-[50vh] lg:max-h-[62vh] rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-200 shadow-sm border border-neutral-200"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label={alt}
    >
      {images.map((src, i) => (
        <div
          key={src}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* خلفية ضبابية تملا أي فراغ على الجوانب */}
          <img
            src={optimizeImageUrl(src, { width: 300, quality: 'eco' })}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-70"
          />
          {/* الصورة كاملة من غير قص */}
          <img
            src={optimizeImageUrl(src, { width: 950, quality: 'auto' })}
            alt={i === index ? alt : ''}
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
            {...(i === 0 ? ({ fetchPriority: 'high' } as any) : {})}
            className="relative z-10 w-full h-full object-cover gpu-layer"
          />
        </div>
      ))}

      {/* بادج المنطقة */}
      <span className="absolute z-20 top-2.5 right-2.5 sm:top-3 sm:right-3 bg-white/80 backdrop-blur-md border border-white/50 text-neutral-900 text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
        <MapPin className="w-3.5 h-3.5 text-amber-600" />
        <span>{regionName}</span>
      </span>

      {count > 1 && (
        <>
          {/* نقاط (لحد 8 صور) أو عداد لو أكتر */}
          {count <= 8 ? (
            <div className="absolute z-20 bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`الصورة ${i + 1}`}
                  aria-current={i === index}
                  className="p-1.5"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? 'w-5 bg-amber-500' : 'w-1.5 bg-white/80'
                    }`}
                  />
                </button>
              ))}
            </div>
          ) : (
            <span className="absolute z-20 bottom-2.5 left-1/2 -translate-x-1/2 text-[11px] text-white bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {index + 1} / {count}
            </span>
          )}

          {/* أسهم — للكمبيوتر بس (الموبايل بالسحب) */}
          <button
            type="button"
            onClick={next}
            aria-label="الصورة التالية"
            className="hidden sm:flex absolute z-20 left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-800 items-center justify-center shadow-sm transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={prev}
            aria-label="الصورة السابقة"
            className="hidden sm:flex absolute z-20 right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-neutral-800 items-center justify-center shadow-sm transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
