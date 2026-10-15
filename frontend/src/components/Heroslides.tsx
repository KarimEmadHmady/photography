'use client';

import React, { useEffect, useState } from 'react';
import { optimizeImageUrl } from '../lib/image';

const FADE_MS = 1400; // مدة الـ crossfade
const ZOOM_MS = 7000; // مدة الزوم البطيء (لازم تكون أطول من مدة بقاء الصورة + الـ fade)
const ZOOM_SCALE = 1.08;

interface HeroSlidesProps {
  images: string[];
  currentSlide: number;
  width: number;
  alt: string;
}

/**
 * Crossfade حقيقي بدون وميض:
 * - current : فوق (z-20) وبيظهر تدريجيًا من 0 → 1
 * - prev    : تحت (z-10) وبيفضل opacity 1 لحد ما الجديدة تكمل، وبعدين يتشال
 * - next    : متحمّل مسبقًا ومخفي (opacity 0)
 * - prev بيتحسب أثناء الرندر نفسه (مش في useEffect) علشان الصورة القديمة
 *   مفيش لحظة تتشال فيها من الـ DOM.
 */
export default function HeroSlides({ images, currentSlide, width, alt }: HeroSlidesProps) {
  const [state, setState] = useState<{ cur: number; prev: number | null }>({
    cur: currentSlide,
    prev: null,
  });
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // تحديث prev أثناء الرندر (آمن في React) — بيمنع أي فريم بدون الصورة القديمة
  if (state.cur !== currentSlide) {
    setState({ cur: currentSlide, prev: state.cur });
  }

  // نشيل الصورة القديمة بعد انتهاء الانتقال
  useEffect(() => {
    if (state.prev === null) return;
    const t = setTimeout(() => setState((s) => ({ ...s, prev: null })), FADE_MS + 100);
    return () => clearTimeout(t);
  }, [state.cur, state.prev]);

  // نبدأ الزوم بعد أول رسم علشان أول صورة كمان تتحرك
  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (images.length === 0) return null;

  const { cur, prev } = state;
  const nextSlide = (cur + 1) % images.length;

  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      {images.map((imgUrl, idx) => {
        const isCurrent = idx === cur;
        const isPrev = idx === prev;
        const isNext = idx === nextSlide;
        if (!isCurrent && !isPrev && !isNext) return null;

        const isActive = isCurrent || isPrev;

        return (
          <div
            key={imgUrl + idx}
            className="absolute inset-0 pointer-events-none"
            aria-hidden={!isCurrent}
            style={{
              opacity: isActive ? 1 : 0,
              zIndex: isCurrent ? 20 : isPrev ? 10 : 0,
              // الـ fade على الصورة الجديدة بس، والقديمة تفضل ثابتة تحتها
              transition: isCurrent ? `opacity ${FADE_MS}ms ease-in-out` : 'none',
              willChange: 'opacity',
            }}
          >
            <img
              src={optimizeImageUrl(imgUrl, { width, quality: 'auto' })}
              alt={`${alt} ${idx + 1}`}
              loading="eager"
              decoding="async"
              {...(idx === 0 ? { fetchPriority: 'high' as const } : {})}
              className="w-full h-full object-cover gpu-layer"
              style={{
                transform: `scale(${isActive && ready && !reduceMotion ? ZOOM_SCALE : 1})`,
                // نفس الـ transition للـ current والـ prev علشان الزوم يكمل من غير قفزة
                transition: isActive && !reduceMotion ? `transform ${ZOOM_MS}ms linear` : 'none',
                willChange: 'transform',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}