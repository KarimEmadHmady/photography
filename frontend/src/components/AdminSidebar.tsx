'use client';

import React from 'react';
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
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, logout } = useAuth();

  const menuItems = [
    { name: 'نظرة عامة', href: '/admin', icon: LayoutDashboard },
    { name: 'المناطق الجغرافية', href: '/admin/regions', icon: MapPin },
    { name: 'أماكن التصوير', href: '/admin/locations', icon: Camera },
    { name: 'الخدمات الإضافية', href: '/admin/services', icon: Layers },
    { name: 'الصفحة الرئيسية', href: '/admin/homepage', icon: Home },
    { name: 'إعدادات الموقع', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-neutral-900 text-neutral-200 border-l border-neutral-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            ADM
          </div>
          <div>
            <h1 className="font-bold text-white text-base">لوحة التحكم</h1>
            <p className="text-xs text-neutral-400 truncate max-w-[140px]">
              {admin?.name || admin?.phone || 'المسؤول'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
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
      <div className="p-4 border-t border-neutral-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>معاينة الموقع العام</span>
          </span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
