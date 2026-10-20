'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, MessageCircle, Camera, ChevronDown } from 'lucide-react';
import { ISiteSettings } from '../../types';
import HeroSlides from '../Heroslides';
import { container, btnPrimary, btnOutlineLight } from './HomeCommon';
import { ScrollReveal } from '../ui/ScrollReveal';

interface HomeHeroProps {
  settings: ISiteSettings;
  whatsappUrl: string;
}

const SLIDE_INTERVAL_MS = 4500;

export function HomeHero({ settings, whatsappUrl }: HomeHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages: string[] = (
    settings?.hero?.images && settings.hero.images.length > 0
      ? settings.hero.images
      : settings?.hero?.imageUrl
      ? [settings.hero.imageUrl]
      : []
  ).filter(Boolean);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, SLIDE_INTERVAL_MS);
    };
    const stop = () => {
      if (interval) clearInterval(interval);
      interval = null;
    };

    // إيقاف السليدر عند إخفاء التاب لتجنب تراكم الحركات
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [heroImages.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white-20 to-white border-b border-neutral-200 pt-28 pb-14 min-h-[100svh] flex items-center lg:min-h-0 lg:pt-36 lg:pb-20">
      {/* Mobile: خلفية متحركة للسليدر */}
      {heroImages.length > 0 && (
        <div className="absolute inset-0 lg:hidden overflow-hidden">
          <HeroSlides
            images={heroImages}
            currentSlide={currentSlide}
            width={800}
            alt={settings.hero.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/45 to-white/10" />
        </div>
      )}

      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

      <div className={`relative w-full ${container}`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* النص والمعلومات */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-right">
            <ScrollReveal animation="fade-down" delay={100} duration={700}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-800 text-[11px] sm:text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>تصوير فوتوغرافي محترف للزفاف والسيشن</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={250} duration={750} distance={24}>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.1rem] font-extrabold text-neutral-900 leading-tight">
                {settings.hero.title}
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={400} duration={750} distance={20}>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {settings.hero.description}
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={550} duration={750} distance={20}>
              <div className="pt-2 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3">
                <Link
                  href={settings.hero.primaryCtaUrl || '/locations'}
                  className={`${btnPrimary} w-full sm:w-auto lg:px-5 lg:py-3`}
                >
                  <span>{settings.hero.primaryCtaText || 'استكشف أماكن التصوير'}</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${btnOutlineLight} w-full sm:w-auto lg:px-5 lg:py-3`}
                >
                  <MessageCircle className="w-4 h-4 text-amber-600" />
                  <span>{settings.hero.secondaryCtaText || 'تواصل عبر واتساب'}</span>
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Desktop: بطاقة السليدر */}
          <div className="hidden lg:block lg:col-span-5">
            <ScrollReveal animation="fade-left" delay={300} duration={850} distance={30}>
              <div className="relative mx-auto w-full max-w-[320px] xl:max-w-sm">
                <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl border-2 border-amber-400" />
                <div className="relative aspect-4/5 rounded-2xl overflow-hidden shadow-xl bg-neutral-100 border-4 border-white group">
                  {heroImages.length > 0 ? (
                    <HeroSlides
                      images={heroImages}
                      currentSlide={currentSlide}
                      width={900}
                      alt={settings.hero.title}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-amber-50 text-center p-8">
                      <div className="w-16 h-16 rounded-full bg-white border border-amber-200 shadow-sm flex items-center justify-center mb-4">
                        <Camera className="w-8 h-8 text-amber-600 stroke-1" />
                      </div>
                      <p className="font-semibold text-base text-neutral-900">{settings.photographerName}</p>
                      <p className="text-xs text-amber-700 mt-1">لحظات تدوم إلى الأبد</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Mobile: مؤشر الماوس المتحرك للسكرول لأسفل */}
      <div className="absolute bottom-8 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 lg:hidden z-40 pointer-events-auto">
        <ScrollReveal animation="fade-up" delay={700} duration={700}>
          <button
            type="button"
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight - 70,
                behavior: 'smooth',
              });
            }}
            aria-label="اسحب لأسفل للاستكشاف"
            className="flex flex-col items-center gap-1 group focus:outline-none"
          >
            <div className="w-5 h-8.5 rounded-full border-2 border-neutral-400/90 group-hover:border-amber-600 flex justify-center pt-1.5 bg-white/70 backdrop-blur-xs transition-colors shadow-xs">
              <span className="w-1 h-2 bg-amber-600 rounded-full animate-mouse-wheel" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 group-hover:text-amber-600 animate-bounce -mt-0.5 transition-colors" />
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}
