import { DepartmentStat as PrismaDepartmentStat } from '@/lib/prisma.lib';

export interface CreateDepartmentStatDto {
  label: string;
  value: string;
  sort?: number;
}

export interface UpdateDepartmentStatDto {
  label?: string;
  value?: string;
  sort?: number;
}

export type DepartmentStat = PrismaDepartmentStat;
