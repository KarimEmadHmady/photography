'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { IService } from '../../types';
import { container, focusRing, SectionHeading } from './HomeCommon';

interface HomeFeaturedServicesProps {
  services: IService[];
  currency: string;
}

export function HomeFeaturedServices({ services, currency }: HomeFeaturedServicesProps) {
  if (!services || services.length === 0) return null;

  return (
    <section className="content-auto bg-amber-50 py-10 lg:py-14">
      <div className={container}>
        <SectionHeading
          align="center"
          title="باقات وخدمات متكاملة ليومك المميز"
          subtitle="خدمات إضافية تكمل جلسة التصوير وتمنحك تجربة كاملة."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {services.map((service) => (
            <Link
              key={service._id}
              href={`/services/${service.slug}`}
              className={`relative bg-white rounded-xl p-5 border border-amber-100 hover:border-amber-300 hover:shadow-md transition text-right group flex flex-col justify-between overflow-hidden ${focusRing}`}
            >
              <span className="absolute top-0 inset-x-0 h-1 bg-amber-600 group-hover:bg-amber-500 transition" />
              <div className="space-y-2 pt-1">
                <h3 className="font-bold text-base lg:text-lg text-neutral-900 group-hover:text-amber-700 transition">
                  {service.name}
                </h3>
                {service.shortDescription && (
                  <p className="text-xs lg:text-sm text-neutral-600 leading-relaxed line-clamp-3">
                    {service.shortDescription}
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-700">
                  {service.price?.type === 'on_request'
                    ? 'السعر حسب الطلب'
                    : `${service.price?.amount} ${currency}`}
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-500 group-hover:text-neutral-900 transition">
                  <span>عرض التفاصيل</span>
                  <ArrowLeft className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
