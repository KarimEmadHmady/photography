'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Instagram, Facebook, Camera } from 'lucide-react';
import { api } from '../lib/api';
import { ISiteSettings } from '../types';

export default function Footer() {
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    api.public.getSettings().then((res) => {
      if (res.success && res.data) {
        setSettings(res.data);
      }
    }).catch(() => {});
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const phone = settings?.contact?.phone || '01000000000';
  const whatsapp = settings?.contact?.whatsappNumber || '201000000000';
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`;

  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Camera className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white">
                {settings?.photographerName || 'مصور فوتوغرافي'}
              </span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
              {settings?.about?.bio ||
                'توثيق أجمل لحظات الزفاف والسيشن في أرقى الأماكن الخارجية والقاعات الفاخرة باحترافية وجودة استثنائية.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">روابط سريعة</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-400 transition">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/regions" className="hover:text-amber-400 transition">
                  المناطق الجغرافية
                </Link>
              </li>
              <li>
                <Link href="/locations" className="hover:text-amber-400 transition">
                  أماكن التصوير
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-amber-400 transition">
                  الخدمات الإضافية
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">تواصل معنا</h3>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-2 hover:text-amber-400 transition"
              >
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span dir="ltr">{phone}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition text-emerald-400"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>واتساب مباشر</span>
              </a>
              {settings?.contact?.instagram && (
                <a
                  href={settings.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-pink-400 transition"
                >
                  <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                  <span>انستغرام</span>
                </a>
              )}
              {settings?.contact?.facebook && (
                <a
                  href={settings.contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-400 transition"
                >
                  <Facebook className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>فيسبوك</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>
            {settings?.footer?.copyrightText || 'جميع الحقوق محفوظة ©'} {new Date().getFullYear()}
          </p>
          <Link href="/admin/login" className="hover:text-neutral-400 transition">
            دخول المشرف
          </Link>
        </div>
      </div>
    </footer>
  );
}
