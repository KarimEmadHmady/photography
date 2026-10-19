import React from 'react';
import Link from 'next/link';
import { Camera, Home, MapPin, Sparkles, ArrowRight, Layers, HelpCircle } from 'lucide-react';

export const metadata = {
  title: '404 - الصفحة غير موجودة | مصطفى متولي للتصوير',
  description: 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
};

export default function NotFound() {
  const quickLinks = [
    {
      title: 'معرض أماكن التصوير',
      desc: 'استكشف أرقى الأماكن والقاعات لجلسات التصوير',
      href: '/locations',
      icon: MapPin,
      badge: 'الأكثر زيارة',
    },
    {
      title: 'خدمات وباقات التصوير',
      desc: 'تفاصيل تغطية الزفاف وجلسات الخطوبة والسيشن',
      href: '/services',
      icon: Sparkles,
      badge: 'عروض حصرية',
    },
    {
      title: 'استكشاف المناطق',
      desc: 'تصفح مواقع التصوير حسب المحافظة والمنطقة',
      href: '/regions',
      icon: Layers,
      badge: 'تغطية شاملة',
    },
  ];

  return (
    <div className="min-h-[85vh] pt-24 sm:pt-28 pb-16 flex items-center justify-center relative overflow-hidden bg-neutral-900 text-white selection:bg-amber-500 selection:text-white">
      {/* خلفية جمالية سينمائية مع بلور خفيف */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 blur-sm"
          style={{ backgroundImage: "url('/image/Baron-Palace.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-neutral-900/90" />
      </div>

      {/* دوائر ضوئية ديكورية بلون الكهرمان */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 sm:space-y-10">
        {/* الجزء البصري: بطاقات صور مائلة + رقم 404 بلمسة فوتوغرافية */}
        <div className="flex flex-col items-center justify-center">
          {/* مشهد الصور الفوتوغرافية المائلة */}
          <div className="relative w-64 h-36 sm:w-80 sm:h-44 mb-4 select-none">
            {/* الصورة اليسرى */}
            <div className="absolute top-2 left-4 w-28 h-36 sm:w-36 sm:h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 -rotate-12 transform hover:rotate-0 transition duration-500 bg-neutral-800">
              <img
                src="/image/15.jpg"
                alt="جلسة تصوير"
                className="w-full h-full object-cover opacity-85"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* الصورة اليمنى */}
            <div className="absolute top-2 right-4 w-28 h-36 sm:w-36 sm:h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 rotate-12 transform hover:rotate-0 transition duration-500 bg-neutral-800">
              <img
                src="/image/20.jpg"
                alt="لقطة زفاف"
                className="w-full h-full object-cover opacity-85"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* بطاقة الكاميرا المركزية الفاخرة */}
            <div className="absolute inset-x-0 bottom-0 mx-auto w-36 h-28 sm:w-44 sm:h-32 rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-amber-500/40 shadow-2xl shadow-amber-500/10 flex flex-col items-center justify-center p-3 z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-2">
                <Camera className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse" />
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-amber-300/90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                خارج إطار التركيز
              </span>
            </div>
          </div>

          {/* رقم 404 مع التدرج اللوني الذهبي */}
          <div className="relative inline-block">
            <span className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              404
            </span>
          </div>

          {/* العناوين والوصف العربي الواضح */}
          <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            عذراً.. هذه اللقطة غير متوفرة!
          </h1>
          <p className="mt-3 text-neutral-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            يبدو أن الرابط الذي تحاول الوصول إليه غير صحيح أو تم نقله لمكان آخر. 
            لا تقلق، يمكنك العودة للصفحة الرئيسية أو استكشاف أجمل لقطات وأماكن التصوير.
          </p>
        </div>

        {/* أزرار الإجراء السريع (Primary CTAs) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm sm:text-base font-bold shadow-lg shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 hover:scale-[1.02] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>العودة للرئيسية</span>
          </Link>

          <Link
            href="/locations"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm sm:text-base font-semibold backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>تصفح أماكن التصوير</span>
          </Link>
        </div>

        {/* بطاقات مساعدة واستكشاف سريعة */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-4">
            روابط قد تهمك في رحلتك
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-right">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-xs text-amber-400 font-semibold opacity-80 group-hover:opacity-100 group-hover:translate-x-[-4px] transition-all">
                    <span>انتقل الآن</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
