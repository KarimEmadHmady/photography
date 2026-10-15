'use client';

import React, { useEffect, useState } from 'react';
import { Download, Check, Sparkles, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AdminPWA() {
  useEffect(() => {
    // 1. Ensure PWA tags are injected strictly in Admin
    const head = document.head;

    const addLink = (rel: string, href: string) => {
      let link = head.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        link.setAttribute('href', href);
        head.appendChild(link);
      }
    };

    const addMeta = (name: string, content: string) => {
      let meta = head.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        head.appendChild(meta);
      }
    };

    // Manifest scoped strictly to Admin
    addLink('manifest', '/manifest-admin.json');
    addLink('apple-touch-icon', '/icons/admin-icon-192.png');

    // Apple / Mobile metadata
    addMeta('theme-color', '#d97706');
    addMeta('apple-mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMeta('apple-mobile-web-app-title', 'الداشبورد');

    // 2. Register Service Worker with /admin/ scope
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-admin.js', { scope: '/admin/' })
        .then((reg) => {
          console.log('[Admin PWA] Service Worker registered for scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[Admin PWA] Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}

/**
 * زر تثبيت تطبيق الداشبورد لوضعه في القائمة الجانبية أو الهيدر
 */
export function AdminInstallButton({ className = '' }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true)
    ) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : '';
    const isAppleMobile = /iphone|ipad|ipod/.test(ua);
    setIsIos(isAppleMobile);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosTip(true);
    } else {
      // Fallback hint for browsers that already installed or have icon in address bar
      alert('لتثبيت تطبيق لوحة التحكم، يمكنك أيضاً الضغط على أيقونة التثبيت (➕ أو ⬇️) الموجودة في شريط عنوان المتصفح.');
    }
  };

  // If already running inside standalone PWA
  if (isInstalled) {
    return (
      <div
        className={`flex lg:hidden items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 ${className}`}
        title="تطبيق  مثبت لديك ويعمل بنمط مستقل"
      >
        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
        <span>تطبيق  مُثبَّت ✓</span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        title="تثبيت لوحة التحكم كتطبيق مستقل على هاتفك"
        className={
          className ||
          'w-full flex lg:hidden items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-600/20 via-amber-500/15 to-transparent text-amber-300 hover:text-white hover:from-amber-600 hover:to-amber-500 text-xs font-bold transition-all border border-amber-500/30 hover:border-amber-400 group shadow-sm'
        }
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <span>تثبيت تطبيق </span>
        </div>

      </button>

      {/* نافذة إرشادية لمستخدمي هواتف آيفون (Safari iOS) */}
      {showIosTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-700 text-white p-6 rounded-3xl shadow-2xl">
            <button
              onClick={() => setShowIosTip(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm">تثبيت التطبيق على آيفون (iOS)</h4>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              لتثبيت لوحة التحكم كتطبيق على شاشة هاتفك الرئيسية:
            </p>
            <ol className="text-xs text-neutral-300 space-y-2.5 list-decimal list-inside pr-1">
              <li>اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari بالأسفل.</li>
              <li>مرر لأسفل واختر <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.</li>
              <li>اضغط <strong>"إضافة" (Add)</strong> في الزاوية العلوية.</li>
            </ol>
            <button
              onClick={() => setShowIosTip(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </>
  );
}
