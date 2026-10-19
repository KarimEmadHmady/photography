'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Share, Smartphone, SquarePlus, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Global prompt capture so any component (sidebar or floating card) can trigger it
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    promptListeners.forEach((fn) => fn(globalDeferredPrompt));
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    promptListeners.forEach((fn) => fn(null));
  });
}

const detectIos = () => {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isAppleMobile = /iphone|ipad|ipod/.test(ua);
  const isIPadOS = ua.includes('macintosh') && window.navigator.maxTouchPoints > 1;
  return isAppleMobile || isIPadOS;
};

const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};

const DISMISS_KEY = 'admin_pwa_dismissed_at';
const DISMISS_DAYS = 7;

const wasDismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return !!at && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

/* ================= نافذة شرح التثبيت على آيفون ================= */

function IosGuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="تثبيت التطبيق على آيفون"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full sm:max-w-sm max-h-[92dvh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-gray-900">التثبيت على آيفون</h4>
        </div>

        <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
          لتثبيت التطبيق على جهاز الآيفون اضغط مشاركة ثم اختر «إضافة إلى الشاشة الرئيسية» أو &quot;Add to Home Screen&quot; من القائمة.
        </p>

        <img
          src="/pwa_ios.png"
          alt="شرح تثبيت التطبيق على iOS"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
          className="w-full rounded-xl border border-gray-200 shadow-sm mb-4"
        />

        <ol className="space-y-3">
          <Step n={1} icon={<Share className="w-5 h-5" />}>
            اضغط زر <strong>المشاركة</strong> في شريط Safari.
          </Step>
          <Step n={2} icon={<SquarePlus className="w-5 h-5" />}>
            اختار <strong>«إضافة إلى الشاشة الرئيسية»</strong> (Add to Home Screen).
          </Step>
          <Step n={3} icon={<Check className="w-5 h-5" />}>
            اضغط <strong>«إضافة»</strong> (Add) فوق على اليمين.
          </Step>
        </ol>

        <p className="mt-4 text-[11px] text-gray-500 leading-relaxed bg-amber-50 border border-amber-100 rounded-xl p-2.5">
          لو بتفتح من متصفح تاني غير Safari (زي Chrome أو من جوه تطبيق)، افتح الرابط في Safari الأول.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold transition"
        >
          فهمت
        </button>
      </div>
    </div>
  );
}

function Step({
  n,
  icon,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="w-6 h-6 shrink-0 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center">
        {n}
      </span>
      <span className="w-10 h-10 shrink-0 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
        {icon}
      </span>
      <span className="text-xs text-gray-700 leading-relaxed">{children}</span>
    </li>
  );
}

/* ================= 1. الكارت العايم للموبايل ================= */

function AdminFloatingPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isIos, setIsIos] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const ios = detectIos();
    setIsIos(ios);

    if (ios) {
      setVisible(true);
      return;
    }

    if (globalDeferredPrompt) {
      setVisible(true);
    }

    const listener = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
      if (prompt) setVisible(true);
      else setVisible(false);
    };

    promptListeners.add(listener);
    return () => {
      promptListeners.delete(listener);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
    setShowGuide(false);
  };

  const handleInstall = async () => {
    if (isIos) {
      setShowGuide(true);
      return;
    }
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return createPortal(
    <>
      <div
        dir="rtl"
        className="fixed z-50 inset-x-3 bottom-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-80 lg:hidden pb-[env(safe-area-inset-bottom)]"
      >
        <div className="relative bg-white border border-gray-200 shadow-2xl rounded-2xl p-3.5">
          <button
            type="button"
            onClick={dismiss}
            aria-label="إغلاق"
            className="absolute top-2 left-2 w-7 h-7 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 pl-6">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900">ثبّت تطبيق لوحة التحكم</p>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                افتحه من شاشتك الرئيسية بسرعة، من غير متصفح.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleInstall}
              className="flex-[2] py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold transition"
            >
              {isIos ? 'طريقة التثبيت' : 'تثبيت التطبيق'}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition"
            >
              لاحقاً
            </button>
          </div>
        </div>
      </div>

      {showGuide && <IosGuideModal onClose={() => setShowGuide(false)} />}
    </>,
    document.body
  );
}

/* ================= 2. المكون الثابت في السايد بار ================= */

/**
 * يظهر في تابة السايد بار بشكل ثابت إذا كان التطبيق غير مُثبّت
 */
export function AdminInstallButton({ className = '' }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const ios = detectIos();
    setIsIos(ios);

    const listener = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
      if (isStandalone()) {
        setInstalled(true);
      }
    };

    promptListeners.add(listener);
    return () => {
      promptListeners.delete(listener);
    };
  }, []);

  const handleInstall = async () => {
    if (isIos) {
      setShowGuide(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuide(true);
    }
  };

  // لو التطبيق مثبت، ميظهرش في السايد بار
  if (installed) return null;


  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className={`lg:hidden w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-amber-400 hover:text-white hover:bg-neutral-800 transition ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>تثبيت التطبيق</span>
      </button>

      {/* نافذة الشرح للآيفون */}
      {showGuide &&
        typeof document !== 'undefined' &&
        createPortal(<IosGuideModal onClose={() => setShowGuide(false)} />, document.body)}
    </>
  );
}

/* ================= المكون الأساسي لـ Admin PWA ================= */

export default function AdminPWA() {
  useEffect(() => {
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

    addLink('manifest', '/manifest-admin.json');
    addLink('apple-touch-icon', '/icons/admin-icon-192.png');

    addMeta('theme-color', '#d97706');
    addMeta('apple-mobile-web-app-capable', 'yes');
    addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    addMeta('apple-mobile-web-app-title', 'الداشبورد');

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

  return <AdminFloatingPrompt />;
}