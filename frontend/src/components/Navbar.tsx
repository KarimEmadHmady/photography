'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Menu, X, MessageCircle, Shield } from 'lucide-react';
import { api } from '../lib/api';
import { ISiteSettings } from '../types';
import { ShareButton } from './ShareModal';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    api.public
      .getSettings()
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const whatsappUrl = settings?.contact?.whatsappNumber
    ? `https://wa.me/${settings.contact.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        settings.contact.defaultWhatsappMessage || ''
      )}`
    : 'https://wa.me/';

  return (
<header
  className={`fixed top-0 inset-x-3 sm:inset-x-6 mt-3 sm:mt-4 max-w-6xl mx-auto z-50 bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/30 shadow-lg shadow-black/10 transition-[border-radius] duration-200 ease-out ${
    isOpen ? 'rounded-[24px]' : 'rounded-[32px]'
  }`}
>
      <div className="flex items-center justify-between gap-2 h-14 sm:h-16 pe-3 ps-2.5 sm:pe-5 sm:ps-3">
        {/* Logo / Photographer Name */}
        <Link
          href="/"
          className={`flex items-center gap-2.5 group min-w-0 rounded-full ${focusRing}`}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full bg-neutral-900 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition">
            <Camera className="w-[18px] h-[18px]" />
          </div>
          <div className="leading-tight min-w-0">
            <span className="font-bold text-sm sm:text-base text-neutral-900 block truncate">
              {settings?.photographerName || 'مصور فوتوغرافي'}
            </span>
            <span className="text-[10px] sm:text-xs text-amber-700 block font-medium truncate">
              جلسات تصوير وأفراح
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition ${focusRing} ${
                isActive(link.href)
                  ? 'text-amber-700 bg-amber-50 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <ShareButton
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-900/5 hover:bg-amber-500/10 text-neutral-800 hover:text-amber-700 text-[13px] font-semibold transition border border-neutral-900/10 hover:border-amber-500/30 ${focusRing}`}
          />
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-600 text-white text-[13px] font-semibold hover:bg-amber-700 shadow-sm transition ${focusRing}`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب</span>
          </a>
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-1.5 shrink-0">
          <ShareButton
            showLabel={false}
            className={`w-9 h-9 rounded-full bg-neutral-900/5 hover:bg-amber-500/10 text-neutral-800 hover:text-amber-700 flex items-center justify-center transition border border-neutral-900/10 ${focusRing}`}
          />
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="واتساب"
            className={`w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center hover:bg-amber-700 transition ${focusRing}`}
          >
            <MessageCircle className="w-[18px] h-[18px]" />
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-neutral-800 hover:bg-neutral-900/5 transition ${focusRing}`}
            aria-label="القائمة"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-neutral-900/10 px-3 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2.5 rounded-2xl text-sm font-medium transition ${
                isActive(link.href)
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-neutral-700 hover:bg-neutral-900/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 px-1">
            <ShareButton
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-neutral-100 hover:bg-amber-50 text-neutral-800 hover:text-amber-800 text-sm font-semibold transition border border-neutral-200"
            />
          </div>
        </div>
      )}
    </header>
  );
}