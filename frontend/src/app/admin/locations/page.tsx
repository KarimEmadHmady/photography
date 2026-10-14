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
  const [photoPriceType, setPhotoPriceType] = useState<'fixed' | 'starting_from' | 'on_request'>('fixed');
  const [photoAmount, setPhotoAmount] = useState<number | string>(1500);
  const [venuePriceType, setVenuePriceType] = useState<'fixed' | 'starting_from' | 'on_request'>('fixed');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">إدارة أماكن التصوير</h1>
          <p className="text-xs text-gray-500 mt-1">
            إضافة وتعديل معارض الصور والأسعار المستقلة لكل مكان تصوير تابع للمناطق.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مكان تصوير</span>
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

      {/* Locations Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <p className="text-gray-500 text-xs">جاري تحميل أماكن التصوير...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 space-y-3">
          <Camera className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500">لا توجد أماكن تصوير مسجلة بعد.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg"
          >
            إضافة أول مكان تصوير
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
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
                {locations.map((loc) => {
                  const regName =
                    typeof loc.regionId === 'object' ? (loc.regionId as any)?.name : 'غير محدد';
                  return (
                    <tr key={loc._id} className="hover:bg-neutral-50/50 transition">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-3">
                        {loc.coverImage ? (
                          <img
                            src={loc.coverImage}
                            alt={loc.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{loc.name}</span>
                            {loc.isFeatured && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                مميز
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono block" dir="ltr">
                            {loc.slug}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>{regName}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {loc.photographyPrice?.type === 'on_request'
                          ? 'حسب الاتفاق'
                          : `${loc.photographyPrice?.amount} ج.م`}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {loc.venuePrice?.type === 'on_request'
                          ? 'حسب الاتفاق'
                          : `${loc.venuePrice?.amount} ج.م`}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                        {loc.gallery?.length || 0} صورة
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            loc.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {loc.status === 'published' ? 'منشور' : 'مسودة'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(loc)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-amber-700 hover:bg-amber-50 transition"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(loc)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 transition"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 text-right shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 left-5 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900">
              {editingLoc ? 'تعديل مكان التصوير' : 'إضافة مكان تصوير جديد'}
            </h2>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Region Selector */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  المنطقة التابع لها المكان *
                </label>
                <select
                  required
                  value={regionId}
                  onChange={(e) => setRegionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-amber-500"
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

              {/* Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    اسم مكان التصوير *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleSlugify(e.target.value)}
                    placeholder="حديقة الطفل - مدينة نصر"
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
                    placeholder="child-park-nasr-city"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Address & Maps URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">العنوان بالتفصيل</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="شارع مكرم عبيد، المنطقة السادسة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    رابط خرائط Google (اختياري)
                  </label>
                  <input
                    type="url"
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
              </div>

              {/* Short Description & Full Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">وصف قصير للبطاقة</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="مساحات خضراء شاسعة وبحيرات صناعية مميزة للتصوير"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">الوصف الكامل للمكان</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="تفاصيل مواعيد الدخول، الإضاءة، أفضل زوايا التصوير..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              {/* Pricing Grid */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-4">
                <h3 className="text-xs font-bold text-gray-800">
                  تفاصيل الأسعار (يتم تخزين كل سعر بشكل مستقل)
                </h3>

                {/* Photography Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600">
                      نوع سعر جلسة التصوير
                    </label>
                    <select
                      value={photoPriceType}
                      onChange={(e) => setPhotoPriceType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                    >
                      <option value="fixed">سعر ثابت (Fixed)</option>
                      <option value="starting_from">يبدأ من (Starting from)</option>
                      <option value="on_request">حسب الاتفاق (On request)</option>
                    </select>
                  </div>
                  {photoPriceType !== 'on_request' && (
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-600">
                        مبلغ سعر التصوير (جنيه)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={photoAmount}
                        onChange={(e) => setPhotoAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Venue Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-gray-600">
                      نوع سعر حجز المكان / القاعة
                    </label>
                    <select
                      value={venuePriceType}
                      onChange={(e) => setVenuePriceType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                    >
                      <option value="fixed">سعر ثابت (Fixed)</option>
                      <option value="starting_from">يبدأ من (Starting from)</option>
                      <option value="on_request">حسب الاتفاق (On request)</option>
                    </select>
                  </div>
                  {venuePriceType !== 'on_request' && (
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-600">
                        مبلغ حجز المكان (جنيه)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={venueAmount}
                        onChange={(e) => setVenueAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Show Total Toggle */}
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={showTotal}
                    onChange={(e) => setShowTotal(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs text-gray-700 font-medium">
                    عرض إجمالي التكلفة التقديرية للعميل (إذا كان السعران معلومين)
                  </span>
                </label>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <ImageUploader
                  label="صورة الغلاف الرئيسية للمكان"
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

              {/* Gallery Management */}
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <h3 className="text-xs font-bold text-gray-800">
                  معرض صور المكان ({gallery.length} صورة)
                </h3>
                <ImageUploader
                  label="إضافة صور جديدة للمعرض"
                  onUploaded={addGalleryImage}
                  defaultAlt={name}
                />
                {gallery.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                    {gallery.map((img, i) => (
                      <div
                        key={img.publicId || i}
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group"
                      >
                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-full text-xs transition"
                          title="حذف الصورة"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status and Flags */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">ترتيب الظهور</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-gray-600">حالة النشر</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                  >
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                  </select>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600"
                    />
                    <span className="text-xs font-semibold text-gray-700">مكان مميز</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
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
                  {submitting ? 'جاري الحفظ...' : editingLoc ? 'حفظ التعديلات' : 'إنشاء مكان التصوير'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
