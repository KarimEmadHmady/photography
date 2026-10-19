'use client';

import { Filter } from 'lucide-react';
import { IRegion } from '../../types';
import { chip } from './constants';

interface RegionFilterProps {
  regions: IRegion[];
  selectedRegion: string;
  regionsLoading: boolean;
  onSelectRegion: (slug: string) => void;
  onRetryRegions: () => void;
}

export function RegionFilter({
  regions,
  selectedRegion,
  regionsLoading,
  onSelectRegion,
  onRetryRegions,
}: RegionFilterProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-3 sm:p-4 space-y-2.5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700">
          <Filter className="w-3.5 h-3.5 text-amber-600" />
          <span>تصفية بالمنطقة</span>
        </span>
        {selectedRegion && (
          <button
            onClick={() => onSelectRegion('')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition"
          >
            مسح الفلتر
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          type="button"
          onClick={() => onSelectRegion('')}
          aria-pressed={selectedRegion === ''}
          className={chip(selectedRegion === '')}
        >
          كل المناطق
        </button>

        {regionsLoading && regions.length === 0 ? (
          <>
            <div className="h-8 w-20 bg-neutral-100 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-neutral-100 rounded-full animate-pulse" />
            <div className="h-8 w-28 bg-neutral-100 rounded-full animate-pulse" />
          </>
        ) : (
          regions.map((reg) => (
            <button
              key={reg._id}
              type="button"
              onClick={() => onSelectRegion(reg.slug)}
              aria-pressed={selectedRegion === reg.slug}
              className={chip(selectedRegion === reg.slug)}
            >
              {reg.name}
            </button>
          ))
        )}

        {!regionsLoading && regions.length === 0 && (
          <button
            type="button"
            onClick={onRetryRegions}
            className="text-xs text-amber-700 hover:underline px-2 py-1"
          >
            إعادة تحميل المناطق
          </button>
        )}
      </div>
    </div>
  );
}
