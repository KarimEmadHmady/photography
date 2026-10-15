'use client';

import React, { useEffect, useState } from 'react';
import {
  Camera,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  MapPin,
  Star,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { ILocation, IRegion, IGalleryImage } from '../../../types';
import ImageUploader from '../../../components/ImageUploader';

const inputCls =
  'w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-gray-300 text-base sm:text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500';
const labelCls = 'block text-xs font-semibold text-gray-700';

type PriceType = 'fixed' | 'starting_from' | 'on_request';

const priceText = (p?: { type?: PriceType; amount?: number | null } | null) =>
  !p || p.type === 'on_request' ? 'حسب الاتفاق' : `${p.amount ?? ''} ج.م`;

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<ILocation[]>([]);
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<ILocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [regionId, setRegionId] = useState('');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [gallery, setGallery] = useState<IGalleryImage[]>([]);

  // Prices
  const [photoPriceType, setPhotoPriceType] = useState<PriceType>('fixed');
  const [photoAmount, setPhotoAmount] = useState<number | string>(1500);
  const [venuePriceType, setVenuePriceType] = useState<PriceType>('fixed');
  const [venueAmount, setVenueAmount] = useState<number | string>(500);
  const [showTotal, setShowTotal] = useState(true);

  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [sortOrder, setSortOrder] = useState(0);

  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
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
    setEditingLoc(null);
    setRegionId(regions[0]?._id || '');
    setName('');
    setSlug('');
    setShortDescription('');
    setDescription('');
    setAddress('');
    setMapUrl('');
    setCoverImage('');
    setGallery([]);
    setPhotoPriceType('fixed');
    setPhotoAmount(1500);
    setVenuePriceType('fixed');
    setVenueAmount(500);
    setShowTotal(true);
    setIsFeatured(false);
    setStatus('published');
    setSortOrder(locations.length);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (loc: ILocation) => {
    setEditingLoc(loc);
    const regId = typeof loc.regionId === 'object' ? (loc.regionId as any)._id : loc.regionId;
    setRegionId(regId || '');
    setName(loc.name);
    setSlug(loc.slug);
    setShortDescription(loc.shortDescription || '');
    setDescription(loc.description || '');
    setAddress(loc.address || '');
    setMapUrl(loc.mapUrl || '');
    setCoverImage(loc.coverImage || '');
    setGallery(loc.gallery || []);

    setPhotoPriceType(loc.photographyPrice?.type || 'on_request');
    setPhotoAmount(loc.photographyPrice?.amount !== null ? loc.photographyPrice?.amount : '');
    setVenuePriceType(loc.venuePrice?.type || 'on_request');
    setVenueAmount(loc.venuePrice?.amount !== null ? loc.venuePrice?.amount : '');
    setShowTotal(loc.showTotal);

    setIsFeatured(loc.isFeatured);
    setStatus(loc.status);
    setSortOrder(loc.sortOrder || 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSlugify = (val: string) => {
    setName(val);
    if (!editingLoc) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      if (generated) setSlug(generated);
    }
  };

  const addGalleryImage = (img: any) => {
    const newImage: IGalleryImage = {
      publicId: img.publicId,
      url: img.url,
      width: img.width || 800,
      height: img.height || 600,
      format: img.format || 'jpg',
      bytes: img.bytes || 0,
      alt: img.alt || name || 'صورة مكان تصوير',
      sortOrder: gallery.length,
    };
    setGallery([...gallery, newImage]);
    // If no cover image yet, set first gallery image as cover
    if (!coverImage) {
      setCoverImage(img.url);
    }
  };

  const removeGalleryImage = (index: number) => {
    const updated = gallery.filter((_, i) => i !== index);
    setGallery(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const photographyPrice = {
        type: photoPriceType,
        amount: photoPriceType === 'on_request' ? null : Number(photoAmount),
      };

      const venuePrice = {
        type: venuePriceType,
        amount: venuePriceType === 'on_request' ? null : Number(venueAmount),
      };

      const payload = {
        regionId,
        name,
        slug,
        shortDescription,
        description,
        address,
        mapUrl,
        coverImage,
        gallery,
        photographyPrice,
        venuePrice,
        showTotal,
        isFeatured,
        status,
        sortOrder: Number(sortOrder),
      };

      if (editingLoc) {
        await api.admin.updateLocation(editingLoc._id, payload);
        setSuccessMsg('تم تحديث مكان التصوير بنجاح');
      } else {
        await api.admin.createLocation(payload);
        setSuccessMsg('تم إنشاء مكان التصوير بنجاح');
      }

      setIsModalOpen(false);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setFormError(err.message || 'فشل حفظ مكان التصوير');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (loc: ILocation) => {
    if (!window.confirm(`هل أنت متأكد من حذف مكان التصوير (${loc.name})؟`)) {
      return;
    }

    try {
      setError(null);
      await api.admin.deleteLocation(loc._id);
      setSuccessMsg(`تم حذف مكان (${loc.name}) بنجاح`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'تعذر حذف مكان التصوير');
    }
  };

  const regionNameOf = (loc: ILocation) =>
    typeof loc.regionId === 'object' ? (loc.regionId as any)?.name : 'غير محدد';

  const StatusBadge = ({ loc }: { loc: ILocation }) => (
    <span
      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap ${
        loc.status === 'published'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}
    >
      {loc.status === 'published' ? 'منشور' : 'مسودة'}
    </span>
  );

  const Thumb = ({ loc, cls }: { loc: ILocation; cls: string }) =>
    loc.coverImage ? (
      <img
        src={loc.coverImage}
        alt={loc.name}
        className={`${cls} rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0`}
      />
    ) : (
      <div
        className={`${cls} rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0`}
      >
        <Camera className="w-5 h-5" />
      </div>
    );

  const FeaturedBadge = () => (
    <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
      <Star className="w-2.5 h-2.5 fill-current" />
      مميز
    </span>
  );

  const SectionBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="p-3.5 sm:p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-3.5">
      <h3 className="text-xs font-bold text-gray-800">{title}</h3>
      {children}
    </section>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4 sm:pb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">إدارة أماكن التصوير</h1>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            إضافة وتعديل معارض الصور والأسعار المستقلة لكل مكان تصوير تابع للمناطق.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm sm:text-xs shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مكان تصوير</span>
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

      {/* Locations */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-gray-500 text-xs">جاري تحميل أماكن التصوير...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-xl sm:rounded-2xl border border-dashed border-gray-300 space-y-3">
          <Camera className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500">لا توجد أماكن تصوير مسجلة بعد.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-amber-600 text-white text-xs font-semibold rounded-lg"
          >
            إضافة أول مكان تصوير
          </button>
        </div>
      ) : (
        <>
          {/* ===== موبايل / تابلت صغير: كروت ===== */}
          <div className="lg:hidden space-y-3">
            {locations.map((loc) => (
              <div
                key={loc._id}
                className="bg-white rounded-xl border border-gray-200 shadow-xs p-3.5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <Thumb loc={loc} cls="w-16 h-16" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-gray-900 leading-snug">{loc.name}</h3>
                      <StatusBadge loc={loc} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {regionNameOf(loc)}
                      </span>
                      {loc.isFeatured && <FeaturedBadge />}
                    </div>
                    <span className="block text-[11px] text-gray-400 font-mono truncate" dir="ltr">
                      /{loc.slug}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-neutral-50 border border-neutral-100 py-2 px-1">
                    <span className="block text-[10px] text-gray-500">سعر التصوير</span>
                    <span className="block text-xs font-bold text-gray-800 mt-0.5">
                      {priceText(loc.photographyPrice)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-neutral-50 border border-neutral-100 py-2 px-1">
                    <span className="block text-[10px] text-gray-500">سعر القاعة</span>
                    <span className="block text-xs font-bold text-gray-800 mt-0.5">
                      {priceText(loc.venuePrice)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-neutral-50 border border-neutral-100 py-2 px-1">
                    <span className="block text-[10px] text-gray-500">الصور</span>
                    <span className="block text-xs font-bold text-gray-800 mt-0.5">
                      {loc.gallery?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(loc)}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 active:bg-amber-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>تعديل</span>
                  </button>
                  <button
                    onClick={() => handleDelete(loc)}
                    className="inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-gray-200 text-red-600 text-xs font-semibold hover:bg-red-50 hover:border-red-200 active:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ===== كمبيوتر: جدول (من lg علشان فيه 7 أعمدة) ===== */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">مكان التصوير</th>
                    <th className="py-3 px-4">المنطقة التابع لها</th>
                    <th className="py-3 px-4">سعر التصوير</th>
                    <th className="py-3 px-4">سعر القاعة / المكان</th>
                    <th className="py-3 px-4">الصور</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {locations.map((loc) => (
                    <tr key={loc._id} className="hover:bg-neutral-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 font-semibold text-gray-900">
                          <Thumb loc={loc} cls="w-10 h-10" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span>{loc.name}</span>
                              {loc.isFeatured && <FeaturedBadge />}
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono block" dir="ltr">
                              {loc.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>{regionNameOf(loc)}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {priceText(loc.photographyPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {priceText(loc.venuePrice)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                        {loc.gallery?.length || 0} صورة
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge loc={loc} />
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(loc)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition"
                            title="تعديل"
                            aria-label={`تعديل ${loc.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(loc)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 transition"
                            title="حذف"
                            aria-label={`حذف ${loc.name}`}
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
          aria-label={editingLoc ? 'تعديل مكان التصوير' : 'إضافة مكان تصوير جديد'}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl text-right shadow-2xl max-h-[94dvh] sm:max-h-[90vh] flex flex-col"
          >
            {/* Header ثابت */}
            <div className="shrink-0 flex items-center justify-between gap-3 px-5 sm:px-8 pt-5 pb-3 sm:pt-7 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingLoc ? 'تعديل مكان التصوير' : 'إضافة مكان تصوير جديد'}
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

                {/* الأساسيات */}
                <SectionBox title="البيانات الأساسية">
                  <div className="space-y-1.5">
                    <label className={labelCls}>المنطقة التابع لها المكان *</label>
                    <select
                      required
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value)}
                      className={inputCls}
                    >
                      <option value="" disabled>
                        -- اختر المنطقة --
                      </option>
                      {regions.map((reg) => (
                        <option key={reg._id} value={reg._id}>
                          {reg.name} ({reg.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className={labelCls}>اسم مكان التصوير *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => handleSlugify(e.target.value)}
                        placeholder="حديقة الطفل - مدينة نصر"
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
                        placeholder="child-park-nasr-city"
                        dir="ltr"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className={`${inputCls} font-mono`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className={labelCls}>العنوان بالتفصيل</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="شارع مكرم عبيد، المنطقة السادسة"
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelCls}>رابط خرائط Google (اختياري)</label>
                      <input
                        type="url"
                        inputMode="url"
                        value={mapUrl}
                        onChange={(e) => setMapUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        dir="ltr"
                        autoCapitalize="none"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>وصف قصير للبطاقة</label>
                    <input
                      type="text"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="مساحات خضراء شاسعة وبحيرات صناعية مميزة للتصوير"
                      className={inputCls}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>الوصف الكامل للمكان</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="تفاصيل مواعيد الدخول، الإضاءة، أفضل زوايا التصوير..."
                      className={inputCls}
                    />
                  </div>
                </SectionBox>

                {/* الأسعار */}
                <SectionBox title="تفاصيل الأسعار (يتم تخزين كل سعر بشكل مستقل)">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className={labelCls}>نوع سعر جلسة التصوير</label>
                      <select
                        value={photoPriceType}
                        onChange={(e) => setPhotoPriceType(e.target.value as PriceType)}
                        className={inputCls}
                      >
                        <option value="fixed">سعر ثابت (Fixed)</option>
                        <option value="starting_from">يبدأ من (Starting from)</option>
                        <option value="on_request">حسب الاتفاق (On request)</option>
                      </select>
                    </div>
                    {photoPriceType !== 'on_request' && (
                      <div className="space-y-1.5">
                        <label className={labelCls}>مبلغ سعر التصوير (جنيه)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          required
                          value={photoAmount}
                          onChange={(e) => setPhotoAmount(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className={labelCls}>نوع سعر حجز المكان / القاعة</label>
                      <select
                        value={venuePriceType}
                        onChange={(e) => setVenuePriceType(e.target.value as PriceType)}
                        className={inputCls}
                      >
                        <option value="fixed">سعر ثابت (Fixed)</option>
                        <option value="starting_from">يبدأ من (Starting from)</option>
                        <option value="on_request">حسب الاتفاق (On request)</option>
                      </select>
                    </div>
                    {venuePriceType !== 'on_request' && (
                      <div className="space-y-1.5">
                        <label className={labelCls}>مبلغ حجز المكان (جنيه)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          required
                          value={venueAmount}
                          onChange={(e) => setVenueAmount(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1 min-h-[44px] sm:min-h-0">
                    <input
                      type="checkbox"
                      checked={showTotal}
                      onChange={(e) => setShowTotal(e.target.checked)}
                      className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 shrink-0"
                    />
                    <span className="text-xs text-gray-700 font-medium leading-relaxed">
                      عرض إجمالي التكلفة التقديرية للعميل (إذا كان السعران معلومين)
                    </span>
                  </label>
                </SectionBox>

                {/* الصور */}
                <SectionBox title="الصور">
                  <div className="space-y-2">
                    <ImageUploader
                      label="صورة الغلاف الرئيسية للمكان"
                      onUploaded={(img) => setCoverImage(img.url)}
                      defaultAlt={name}
                    />
                    {coverImage && (
                      <div className="relative aspect-[16/9] max-h-48 w-full rounded-xl overflow-hidden border border-gray-200">
                        <img src={coverImage} alt="غلاف" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCoverImage('')}
                          aria-label="إزالة صورة الغلاف"
                          className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                      معرض صور المكان ({gallery.length} صورة)
                    </h4>
                    <ImageUploader
                      label="إضافة صور جديدة للمعرض"
                      onUploaded={addGalleryImage}
                      defaultAlt={name}
                    />
                    {gallery.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                        {gallery.map((img, i) => (
                          <div
                            key={img.publicId || i}
                            className="relative aspect-square rounded-xl overflow-hidden border border-gray-200"
                          >
                            <img
                              src={img.url}
                              alt={img.alt}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(i)}
                              aria-label={`حذف الصورة ${i + 1}`}
                              className="absolute top-1 right-1 w-7 h-7 bg-red-600/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SectionBox>

                {/* النشر */}
                <SectionBox title="إعدادات النشر">
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5">
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
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px] sm:min-h-0">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-5 h-5 sm:w-4 sm:h-4 rounded text-amber-600 focus:ring-amber-500 shrink-0"
                    />
                    <span className="text-xs font-semibold text-gray-700">مكان مميز</span>
                  </label>
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
                    : editingLoc
                    ? 'حفظ التعديلات'
                    : 'إنشاء مكان التصوير'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}