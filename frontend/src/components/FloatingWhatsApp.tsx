'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronUp, Share2 } from 'lucide-react';
import { api } from '../lib/api';
import { ISiteSettings } from '../types';
import { useShare } from './ShareModal';

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const { openShare } = useShare();
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    api.public
      .getSettings()
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {});

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 320);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // لا يظهر داخل صفحات لوحة تحكم المشرف
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const rawPhone = settings?.contact?.whatsappNumber || '201000000000';
  const phoneClean = rawPhone.replace(/[^0-9]/g, '');
  const defaultMsg =
    settings?.contact?.defaultWhatsappMessage ||
    'مرحباً، أود الاستفسار عن تفاصيل جلسات التصوير والأسعار.';
  const whatsappUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(defaultMsg)}`;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <aside
      aria-label="أزرار الإجراءات السريعة"
      className="fixed bottom-15 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-center gap-2.5 sm:gap-3 pointer-events-auto"
    >
      {/* 1. زر المشاركة السريع */}
      <button
        type="button"
        onClick={() => openShare()}
        aria-label="مشاركة الصفحة ونسخ الرابط"
        title="مشاركة الصفحة ونسخ الرابط"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/95 hover:bg-neutral-900 text-neutral-700 hover:text-white shadow-md hover:shadow-xl hover:shadow-black/20 border border-neutral-200/90 hover:border-neutral-900 hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
      >
        <Share2 className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* 2. زر الواتساب العائم */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا عبر واتساب"
        title="تواصل معنا عبر واتساب"
        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/25 hover:shadow-xl hover:shadow-amber-600/30 hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 border border-amber-400/40"
      >
        {/* نبض هادئ يشد الانتباه */}
        <span
          className="absolute -inset-0.5 rounded-full bg-amber-500 opacity-35 animate-ping pointer-events-none"
          style={{ animationDuration: '3s' }}
        />

        {/* أيقونة واتساب واضحة */}
        <span className="relative flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            width="21"
            height="21"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.301-.778.978-.954 1.179-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.786-1.676-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.678-1.635-.929-2.239-.245-.589-.494-.509-.678-.518l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.2 2.124 3.243 5.145 4.549.719.31 1.281.496 1.719.635.723.23 1.38.197 1.9.12.58-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.076-.126-.276-.201-.577-.351zm-5.467 7.618a9.932 9.932 0 01-5.064-1.39l-.363-.215-3.763.987 1.005-3.669-.236-.376a9.92 9.92 0 01-1.523-5.26c0-5.495 4.475-9.97 9.975-9.97a9.914 9.914 0 017.051 2.923 9.916 9.916 0 012.924 7.051c0 5.496-4.474 9.973-9.971 9.973h-.028zm8.508-18.479A11.905 11.905 0 0012.005.002C5.385.002.003 5.384.003 12.004a11.9 11.9 0 001.621 5.99L0 24l6.175-1.62a11.933 11.933 0 005.83 1.517h.005c6.619 0 12.002-5.382 12.002-12.003a11.92 11.92 0 00-3.5-8.497z" />
          </svg>
        </span>
      </a>

      {/* 2. زر الصعود لأعلى (To Up) */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="العودة لأعلى الصفحة"
        title="العودة لأعلى الصفحة"
        className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/95 hover:bg-amber-600 text-neutral-700 hover:text-white shadow-md hover:shadow-xl hover:shadow-amber-600/25 border border-neutral-200/90 hover:border-amber-500 hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
          showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <ChevronUp className="w-5 h-5 stroke-[2.5]" />
      </button>
    </aside>
  );
}
