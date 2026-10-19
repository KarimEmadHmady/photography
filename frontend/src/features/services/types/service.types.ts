import { PriceType } from '../../../components/admin/types';
import { PublishStatus } from '../../../components/admin/StatusBadge';

export interface ServiceFormValues {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  priceType: PriceType;
  priceAmount: number | string;
  visHomepage: boolean;
  visServicesPage: boolean;
  visAllLocations: boolean;
  isActive: boolean;
  status: PublishStatus;
  sortOrder: number;
}

export type SetServiceField = <K extends keyof ServiceFormValues>(
  key: K,
  value: ServiceFormValues[K]
) => void;