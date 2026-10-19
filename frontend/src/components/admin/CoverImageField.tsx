import { X } from 'lucide-react';
import { optimizeImageUrl } from '../../lib/image';
import ImageUploader from '../ImageUploader';

interface Props {
  label: string;
  value: string;
  alt: string;
  previewAlt?: string;
  removeLabel?: string;
  onChange: (url: string) => void;
}

export default function CoverImageField({
  label,
  value,
  alt,
  previewAlt = 'غلاف',
  removeLabel = 'إزالة الصورة',
  onChange,
}: Props) {
  return (
    <div className="space-y-2">
      <ImageUploader label={label} onUploaded={(img) => onChange(img.url)} defaultAlt={alt} />
      {value && (
        <div className="relative aspect-[16/9] max-h-48 w-full rounded-xl overflow-hidden border border-gray-200">
          <img
            src={optimizeImageUrl(value, { width: 600, quality: 'auto' })}
            alt={previewAlt}
            decoding="async"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={removeLabel}
            className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}