/**
 * أداة تحسين وتسريع تحميل الصور تلقائياً (Image Optimizer Utility)
 * تحول الصور الكبيرة (Cloudinary / Unsplash) إلى نسخ مضغوطة بصيغة WebP / AVIF
 * مع تحديد العرض المناسب بدون استهلاك مساحة أو إبطاء المتصفح.
 */

export function optimizeImageUrl(
  url?: string | null,
  options?: {
    width?: number;
    quality?: 'auto' | 'good' | 'eco' | 'best' | number;
  }
): string {
  if (!url || typeof url !== 'string') return '';

  const width = options?.width || 800;
  const quality = options?.quality || 'auto';

  // 1. تحسين صور Cloudinary (تحويل لصيغة فوتوغرافية WebP/AVIF وتقليص الحجم 90%)
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    // التحقق إذا كانت الصورة تحتوي بالفعل على تحويلات
    const uploadIndex = url.indexOf('/image/upload/');
    if (uploadIndex !== -1) {
      const prefix = url.substring(0, uploadIndex + '/image/upload/'.length);
      const rest = url.substring(uploadIndex + '/image/upload/'.length);

      // إذا كانت تحتوي بالفعل على فلاتر فـ نتجنب التكرار، وإلا نضيف تحسين الأداء
      if (!rest.startsWith('f_auto') && !rest.startsWith('w_') && !rest.startsWith('q_')) {
        return `${prefix}f_auto,q_${quality},w_${width},c_limit/${rest}`;
      }
    }
  }

  // 2. تحسين صور Unsplash
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', width.toString());
      u.searchParams.set('q', quality === 'auto' ? '75' : quality.toString());
      return u.toString();
    } catch {
      return url;
    }
  }

  // 3. الصور المحلية أو السيرفرات الأخرى
  return url;
}
