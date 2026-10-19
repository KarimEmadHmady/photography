import { api } from '../../../lib/api';
import { IRegion } from '../../../types';
import { useAdminList } from '../../../hooks/useAdminList';

export function useAdminRegions() {
  const list = useAdminList<IRegion>({
    fetchAll: () => api.admin.getRegions(),
    remove: (r) => api.admin.deleteRegion(r._id),
    loadError: 'فشل في تحميل قائمة المناطق',
    deleteError: 'تعذر حذف المنطقة',
    confirmDelete: (r) => `هل أنت متأكد من حذف منطقة (${r.name})؟`,
    deletedMessage: (r) => `تم حذف منطقة (${r.name}) بنجاح`,
  });

  return {
    regions: list.items,
    loading: list.loading,
    error: list.error,
    setError: list.setError,
    successMsg: list.successMsg,
    showSuccess: list.showSuccess,
    reload: list.reload,
    deleteRegion: list.deleteItem,
  };
}