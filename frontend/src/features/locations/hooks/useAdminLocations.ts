import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { ILocation, IRegion } from '../../../types';

export function useAdminLocations() {
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [locRes, regRes] = await Promise.all([
        api.admin.getLocations(),
        api.admin.getRegions(),
      ]);
      if (locRes.success && locRes.data) setLocations(locRes.data);
      if (regRes.success && regRes.data) setRegions(regRes.data);
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل بيانات الأماكن');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const deleteLocation = async (loc: ILocation) => {
    if (!window.confirm(`هل أنت متأكد من حذف مكان التصوير (${loc.name})؟`)) return;

    try {
      setError(null);
      await api.admin.deleteLocation(loc._id);
      showSuccess(`تم حذف مكان (${loc.name}) بنجاح`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'تعذر حذف مكان التصوير');
    }
  };

  return {
    locations,
    regions,
    loading,
    error,
    setError,
    successMsg,
    showSuccess,
    reload: loadData,
    deleteLocation,
  };
}