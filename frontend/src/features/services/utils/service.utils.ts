import { PriceType } from '../../../components/admin/types';
import { IService } from '../../../types';
import { ServiceFormValues } from '../types/service.types';

export const priceText = (p?: { type?: PriceType; amount?: number | null } | null) =>
  !p || p.type === 'on_request' ? 'حسب الطلب' : `${p.amount ?? ''} ج.م`;

export const createEmptyForm = (sortOrder: number): ServiceFormValues => ({
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  mainImage: '',
  priceType: 'fixed',
  priceAmount: 800,
  visHomepage: true,
  visServicesPage: true,
  visAllLocations: true,
  isActive: true,
  status: 'published',
  sortOrder,
});

export const serviceToForm = (s: IService): ServiceFormValues => ({
  name: s.name,
  slug: s.slug,
  shortDescription: s.shortDescription || '',
  description: s.description || '',
  mainImage: s.mainImage || '',
  priceType: s.price?.type || 'on_request',
  priceAmount: s.price?.amount ?? '',
  visHomepage: !!s.visibility?.homepage,
  visServicesPage: s.visibility?.servicesPage !== false,
  visAllLocations: !!s.visibility?.allLocations,
  isActive: s.isActive !== false,
  status: s.status,
  sortOrder: s.sortOrder || 0,
});

export const buildPayload = (v: ServiceFormValues) => ({
  name: v.name,
  slug: v.slug,
  shortDescription: v.shortDescription,
  description: v.description,
  mainImage: v.mainImage,
  price: {
    type: v.priceType,
    amount: v.priceType === 'on_request' ? null : Number(v.priceAmount),
  },
  visibility: {
    homepage: v.visHomepage,
    servicesPage: v.visServicesPage,
    allLocations: v.visAllLocations,
  },
  isActive: v.isActive,
  status: v.status,
  sortOrder: Number(v.sortOrder),
});