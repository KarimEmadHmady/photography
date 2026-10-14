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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">إدارة المناطق الجغرافية</h1>
          <p className="text-xs text-gray-500 mt-1">
            إضافة وتعديل المناطق التي تُنظم أماكن التصوير (مثل: مدينة نصر، مصر الجديدة، الزمالك).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منطقة جديدة</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Regions Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-gray-500 text-xs">جاري تحميل المناطق...</p>
        </div>
      ) : regions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 space-y-3">
          <MapPin className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500">لا توجد مناطق جغرافية بعد.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg"
          >
            إضافة أول منطقة
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
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
                    <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-3">
                      {region.coverImage ? (
                        <img
                          src={region.coverImage}
                          alt={region.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                          <MapPin className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span>{region.name}</span>
                        {region.description && (
                          <p className="text-[11px] text-gray-400 font-normal truncate max-w-xs">
                            {region.description}
                          </p>
                        )}
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
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          region.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {region.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(region)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(region)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 transition"
                          title="حذف"
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
      )}

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-right shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900">
              {editingRegion ? 'تعديل بيانات المنطقة' : 'إضافة منطقة جديدة'}
            </h2>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">اسم المنطقة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleSlugify(e.target.value)}
                  placeholder="مثال: مدينة نصر"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[10px] text-gray-400 block">
                  أحرف إنجليزية صغيرة وأرقام وشرطات فقط (3-120 حرف)
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">وصف المنطقة</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للمنطقة ومواقع التصوير المتوفرة بها..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500"
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
                  <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-gray-200">
                    <img src={coverImage} alt="غلاف" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs shadow-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">ترتيب الظهور</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">حالة النشر</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white"
                  >
                    <option value="published">منشور للعامة</option>
                    <option value="draft">مسودة (غير معروض)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
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
