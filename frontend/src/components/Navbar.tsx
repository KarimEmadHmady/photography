'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Menu, X, Phone, MessageCircle, Shield } from 'lucide-react';
import { api } from '../lib/api';
import { ISiteSettings } from '../types';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    api.public.getSettings().then((res) => {
      if (res.success && res.data) {
        setSettings(res.data);
      }
    }).catch(() => {});
  }, []);

  // Do not show public navbar on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'المناطق', href: '/regions' },
    { name: 'أماكن التصوير', href: '/locations' },
    { name: 'الخدمات', href: '/services' },
  ];

  const whatsappUrl = settings?.contact?.whatsappNumber
    ? `https://wa.me/${settings.contact.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(settings.contact.defaultWhatsappMessage || '')}`
    : 'https://wa.me/';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Photographer Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:bg-amber-100 transition">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-gray-900 block">
                {settings?.photographerName || 'مصور فوتوغرافي'}
              </span>
              <span className="text-xs text-amber-700 block font-medium">جلسات تصوير وأفراح</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition ${
                    isActive ? 'text-amber-700 font-semibold border-b-2 border-amber-600 pb-1' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>واتساب</span>
            </a>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-50 text-xs transition"
              title="لوحة الإدارة"
            >
              <Shield className="w-4 h-4" />
              <span>لوحة التحكم</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="القائمة"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href ? 'bg-amber-50 text-amber-800' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>تواصل عبر واتساب</span>
            </a>
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              <span>لوحة تحكم المشرف</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
