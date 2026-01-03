import {
  DepartmentTrainer as PrismaDepartmentTrainer,
  Prisma,
} from '@/lib/prisma.lib';

export interface TrainerLicense {
  name: string;
  variant: 'gold' | 'blue';
}

export interface CreateDepartmentTrainerDto {
  contactPersonId: number;
  role: string;
  licenses: TrainerLicense[];
  experience: string;
  quote: string;
  sort?: number;
}

export interface UpdateDepartmentTrainerDto {
  role?: string;
  licenses?: TrainerLicense[];
  experience?: string;
  quote?: string;
  sort?: number;
}

export type DepartmentTrainer = PrismaDepartmentTrainer;

export type DepartmentTrainerWithContactPerson =
  Prisma.DepartmentTrainerGetPayload<{
    include: {
      contactPerson: {
        include: { profileImage: true };
      };
    };
  }>;
