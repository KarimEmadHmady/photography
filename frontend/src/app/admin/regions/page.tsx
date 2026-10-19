'use client';

import { MapPin } from 'lucide-react';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import AdminLoading from '../../../components/admin/AdminLoading';
import AdminNotifications from '../../../components/admin/AdminNotifications';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { useAdminRegions } from '../../../features/regions/hooks/useAdminRegions';
import { useRegionForm } from '../../../features/regions/hooks/useRegionForm';
import RegionFormModal from '../../../features/regions/components/RegionFormModal';
import RegionsMobileList from '../../../features/regions/components/RegionsMobileList';
import RegionsTable from '../../../features/regions/components/RegionsTable';

export default function AdminRegionsPage() {
  const { regions, loading, error, setError, successMsg, showSuccess, reload, deleteRegion } =
    useAdminRegions();

  const form = useRegionForm({
    regionsCount: regions.length,
    onSaved: (msg) => {
      showSuccess(msg);
      reload();
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="إدارة المناطق الجغرافية"
        description="إضافة وتعديل المناطق التي تُنظم أماكن التصوير (مثل: مدينة نصر، مصر الجديدة، الزمالك)."
        actionLabel="إضافة منطقة جديدة"
        onAction={form.openCreate}
      />

      <AdminNotifications
        successMsg={successMsg}
        error={error}
        onDismissError={() => setError(null)}
      />

      {loading ? (
        <AdminLoading message="جاري تحميل المناطق..." />
      ) : regions.length === 0 ? (
        <AdminEmptyState
          icon={MapPin}
          message="لا توجد مناطق جغرافية بعد."
          actionLabel="إضافة أول منطقة"
          onAction={form.openCreate}
        />
      ) : (
        <>
          <RegionsMobileList regions={regions} onEdit={form.openEdit} onDelete={deleteRegion} />
          <RegionsTable regions={regions} onEdit={form.openEdit} onDelete={deleteRegion} />
        </>
      )}

      <RegionFormModal form={form} />
    </div>
  );
}