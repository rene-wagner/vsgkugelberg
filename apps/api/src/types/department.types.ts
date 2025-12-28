import { Department as PrismaDepartment } from '@/lib/prisma.lib';
import { Media } from './media.types';

export interface CreateDepartmentDto {
  name: string;
  shortDescription: string;
  longDescription: string;
  iconId?: number;
}

export interface UpdateDepartmentDto {
  name?: string;
  shortDescription?: string;
  longDescription?: string;
  iconId?: number | null;
}

export type Department = PrismaDepartment;

export type DepartmentWithIcon = PrismaDepartment & {
  icon: Media | null;
};
