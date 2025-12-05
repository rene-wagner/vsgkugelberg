import { Department as PrismaDepartment } from '@/lib/prisma.lib';

export interface CreateDepartmentDto {
  name: string;
  shortDescription: string;
  longDescription: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  shortDescription?: string;
  longDescription?: string;
}

export type Department = PrismaDepartment;
