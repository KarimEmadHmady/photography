import { Camera } from 'lucide-react';
import AdminThumb from '../../../components/admin/AdminThumb';
import { ILocation } from '../../../types';

export default function LocationThumb({ loc, cls }: { loc: ILocation; cls: string }) {
    return <AdminThumb src={loc.coverImage} alt={loc.name} cls={cls} icon={Camera} />;
}