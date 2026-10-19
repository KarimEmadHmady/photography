import { IRegion } from '../../../types';
import { RegionFormValues } from '../types/region.types';

export const createEmptyForm = (sortOrder: number): RegionFormValues => ({
  name: '',
  slug: '',
  description: '',
  coverImage: '',
  status: 'published',
  sortOrder,
});

export const regionToForm = (region: IRegion): RegionFormValues => ({
  name: region.name,
  slug: region.slug,
  description: region.description || '',
  coverImage: region.coverImage || '',
  status: region.status,
  sortOrder: region.sortOrder || 0,
});

export const buildPayload = (v: RegionFormValues) => ({
  name: v.name,
  slug: v.slug,
  description: v.description,
  coverImage: v.coverImage,
  status: v.status,
  sortOrder: Number(v.sortOrder),
});