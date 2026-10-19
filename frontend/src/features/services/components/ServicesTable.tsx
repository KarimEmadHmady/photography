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

export default function ServicesTable({ services, onEdit, onDelete }: Props) {
  return (
    <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold">
            <tr>
              <th className="py-3 px-4">الخدمة</th>
              <th className="py-3 px-4">السعر</th>
              <th className="py-3 px-4">أماكن الظهور</th>
              <th className="py-3 px-4">الحالة</th>
              <th className="py-3 px-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map((service) => (
              <tr key={service._id} className="hover:bg-neutral-50/50 transition">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3 font-semibold text-gray-900">
                    <ServiceThumb service={service} cls="w-10 h-10" />
                    <div className="min-w-0">
                      <span>{service.name}</span>
                      {service.shortDescription && (
                        <p className="text-[11px] text-gray-400 font-normal truncate max-w-xs">
                          {service.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-medium text-gray-800">
                  {priceText(service.price)}
                </td>
                <td className="py-3.5 px-4">
                  <VisibilityTags service={service} />
                </td>
                <td className="py-3.5 px-4">
                  <ServiceStatusBadge service={service} />
                </td>
                <td className="py-3.5 px-4 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(service)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition"
                      title="تعديل"
                      aria-label={`تعديل ${service.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(service)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 transition"
                      title="حذف"
                      aria-label={`حذف ${service.name}`}
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