'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';
const inputCls =
  'w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-gray-300 text-base sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition placeholder:text-gray-400';
const iconInputCls = `${inputCls} pr-10 sm:pr-9`;
const labelCls = 'block text-xs font-semibold text-gray-700';

function SectionPanel({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-200 shadow-xs space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AdminProfilePage() {
  const { admin, refreshMe } = useAuth();

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Populate data from admin context
  useEffect(() => {
    if (admin) {
      setName(admin.name || '');
      setEmail(admin.email || '');
      setPhone(admin.phone || '');
    }
  }, [admin]);

  // Handle Profile Update (PATCH /admin/profile)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!name.trim()) {
      setProfileError('يرجى إدخال اسم المشرف');
      return;
    }
    if (!phone.trim()) {
      setProfileError('يرجى إدخال رقم الهاتف');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await api.admin.updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
      });

      if (res.success) {
        setProfileSuccess(res.message || 'تم تحديث البيانات الشخصية بنجاح');
        await refreshMe();
        setTimeout(() => setProfileSuccess(null), 4000);
      } else {
        setProfileError(res.message || 'تعذر تحديث البيانات الشخصية');
      }
    } catch (err: any) {
      setProfileError(err.message || 'فشل حفظ التعديلات');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change (PATCH /admin/change-password)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('يرجى إدخال كلمة المرور الحالية');
      return;
    }
    if (!newPassword) {
      setPasswordError('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await api.admin.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setPasswordSuccess(res.message || 'تم تغيير كلمة المرور بنجاح');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 4000);
      } else {
        setPasswordError(res.message || 'تعذر تغيير كلمة المرور');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'فشل تغيير كلمة المرور');
    } finally {
      setSavingPassword(false);
    }
  };

  // Format Date for Last Login
  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'غير متوفر';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            البيانات الشخصية والأمان
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
            إدارة بيانات حساب المشرف المسجل وكلمة المرور الخاصة بلوحة التحكم.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Forms (2 Columns on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* ================= 1. Personal Profile ================= */}
          <SectionPanel
            title="تعديل البيانات الشخصية"
            subtitle="الاسم ورقم الهاتف والبريد الإلكتروني المرتبط بحسابك"
            icon={User}
          >
            {profileSuccess && (
              <div
                role="status"
                className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
                <button
                  onClick={() => setProfileSuccess(null)}
                  className="text-emerald-600 hover:text-emerald-800"
                  aria-label="إغلاق"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {profileError && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{profileError}</span>
                </div>
                <button
                  onClick={() => setProfileError(null)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="إغلاق"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>الاسم الكامل *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: مصطفى متولي"
                    className={iconInputCls}
                  />
                  <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>رقم الهاتف (يُستخدم لتسجيل الدخول) *</label>
                <div className="relative">
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="مثال: 01000000000"
                    dir="ltr"
                    className={`${iconInputCls} font-mono`}
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-gray-400">
                  تنبيه: في حال تعديل رقم الهاتف، ستقوم باستخدامه في المرة القادمة لتسجيل الدخول.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={labelCls}>البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="مثال: admin@photography.com"
                    dir="ltr"
                    className={`${iconInputCls} font-mono`}
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 ${focusRing}`}
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري حفظ البيانات...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>حفظ البيانات الشخصية</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </SectionPanel>

          {/* ================= 2. Change Password ================= */}
          <SectionPanel
            title="تغيير كلمة المرور"
            subtitle="يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل"
            icon={KeyRound}
          >
            {passwordSuccess && (
              <div
                role="status"
                className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
                <button
                  onClick={() => setPasswordSuccess(null)}
                  className="text-emerald-600 hover:text-emerald-800"
                  aria-label="إغلاق"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {passwordError && (
              <div
                role="alert"
                className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{passwordError}</span>
                </div>
                <button
                  onClick={() => setPasswordError(null)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="إغلاق"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelCls}>كلمة المرور الحالية *</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`${inputCls} pr-10 pl-10 font-mono`}
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    aria-label={showCurrentPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelCls}>كلمة المرور الجديدة *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8 أحرف كحد أدنى"
                      dir="ltr"
                      className={`${inputCls} pr-10 pl-10 font-mono`}
                    />
                    <KeyRound className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      aria-label={showNewPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>تأكيد كلمة المرور الجديدة *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة كلمة المرور"
                      dir="ltr"
                      className={`${inputCls} pr-10 pl-10 font-mono`}
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 ${focusRing}`}
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري تحديث كلمة المرور...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>تحديث كلمة المرور</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </SectionPanel>
        </div>

        {/* Right Side: Account Overview Card (1 Column) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white p-6 rounded-2xl shadow-md border border-neutral-700 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg shadow-inner">
                {name?.trim() ? name.trim().charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-white truncate">{name || 'مشرف النظام'}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  حساب نشط (Super Admin)
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-neutral-800 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>الصلاحية:</span>
                <span className="font-semibold text-neutral-200">مدير كامل الصلاحيات</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>الهاتف الأساسي:</span>
                <span className="font-mono text-neutral-200" dir="ltr">
                  {phone || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>البريد الإلكتروني:</span>
                <span className="font-mono text-neutral-200 truncate max-w-[150px]" dir="ltr">
                  {email || '—'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-neutral-800/80 rounded-xl border border-neutral-700/60 space-y-1">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                آخر تسجيل دخول
              </span>
              <p className="text-xs font-medium text-neutral-200">
                {formatLastLogin(admin?.lastLoginAt)}
              </p>
            </div>
          </div>

          {/* Security Tips Box */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>نصائح أمان الحساب</span>
            </h4>
            <ul className="text-xs text-amber-800 space-y-2 leading-relaxed list-disc list-inside">
              <li>استخدم كلمة مرور قوية تحتوي على أرقام وحروف ورموز خاصة.</li>
              <li>لا تشارك بيانات الدخول مع أي شخص آخر للحفاظ على أمان المعرض.</li>
              <li>عند تغيير رقم الهاتف، تأكد من حفظه لأنك ستستخدمه في الدخول.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
