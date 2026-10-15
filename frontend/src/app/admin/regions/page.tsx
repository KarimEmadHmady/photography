'use client';

import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { IRegion } from '../../../types';
import ImageUploader from '../../../components/ImageUploader';

const inputCls =
  'w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-gray-300 text-base sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';

export default function AdminRegionsPage() {
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<IRegion | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [sortOrder, setSortOrder] = useState(0);

  const loadRegions = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getRegions();
      if (res.success && res.data) {
        setRegions(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل قائمة المناطق');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegions();
  }, []);

  // قفل السكرول + Esc لما المودال مفتوح
  useEffect(() => {
    if (!isModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isModalOpen]);

  const openCreateModal = () => {
    setEditingRegion(null);
    setName('');
    setSlug('');
    setDescription('');
    setCoverImage('');
    setStatus('published');
    setSortOrder(regions.length);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (region: IRegion) => {
    setEditingRegion(region);
    setName(region.name);
    setSlug(region.slug);
    setDescription(region.description || '');
    setCoverImage(region.coverImage || '');
    setStatus(region.status);
    setSortOrder(region.sortOrder || 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSlugify = (val: string) => {
    setName(val);
    if (!editingRegion) {
      // auto generate slug suggestion
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      if (generated) setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const payload = {
        name,
        slug,
        description,
        coverImage,
        status,
        sortOrder: Number(sortOrder),
      };

      if (editingRegion) {
        await api.admin.updateRegion(editingRegion._id, payload);
        setSuccessMsg('تم تحديث المنطقة بنجاح');
      } else {
        await api.admin.createRegion(payload);
        setSuccessMsg('تم إنشاء المنطقة بنجاح');
      }

      setIsModalOpen(false);
      loadRegions();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ المنطقة، يرجى مراجعة البيانات المدخلة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (region: IRegion) => {
    if (!window.confirm(`هل أنت متأكد من حذف منطقة (${region.name})؟`)) {
      return;
    }

    try {
      setError(null);
      await api.admin.deleteRegion(region._id);
      setSuccessMsg(`تم حذف منطقة (${region.name}) بنجاح`);
      loadRegions();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'تعذر حذف المنطقة');
    }
  };

  const StatusBadge = ({ region }: { region: IRegion }) => (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${
        region.status === 'published'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {region.status === 'published' ? 'منشور' : 'مسودة'}
    </span>
  );

  const Thumb = ({ region, cls }: { region: IRegion; cls: string }) =>
    region.coverImage ? (
      <img
        src={region.coverImage}
        alt={region.name}
        className={`${cls} rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0`}
      />
    ) : (
      <div
        className={`${cls} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0`}
      >
        <MapPin className="w-5 h-5" />
      </div>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4 sm:pb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            إدارة المناطق الجغرافية
          </h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            إضافة وتعديل المناطق التي تُنظم أماكن التصوير (مثل: مدينة نصر، مصر الجديدة، الزمالك).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm sm:text-xs shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منطقة جديدة</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800"
        >
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="إغلاق"
            className="shrink-0 p-1 text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Regions */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-gray-500 text-xs">جاري تحميل المناطق...</p>
        </div>
      ) : regions.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl sm:rounded-2xl border border-dashed border-gray-300 space-y-3">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500">لا توجد مناطق جغرافية بعد.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-amber-600 text-white text-xs font-semibold rounded-lg"
          >
            إضافة أول منطقة
          </button>
        </div>
      ) : (
        <>
          {/* ===== موبايل: كروت ===== */}
          <div className="md:hidden space-y-3">
            {regions.map((region) => (
              <div
                key={region._id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs p-3.5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Thumb region={region} cls="w-14 h-14" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-gray-900 leading-snug">
                        {region.name}
                      </h3>
                      <StatusBadge region={region} />
                    </div>
                    {region.description && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {region.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold">
                    {region.locationCount || 0} مكان
                  </span>
                  <span className="text-gray-500">
                    الترتيب: <span className="font-semibold text-gray-700">{region.sortOrder}</span>
                  </span>
                  <span className="text-gray-400 font-mono truncate max-w-full" dir="ltr">
                    /{region.slug}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(region)}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:bg-amber-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDelete(region)}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-red-600 text-xs font-semibold hover:bg-red-50 hover:border-red-200 active:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ===== كمبيوتر / تابلت: جدول ===== */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">المنطقة</th>
                    <th className="py-3 px-4">الرابط المخصص (Slug)</th>
                    <th className="py-3 px-4">أماكن التصوير</th>
                    <th className="py-3 px-4">الترتيب</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {regions.map((region) => (
                    <tr key={region._id} className="hover:bg-neutral-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 font-semibold text-gray-900">
                          <Thumb region={region} cls="w-10 h-10" />
                          <div className="min-w-0">
                            <span>{region.name}</span>
                            {region.description && (
                              <p className="text-[11px] text-gray-400 font-normal truncate max-w-xs">
                                {region.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]" dir="ltr">
                        {region.slug}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-[11px]">
                          {region.locationCount || 0} مكان
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">{region.sortOrder}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge region={region} />
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(region)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition"
                            title="تعديل"
                            aria-label={`تعديل ${region.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(region)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 transition"
                            title="حذف"
                            aria-label={`حذف ${region.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Create / Edit — موبايل: شاشة سفلية | كمبيوتر: في النص */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={editingRegion ? 'تعديل بيانات المنطقة' : 'إضافة منطقة جديدة'}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl text-right shadow-2xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col"
          >
            {/* Header ثابت */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-5 sm:px-8 pt-5 pb-3 sm:pt-7 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingRegion ? 'تعديل بيانات المنطقة' : 'إضافة منطقة جديدة'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="إغلاق"
                className="w-10 h-10 -ml-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
              {/* المحتوى بيسكرول */}
              <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 space-y-4">
                {formError && (
                  <div
                    role="alert"
                    className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">اسم المنطقة *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleSlugify(e.target.value)}
                    placeholder="مثال: مدينة نصر"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    الرابط المخصص (Slug) *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    placeholder="nasr-city"
                    dir="ltr"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`${inputCls} font-mono`}
                  />
                  <span className="text-[11px] text-gray-400 block">
                    أحرف إنجليزية صغيرة وأرقام وشرطات فقط (3-120 حرف)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700">وصف المنطقة</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف مختصر للمنطقة ومواقع التصوير المتوفرة بها..."
                    className={inputCls}
                  />
                </div>

                {/* Cover Image Upload */}
                <div className="space-y-2">
                  <ImageUploader
                    label="صورة غلاف المنطقة"
                    onUploaded={(img) => setCoverImage(img.url)}
                    defaultAlt={name}
                  />
                  {coverImage && (
                    <div className="relative aspect-[16/9] max-h-48 w-full rounded-xl overflow-hidden border border-gray-200">
                      <img src={coverImage} alt="غلاف" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        aria-label="إزالة الصورة"
                        className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">ترتيب الظهور</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className={inputCls}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700">حالة النشر</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className={inputCls}
                    >
                      <option value="published">منشور للعامة</option>
                      <option value="draft">مسودة (غير معروض)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* الأزرار ثابتة تحت */}
              <div className="shrink-0 px-5 sm:px-8 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-6 flex items-center gap-3 border-t border-gray-100 bg-white rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm sm:text-xs font-medium hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] sm:flex-none px-5 py-3 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm sm:text-xs shadow-xs transition disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : editingRegion ? 'حفظ التعديلات' : 'إنشاء المنطقة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}