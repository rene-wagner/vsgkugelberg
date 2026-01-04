import {
  DepartmentTrainingGroup as PrismaDepartmentTrainingGroup,
  DepartmentTrainingSession as PrismaDepartmentTrainingSession,
  Prisma,
} from '@/lib/prisma.lib';

// Training Group DTOs
export interface CreateDepartmentTrainingGroupDto {
  name: string;
  ageRange?: string;
  icon: 'youth' | 'adults';
  variant: 'primary' | 'secondary';
  sort?: number;
}

export interface UpdateDepartmentTrainingGroupDto {
  name?: string;
  ageRange?: string;
  icon?: 'youth' | 'adults';
  variant?: 'primary' | 'secondary';
  sort?: number;
}

// Training Session DTOs
export interface CreateDepartmentTrainingSessionDto {
  day: string;
  time: string;
  sort?: number;
}

export interface UpdateDepartmentTrainingSessionDto {
  day?: string;
  time?: string;
  sort?: number;
}

export type DepartmentTrainingGroup = PrismaDepartmentTrainingGroup;
export type DepartmentTrainingSession = PrismaDepartmentTrainingSession;

export type DepartmentTrainingGroupWithSessions =
  Prisma.DepartmentTrainingGroupGetPayload<{
    include: { sessions: true };
  }>;
