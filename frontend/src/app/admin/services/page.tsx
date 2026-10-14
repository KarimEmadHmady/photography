'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { IService } from '../../../types';
import ImageUploader from '../../../components/ImageUploader';

export default function AdminServicesPage() {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'starting_from' | 'on_request'>('fixed');
  const [priceAmount, setPriceAmount] = useState<number | string>(800);

  // Visibility
  const [visHomepage, setVisHomepage] = useState(false);
  const [visServicesPage, setVisServicesPage] = useState(true);
  const [visAllLocations, setVisAllLocations] = useState(true);

  const [isActive, setIsActive] = useState(true);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [sortOrder, setSortOrder] = useState(0);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await api.admin.getServices();
      if (res.success && res.data) {
        setServices(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'فشل في تحميل قائمة الخدمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setSlug('');
    setShortDescription('');
    setDescription('');
    setMainImage('');
    setPriceType('fixed');
    setPriceAmount(800);
    setVisHomepage(true);
    setVisServicesPage(true);
    setVisAllLocations(true);
    setIsActive(true);
    setStatus('published');
    setSortOrder(services.length);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: IService) => {
    setEditingService(service);
    setName(service.name);
    setSlug(service.slug);
    setShortDescription(service.shortDescription || '');
    setDescription(service.description || '');
    setMainImage(service.mainImage || '');
    setPriceType(service.price?.type || 'on_request');
    setPriceAmount(service.price?.amount !== null ? service.price?.amount : '');

    setVisHomepage(!!service.visibility?.homepage);
    setVisServicesPage(service.visibility?.servicesPage !== false);
    setVisAllLocations(!!service.visibility?.allLocations);

    setIsActive(service.isActive !== false);
    setStatus(service.status);
    setSortOrder(service.sortOrder || 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSlugify = (val: string) => {
    setName(val);
    if (!editingService) {
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
      const price = {
        type: priceType,
        amount: priceType === 'on_request' ? null : Number(priceAmount),
      };

      const payload = {
        name,
        slug,
        shortDescription,
        description,
        mainImage,
        price,
        visibility: {
          homepage: visHomepage,
          servicesPage: visServicesPage,
          allLocations: visAllLocations,
        },
        isActive,
        status,
        sortOrder: Number(sortOrder),
      };

      if (editingService) {
        await api.admin.updateService(editingService._id, payload);
        setSuccessMsg('تم تحديث الخدمة بنجاح');
      } else {
        await api.admin.createService(payload);
        setSuccessMsg('تم إنشاء الخدمة بنجاح');
      }

      setIsModalOpen(false);
      loadServices();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ الخدمة');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (service: IService) => {
    if (!window.confirm(`هل أنت متأكد من حذف خدمة (${service.name})؟`)) {
      return;
    }

    try {
      setError(null);
      await api.admin.deleteService(service._id);
      setSuccessMsg(`تم حذف خدمة (${service.name}) بنجاح`);
      loadServices();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'تعذر حذف الخدمة');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">إدارة الخدمات الإضافية</h1>
          <p className="text-xs text-gray-500 mt-1">
            إضافة وتعديل باقات التصوير، الألبومات المطبوعة، التابلوهات، وفيديوهات الأفراح.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خدمة جديدة</span>
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

      {/* Services Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-gray-500 text-xs">جاري تحميل الخدمات...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 space-y-3">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500">لا توجد خدمات مضافة بعد.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg"
          >
            إضافة أول خدمة
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold">
                <tr>
                  <th className="py-3 px-4">الخدمة</th>
                  <th className="py-3 px-4">السعر</th>
                  <th className="py-3 px-4">أماكن الظهور</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((service) => (
                  <tr key={service._id} className="hover:bg-neutral-50/50 transition">
                    <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-3">
                      {service.mainImage ? (
                        <img
                          src={service.mainImage}
                          alt={service.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-amber-600">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span>{service.name}</span>
                        {service.shortDescription && (
                          <p className="text-[11px] text-gray-400 font-normal truncate max-w-xs">
                            {service.shortDescription}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">
                      {service.price?.type === 'on_request'
                        ? 'حسب الطلب'
                        : `${service.price?.amount} ج.م`}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {service.visibility?.homepage && (
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            الرئيسية
                          </span>
                        )}
                        {service.visibility?.allLocations && (
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            كل الأماكن
                          </span>
                        )}
                        {service.visibility?.servicesPage && (
                          <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                            صفحة الخدمات
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          service.status === 'published' && service.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {service.status === 'published' && service.isActive ? 'نشط ومنشور' : 'معطل'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
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
              {editingService ? 'تعديل بيانات الخدمة' : 'إضافة خدمة جديدة'}
            </h2>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">اسم الخدمة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleSlugify(e.target.value)}
                  placeholder="ألبوم صور زفاف فاخر"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">الرابط المخصص (Slug) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="luxury-wedding-album"
                  dir="ltr"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">وصف قصير للبطاقة</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="ألبوم مطبوع بجودة عالية وغلاف جلدي مخصص"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">الوصف الكامل</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="تفاصيل عدد الصفحات، خامات الطباعة، مدة التسليم..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-3 items-end p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">نوع السعر</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                  >
                    <option value="fixed">سعر محدد</option>
                    <option value="starting_from">يبدأ من</option>
                    <option value="on_request">حسب الطلب</option>
                  </select>
                </div>
                {priceType !== 'on_request' && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600">المبلغ (جنيه)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={priceAmount}
                      onChange={(e) => setPriceAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Main Image */}
              <div className="space-y-2">
                <ImageUploader
                  label="صورة الخدمة"
                  onUploaded={(img) => setMainImage(img.url)}
                  defaultAlt={name}
                />
                {mainImage && (
                  <div className="relative aspect-16/9 rounded-xl overflow-hidden border border-gray-200">
                    <img src={mainImage} alt="صورة الخدمة" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMainImage('')}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full text-xs shadow-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Visibility Options */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <span className="block text-xs font-bold text-gray-700">خيارات ظهور الخدمة:</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={visHomepage}
                    onChange={(e) => setVisHomepage(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span>عرض الخدمة في الصفحة الرئيسية</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={visServicesPage}
                    onChange={(e) => setVisServicesPage(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span>عرض في صفحة الخدمات المخصصة</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={visAllLocations}
                    onChange={(e) => setVisAllLocations(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600"
                  />
                  <span>عرض تلقائي مع كافة أماكن التصوير كخدمة مقترحة</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">حالة النشر</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white"
                  >
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">ترتيب الظهور</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              {/* Actions */}
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
                  {submitting ? 'جاري الحفظ...' : editingService ? 'حفظ التعديلات' : 'إنشاء الخدمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
