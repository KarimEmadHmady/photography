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
  }, []);

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
    <div className="bg-white">
      {/* 1. Hero Section */}
      <HomeHero settings={settings} whatsappUrl={whatsappUrl} />

      {/* 2. Featured Regions Section */}
      <HomeFeaturedRegions regions={featuredRegions} />

      {/* 3. Featured Locations Section */}
      <HomeFeaturedLocations
        locations={featuredLocations}
        currency={settings.currencyLabel}
      />

      {/* 4. Featured Services Section */}
      <HomeFeaturedServices
        services={featuredServices}
        currency={settings.currencyLabel}
      />

      {/* 5. How It Works Section */}
      <HomeHowItWorks />

      {/* 6. Contact CTA Section */}
      <HomeContactCta
        whatsappUrl={whatsappUrl}
        phone={settings.contact?.phone}
      />
    </div>
  );
}