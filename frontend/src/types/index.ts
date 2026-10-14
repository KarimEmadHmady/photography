export interface IPrice {
  amount: number | null;
  type: 'fixed' | 'starting_from' | 'on_request';
}

export interface IGalleryImage {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  alt: string;
  sortOrder: number;
}

export interface IRegion {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published';
  sortOrder: number;
  locationCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ILocation {
  _id: string;
  regionId: string | IRegion;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  address?: string;
  mapUrl?: string;
  coverImage?: string;
  gallery: IGalleryImage[];
  photographyPrice: IPrice;
  venuePrice: IPrice;
  showTotal: boolean;
  computedTotalPrice?: number | null;
  relatedServiceIds: (string | IService)[];
  relatedLocationIds?: (string | ILocation)[];
  isFeatured: boolean;
  status: 'draft' | 'published';
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  relatedServices?: IService[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IServiceVariant {
  name: string;
  description?: string;
  price?: IPrice;
}

export interface IService {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  mainImage?: string;
  gallery?: IGalleryImage[];
  videoUrl?: string;
  price: IPrice;
  variants?: IServiceVariant[];
  visibility: {
    homepage: boolean;
    servicesPage: boolean;
    allLocations: boolean;
  };
  locationIds?: (string | ILocation)[];
  isFeatured: boolean;
  isActive: boolean;
  status: 'draft' | 'published';
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IHomepageSection {
  id: string;
  enabled: boolean;
  order: number;
  title: string;
  description?: string;
}

export interface IPortfolioItem {
  locationId: string;
  locationName?: string;
  locationSlug?: string;
  imagePublicId: string;
  imageUrl?: string;
  alt?: string;
}

export interface ISiteSettings {
  photographerName: string;
  logo?: string;
  favicon?: string;
  hero: {
    title: string;
    description: string;
    imageUrl: string;
    primaryCtaText: string;
    primaryCtaUrl: string;
    secondaryCtaText: string;
    secondaryCtaUrl: string;
  };
  about: {
    bio: string;
    imageUrl?: string;
  };
  homepageSections?: IHomepageSection[];
  featuredRegionIds?: string[];
  featuredLocationIds?: string[];
  portfolioItems?: IPortfolioItem[];
  featuredServiceIds?: string[];
  contact: {
    phone: string;
    whatsappNumber: string;
    defaultWhatsappMessage: string;
    instagram?: string;
    facebook?: string;
    email?: string;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  defaultSeo: {
    title: string;
    description: string;
  };
  footer: {
    copyrightText: string;
    privacyNotice?: string;
  };
  currencyLabel: string;
}

export interface IAdmin {
  _id: string;
  phone: string;
  name: string;
  email?: string;
  lastLoginAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
