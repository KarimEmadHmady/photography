import { Image as ImageIcon, X } from 'lucide-react';
import { optimizeImageUrl } from '../../../lib/image';
import ImageUploader from '../../../components/ImageUploader';
import CoverImageField from '../../../components/admin/CoverImageField';
import { LocationFormValues, SetFormField } from '../types/location.types';
import SectionBox from '../../../components/admin/SectionBox';

interface Props {
    values: LocationFormValues;
    setField: SetFormField;
    onGalleryAdd: (img: any) => void;
    onGalleryAddMany: (imgs: any[]) => void;
    onGalleryRemove: (index: number) => void;
}

export default function ImagesSection({
    values,
    setField,
    onGalleryAdd,
    onGalleryAddMany,
    onGalleryRemove,
}: Props) {
    const { coverImage, gallery, name } = values;

    return (
        <SectionBox title="الصور">
            <CoverImageField
                label="صورة الغلاف الرئيسية للمكان"
                value={coverImage}
                alt={name}
                removeLabel="إزالة صورة الغلاف"
                onChange={(url) => setField('coverImage', url)}
            />

            <div className="space-y-2.5 pt-3 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    معرض صور المكان ({gallery.length} صورة)
                </h4>
                <ImageUploader
                    label="إضافة صور جديدة للمعرض (يمكنك تحديد عدة صور معاً)"
                    multiple={true}
                    onUploaded={onGalleryAdd}
                    onMultipleUploaded={onGalleryAddMany}
                    defaultAlt={name}
                />
                {gallery.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                        {gallery.map((img, i) => (
                            <div
                                key={img.publicId || i}
                                className="relative aspect-square rounded-xl overflow-hidden border border-gray-200"
                            >
                                <img
                                    src={optimizeImageUrl(img.url, { width: 250, quality: 'auto' })}
                                    alt={img.alt}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => onGalleryRemove(i)}
                                    aria-label={`حذف الصورة ${i + 1}`}
                                    className="absolute top-1 right-1 w-7 h-7 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SectionBox>
    );
}