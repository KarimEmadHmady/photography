import { useCallback, useEffect, useRef, useState } from 'react';

interface ListResponse<T> {
  success: boolean;
  data?: T[];
}

interface Options<T> {
  fetchAll: () => Promise<ListResponse<T>>;
  remove: (item: T) => Promise<unknown>;
  loadError: string;
  deleteError: string;
  confirmDelete: (item: T) => string;
  deletedMessage: (item: T) => string;
}

export function useAdminList<T>(options: Options<T>) {
  const optsRef = useRef(options);
  optsRef.current = options;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  }, []);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const res = await optsRef.current.fetchAll();
      if (res.success && res.data) setItems(res.data);
    } catch (err: any) {
      setError(err.message || optsRef.current.loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const deleteItem = async (item: T) => {
    const o = optsRef.current;
    if (!window.confirm(o.confirmDelete(item))) return;

    try {
      setError(null);
      await o.remove(item);
      showSuccess(o.deletedMessage(item));
      reload();
    } catch (err: any) {
      setError(err.message || o.deleteError);
    }
  };

  return { items, loading, error, setError, successMsg, showSuccess, reload, deleteItem };
}