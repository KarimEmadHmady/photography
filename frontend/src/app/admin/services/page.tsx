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

const inputCls =
  'w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-gray-300 text-base sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
const labelCls = 'block text-xs font-semibold text-gray-700';

type PriceType = 'fixed' | 'starting_from' | 'on_request';

const priceText = (p?: { type?: PriceType; amount?: number | null } | null) =>
  !p || p.type === 'on_request' ? 'حسب الطلب' : `${p.amount ?? ''} ج.م`;

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
  const [priceType, setPriceType] = useState<PriceType>('fixed');
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

  const StatusBadge = ({ service }: { service: IService }) => {
    const live = service.status === 'published' && service.isActive;
    return (
      <span
        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${
          live
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
        }`}
      >
        {live ? 'نشط ومنشور' : 'معطل'}
      </span>
    );
  };

  const VisibilityTags = ({ service }: { service: IService }) => (
    <div className="flex flex-wrap gap-1 text-[10px]">
      {service.visibility?.homepage && (
        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">الرئيسية</span>
      )}
      {service.visibility?.allLocations && (
        <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">كل الأماكن</span>
      )}
      {service.visibility?.servicesPage && (
        <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">صفحة الخدمات</span>
      )}
    </div>
  );

  const Thumb = ({ service, cls }: { service: IService; cls: string }) =>
    service.mainImage ? (
      <img
        src={service.mainImage}
        alt={service.name}
        className={`${cls} rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0`}
      />
    ) : (
      <div
        className={`${cls} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-amber-600 shrink-0`}
      >
        <Sparkles className="w-5 h-5" />
      </div>
    );

  const SectionBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="p-3.5 sm:p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3.5">
      <h3 className="text-xs font-bold text-gray-800">{title}</h3>
      {children}
    </section>
  );

  const CheckRow = ({
    checked,
    onChange,
    children,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    children: React.ReactNode;
  }) => (
    <label className="flex items-start gap-2.5 cursor-pointer min-h-[44px] sm:min-h-0 text-xs text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 shrink-0"
      />
      <span className="leading-relaxed">{children}</span>
    </label>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4 sm:pb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">إدارة الخدمات الإضافية</h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            إضافة وتعديل باقات التصوير، الألبومات المطبوعة، التابلوهات، وفيديوهات الأفراح.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm sm:text-xs shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خدمة جديدة</span>
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

      {/* Services */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-gray-500 text-xs">جاري تحميل الخدمات...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl sm:rounded-2xl border border-dashed border-gray-300 space-y-3">
          <Sparkles className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500">لا توجد خدمات مضافة بعد.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-amber-600 text-white text-xs font-semibold rounded-lg"
          >
            إضافة أول خدمة
          </button>
        </div>
      ) : (
        <>
          {/* ===== موبايل: كروت ===== */}
          <div className="md:hidden space-y-3">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs p-3.5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Thumb service={service} cls="w-14 h-14" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-gray-900 leading-snug">
                        {service.name}
                      </h3>
                      <StatusBadge service={service} />
                    </div>
                    {service.shortDescription && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {service.shortDescription}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-amber-700">
                    {priceText(service.price)}
                  </span>
                  <VisibilityTags service={service} />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(service)}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:bg-amber-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
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
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 font-semibold text-gray-900">
                          <Thumb service={service} cls="w-10 h-10" />
                          <div className="min-w-0">
                            <span>{service.name}</span>
                            {service.shortDescription && (
                              <p className="text-[11px] text-gray-400 font-normal truncate max-w-xs">
                                {service.shortDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {priceText(service.price)}
                      </td>
                      <td className="py-3.5 px-4">
                        <VisibilityTags service={service} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge service={service} />
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition"
                            title="تعديل"
                            aria-label={`تعديل ${service.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 transition"
                            title="حذف"
                            aria-label={`حذف ${service.name}`}
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
          aria-label={editingService ? 'تعديل بيانات الخدمة' : 'إضافة خدمة جديدة'}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl text-right shadow-2xl max-h-[94dvh] sm:max-h-[90vh] flex flex-col"
          >
            {/* Header ثابت */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-5 sm:px-8 pt-5 pb-3 sm:pt-7 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingService ? 'تعديل بيانات الخدمة' : 'إضافة خدمة جديدة'}
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
                  <label className={labelCls}>اسم الخدمة *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleSlugify(e.target.value)}
                    placeholder="ألبوم صور زفاف فاخر"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>الرابط المخصص (Slug) *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    placeholder="luxury-wedding-album"
                    dir="ltr"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`${inputCls} font-mono`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>وصف قصير للبطاقة</label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="ألبوم مطبوع بجودة عالية وغلاف جلدي مخصص"
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={labelCls}>الوصف الكامل</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="تفاصيل عدد الصفحات، خامات الطباعة، مدة التسليم..."
                    className={inputCls}
                  />
                </div>

                {/* Price */}
                <SectionBox title="السعر">
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className={labelCls}>نوع السعر</label>
                      <select
                        value={priceType}
                        onChange={(e) => setPriceType(e.target.value as PriceType)}
                        className={inputCls}
                      >
                        <option value="fixed">سعر محدد</option>
                        <option value="starting_from">يبدأ من</option>
                        <option value="on_request">حسب الطلب</option>
                      </select>
                    </div>
                    {priceType !== 'on_request' && (
                      <div className="space-y-1.5">
                        <label className={labelCls}>المبلغ (جنيه)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          required
                          value={priceAmount}
                          onChange={(e) => setPriceAmount(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>
                </SectionBox>

                {/* Main Image */}
                <SectionBox title="الصورة">
                  <ImageUploader
                    label="صورة الخدمة"
                    onUploaded={(img) => setMainImage(img.url)}
                    defaultAlt={name}
                  />
                  {mainImage && (
                    <div className="relative aspect-[16/9] max-h-48 w-full rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={mainImage}
                        alt="صورة الخدمة"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setMainImage('')}
                        aria-label="إزالة الصورة"
                        className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </SectionBox>

                {/* Visibility Options */}
                <SectionBox title="خيارات ظهور الخدمة">
                  <div className="space-y-1">
                    <CheckRow checked={visHomepage} onChange={setVisHomepage}>
                      عرض الخدمة في الصفحة الرئيسية
                    </CheckRow>
                    <CheckRow checked={visServicesPage} onChange={setVisServicesPage}>
                      عرض في صفحة الخدمات المخصصة
                    </CheckRow>
                    <CheckRow checked={visAllLocations} onChange={setVisAllLocations}>
                      عرض تلقائي مع كافة أماكن التصوير كخدمة مقترحة
                    </CheckRow>
                  </div>
                </SectionBox>

                {/* Publish */}
                <SectionBox title="إعدادات النشر">
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className={labelCls}>حالة النشر</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className={inputCls}
                      >
                        <option value="published">منشور</option>
                        <option value="draft">مسودة</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>ترتيب الظهور</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </SectionBox>
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
                  {submitting
                    ? 'جاري الحفظ...'
                    : editingService
                    ? 'حفظ التعديلات'
                    : 'إنشاء الخدمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}