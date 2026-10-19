import { Edit2, Trash2 } from 'lucide-react';
import StatusBadge from '../../../components/admin/StatusBadge';
import { IRegion } from '../../../types';
import RegionLocationCount from './RegionLocationCount';
import RegionThumb from './RegionThumb';

interface Props {
    regions: IRegion[];
    onEdit: (region: IRegion) => void;
    onDelete: (region: IRegion) => void;
}

export default function RegionsTable({ regions, onEdit, onDelete }: Props) {
    return (
        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold">
                        <tr>
                            <th className="py-3 px-4">المنطقة</th>
                            <th className="py-3 px-4">الرابط المخصص (Slug)</th>
                            <th className="py-3 px-4">أماكن التصوير</th>
                            <th className="py-3 px-4">الترتيب</th>
                            <th className="py-3 px-4">الحالة</th>
                            <th className="py-3 px-4 text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {regions.map((region) => (
                            <tr key={region._id} className="hover:bg-neutral-50/50 transition">
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3 font-semibold text-gray-900">
                                        <RegionThumb region={region} cls="w-10 h-10" />
                                        <div className="min-w-0">
                                            <span>{region.name}</span>
                                            {region.description && (
                                                <p className="text-[11px] text-gray-400 font-normal truncate max-w-xs">
                                                    {region.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]" dir="ltr">
                                    {region.slug}
                                </td>
                                <td className="py-3.5 px-4">
                                    <RegionLocationCount count={region.locationCount} />
                                </td>
                                <td className="py-3.5 px-4 text-gray-600 font-medium">{region.sortOrder}</td>
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={region.status} />
                                </td>
                                <td className="py-3.5 px-4 text-left">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onEdit(region)}
                                            className="p-1.5 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition"
                                            title="تعديل"
                                            aria-label={`تعديل ${region.name}`}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(region)}
                                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 transition"
                                            title="حذف"
                                            aria-label={`حذف ${region.name}`}
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