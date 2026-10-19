import { IService } from '../../../types';

export default function VisibilityTags({ service }: { service: IService }) {
  return (
    <div className="flex flex-wrap gap-1 text-[10px]">
      {service.visibility?.homepage && (
        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">الرئيسية</span>
      )}
      {service.visibility?.allLocations && (
        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">كل الأماكن</span>
      )}
      {service.visibility?.servicesPage && (
        <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">صفحة الخدمات</span>
      )}
    </div>
  );
}