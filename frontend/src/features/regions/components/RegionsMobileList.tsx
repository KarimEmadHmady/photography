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

export default function RegionsMobileList({ regions, onEdit, onDelete }: Props) {
    return (
        <div className="md:hidden space-y-3 content-auto">
            {regions.map((region) => (
                <div
                    key={region._id}
                    className="bg-white rounded-xl border border-gray-200 shadow-xs p-3.5 space-y-3"
                >
                    <div className="flex items-start gap-3">
                        <RegionThumb region={region} cls="w-14 h-14" />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-sm text-gray-900 leading-snug">{region.name}</h3>
                                <StatusBadge status={region.status} />
                            </div>
                            {region.description && (
                                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                    {region.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
                        <RegionLocationCount count={region.locationCount} />
                        <span className="text-gray-500">
                            الترتيب: <span className="font-semibold text-gray-700">{region.sortOrder}</span>
                        </span>
                        <span className="text-gray-400 font-mono truncate max-w-full" dir="ltr">
                            /{region.slug}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => onEdit(region)}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:bg-amber-100 transition"
                        >
                            <Edit2 className="w-4 h-4" />
                            <span>تعديل</span>
                        </button>
                        <button
                            onClick={() => onDelete(region)}
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