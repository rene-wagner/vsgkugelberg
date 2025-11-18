import { Department as PrismaDepartment } from '@prisma/client';

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
