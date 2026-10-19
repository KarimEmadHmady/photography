import { IGalleryImage } from '../../../types';

import type { PriceType } from '../../../components/admin/types';
export type { PriceType };

export type LocationStatus = 'draft' | 'published';

export interface LocationFormValues {
  regionId: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  address: string;
  mapUrl: string;
  coverImage: string;
  gallery: IGalleryImage[];
  photoPriceType: PriceType;
  photoAmount: number | string;
  venuePriceType: PriceType;
  venueAmount: number | string;
  showTotal: boolean;
  isFeatured: boolean;
  status: LocationStatus;
  sortOrder: number;
}


export type SetFormField = <K extends keyof LocationFormValues>(
  key: K,
  value: LocationFormValues[K]
) => void;