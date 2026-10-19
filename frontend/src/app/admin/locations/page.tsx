'use client';

import { Camera } from 'lucide-react';
import AdminEmptyState from '../../../components/admin/AdminEmptyState';
import AdminLoading from '../../../components/admin/AdminLoading';
import AdminNotifications from '../../../components/admin/AdminNotifications';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { useAdminLocations } from '../../../features/locations/hooks/useAdminLocations';
import { useLocationForm } from '../../../features/locations/hooks/useLocationForm';
import LocationsMobileList from '../../../features/locations/components/LocationsMobileList';
import LocationsTable from '../../../features/locations/components/LocationsTable';
import LocationFormModal from '../../../features/locations/components/LocationFormModal';

export default function AdminLocationsPage() {
  const {
    locations,
    regions,
    loading,
    error,
    setError,
    successMsg,
    showSuccess,
    reload,
    deleteLocation,
  } = useAdminLocations();

  const form = useLocationForm({
    regions,
    locationsCount: locations.length,
    onSaved: (msg) => {
      showSuccess(msg);
      reload();
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        title="إدارة أماكن التصوير"
        description="إضافة وتعديل معارض الصور والأسعار المستقلة لكل مكان تصوير تابع للمناطق."
        actionLabel="إضافة مكان تصوير"
        onAction={form.openCreate}
      />

      <AdminNotifications
        successMsg={successMsg}
        error={error}
        onDismissError={() => setError(null)}
      />

      {loading ? (
        <AdminLoading message="جاري تحميل أماكن التصوير..." />
      ) : locations.length === 0 ? (
        <AdminEmptyState
          icon={Camera}
          message="لا توجد أماكن تصوير مسجلة بعد."
          actionLabel="إضافة أول مكان تصوير"
          onAction={form.openCreate}
        />
      ) : (
        <>
          <LocationsMobileList
            locations={locations}
            onEdit={form.openEdit}
            onDelete={deleteLocation}
          />
          <LocationsTable
            locations={locations}
            onEdit={form.openEdit}
            onDelete={deleteLocation}
          />
        </>
      )}

      <LocationFormModal form={form} regions={regions} />
    </div>
  );
}