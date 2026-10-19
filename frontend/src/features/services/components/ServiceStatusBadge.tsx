import { IService } from '../../../types';

export default function ServiceStatusBadge({ service }: { service: IService }) {
  const live = service.status === 'published' && service.isActive;
  return (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${
        live
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {live ? 'نشط ومنشور' : 'معطل'}
    </span>
  );
}