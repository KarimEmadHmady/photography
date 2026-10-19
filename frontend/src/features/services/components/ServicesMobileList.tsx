import { Edit2, Trash2 } from 'lucide-react';
import { IService } from '../../../types';
import { priceText } from '../utils/service.utils';
import ServiceStatusBadge from './ServiceStatusBadge';
import ServiceThumb from './ServiceThumb';
import VisibilityTags from './VisibilityTags';

interface Props {
  services: IService[];
  onEdit: (service: IService) => void;
  onDelete: (service: IService) => void;
}

export default function ServicesMobileList({ services, onEdit, onDelete }: Props) {
  return (
    <div className="md:hidden space-y-3 content-auto">
      {services.map((service) => (
        <div
          key={service._id}
          className="bg-white rounded-xl border border-gray-200 shadow-xs p-3.5 space-y-3"
        >
          <div className="flex items-start gap-3">
            <ServiceThumb service={service} cls="w-14 h-14" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-gray-900 leading-snug">{service.name}</h3>
                <ServiceStatusBadge service={service} />
              </div>
              {service.shortDescription && (
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {service.shortDescription}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-amber-700">{priceText(service.price)}</span>
            <VisibilityTags service={service} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => onEdit(service)}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:bg-amber-100 transition"
            >
              <Edit2 className="w-4 h-4" />
              <span>تعديل</span>
            </button>
            <button
              onClick={() => onDelete(service)}
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