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

export default function LocationsTable({ locations, onEdit, onDelete }: Props) {
    return (
        <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold">
                        <tr>
                            <th className="py-3 px-4">مكان التصوير</th>
                            <th className="py-3 px-4">المنطقة التابع لها</th>
                            <th className="py-3 px-4">سعر التصوير</th>
                            <th className="py-3 px-4">سعر القاعة / المكان</th>
                            <th className="py-3 px-4">الصور</th>
                            <th className="py-3 px-4">الحالة</th>
                            <th className="py-3 px-4 text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {locations.map((loc) => (
                            <tr key={loc._id} className="hover:bg-neutral-50/50 transition">
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3 font-semibold text-gray-900">
                                        <LocationThumb loc={loc} cls="w-10 h-10" />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span>{loc.name}</span>
                                                {loc.isFeatured && <FeaturedBadge />}
                                            </div>
                                            <span className="text-[11px] text-gray-400 font-mono block" dir="ltr">
                                                {loc.slug}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3.5 px-4 text-gray-600 font-medium">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-amber-600" />
                                        <span>{regionNameOf(loc)}</span>
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 font-medium text-gray-800">
                                    {priceText(loc.photographyPrice)}
                                </td>
                                <td className="py-3.5 px-4 font-medium text-gray-800">
                                    {priceText(loc.venuePrice)}
                                </td>
                                <td className="py-3.5 px-4 text-gray-500 font-medium">
                                    {loc.gallery?.length || 0} صورة
                                </td>
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={loc.status} />
                                </td>
                                <td className="py-3.5 px-4 text-left">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(loc)}
                                            className="p-1.5 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition"
                                            title="تعديل"
                                            aria-label={`تعديل ${loc.name}`}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(loc)}
                                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 transition"
                                            title="حذف"
                                            aria-label={`حذف ${loc.name}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}