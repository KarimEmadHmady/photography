'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { ILocation, IRegion, ISiteSettings } from '../../types';
import {
  shell,
  container,
  PAGE_SIZE,
  computeHasMore,
  LocationsHeader,
  RegionFilter,
  LocationCard,
  LocationsSkeleton,
  LocationsEmptyState,
  LocationsErrorState,
  LocationsInfiniteFooter,
} from '../../components/locations';
import { ScrollReveal } from '../../components/ui/ScrollReveal';

function LocationsContent() {
  const searchParams = useSearchParams();
  const urlRegion = searchParams.get('region') || '';

  const [locations, setLocations] = useState<ILocation[]>([]);
  const [regions, setRegions] = useState<IRegion[]>([]);
  const [settings, setSettings] = useState<ISiteSettings | null>(null);
  const [selectedRegion, setSelectedRegion] = useState(urlRegion);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalLocations, setTotalLocations] = useState(0);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  /** رقم الطلب الحالي: أي رد جاي من طلب أقدم بيتتجاهل (يمنع الـ race condition) */
  const requestIdRef = useRef(0);

  /** آخر قيم الـ state، علشان الـ observer يتعمل مرة واحدة من غير dependencies */
  const stateRef = useRef({
    loading,
    loadingMore,
    hasMore,
    page,
    selectedRegion,
    loadMoreError,
  });
  stateRef.current = { loading, loadingMore, hasMore, page, selectedRegion, loadMoreError };

  /* ---------- المناطق والإعدادات ---------- */
  const fetchRegionsAndSettings = useCallback(() => {
    setRegionsLoading(true);
    api.public
      .getRegions()
      .then((res) => {
        if (res.success && res.data) setRegions(res.data);
      })
      .catch((err) => {
        console.error('Failed to load regions:', err);
      })
      .finally(() => setRegionsLoading(false));

    api.public
      .getSettings()
      .then((res) => {
        if (res.success && res.data) setSettings(res.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchRegionsAndSettings();
  }, [fetchRegionsAndSettings]);

  /* ---------- الفلتر + الـ URL ---------- */
  const selectRegion = useCallback((slug: string) => {
    setSelectedRegion(slug);
    const url = slug ? `/locations?region=${encodeURIComponent(slug)}` : '/locations';
    window.history.replaceState(null, '', url);
  }, []);

  // لو الـ URL اتغير من برة (لينك من النافبار مثلاً) نزامن الفلتر معاه
  useEffect(() => {
    setSelectedRegion(urlRegion);
  }, [urlRegion]);

  /* ---------- جلب أول صفحة ---------- */
  const fetchInitialLocations = useCallback((regionSlug: string) => {
    const myId = ++requestIdRef.current;

    setLoading(true);
    setLoadingMore(false);
    setLoadMoreError(false);
    setError(null);
    setPage(1);

    api.public
      .getLocations({
        region: regionSlug || undefined,
        page: 1,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        if (myId !== requestIdRef.current) return;
        if (res.success && res.data) {
          setLocations(res.data);
          setTotalLocations(res.pagination?.total ?? res.data.length);
          setHasMore(computeHasMore(res.pagination, 1, res.data.length));
        } else {
          setError(res.message || 'فشل في تحميل أماكن التصوير');
        }
      })
      .catch((err) => {
        if (myId !== requestIdRef.current) return;
        setError(err.message || 'تعذر الاتصال بالسيرفر، يرجى إعادة المحاولة.');
      })
      .finally(() => {
        if (myId === requestIdRef.current) setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchInitialLocations(selectedRegion);
  }, [selectedRegion, fetchInitialLocations]);

  /* ---------- جلب الصفحات التالية (Infinite Scroll) ---------- */
  const loadMoreLocations = useCallback(() => {
    const s = stateRef.current;
    if (s.loading || s.loadingMore || !s.hasMore || s.loadMoreError) return;

    const myId = requestIdRef.current;
    const nextPage = s.page + 1;

    stateRef.current.loadingMore = true;
    setLoadingMore(true);

    api.public
      .getLocations({
        region: s.selectedRegion || undefined,
        page: nextPage,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        if (myId !== requestIdRef.current) return;
        if (res.success && res.data) {
          const newItems = res.data;
          setLocations((prev) => {
            const existingIds = new Set(prev.map((l) => l._id));
            return [...prev, ...newItems.filter((l) => !existingIds.has(l._id))];
          });
          setPage(nextPage);
          setTotalLocations((prev) => res.pagination?.total ?? prev);
          setHasMore(computeHasMore(res.pagination, nextPage, newItems.length));
        } else {
          setLoadMoreError(true);
        }
      })
      .catch((err) => {
        if (myId !== requestIdRef.current) return;
        console.error('Failed to load more locations:', err);
        setLoadMoreError(true);
      })
      .finally(() => {
        if (myId === requestIdRef.current) setLoadingMore(false);
      });
  }, []);

  const retryLoadMore = () => {
    setLoadMoreError(false);
    stateRef.current.loadMoreError = false;
    loadMoreLocations();
  };

  /* ---------- مراقب التمرير ---------- */
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreLocations();
      },
      { root: null, rootMargin: '250px', threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMoreLocations]);

  useEffect(() => {
    if (loading || loadingMore || !hasMore || loadMoreError) return;
    const el = observerTarget.current;
    if (!el) return;
    if (el.getBoundingClientRect().top <= window.innerHeight + 250) {
      loadMoreLocations();
    }
  }, [locations.length, loading, loadingMore, hasMore, loadMoreError, loadMoreLocations]);

  const currency = settings?.currencyLabel || 'جنيه';

  return (
    <div className={shell}>
      <div className={`${container} space-y-5 lg:space-y-6`}>
        {/* Header */}
        <LocationsHeader />

        {/* Region filter */}
        <RegionFilter
          regions={regions}
          selectedRegion={selectedRegion}
          regionsLoading={regionsLoading}
          onSelectRegion={selectRegion}
          onRetryRegions={fetchRegionsAndSettings}
        />

        {/* Content State */}
        {loading ? (
          <LocationsSkeleton />
        ) : error ? (
          <LocationsErrorState
            error={error}
            onRetry={() => fetchInitialLocations(selectedRegion)}
          />
        ) : locations.length === 0 ? (
          <LocationsEmptyState />
        ) : (
          <>
            <ScrollReveal animation="fade" delay={50} duration={600}>
              <div className="flex items-center justify-between text-xs text-neutral-500 text-right">
                <span>
                  {totalLocations > 0
                    ? `عرض ${locations.length} من أصل ${totalLocations} مكان تصوير`
                    : `${locations.length} مكان تصوير`}
                </span>
              </div>
            </ScrollReveal>

            <div className="content-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {locations.map((loc, index) => (
                <LocationCard
                  key={loc._id}
                  location={loc}
                  index={index}
                  currency={currency}
                />
              ))}
            </div>

            {/* مؤشر وحالات التحميل التلقائي */}
            <LocationsInfiniteFooter
              loadingMore={loadingMore}
              loadMoreError={loadMoreError}
              hasMore={hasMore}
              loadedCount={locations.length}
              totalLocations={totalLocations}
              pageSize={PAGE_SIZE}
              onRetry={retryLoadMore}
            />
          </>
        )}

        {/* عنصر المراقبة للـ Infinite Scroll */}
        <div ref={observerTarget} className="h-6 w-full" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function LocationsPage() {
  return (
    <Suspense
      fallback={
        <div className={shell}>
          <div className="min-h-[50vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
        </div>
      }
    >
      <LocationsContent />
    </Suspense>
  );
}