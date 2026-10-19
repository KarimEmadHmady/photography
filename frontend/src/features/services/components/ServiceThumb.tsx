import { Sparkles } from 'lucide-react';
import AdminThumb from '../../../components/admin/AdminThumb';
import { IService } from '../../../types';

export default function ServiceThumb({ service, cls }: { service: IService; cls: string }) {
  return (
    <AdminThumb
      src={service.mainImage}
      alt={service.name}
      cls={cls}
      icon={Sparkles}
      iconCls="text-amber-600"
    />
  );
}