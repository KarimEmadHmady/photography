import { Edit2, MapPin, Trash2 } from 'lucide-react';
import { ILocation } from '../../../types';
import { priceText, regionNameOf } from '../utils/location.utils';
import FeaturedBadge from './FeaturedBadge';
import StatusBadge from '../../../components/admin/StatusBadge';
import LocationThumb from './LocationThumb';

interface Props {
    locations: ILocation[];
    onEdit: (loc: ILocation) => void;
    onDelete: (loc: ILocation) => void;
}

export default function LocationsMobileList({ locations, onEdit, onDelete }: Props) {
    return (
        <div className="lg:hidden space-y-3 content-auto">
            {locations.map((loc) => (
                <div
                    key={loc._id}
                    className="bg-white rounded-xl border border-gray-200 shadow-xs p-3.5 space-y-3"
                >
                    <div className="flex items-start gap-3">
                        <LocationThumb loc={loc} cls="w-16 h-16" />
                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-sm text-gray-900 leading-snug">{loc.name}</h3>
                                <StatusBadge status={loc.status} />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-amber-600" />
                                    {regionNameOf(loc)}
                                </span>
                                {loc.isFeatured && <FeaturedBadge />}
                            </div>
                            <span className="block text-[11px] text-gray-400 font-mono truncate" dir="ltr">
                                /{loc.slug}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-neutral-50 border border-neutral-100 py-2 px-1">
                            <span className="block text-[10px] text-gray-500">سعر التصوير</span>
                            <span className="block text-xs font-bold text-gray-800 mt-0.5">
                                {priceText(loc.photographyPrice)}
                            </span>
                        </div>
                        <div className="rounded-lg bg-neutral-50 border border-neutral-100 py-2 px-1">
                            <span className="block text-[10px] text-gray-500">سعر القاعة</span>
                            <span className="block text-xs font-bold text-gray-800 mt-0.5">
                                {priceText(loc.venuePrice)}
                            </span>
                        </div>
                        <div className="rounded-lg bg-neutral-50 border border-neutral-100 py-2 px-1">
                            <span className="block text-[10px] text-gray-500">الصور</span>
                            <span className="block text-xs font-bold text-gray-800 mt-0.5">
                                {loc.gallery?.length || 0}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => onEdit(loc)}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:bg-amber-100 transition"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>تعديل</span>
                        </button>
                        <button
                            onClick={() => onDelete(loc)}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-red-600 text-xs font-semibold hover:bg-red-50 hover:border-red-200 active:bg-red-100 transition"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>حذف</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}