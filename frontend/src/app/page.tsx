'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { IRegion, ILocation, IService, ISiteSettings } from '../types';
import {
  HomeHero,
  HomeFeaturedRegions,
  HomeFeaturedLocations,
  HomeFeaturedServices,
  HomeHowItWorks,
  HomeContactCta,
  HomeSkeleton,
  HomeErrorState,
} from '../components/home';

export default function HomePage() {
  const [data, setData] = useState<{
    settings: ISiteSettings;
    sections: any[];
    featuredRegions: IRegion[];
    featuredLocations: ILocation[];
    featuredServices: IService[];
    portfolioItems: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    api.public
      .getHomepage()
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || 'فشل في تحميل بيانات الصفحة الرئيسية');
        }
      })
      .catch((err) => {
        setError(err.message || 'تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // إجبار المتصفح على البقاء في أعلى الصفحة ومنع القفز لأسفل
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  // عند انتهاء التحميل نضمن أن الصفحة تبدأ من الأعلى تماماً
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [loading]);

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error || !data) {
    return <HomeErrorState error={error} onRetry={loadData} />;
  }

  const { settings, featuredRegions, featuredLocations, featuredServices } = data;

  const whatsappUrl = `https://wa.me/${(settings.contact.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    settings.contact.defaultWhatsappMessage || ''
  )}`;

  return (
    <div className="bg-white overflow-hidden">
      {/* 1. Hero Section - مع أنيميشن متتابع للعنوان والأزرار والكارت */}
      <HomeHero settings={settings} whatsappUrl={whatsappUrl} />

      {/* 2. Featured Regions Section - مع أنيميشن متتابع للعنوان والكروت */}
      <HomeFeaturedRegions regions={featuredRegions} />

      {/* 3. Featured Locations Section - مع أنيميشن متتابع للعنوان والكارت الرئيسي والكروت الجانبية */}
      <HomeFeaturedLocations
        locations={featuredLocations}
        currency={settings.currencyLabel}
      />

      {/* 4. Featured Services Section - مع أنيميشن متتابع للباقات والخدمات */}
      <HomeFeaturedServices
        services={featuredServices}
        currency={settings.currencyLabel}
      />

      {/* 5. How It Works Section - مع أنيميشن متتابع للخطوات 1 إلى 4 */}
      <HomeHowItWorks />

      {/* 6. Contact CTA Section - مع أنيميشن زووم وتتابع للعنوان والتفاصيل وأزرار التواصل */}
      <HomeContactCta
        whatsappUrl={whatsappUrl}
        phone={settings.contact?.phone}
      />
    </div>
  );
}