import { useState } from 'react';
import { api } from '../../../lib/api';
import { IRegion } from '../../../types';
import { slugify } from '../../../utils/slugify';
import { RegionFormValues, SetRegionField } from '../types/region.types';
import { buildPayload, createEmptyForm, regionToForm } from '../utils/region.utils';

interface Options {
  regionsCount: number;
  onSaved: (message: string) => void;
}

export function useRegionForm({ regionsCount, onSaved }: Options) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<IRegion | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [values, setValues] = useState<RegionFormValues>(() => createEmptyForm(0));

  const setField: SetRegionField = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const close = () => setIsOpen(false);

  const openCreate = () => {
    setEditingRegion(null);
    setValues(createEmptyForm(regionsCount));
    setFormError(null);
    setIsOpen(true);
  };

  const openEdit = (region: IRegion) => {
    setEditingRegion(region);
    setValues(regionToForm(region));
    setFormError(null);
    setIsOpen(true);
  };

  // الاسم + توليد الـ slug تلقائياً (في الإضافة فقط)
  const changeName = (val: string) => {
    setValues((prev) => {
      const next = { ...prev, name: val };
      if (!editingRegion) {
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

      if (editingRegion) {
        await api.admin.updateRegion(editingRegion._id, payload);
        onSaved('تم تحديث المنطقة بنجاح');
      } else {
        await api.admin.createRegion(payload);
        onSaved('تم إنشاء المنطقة بنجاح');
      }

      close();
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ المنطقة، يرجى مراجعة البيانات المدخلة');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isOpen,
    editingRegion,
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