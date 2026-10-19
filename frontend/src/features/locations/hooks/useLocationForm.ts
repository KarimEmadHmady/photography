import { useState } from 'react';
import { api } from '../../../lib/api';
import { ILocation, IRegion, IGalleryImage } from '../../../types';
import { LocationFormValues, SetFormField } from '../types/location.types';
import {
  buildPayload,
  createEmptyForm,
  locationToForm,

} from '../utils/location.utils';
import { slugify } from '../../../utils/slugify';

interface Options {
  regions: IRegion[];
  locationsCount: number;
  onSaved: (message: string) => void;
}

const toGalleryImage = (img: any, index: number, fallbackAlt: string): IGalleryImage => ({
  publicId: img.publicId,
  url: img.url,
  width: img.width || 800,
  height: img.height || 600,
  format: img.format || 'jpg',
  bytes: img.bytes || 0,
  alt: img.alt || fallbackAlt || 'صورة مكان تصوير',
  sortOrder: index,
});

export function useLocationForm({ regions, locationsCount, onSaved }: Options) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<ILocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [values, setValues] = useState<LocationFormValues>(() => createEmptyForm('', 0));

  const setField: SetFormField = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const close = () => setIsOpen(false);

  const openCreate = () => {
    setEditingLoc(null);
    setValues(createEmptyForm(regions[0]?._id || '', locationsCount));
    setFormError(null);
    setIsOpen(true);
  };

  const openEdit = (loc: ILocation) => {
    setEditingLoc(loc);
    setValues(locationToForm(loc));
    setFormError(null);
    setIsOpen(true);
  };

  // الاسم + توليد الـ slug تلقائياً (في الإضافة فقط)
  const changeName = (val: string) => {
    setValues((prev) => {
      const next = { ...prev, name: val };
      if (!editingLoc) {
        const generated = slugify(val);
        if (generated) next.slug = generated;
      }
      return next;
    });
  };

  const addGalleryImage = (img: any) =>
    setValues((prev) => ({
      ...prev,
      gallery: [...prev.gallery, toGalleryImage(img, prev.gallery.length, prev.name)],
      coverImage: prev.coverImage || img.url,
    }));

  const addGalleryImages = (imgs: any[]) => {
    if (!imgs || imgs.length === 0) return;
    setValues((prev) => ({
      ...prev,
      gallery: [
        ...prev.gallery,
        ...imgs.map((img, i) => toGalleryImage(img, prev.gallery.length + i, prev.name)),
      ],
      coverImage: prev.coverImage || imgs[0]?.url || '',
    }));
  };

  const removeGalleryImage = (index: number) =>
    setValues((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = buildPayload(values);

      if (editingLoc) {
        await api.admin.updateLocation(editingLoc._id, payload);
        onSaved('تم تحديث مكان التصوير بنجاح');
      } else {
        await api.admin.createLocation(payload);
        onSaved('تم إنشاء مكان التصوير بنجاح');
      }

      close();
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ مكان التصوير');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isOpen,
    editingLoc,
    submitting,
    formError,
    values,
    setField,
    changeName,
    addGalleryImage,
    addGalleryImages,
    removeGalleryImage,
    openCreate,
    openEdit,
    close,
    submit,
  };
}