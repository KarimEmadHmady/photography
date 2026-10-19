import { api } from '../../../lib/api';
import { IService } from '../../../types';
import { useAdminList } from '../../../hooks/useAdminList';

export function useAdminServices() {
  const list = useAdminList<IService>({
    fetchAll: () => api.admin.getServices(),
    remove: (s) => api.admin.deleteService(s._id),
    loadError: 'فشل في تحميل قائمة الخدمات',
    deleteError: 'تعذر حذف الخدمة',
    confirmDelete: (s) => `هل أنت متأكد من حذف خدمة (${s.name})؟`,
    deletedMessage: (s) => `تم حذف خدمة (${s.name}) بنجاح`,
  });

  return {
    services: list.items,
    loading: list.loading,
    error: list.error,
    setError: list.setError,
    successMsg: list.successMsg,
    showSuccess: list.showSuccess,
    reload: list.reload,
    deleteService: list.deleteItem,
  };
}