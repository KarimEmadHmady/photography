'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { ISiteSettings } from '../../../types';
import ImageUploader from '../../../components/ImageUploader';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
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
  const [primaryCtaText, setPrimaryCtaText] = useState('');
  const [primaryCtaUrl, setPrimaryCtaUrl] = useState('');

  // About Fields
  const [aboutBio, setAboutBio] = useState('');

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  useEffect(() => {
    api.admin
      .getSettings()
      .then((res) => {
        if (res.success && res.data) {
          const s = res.data;
          setSettings(s);
          setPhotographerName(s.photographerName || '');
          setPhone(s.contact?.phone || '');
          setWhatsappNumber(s.contact?.whatsappNumber || '');
          setDefaultWhatsappMessage(s.contact?.defaultWhatsappMessage || '');
          setInstagram(s.contact?.instagram || s.socialLinks?.instagram || '');
          setFacebook(s.contact?.facebook || s.socialLinks?.facebook || '');
          setCurrencyLabel(s.currencyLabel || 'جنيه');

          setHeroTitle(s.hero?.title || '');
          setHeroDescription(s.hero?.description || '');
          setHeroImageUrl(s.hero?.imageUrl || '');
          setPrimaryCtaText(s.hero?.primaryCtaText || '');
          setPrimaryCtaUrl(s.hero?.primaryCtaUrl || '');

          setAboutBio(s.about?.bio || '');

          setSeoTitle(s.defaultSeo?.title || '');
          setSeoDescription(s.defaultSeo?.description || '');
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر تحميل الإعدادات');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
          imageUrl: heroImageUrl,
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
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-500 text-xs">جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">إعدادات الموقع العامة</h1>
          <p className="text-xs text-gray-500 mt-1">
            إدارة بيانات المصور، أرقام التواصل والواتساب، إعدادات الـ SEO والقسم الرئيسي.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>حفظ التعديلات</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Basic Brand Info */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">هوية المصور والعملة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">اسم المصور / الاستوديو *</label>
            <input
              type="text"
              required
              value={photographerName}
              onChange={(e) => setPhotographerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">تسمية العملة</label>
            <input
              type="text"
              required
              value={currencyLabel}
              onChange={(e) => setCurrencyLabel(e.target.value)}
              placeholder="جنيه"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 2. Contact & WhatsApp */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">بيانات التواصل المباشر والواتساب</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">رقم الهاتف للاتصال</label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                dir="ltr"
                className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-gray-300 text-xs"
              />
              <Phone className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3.5" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">رقم الواتساب (مع الكود الدولي)</label>
            <div className="relative">
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="201012345678"
                dir="ltr"
                className="w-full px-3.5 py-2.5 pr-9 rounded-xl border border-gray-300 text-xs"
              />
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 absolute right-3 top-3.5" />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700">رسالة الواتساب الافتراضية</label>
          <input
            type="text"
            value={defaultWhatsappMessage}
            onChange={(e) => setDefaultWhatsappMessage(e.target.value)}
            placeholder="مرحباً، أود الاستفسار عن تفاصيل جلسات التصوير والأسعار."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">رابط حساب انستغرام</label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">رابط صفحة فيسبوك</label>
            <input
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/..."
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Hero Section Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">القسم الرئيسي (Hero Section)</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">عنوان البانر الرئيسي</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">الوصف الترحيبي</label>
            <textarea
              rows={2}
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">نص الزر الرئيسي</label>
              <input
                type="text"
                value={primaryCtaText}
                onChange={(e) => setPrimaryCtaText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">رابط الزر الرئيسي</label>
              <input
                type="text"
                value={primaryCtaUrl}
                onChange={(e) => setPrimaryCtaUrl(e.target.value)}
                dir="ltr"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
              />
            </div>
          </div>

          {/* Hero Image Upload */}
          <div className="space-y-2 pt-2">
            <ImageUploader
              label="صورة البانر الرئيسي (Hero Image)"
              onUploaded={(img) => setHeroImageUrl(img.url)}
              defaultAlt="Hero wedding image"
            />
            {heroImageUrl && (
              <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-gray-200">
                <img src={heroImageUrl} alt="Hero" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. About Bio */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">نبذة عن المصور (About Section)</h2>
        <div className="space-y-1">
          <textarea
            rows={3}
            value={aboutBio}
            onChange={(e) => setAboutBio(e.target.value)}
            placeholder="نبذة تعريفية مختصرة عن أسلوب وخبرة المصور..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
          />
        </div>
      </div>

      {/* 5. Default SEO Settings */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">إعدادات محركات البحث (SEO)</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">عنوان الصفحة الافتراضي (SEO Title)</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">الوصف الافتراضي (SEO Description)</label>
            <textarea
              rows={2}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
