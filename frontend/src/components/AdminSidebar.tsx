'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Camera,
  Layers,
  Home,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  User,
  Database,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AdminInstallButton } from './AdminPWA';

const menuItems = [
  { name: 'نظرة عامة', href: '/admin', icon: LayoutDashboard },
  { name: 'المناطق الجغرافية', href: '/admin/regions', icon: MapPin },
  { name: 'أماكن التصوير', href: '/admin/locations', icon: Camera },
  { name: 'الخدمات الإضافية', href: '/admin/services', icon: Layers },
  { name: 'الصفحة الرئيسية', href: '/admin/homepage', icon: Home },
  { name: 'إعدادات الموقع', href: '/admin/settings', icon: Settings },
  { name: 'النسخ الاحتياطي', href: '/admin/backup', icon: Database },
  { name: 'البيانات الشخصية', href: '/admin/profile', icon: User },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const displayName = admin?.name || admin?.phone || 'المسؤول';
  const initial = displayName.trim().charAt(0).toUpperCase();
  const avatarUrl = (admin as any)?.avatar || (admin as any)?.image || null;

  // اقفل القايمة لما الصفحة تتغير
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // قفل السكرول + Esc لما القايمة مفتوحة في الموبايل
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const Avatar = ({ size = 'md' }: { size?: 'sm' | 'md' }) => {
    const dims = size === 'sm' ? 'w-8 h-8 text-sm' : 'w-11 h-11 text-base';
    return (
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className={`${dims} rounded-full object-cover border border-amber-500/40`}
          />
        ) : (
          <div
            className={`${dims} rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold flex items-center justify-center shadow-sm`}
          >
            {initial}
          </div>
        )}
        <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-neutral-900" />
      </div>
    );
  };

  return (
    <>
      {/* شريط علوي — موبايل فقط */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between">
        <Link
          href="/admin/profile"
          className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition"
        >
          <Avatar size="sm" />
          <div className="min-w-0 leading-tight">
            <p className="text-[11px] text-neutral-300 group-hover:text-amber-400 font-medium truncate max-w-[160px] transition">
              {displayName}
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="فتح القائمة"
          aria-expanded={open}
          className={`w-10 h-10 rounded-lg text-neutral-200 hover:bg-neutral-800 flex items-center justify-center transition ${focusRing}`}
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* مسافة تعوّض الشريط العلوي — موبايل فقط
          (لو الـ layout عندك فيه pt للمحتوى، شيل السطر ده) */}
      <div className="lg:hidden h-14 shrink-0" aria-hidden="true" />

      {/* الخلفية المعتمة — موبايل */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* السايد بار */}
      <aside
        className={`fixed lg:sticky top-0 right-0 z-50 lg:z-auto h-dvh w-72 max-w-[85vw] lg:w-64 lg:max-w-none bg-neutral-900 text-neutral-200 border-l border-neutral-800 flex flex-col shrink-0 transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        aria-label="القائمة الجانبية"
      >
        {/* Brand Header */}
        <div className="p-4 lg:p-5 border-b border-neutral-800 flex items-center justify-between gap-3">
          <Link
            href="/admin/profile"
            className="flex items-center gap-3 min-w-0 group hover:opacity-90 transition"
            title="تعديل البيانات الشخصية"
          >
            <Avatar />
            <div className="min-w-0 leading-snug">
              <p className="text-xs font-semibold text-neutral-200 group-hover:text-amber-400 truncate max-w-[130px] transition">
                {displayName}
              </p>
              <span className="text-[10px] text-neutral-500 group-hover:text-amber-500/80 transition">
                مدير النظام
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
            className={`lg:hidden shrink-0 w-9 h-9 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 flex items-center justify-center transition ${focusRing}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto" aria-label="التنقل الرئيسي">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-3 px-3.5 py-3 lg:py-2.5 rounded-lg text-sm font-medium transition ${focusRing} ${
                  isActive
                    ? 'bg-amber-600 text-white font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 lg:p-4 border-t border-neutral-800 space-y-1.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="pb-1 lg:hidden">
            <AdminInstallButton />
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition ${focusRing}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>معاينة الموقع العام</span>
          </Link>
          <button
            type="button"
            onClick={logout}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition ${focusRing}`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}