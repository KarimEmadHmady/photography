import { PublishStatus } from '../../../components/admin/StatusBadge';

export interface RegionFormValues {
    name: string;
    slug: string;
    description: string;
    coverImage: string;
    status: PublishStatus;
    sortOrder: number;
}

export type SetRegionField = <K extends keyof RegionFormValues>(
    key: K,
    value: RegionFormValues[K]
) => void;