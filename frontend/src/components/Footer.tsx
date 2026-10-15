'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Instagram, Facebook, Camera } from 'lucide-react';
import { api } from '../lib/api';
import { ISiteSettings } from '../types';

const footerLink =
  'text-neutral-400 hover:text-amber-400 transition rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500';

export default function Footer() {
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

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const phone = settings?.contact?.phone || '01000000000';
  const whatsapp = settings?.contact?.whatsappNumber || '201000000000';
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`;

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t-4 border-amber-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-center md:text-start">
          {/* Brand */}
          <div className="md:col-span-2 w-full space-y-4 flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center md:justify-start gap-3 w-full">
              <div className="w-11 h-11 rounded-full bg-amber-600 flex items-center justify-center text-white shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white">
                {settings?.photographerName || 'مصور فوتوغرافي'}
              </span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md mx-auto md:mx-0 text-center md:text-start">
              {settings?.about?.bio ||
                'توثيق أجمل لحظات الزفاف والسيشن في أرقى الأماكن الخارجية والقاعات الفاخرة باحترافية وجودة استثنائية.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="w-full flex flex-col items-center md:items-start">
            <h3 className="text-white font-semibold text-sm mb-4">روابط سريعة</h3>
            <ul className="space-y-3 text-sm flex flex-col items-start w-fit md:w-full">
              <li>
                <Link href="/" className={footerLink}>
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/regions" className={footerLink}>
                  المناطق الجغرافية
                </Link>
              </li>
              <li>
                <Link href="/locations" className={footerLink}>
                  أماكن التصوير
                </Link>
              </li>
              <li>
                <Link href="/services" className={footerLink}>
                  الخدمات الإضافية
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="w-full flex flex-col items-center md:items-start">
            <h3 className="text-white font-semibold text-sm mb-4">تواصل معنا</h3>
            <div className="space-y-3 text-sm flex flex-col items-start w-fit md:w-full">
              <a
                href={`tel:${phone}`}
                className={`flex items-center justify-start gap-2.5 ${footerLink}`}
              >
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span dir="ltr">{phone}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-start gap-2.5 ${footerLink}`}
              >
                <MessageCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>واتساب مباشر</span>
              </a>
              {settings?.contact?.instagram && (
                <a
                  href={settings.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-start gap-2.5 ${footerLink}`}
                >
                  <Instagram className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>انستغرام</span>
                </a>
              )}
              {settings?.contact?.facebook && (
                <a
                  href={settings.contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-start gap-2.5 ${footerLink}`}
                >
                  <Facebook className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>فيسبوك</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-center sm:justify-between text-center sm:text-start text-xs text-neutral-500 gap-4">
          <p className="w-full sm:w-auto text-center sm:text-start">
            {settings?.footer?.copyrightText || 'جميع الحقوق محفوظة ©'} {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}