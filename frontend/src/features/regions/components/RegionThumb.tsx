import { MapPin } from 'lucide-react';
import AdminThumb from '../../../components/admin/AdminThumb';
import { IRegion } from '../../../types';

export default function RegionThumb({ region, cls }: { region: IRegion; cls: string }) {
    return <AdminThumb src={region.coverImage} alt={region.name} cls={cls} icon={MapPin} />;
}