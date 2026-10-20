import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { focusRing } from './HomeCommon';
import { ScrollReveal } from '../ui/ScrollReveal';

interface HomeContactCtaProps {
  whatsappUrl: string;
  phone?: string;
}

export function HomeContactCta({ whatsappUrl, phone }: HomeContactCtaProps) {
  return (
    <section id="contact" className="content-auto bg-white pb-10 lg:pb-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="zoom-in" duration={800}>
          <div className="relative overflow-hidden rounded-2xl bg-amber-600 text-white p-6 sm:p-8 text-center space-y-4 shadow-lg">
            <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-amber-500/60 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-neutral-900/20 blur-2xl" />

            <ScrollReveal animation="fade-down" delay={150} duration={700}>
              <h2 className="relative text-xl sm:text-2xl font-bold">
                جاهز لحجز جلسة تصوير لا تُنسى؟
              </h2>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={300} duration={700}>
              <p className="relative text-amber-50 text-sm max-w-xl mx-auto leading-relaxed">
                يسعدنا الرد على جميع استفساراتك حول المواعيد والأسعار والباقات الإضافية مباشرة عبر واتساب
                أو المكالمات الهاتفية.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={450} duration={700}>
              <div className="relative flex flex-wrap items-center justify-center gap-3 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 shadow-md transition ${focusRing} focus-visible:ring-offset-amber-600`}
                >
                  <MessageCircle className="w-5 h-5 text-amber-400" />
                  <span>مراسلة عبر واتساب</span>
                </a>

                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-neutral-900 text-sm font-semibold hover:bg-amber-50 shadow-md transition ${focusRing} focus-visible:ring-offset-amber-600`}
                  >
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span dir="ltr">{phone}</span>
                  </a>
                )}
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
