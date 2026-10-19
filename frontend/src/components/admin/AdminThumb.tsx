import type { LucideIcon } from 'lucide-react';
import { optimizeImageUrl } from '../../lib/image';

interface Props {
  src?: string;
  alt: string;
  cls: string;
  icon: LucideIcon;
  iconCls?: string;
}

export default function AdminThumb({
  src,
  alt,
  cls,
  icon: Icon,
  iconCls = 'text-gray-400',
}: Props) {
  return src ? (
    <img
      src={optimizeImageUrl(src, { width: 160, quality: 'auto' })}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`${cls} rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0 gpu-layer`}
    />
  ) : (
    <div
      className={`${cls} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center ${iconCls} shrink-0`}
    >
      <Icon className="w-5 h-5" />
    </div>
  );
}