'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { noScrollbar } from './constants';
import { ScrollReveal } from '../../../../components/ui/ScrollReveal';

interface LocationBreadcrumbsProps {
  locationName: string;
  regionName: string;
  regionSlug?: string;
}

export function LocationBreadcrumbs({
  locationName,
  regionName,
  regionSlug,
}: LocationBreadcrumbsProps) {
  return (
    <ScrollReveal animation="fade-down" duration={650} delay={50}>
      <nav
        className={`flex items-center gap-1.5 text-xs text-neutral-500 overflow-x-auto whitespace-nowrap ${noScrollbar}`}
        aria-label="مسار التنقل"
      >
      <Link href="/" className="hover:text-amber-700 transition shrink-0">
        الرئيسية
      </Link>
      <ChevronLeft className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      <Link href="/regions" className="hover:text-amber-700 transition shrink-0">
        المناطق
      </Link>
      <ChevronLeft className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      {regionSlug ? (
        <Link
          href={`/regions/${regionSlug}`}
          className="hover:text-amber-700 transition shrink-0"
        >
          {regionName}
        </Link>
      ) : (
        <span className="shrink-0">{regionName}</span>
      )}
      <ChevronLeft className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
      <span className="text-neutral-900 font-bold shrink-0">{locationName}</span>
    </nav>
    </ScrollReveal>
  );
}
