'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Share2, Copy, Check, X, ExternalLink } from 'lucide-react';

interface ShareOptions {
  title?: string;
  url?: string;
  text?: string;
}

interface ShareContextType {
  openShare: (options?: ShareOptions) => void;
  closeShare: () => void;
  isOpen: boolean;
}

const ShareContext = createContext<ShareContextType | null>(null);

export function useShare() {
  const ctx = useContext(ShareContext);
  if (!ctx) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return ctx;
}

export function ShareProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [shareData, setShareData] = useState({
    title: '',
    url: '',
    text: '',
  });
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Check if native sharing is available in the browser
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanNativeShare(true);
    }
  }, []);

  // Close share modal if navigating to admin
  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      setIsOpen(false);
    }
  }, [pathname]);

  const copyToClipboard = useCallback(async (textToCopy: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older or non-https contexts
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setShowToast(true);
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setShowToast(false), 3500);
      return true;
    } catch (err) {
      console.warn('Failed to copy link:', err);
      return false;
    }
  }, []);

  const openShare = useCallback(
    (options?: ShareOptions) => {
      // Don't open if inside admin dashboard
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        return;
      }

      const currentUrl =
        options?.url || (typeof window !== 'undefined' ? window.location.href : '');
      const currentTitle =
        options?.title ||
        (typeof document !== 'undefined'
          ? document.title
          : 'معرض تصوير مصطفى متولي');
      const currentText =
        options?.text || 'شاهد هذا المحتوى المميز من تصوير مصطفى متولي:';

      setShareData({
        title: currentTitle,
        url: currentUrl,
        text: currentText,
      });

      // 1. Copy link automatically to clipboard
      if (currentUrl) {
        copyToClipboard(currentUrl);
      }

      // 2. Open the popup modal
      setIsOpen(true);
    },
    [copyToClipboard]
  );

  const closeShare = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close with Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeShare();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeShare]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const encodedUrl = encodeURIComponent(shareData.url);
  const encodedText = encodeURIComponent(`${shareData.text}\n${shareData.url}`);
  const encodedTitle = encodeURIComponent(shareData.title);

  const socialChannels = [
    {
      name: 'واتساب',
      english: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedText}`,
      bg: 'bg-[#25D366] hover:bg-[#1EBE5D] text-white',
      border: 'border-[#20ba59]',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.301-.778.978-.954 1.179-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.799-1.5-1.786-1.676-2.087-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.678-1.635-.929-2.239-.245-.589-.494-.509-.678-.518l-.578-.01c-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.2 2.124 3.243 5.145 4.549.719.31 1.281.496 1.719.635.723.23 1.38.197 1.9.12.58-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.076-.126-.276-.201-.577-.351zm-5.467 7.618a9.932 9.932 0 01-5.064-1.39l-.363-.215-3.763.987 1.005-3.669-.236-.376a9.92 9.92 0 01-1.523-5.26c0-5.495 4.475-9.97 9.975-9.97a9.914 9.914 0 017.051 2.923 9.916 9.916 0 012.924 7.051c0 5.496-4.474 9.973-9.971 9.973h-.028zm8.508-18.479A11.905 11.905 0 0012.005.002C5.385.002.003 5.384.003 12.004a11.9 11.9 0 001.621 5.99L0 24l6.175-1.62a11.933 11.933 0 005.83 1.517h.005c6.619 0 12.002-5.382 12.002-12.003a11.92 11.92 0 00-3.5-8.497z" />
        </svg>
      ),
    },
    {
      name: 'فيسبوك',
      english: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
      border: 'border-[#156adb]',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'ماسنجر',
      english: 'Messenger',
      href: `fb-messenger://share/?link=${encodedUrl}`,
      bg: 'bg-gradient-to-r from-[#00B2FF] to-[#006AFF] hover:opacity-95 text-white',
      border: 'border-[#0084FF]',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.077.299 2.222.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.89-3.259-6.56 6.963z" />
        </svg>
      ),
    },

  ];

  return (
    <ShareContext.Provider value={{ openShare, closeShare, isOpen }}>
      {children}

      {/* 1. إشعار منبثق فوري (Toast) عند النسخ */}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-900/95 text-white text-sm font-semibold shadow-2xl border border-neutral-700/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>تم نسخ الرابط بنجاح إلى الحافظة!</span>
        </div>
      )}

      {/* 2. النافذة المنبثقة (Popup Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={closeShare}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-7"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/50">
                  <Share2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3
                    id="share-modal-title"
                    className="text-lg font-bold text-neutral-900 leading-tight"
                  >
                    مشاركة الصفحة
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    اختر وسيلة المشاركة أو انسخ الرابط مباشرة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeShare}
                aria-label="إغلاق"
                className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* تم نسخ الرابط تلقائياً - تنبيه لطيف */}
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs sm:text-[13px] font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span>تم نسخ رابط الصفحة تلقائياً! يمكنك لصقه مباشرة أينما تريد.</span>
            </div>

            {/* حقل الرابط مع زر النسخ اليدوي */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                رابط الصفحة
              </label>
              <div className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl bg-neutral-50 border border-neutral-200/80 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition">
                <input
                  type="text"
                  readOnly
                  value={shareData.url}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 bg-transparent text-xs text-neutral-700 px-2 py-1 outline-none select-all truncate text-left"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(shareData.url)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 shadow-sm ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* أزرار التواصل الاجتماعي */}
            <div className="mb-4">
              <div className="text-xs font-semibold text-neutral-600 mb-3">
                المشاركة عبر التطبيقات
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {socialChannels.map((item) => (
                  <a
                    key={item.english}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-2xl border transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-sm hover:shadow-md ${item.bg} ${item.border}`}
                  >
                    {item.icon}
                    <span className="text-[12px] font-bold tracking-tight">
                      {item.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* زر المشاركة عبر النظام (Native Share على الهواتف والأجهزة المدعومة) */}
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition active:scale-[0.99]"
              >
                <ExternalLink className="w-4 h-4 text-neutral-600" />
                <span>مشاركة عبر خيارات أخرى في جهازك...</span>
              </button>
            )}
          </div>
        </div>
      )}
    </ShareContext.Provider>
  );
}

/**
 * زر مشاركة جاهز للاستخدام في أي مكان
 */
export function ShareButton({
  className = '',
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { openShare } = useShare();
  const pathname = usePathname();

  // لا يظهر في لوحة التحكم
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => openShare()}
      aria-label="مشاركة الصفحة"
      title="مشاركة الصفحة"
      className={
        className ||
        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-900/5 hover:bg-neutral-900/10 text-neutral-800 text-[13px] font-semibold transition border border-neutral-900/10'
      }
    >
      <Share2 className="w-4 h-4 text-amber-600 stroke-[2.2]" />
      {showLabel && <span>مشاركة</span>}
    </button>
  );
}
