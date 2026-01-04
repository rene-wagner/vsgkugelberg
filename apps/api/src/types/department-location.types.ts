import { DepartmentLocation as PrismaDepartmentLocation } from '@/lib/prisma.lib';

export interface LocationAmenity {
  text: string;
}

export interface CreateDepartmentLocationDto {
  name: string;
  badge: string;
  badgeVariant: 'primary' | 'secondary';
  street: string;
  city: string;
  mapsUrl?: string;
  amenities: LocationAmenity[];
  sort?: number;
}

export interface UpdateDepartmentLocationDto {
  name?: string;
  badge?: string;
  badgeVariant?: 'primary' | 'secondary';
  street?: string;
  city?: string;
  mapsUrl?: string;
  amenities?: LocationAmenity[];
  sort?: number;
}

export type DepartmentLocation = PrismaDepartmentLocation;
