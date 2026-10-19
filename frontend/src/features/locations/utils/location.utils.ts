import { ILocation } from '../../../types';
import { LocationFormValues, PriceType } from '../types/location.types';

export const priceText = (p?: { type?: PriceType; amount?: number | null } | null) =>
  !p || p.type === 'on_request' ? 'حسب الاتفاق' : `${p.amount ?? ''} ج.م`;

export const regionNameOf = (loc: ILocation) =>
  typeof loc.regionId === 'object' ? (loc.regionId as any)?.name : 'غير محدد';


export const createEmptyForm = (regionId: string, sortOrder: number): LocationFormValues => ({
  regionId,
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  address: '',
  mapUrl: '',
  coverImage: '',
  gallery: [],
  photoPriceType: 'fixed',
  photoAmount: 1500,
  venuePriceType: 'fixed',
  venueAmount: 500,
  showTotal: true,
  isFeatured: false,
  status: 'published',
  sortOrder,
});

export const locationToForm = (loc: ILocation): LocationFormValues => {
  const regId = typeof loc.regionId === 'object' ? (loc.regionId as any)._id : loc.regionId;
  return {
    regionId: regId || '',
    name: loc.name,
    slug: loc.slug,
    shortDescription: loc.shortDescription || '',
    description: loc.description || '',
    address: loc.address || '',
    mapUrl: loc.mapUrl || '',
    coverImage: loc.coverImage || '',
    gallery: loc.gallery || [],
    photoPriceType: loc.photographyPrice?.type || 'on_request',
    photoAmount: loc.photographyPrice?.amount ?? '',
    venuePriceType: loc.venuePrice?.type || 'on_request',
    venueAmount: loc.venuePrice?.amount ?? '',
    showTotal: loc.showTotal,
    isFeatured: loc.isFeatured,
    status: loc.status,
    sortOrder: loc.sortOrder || 0,
  };
};

export const buildPayload = (v: LocationFormValues) => ({
  regionId: v.regionId,
  name: v.name,
  slug: v.slug,
  shortDescription: v.shortDescription,
  description: v.description,
  address: v.address,
  mapUrl: v.mapUrl,
  coverImage: v.coverImage,
  gallery: v.gallery,
  photographyPrice: {
    type: v.photoPriceType,
    amount: v.photoPriceType === 'on_request' ? null : Number(v.photoAmount),
  },
  venuePrice: {
    type: v.venuePriceType,
    amount: v.venuePriceType === 'on_request' ? null : Number(v.venueAmount),
  },
  showTotal: v.showTotal,
  isFeatured: v.isFeatured,
  status: v.status,
  sortOrder: Number(v.sortOrder),
});