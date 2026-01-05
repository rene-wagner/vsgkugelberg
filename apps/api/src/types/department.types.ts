import { Department as PrismaDepartment, Prisma } from '@/lib/prisma.lib';
import { Media } from './media.types';

export interface CreateDepartmentDto {
  name: string;
  shortDescription: string;
  iconId?: number;
}

export interface UpdateDepartmentDto {
  name?: string;
  shortDescription?: string;
  iconId?: number | null;
}

export type Department = PrismaDepartment;

export type DepartmentWithIcon = PrismaDepartment & {
  icon: Media | null;
};

export type DepartmentWithAllRelations = Prisma.DepartmentGetPayload<{
  include: {
    icon: true;
    stats: true;
    trainingGroups: {
      include: { sessions: true };
    };
    locations: true;
    trainers: {
      include: {
        contactPerson: {
          include: { profileImage: true };
        };
      };
    };
  };
}>;
