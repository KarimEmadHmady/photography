'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { optimizeImageUrl } from '../../../lib/image';
import { ISiteSettings } from '../../../types';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';

const inputClass =
  'w-full h-12 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition';

export default function AdminLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { login } = useAuth();
  const router = useRouter();

  // نجيب صور الموقع (نفس صور الهيرو) عشان تظهر جنب الفورم
  useEffect(() => {
    api.public
      .getSettings()
      .then((res) => {
        if (res.success && res.data) setSettings(res.data);
      })
      .catch(() => {});
  }, []);

  const images: string[] = (
    settings?.hero?.images && settings.hero.images.length > 0
      ? settings.hero.images
      : settings?.hero?.imageUrl
      ? [settings.hero.imageUrl]
      : []
  ).filter(Boolean);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('يرجى إدخال رقم الهاتف وكلمة المرور');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(phone, password);
    } catch (err: any) {
      setError(err.message || 'بيانات الدخول غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-2">
      {/* ================= Form side ================= */}
      <div className="flex flex-col min-h-screen">
        {/* Mobile image banner */}
        {images.length > 0 && (
          <div className="relative h-40 sm:h-52 lg:hidden overflow-hidden bg-neutral-200">
            {images.map((url, idx) => (
              <img
                key={url + idx}
                src={optimizeImageUrl(url, { width: 640, quality: 'auto' })}
                alt=""
                aria-hidden="true"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 bg-top gpu-layer ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          </div>
        )}

        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8 lg:py-12">
          <div
            className={`w-full max-w-md space-y-7 text-right ${
              images.length > 0 ? '-mt-10 relative lg:mt-0' : ''
            }`}
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                  تسجيل دخول المشرف
                </h1>
                <span className="mt-3 block h-1 w-12 rounded-full bg-amber-500" />
                <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                  ادخل بياناتك للوصول إلى لوحة إدارة الموقع والمعرض.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-semibold text-neutral-800">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="username"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    dir="ltr"
                    className={`${inputClass} pr-11 pl-4`}
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-neutral-800">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`${inputClass} pr-11 pl-11`}
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition ${focusRing}`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full h-12 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${focusRing}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <span>دخول للوحة التحكم</span>
                )}
              </button>
            </form>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => router.push('/')}
                className={`inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-amber-700 transition rounded ${focusRing}`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة للموقع الرئيسي</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Image side (desktop) ================= */}
      <div className="hidden lg:block relative overflow-hidden bg-amber-50 border-r border-neutral-200">
        {images.length > 0 ? (
          <>
            {images.map((url, idx) => (
              <img
                key={url + idx}
                src={optimizeImageUrl(url, { width: 1200, quality: 'auto' })}
                alt=""
                aria-hidden="true"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                // @ts-ignore
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out gpu-layer ${
                  idx === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />

            <div className="absolute bottom-0 inset-x-0 p-10 text-white space-y-3 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold">
                <Camera className="w-3.5 h-3.5 text-amber-300" />
                <span>{settings?.photographerName || 'لوحة الإدارة'}</span>
              </div>


            </div>
          </>
        ) : (
          /* مفيش صور مرفوعة: خلفية برتقالية فاتحة بدل الصورة */
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 bg-gradient-to-br from-amber-50 via-white to-amber-100">
            <div className="w-24 h-24 rounded-3xl bg-white border border-amber-200 shadow-md flex items-center justify-center mb-6">
              <Camera className="w-11 h-11 text-amber-600 stroke-1" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">
              {settings?.photographerName || 'لوحة الإدارة'}
            </p>
            <p className="text-sm text-amber-700 mt-2">لحظات تدوم إلى الأبد</p>
          </div>
        )}
      </div>
    </div>
  );
}