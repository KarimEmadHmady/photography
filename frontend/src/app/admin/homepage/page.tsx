'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Check,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { IRegion, ILocation, IService, IHomepageSection } from '../../../types';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2';

/* ترتيب ثابت للمقارنة (علشان نعرف فيه تعديلات ولا لأ) */
const snapshot = (
  sections: IHomepageSection[],
  r: string[],
  l: string[],
  s: string[]
) =>
  JSON.stringify({
    sections: sections.map((x) => ({ id: x.id, enabled: x.enabled, order: x.order })),
    r: [...r].sort(),
    l: [...l].sort(),
    s: [...s].sort(),
  });

function PickCard({
  selected,
  onToggle,
  title,
  subtitle,
}: {
  selected: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="checkbox"
      aria-checked={selected}
      className={`w-full min-h-[52px] p-3 rounded-xl border text-right text-xs transition flex items-center justify-between gap-3 active:scale-[0.99] ${focusRing} ${
        selected
          ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-bold'
          : 'border-gray-200 bg-white hover:bg-neutral-50 text-gray-700'
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate">{title}</span>
        {subtitle && (
          <span className="block text-[10px] text-gray-400 font-normal mt-0.5">{subtitle}</span>
        )}
      </span>
      <span
        className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition ${
          selected ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-gray-300'
        }`}
        aria-hidden="true"
      >
        {selected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

function Panel({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-gray-200 shadow-xs space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">{title}</h2>
        {count !== undefined && (
          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

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

  // آخر حالة اتحفظت (للمقارنة)
  const savedRef = useRef<string>('');

  useEffect(() => {
    Promise.all([
      api.admin.getHomepage(),
      api.admin.getRegions(),
      api.admin.getLocations(),
      api.admin.getServices(),
    ])
      .then(([hpRes, regRes, locRes, servRes]) => {
        if (hpRes.success && hpRes.data) {
          const sec = hpRes.data.homepageSections || [];
          const r = hpRes.data.featuredRegionIds || [];
          const l = hpRes.data.featuredLocationIds || [];
          const s = hpRes.data.featuredServiceIds || [];
          setSections(sec);
          setFeaturedRegionIds(r);
          setFeaturedLocationIds(l);
          setFeaturedServiceIds(s);
          savedRef.current = snapshot(sec, r, l, s);
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

  const isDirty = useMemo(
    () =>
      !loading &&
      snapshot(sections, featuredRegionIds, featuredLocationIds, featuredServiceIds) !==
        savedRef.current,
    [loading, sections, featuredRegionIds, featuredLocationIds, featuredServiceIds, successMsg]
  );

  // تحذير لو حاول يقفل الصفحة وفيه تعديلات مش محفوظة
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const toggleSection = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
  };

  const updateSectionOrder = (id: string, newOrder: number) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, order: newOrder } : s)));
  };

  const toggleIn =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => (id: string) =>
      setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleFeaturedRegion = toggleIn(setFeaturedRegionIds);
  const toggleFeaturedLocation = toggleIn(setFeaturedLocationIds);
  const toggleFeaturedService = toggleIn(setFeaturedServiceIds);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
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
      savedRef.current = snapshot(
        sections,
        featuredRegionIds,
        featuredLocationIds,
        featuredServiceIds
      );
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
      <div className="py-16 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <p className="text-gray-500 text-xs">جاري تحميل إعدادات الصفحة الرئيسية...</p>
      </div>
    );
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    
    <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
      {/*
        شريط الحفظ — sticky
        - موبايل: تحت الشريط العلوي (h-14) مباشرة، وبيمتد لحد حواف الشاشة
        - كمبيوتر: لازق فوق خالص (top-0)
        لو الـ layout عندك فيه padding للـ main غير p-4/p-6/p-8، عدّل قيم -mx و px هنا.
      */}
      <div className="sticky top-14 lg:top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 bg-neutral-50/90 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl lg:text-2xl font-extrabold text-gray-900 truncate">
              إدارة محتوى الصفحة الرئيسية
            </h1>
            <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
              التحكم في إظهار وإخفاء وترتيب أقسام الصفحة الرئيسية واختيار العناصر المميزة.
            </p>
            {isDirty && (
              <span className="sm:hidden inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                تعديلات غير محفوظة
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isDirty && (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                تعديلات غير محفوظة
              </span>
            )}
            <button
              type="submit"
              disabled={saving || !isDirty}
              className={`inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-white font-semibold text-sm sm:text-xs shadow-xs transition disabled:cursor-not-allowed ${focusRing} ${
                isDirty
                  ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                  : 'bg-gray-300'
              } ${saving ? 'opacity-70' : ''}`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </div>
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

      {/* 1. Sections Visibility & Ordering */}
      <Panel title="أقسام الصفحة الرئيسية">
        <div className="space-y-2.5">
          {sortedSections.map((section) => (
            <div
              key={section.id}
              className={`flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl border transition ${
                section.enabled
                  ? 'border-gray-200 bg-neutral-50/50'
                  : 'border-dashed border-gray-200 bg-gray-50 opacity-75'
              }`}
            >
              <label className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  checked={section.enabled}
                  onChange={() => toggleSection(section.id)}
                  className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 shrink-0"
                />
                <span className="min-w-0">
                  <span className="font-semibold text-xs text-gray-900 block truncate">
                    {section.title}
                  </span>
                  <span className="text-[11px] text-gray-400 block font-mono truncate" dir="ltr">
                    ID: {section.id}
                  </span>
                </span>
              </label>

              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor={`order-${section.id}`} className="text-[11px] text-gray-500">
                  الترتيب
                </label>
                <input
                  id={`order-${section.id}`}
                  type="number"
                  inputMode="numeric"
                  value={section.order}
                  onChange={(e) => updateSectionOrder(section.id, Number(e.target.value))}
                  className="w-16 px-2 py-2 rounded-lg border border-gray-300 text-base sm:text-xs text-center bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* 2. Featured Regions Selector */}
      <Panel title="المناطق المميزة المعروضة في الرئيسية" count={featuredRegionIds.length}>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {allRegions.map((region) => (
            <PickCard
              key={region._id}
              selected={featuredRegionIds.includes(region._id)}
              onToggle={() => toggleFeaturedRegion(region._id)}
              title={region.name}
            />
          ))}
        </div>
      </Panel>

      {/* 3. Featured Locations Selector */}
      <Panel title="أماكن التصوير المميزة المعروضة في الرئيسية" count={featuredLocationIds.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {allLocations.map((loc) => (
            <PickCard
              key={loc._id}
              selected={featuredLocationIds.includes(loc._id)}
              onToggle={() => toggleFeaturedLocation(loc._id)}
              title={loc.name}
              subtitle={
                loc.photographyPrice?.amount ? `${loc.photographyPrice.amount} ج.م` : undefined
              }
            />
          ))}
        </div>
      </Panel>

      {/* 4. Featured Services Selector */}
      <Panel title="الخدمات المميزة المعروضة في الرئيسية" count={featuredServiceIds.length}>
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {allServices.map((service) => (
            <PickCard
              key={service._id}
              selected={featuredServiceIds.includes(service._id)}
              onToggle={() => toggleFeaturedService(service._id)}
              title={service.name}
            />
          ))}
        </div>
      </Panel>

            {/* زرار حفظ عائم — بيظهر أول ما يبقى فيه تعديلات، وبيفضل ثابت مع السكرول */}
      {isDirty && (
        <div className="fixed z-40 bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:left-6 pb-[env(safe-area-inset-bottom)] pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between sm:justify-start gap-3 p-2.5 sm:p-2 ps-4 rounded-2xl bg-neutral-900/95 backdrop-blur-md text-white shadow-2xl border border-white/10">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              تعديلات غير محفوظة
            </span>
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white font-semibold text-sm sm:text-xs transition disabled:opacity-70 ${focusRing} focus-visible:ring-offset-neutral-900`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      )}
    </form>
   
  );
}