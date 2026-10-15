'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Phone,
  MessageCircle,
  X,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { ISiteSettings } from '../../../types';
import ImageUploader from '../../../components/ImageUploader';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';
const inputCls =
  'w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-gray-300 text-base sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
const iconInputCls = `${inputCls} pr-10 sm:pr-9`;
const labelCls = 'block text-xs font-semibold text-gray-700';

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs space-y-3.5 sm:space-y-4">
      <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">{title}</h2>
      {children}
    </section>
  );
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [photographerName, setPhotographerName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [defaultWhatsappMessage, setDefaultWhatsappMessage] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [currencyLabel, setCurrencyLabel] = useState('جنيه');

  // Hero Fields
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [primaryCtaText, setPrimaryCtaText] = useState('');
  const [primaryCtaUrl, setPrimaryCtaUrl] = useState('');

  // About Fields
  const [aboutBio, setAboutBio] = useState('');

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // آخر حالة اتحفظت (للمقارنة)
  const savedRef = useRef<string>('');
  const [savedTick, setSavedTick] = useState(0);

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        photographerName,
        phone,
        whatsappNumber,
        defaultWhatsappMessage,
        instagram,
        facebook,
        currencyLabel,
        heroTitle,
        heroDescription,
        heroImages,
        primaryCtaText,
        primaryCtaUrl,
        aboutBio,
        seoTitle,
        seoDescription,
      }),
    [
      photographerName,
      phone,
      whatsappNumber,
      defaultWhatsappMessage,
      instagram,
      facebook,
      currencyLabel,
      heroTitle,
      heroDescription,
      heroImages,
      primaryCtaText,
      primaryCtaUrl,
      aboutBio,
      seoTitle,
      seoDescription,
    ]
  );

  // أول ما البيانات تتحمل، نخزن الحالة الأصلية
  useEffect(() => {
    api.admin
      .getSettings()
      .then((res) => {
        if (res.success && res.data) {
          const s = res.data;
          setPhotographerName(s.photographerName || '');
          setPhone(s.contact?.phone || '');
          setWhatsappNumber(s.contact?.whatsappNumber || '');
          setDefaultWhatsappMessage(s.contact?.defaultWhatsappMessage || '');
          setInstagram(s.contact?.instagram || s.socialLinks?.instagram || '');
          setFacebook(s.contact?.facebook || s.socialLinks?.facebook || '');
          setCurrencyLabel(s.currencyLabel || 'جنيه');

          setHeroTitle(s.hero?.title || '');
          setHeroDescription(s.hero?.description || '');
          const heroImgs: string[] =
            Array.isArray(s.hero?.images) && s.hero.images.length > 0
              ? s.hero.images
              : s.hero?.imageUrl
              ? [s.hero.imageUrl]
              : [];
          setHeroImages(heroImgs);
          setHeroImageUrl(s.hero?.imageUrl || heroImgs[0] || '');
          setPrimaryCtaText(s.hero?.primaryCtaText || '');
          setPrimaryCtaUrl(s.hero?.primaryCtaUrl || '');

          setAboutBio(s.about?.bio || '');

          setSeoTitle(s.defaultSeo?.title || '');
          setSeoDescription(s.defaultSeo?.description || '');

          // نخلي المقارنة بعد ما الـ state يتحدّث
          setSavedTick((t) => t + 1);
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر تحميل الإعدادات');
      })
      .finally(() => setLoading(false));
  }, []);

  // بعد التحميل الأولي أو بعد الحفظ، نثبّت الحالة المحفوظة
  useEffect(() => {
    if (savedTick > 0) savedRef.current = currentSnapshot;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedTick]);

  const isDirty = !loading && savedRef.current !== '' && currentSnapshot !== savedRef.current;

  // تحذير لو حاول يقفل الصفحة وفيه تعديلات مش محفوظة
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const handleAddHeroImage = (img: { url: string }) => {
    if (heroImages.length >= 4) {
      setError('الحد الأقصى لصور البانر الرئيسي هو 4 صور');
      return;
    }
    const updated = [...heroImages, img.url];
    setHeroImages(updated);
    setHeroImageUrl(updated[0] || '');
  };

  const handleRemoveHeroImage = (indexToRemove: number) => {
    const updated = heroImages.filter((_, idx) => idx !== indexToRemove);
    setHeroImages(updated);
    setHeroImageUrl(updated[0] || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload: Partial<ISiteSettings> = {
        photographerName,
        currencyLabel,
        contact: {
          phone,
          whatsappNumber,
          defaultWhatsappMessage,
          instagram,
          facebook,
        },
        socialLinks: {
          instagram,
          facebook,
        },
        hero: {
          title: heroTitle,
          description: heroDescription,
          imageUrl: heroImages[0] || heroImageUrl,
          images: heroImages,
          primaryCtaText,
          primaryCtaUrl,
          secondaryCtaText: 'تواصل عبر واتساب',
          secondaryCtaUrl: `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`,
        },
        about: {
          bio: aboutBio,
        },
        defaultSeo: {
          title: seoTitle,
          description: seoDescription,
        },
      };

      await api.admin.updateSettings(payload);
      savedRef.current = currentSnapshot;
      setSavedTick((t) => t + 1);
      setSuccessMsg('تم حفظ وتحديث إعدادات الموقع بنجاح');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-500 text-xs">جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      {/*
        شريط الحفظ — sticky
        موبايل: تحت الشريط العلوي (h-14) | كمبيوتر: top-0
        الـ -mx بتفترض إن الـ main عليه p-4 sm:p-6 lg:p-8
      */}
      <div className="sticky top-14 lg:top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 bg-neutral-50/90 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold text-gray-900 truncate">
              إعدادات الموقع العامة
            </h1>
            <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
              إدارة بيانات المصور، أرقام التواصل والواتساب، إعدادات الـ SEO والقسم الرئيسي.
            </p>
            {isDirty && (
              <span className="sm:hidden inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                تعديلات غير محفوظة
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isDirty && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                تعديلات غير محفوظة
              </span>
            )}
            <button
              type="submit"
              disabled={saving || !isDirty}
              className={`inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-white font-semibold text-sm sm:text-xs shadow-xs transition disabled:cursor-not-allowed ${focusRing} ${
                isDirty ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800' : 'bg-gray-300'
              } ${saving ? 'opacity-70' : ''}`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="إغلاق"
            className="shrink-0 p-1 text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Basic Brand Info */}
      <Panel title="هوية المصور والعملة">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>اسم المصور / الاستوديو *</label>
            <input
              type="text"
              required
              value={photographerName}
              onChange={(e) => setPhotographerName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>تسمية العملة</label>
            <input
              type="text"
              required
              value={currencyLabel}
              onChange={(e) => setCurrencyLabel(e.target.value)}
              placeholder="جنيه"
              className={inputCls}
            />
          </div>
        </div>
      </Panel>

      {/* 2. Contact & WhatsApp */}
      <Panel title="بيانات التواصل المباشر والواتساب">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>رقم الهاتف للاتصال</label>
            <div className="relative">
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                dir="ltr"
                className={`${iconInputCls} text-left`}
              />
              <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>رقم الواتساب (مع الكود الدولي)</label>
            <div className="relative">
              <input
                type="tel"
                inputMode="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="201012345678"
                dir="ltr"
                className={`${iconInputCls} text-left`}
              />
              <MessageCircle className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>رسالة الواتساب الافتراضية</label>
          <input
            type="text"
            value={defaultWhatsappMessage}
            onChange={(e) => setDefaultWhatsappMessage(e.target.value)}
            placeholder="مرحباً، أود الاستفسار عن تفاصيل جلسات التصوير والأسعار."
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
          <div className="space-y-1.5">
            <label className={labelCls}>رابط حساب انستغرام</label>
            <input
              type="url"
              inputMode="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
              dir="ltr"
              autoCapitalize="none"
              className={`${inputCls} text-left`}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>رابط صفحة فيسبوك</label>
            <input
              type="url"
              inputMode="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/..."
              dir="ltr"
              autoCapitalize="none"
              className={`${inputCls} text-left`}
            />
          </div>
        </div>
      </Panel>

      {/* 3. Hero Section Configuration */}
      <Panel title="القسم الرئيسي (Hero Section)">
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className={labelCls}>عنوان البانر الرئيسي</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>الوصف الترحيبي</label>
            <textarea
              rows={2}
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <label className={labelCls}>نص الزر الرئيسي</label>
              <input
                type="text"
                value={primaryCtaText}
                onChange={(e) => setPrimaryCtaText(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelCls}>رابط الزر الرئيسي</label>
              <input
                type="text"
                value={primaryCtaUrl}
                onChange={(e) => setPrimaryCtaUrl(e.target.value)}
                dir="ltr"
                autoCapitalize="none"
                className={`${inputCls} text-left`}
              />
            </div>
          </div>

          {/* Hero Slider Images Upload (Up to 4 images) */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <label className="block text-xs font-bold text-gray-800">
                  صور سليدر البانر الرئيسي (حتى 4 صور)
                </label>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  تتنقل الصور تلقائياً على الموقع بأنيميشن ناعم وسلس في الخلفية والبانر.
                </p>
              </div>
              <span
                className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                  heroImages.length === 4
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {heroImages.length} من 4
              </span>
            </div>

            {heroImages.length < 4 ? (
              <ImageUploader
                label={`إضافة صورة جديدة للسليدر (الصورة رقم ${heroImages.length + 1})`}
                onUploaded={handleAddHeroImage}
                defaultAlt="Hero wedding image"
              />
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center font-medium">
                ✅ تم إضافة الحد الأقصى (4 صور). يمكنك حذف أي صورة لإضافة غيرها.
              </div>
            )}

            {heroImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
                {heroImages.map((url, i) => (
                  <div
                    key={url + i}
                    className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-gray-200 bg-neutral-900 shadow-xs"
                  >
                    <img src={url} alt={`Hero ${i + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {i === 0 ? 'الرئيسية (١)' : `صورة (${i + 1})`}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHeroImage(i)}
                      aria-label={`حذف الصورة ${i + 1}`}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* 4. About Bio */}
      <Panel title="نبذة عن المصور (About Section)">
        <textarea
          rows={4}
          value={aboutBio}
          onChange={(e) => setAboutBio(e.target.value)}
          placeholder="نبذة تعريفية مختصرة عن أسلوب وخبرة المصور..."
          className={inputCls}
        />
      </Panel>

      {/* 5. Default SEO Settings */}
      <Panel title="إعدادات محركات البحث (SEO)">
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className={labelCls}>عنوان الصفحة الافتراضي (SEO Title)</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>الوصف الافتراضي (SEO Description)</label>
            <textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </Panel>

      {/* زرار حفظ عائم — بيظهر أول ما يبقى فيه تعديلات، وبيفضل ثابت مع السكرول */}
      {isDirty && (
        <div className="fixed z-40 bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:left-6 pb-[env(safe-area-inset-bottom)] pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between sm:justify-start gap-3 p-2.5 sm:p-2 ps-4 rounded-2xl bg-neutral-900/95 backdrop-blur-md text-white shadow-2xl border border-white/10">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              تعديلات غير محفوظة
            </span>
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold text-sm sm:text-xs transition disabled:opacity-70 ${focusRing} focus-visible:ring-offset-neutral-900`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}