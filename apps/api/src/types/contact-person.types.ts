import { ContactPerson as PrismaContactPerson } from '@/lib/prisma.lib';

export interface CreateContactPersonDto {
  firstName: string;
  lastName: string;
  type: string;
  email?: string;
  address?: string;
  phone: string;
}

export interface UpdateContactPersonDto {
  firstName?: string;
  lastName?: string;
  type?: string;
  email?: string;
  address?: string;
  phone?: string;
}

export type ContactPerson = PrismaContactPerson;
