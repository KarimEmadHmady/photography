'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Phone, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

export default function AdminLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

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
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6 text-right">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900">تسجيل دخول المشرف</h1>
          <p className="text-xs text-neutral-500">لوحة إدارة موقع ومعرض تصوير حفلات الزفاف</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700">رقم الهاتف</label>
            <div className="relative">
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                dir="ltr"
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-neutral-700">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-sm"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
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

        <div className="text-center pt-2">
          <button
            onClick={() => router.push('/')}
            className="text-xs text-neutral-500 hover:text-neutral-800 transition"
          >
            ← العودة للموقع الرئيسي
          </button>
        </div>
      </div>
    </div>
  );
}
