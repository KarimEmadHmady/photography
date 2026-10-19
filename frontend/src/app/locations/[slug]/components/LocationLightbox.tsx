'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { IGalleryImage } from '../../../../types';
import { optimizeImageUrl } from '../../../../lib/image';

interface LocationLightboxProps {
  gallery: IGalleryImage[];
  activeImageIndex: number | null;
  locationName: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function LocationLightbox({
  gallery,
  activeImageIndex,
  locationName,
  onClose,
  onNavigate,
}: LocationLightboxProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const isOpen = activeImageIndex !== null;
  const galleryLength = gallery.length;

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // RTL: ArrowLeft = التالي (Next), ArrowRight = السابق (Prev)
      if (e.key === 'ArrowLeft') {
        if (activeImageIndex !== null && activeImageIndex < galleryLength - 1) {
          onNavigate(activeImageIndex + 1);
        }
      }
      if (e.key === 'ArrowRight') {
        if (activeImageIndex !== null && activeImageIndex > 0) {
          onNavigate(activeImageIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, activeImageIndex, galleryLength, onClose, onNavigate]);

  if (!isOpen || activeImageIndex === null) return null;

  const activeImage = gallery[activeImageIndex];
  if (!activeImage) return null;

  const goPrev = () => {
    if (activeImageIndex > 0) onNavigate(activeImageIndex - 1);
  };

  const goNext = () => {
    if (activeImageIndex < galleryLength - 1) onNavigate(activeImageIndex + 1);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    // RTL: السحب لليسار = التالي
    if (dx < -50) goNext();
    if (dx > 50) goPrev();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-neutral-900/95 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="معرض الصور"
      onClick={onClose}
      onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={onClose}
        aria-label="إغلاق"
        className="absolute top-3 right-3 sm:top-5 sm:right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
      >
        <X className="w-6 h-6" />
      </button>

      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
        {activeImageIndex + 1} / {galleryLength}
      </span>

      {/* السابق (يمين في RTL) */}
      {activeImageIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="الصورة السابقة"
          className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-50"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* التالي (شمال في RTL) */}
      {activeImageIndex < galleryLength - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="الصورة التالية"
          className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <div
        className="max-w-5xl w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={optimizeImageUrl(activeImage.url, { width: 1400, quality: 'auto' })}
          alt={activeImage.alt || locationName}
          decoding="async"
          className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl gpu-layer"
        />
        {activeImage.alt && (
          <p className="text-white/90 text-xs mt-3 text-center px-8">{activeImage.alt}</p>
        )}
      </div>
    </div>
  );
}
