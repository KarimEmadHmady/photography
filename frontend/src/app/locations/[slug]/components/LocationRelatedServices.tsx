'use client';

import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { IService } from '../../../../types';
import { focusRing } from './constants';
import { ScrollReveal } from '../../../../components/ui/ScrollReveal';

interface LocationRelatedServicesProps {
  services: IService[];
  currency: string;
}

export function LocationRelatedServices({
  services,
  currency,
}: LocationRelatedServicesProps) {
  if (!services || services.length === 0) return null;

  return (
    <section className="bg-amber-50 border border-amber-100 p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4">
      <ScrollReveal animation="fade-up" duration={700} delay={50}>
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-neutral-900">
            خدمات إضافية يمكنك طلبها مع هذه الجلسة
          </h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {services.map((service, idx) => (
          <ScrollReveal
            key={service._id}
            animation="fade-up"
            delay={80 + idx * 80}
            duration={700}
            distance={20}
            className="h-full"
          >
            <Link
              href={`/services/${service.slug}`}
              className={`group bg-white p-3 sm:p-4 rounded-xl border border-amber-100 hover:border-amber-300 hover:shadow-md lg:hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between gap-3 h-full ${focusRing}`}
            >
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-neutral-900 group-hover:text-amber-700 transition-colors truncate">
                  {service.name}
                </h3>
                <span className="text-xs text-amber-700 font-medium">
                  {service.price?.type === 'on_request'
                    ? 'السعر حسب الطلب'
                    : `${service.price?.amount} ${currency}`}
                </span>
              </div>
              <span className="shrink-0 w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <ArrowLeft className="w-4 h-4" />
              </span>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
