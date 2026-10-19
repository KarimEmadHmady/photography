import { useState } from 'react';
import { api } from '../../../lib/api';
import { IService } from '../../../types';
import { slugify } from '../../../utils/slugify';
import { ServiceFormValues, SetServiceField } from '../types/service.types';
import { buildPayload, createEmptyForm, serviceToForm } from '../utils/service.utils';

interface Options {
  servicesCount: number;
  onSaved: (message: string) => void;
}

export function useServiceForm({ servicesCount, onSaved }: Options) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [values, setValues] = useState<ServiceFormValues>(() => createEmptyForm(0));

  const setField: SetServiceField = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const close = () => setIsOpen(false);

  const openCreate = () => {
    setEditingService(null);
    setValues(createEmptyForm(servicesCount));
    setFormError(null);
    setIsOpen(true);
  };

  const openEdit = (service: IService) => {
    setEditingService(service);
    setValues(serviceToForm(service));
    setFormError(null);
    setIsOpen(true);
  };

  // الاسم + توليد الـ slug تلقائياً (في الإضافة فقط)
  const changeName = (val: string) => {
    setValues((prev) => {
      const next = { ...prev, name: val };
      if (!editingService) {
        const generated = slugify(val);
        if (generated) next.slug = generated;
      }
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = buildPayload(values);

      if (editingService) {
        await api.admin.updateService(editingService._id, payload);
        onSaved('تم تحديث الخدمة بنجاح');
      } else {
        await api.admin.createService(payload);
        onSaved('تم إنشاء الخدمة بنجاح');
      }

      close();
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ الخدمة');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isOpen,
    editingService,
    submitting,
    formError,
    values,
    setField,
    changeName,
    openCreate,
    openEdit,
    close,
    submit,
  };
}