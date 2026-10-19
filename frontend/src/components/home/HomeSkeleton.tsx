'use client';

import React, { useEffect, useState } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';

interface HomeSkeletonProps {
  photographerName?: string;
}

export function HomeSkeleton({ photographerName }: HomeSkeletonProps) {
  const [name, setName] = useState(photographerName || '');

  useEffect(() => {
    if (!name) {
      api.public
        .getSettings()
        .then((res) => {
          if (res?.success && res.data?.photographerName) {
            setName(res.data.photographerName);
          }
        })
        .catch(() => {});
    }
  }, [name]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-amber-50/30 select-none pt-16 sm:pt-20">
      {/* إضاءات ذهبية خلفية هادئة (Ambient Glows) */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl" />

      {/* المحتوى المركزي الفاخر */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md mx-auto">
        {/* أيقونة العدسة الفوتوغرافية مع حلقات التركيز الدوارة */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center mb-6">
          {/* حلقة التدوير الخارجية للعدسة (Focus Ring) */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 animate-shutter-spin" />

          {/* حلقة النبض الخافتة لتأثير الضبط التلقائي (Autofocus Pulse) */}
          <div className="absolute inset-2 rounded-full border border-amber-400/30 animate-ping opacity-25 [animation-duration:2.5s]" />

          {/* الدائرة المركزية للعدسة */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-white flex items-center justify-center shadow-xl shadow-amber-500/25 border-2 border-white">
            <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[1.8]" />

            {/* بريق زاوية الكاميرا */}
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-sm text-amber-600 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* هوية المصور والمقولة */}
        <div className="space-y-1.5 mb-5">
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            {name || ' جارى تحميل المعرض... '}
          </h2>
          <p className="text-[10px] sm:text-xs font-bold tracking-[0.22em] text-amber-700 uppercase">
            Capturing Moments That Last Forever
          </p>
        </div>

        {/* شريط التحميل السينمائي الخفيف */}
        <div className="w-48 sm:w-56 h-1.5 rounded-full bg-neutral-200/90 overflow-hidden relative mb-4">
          <div className="absolute inset-y-0 w-24 rounded-full bg-gradient-to-r from-transparent via-amber-600 to-transparent animate-beam-slide" />
        </div>

        {/* النص التوضيحي للودينج */}
        <p className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
          <span>جاري تجهيز أحدث لقطات وجلسات التصوير</span>
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-amber-600 animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-1 rounded-full bg-amber-600 animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-1 rounded-full bg-amber-600 animate-bounce [animation-delay:300ms]" />
          </span>
        </p>
      </div>

      {/* خلفية هيكلية خافتة تمنح عمق ثلاثي الأبعاد قبل فتح الصفحة */}
      <div className="absolute inset-x-4 sm:inset-x-8 bottom-6 pointer-events-none opacity-20 max-w-5xl mx-auto hidden sm:grid grid-cols-3 gap-4">
        <div className="h-20 rounded-2xl bg-gradient-to-tr from-neutral-200 to-neutral-100 animate-pulse" />
        <div className="h-20 rounded-2xl bg-gradient-to-tr from-neutral-200 to-neutral-100 animate-pulse [animation-delay:200ms]" />
        <div className="h-20 rounded-2xl bg-gradient-to-tr from-neutral-200 to-neutral-100 animate-pulse [animation-delay:400ms]" />
      </div>
    </div>
  );
}
