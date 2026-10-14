'use client';

import React, { useEffect, useState } from 'react';
import {
  Home,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { IRegion, ILocation, IService, IHomepageSection } from '../../../types';

export default function AdminHomepageConfigPage() {
  const [sections, setSections] = useState<IHomepageSection[]>([]);
  const [featuredRegionIds, setFeaturedRegionIds] = useState<string[]>([]);
  const [featuredLocationIds, setFeaturedLocationIds] = useState<string[]>([]);
  const [featuredServiceIds, setFeaturedServiceIds] = useState<string[]>([]);

  // Selection pools
  const [allRegions, setAllRegions] = useState<IRegion[]>([]);
  const [allLocations, setAllLocations] = useState<ILocation[]>([]);
  const [allServices, setAllServices] = useState<IService[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.admin.getHomepage(),
      api.admin.getRegions(),
      api.admin.getLocations(),
      api.admin.getServices(),
    ])
      .then(([hpRes, regRes, locRes, servRes]) => {
        if (hpRes.success && hpRes.data) {
          setSections(hpRes.data.homepageSections || []);
          setFeaturedRegionIds(hpRes.data.featuredRegionIds || []);
          setFeaturedLocationIds(hpRes.data.featuredLocationIds || []);
          setFeaturedServiceIds(hpRes.data.featuredServiceIds || []);
        }
        if (regRes.success && regRes.data) setAllRegions(regRes.data);
        if (locRes.success && locRes.data) setAllLocations(locRes.data);
        if (servRes.success && servRes.data) setAllServices(servRes.data);
      })
      .catch((err) => {
        setError(err.message || 'تعذر تحميل إعدادات الصفحة الرئيسية');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = (id: string) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const updateSectionOrder = (id: string, newOrder: number) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, order: newOrder } : s))
    );
  };

  const toggleFeaturedRegion = (id: string) => {
    setFeaturedRegionIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const toggleFeaturedLocation = (id: string) => {
    setFeaturedLocationIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const toggleFeaturedService = (id: string) => {
    setFeaturedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.admin.updateHomepage({
        homepageSections: sections,
        featuredRegionIds,
        featuredLocationIds,
        featuredServiceIds,
      });
      setSuccessMsg('تم حفظ وتحديث إعدادات الصفحة الرئيسية بنجاح');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError(err.message || 'فشل في حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-500 text-xs">جاري تحميل إعدادات الصفحة الرئيسية...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">إدارة محتوى الصفحة الرئيسية</h1>
          <p className="text-xs text-gray-500 mt-1">
            التحكم في إظهار وإخفاء وترتيب أقسام الصفحة الرئيسية واختيار العناصر المميزة.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>حفظ التعديلات</span>
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

      {/* 1. Sections Visibility & Ordering */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">أقسام الصفحة الرئيسية</h2>
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-neutral-50/50"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={() => toggleSection(section.id)}
                  className="w-4 h-4 rounded text-amber-600"
                />
                <div>
                  <span className="font-semibold text-xs text-gray-900">{section.title}</span>
                  <span className="text-[11px] text-gray-400 block font-mono">
                    ID: {section.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">الترتيب:</span>
                <input
                  type="number"
                  value={section.order}
                  onChange={(e) => updateSectionOrder(section.id, Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded-lg border border-gray-300 text-xs text-center bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Featured Regions Selector */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">
          المناطق المميزة المعروضة في الرئيسية ({featuredRegionIds.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allRegions.map((region) => {
            const isSelected = featuredRegionIds.includes(region._id);
            return (
              <div
                key={region._id}
                onClick={() => toggleFeaturedRegion(region._id)}
                className={`p-3 rounded-xl border cursor-pointer text-xs transition flex items-center justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-bold'
                    : 'border-gray-200 hover:bg-neutral-50 text-gray-700'
                }`}
              >
                <span>{region.name}</span>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-amber-600 pointer-events-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Featured Locations Selector */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">
          أماكن التصوير المميزة المعروضة في الرئيسية ({featuredLocationIds.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allLocations.map((loc) => {
            const isSelected = featuredLocationIds.includes(loc._id);
            return (
              <div
                key={loc._id}
                onClick={() => toggleFeaturedLocation(loc._id)}
                className={`p-3 rounded-xl border cursor-pointer text-xs transition flex items-center justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-bold'
                    : 'border-gray-200 hover:bg-neutral-50 text-gray-700'
                }`}
              >
                <div className="truncate max-w-[200px]">
                  <span>{loc.name}</span>
                  <span className="text-[10px] text-gray-400 block font-normal">
                    {loc.photographyPrice?.amount ? `${loc.photographyPrice.amount} ج.م` : ''}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-amber-600 pointer-events-none shrink-0"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Featured Services Selector */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">
          الخدمات المميزة المعروضة في الرئيسية ({featuredServiceIds.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allServices.map((service) => {
            const isSelected = featuredServiceIds.includes(service._id);
            return (
              <div
                key={service._id}
                onClick={() => toggleFeaturedService(service._id)}
                className={`p-3 rounded-xl border cursor-pointer text-xs transition flex items-center justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-bold'
                    : 'border-gray-200 hover:bg-neutral-50 text-gray-700'
                }`}
              >
                <span>{service.name}</span>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded text-amber-600 pointer-events-none shrink-0"
                />
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
}
