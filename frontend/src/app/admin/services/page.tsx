'use client';

import { Sparkles } from 'lucide-react';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import AdminLoading from '../../../components/admin/AdminLoading';
import AdminNotifications from '../../../components/admin/AdminNotifications';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { useAdminServices } from '../../../features/services/hooks/useAdminServices';
import { useServiceForm } from '../../../features/services/hooks/useServiceForm';
import ServiceFormModal from '../../../features/services/components/ServiceFormModal';
import ServicesMobileList from '../../../features/services/components/ServicesMobileList';
import ServicesTable from '../../../features/services/components/ServicesTable';

export default function AdminServicesPage() {
  const { services, loading, error, setError, successMsg, showSuccess, reload, deleteService } =
    useAdminServices();

  const form = useServiceForm({
    servicesCount: services.length,
    onSaved: (msg) => {
      showSuccess(msg);
      reload();
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="إدارة الخدمات الإضافية"
        description="إضافة وتعديل باقات التصوير، الألبومات المطبوعة، التابلوهات، وفيديوهات الأفراح."
        actionLabel="إضافة خدمة جديدة"
        onAction={form.openCreate}
      />

      <AdminNotifications
        successMsg={successMsg}
        error={error}
        onDismissError={() => setError(null)}
      />

      {loading ? (
        <AdminLoading message="جاري تحميل الخدمات..." />
      ) : services.length === 0 ? (
        <AdminEmptyState
          icon={Sparkles}
          message="لا توجد خدمات مضافة بعد."
          actionLabel="إضافة أول خدمة"
          onAction={form.openCreate}
        />
      ) : (
        <>
          <ServicesMobileList services={services} onEdit={form.openEdit} onDelete={deleteService} />
          <ServicesTable services={services} onEdit={form.openEdit} onDelete={deleteService} />
        </>
      )}

      <ServiceFormModal form={form} />
    </div>
  );
}