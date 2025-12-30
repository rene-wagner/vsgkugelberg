import { ContactPerson as PrismaContactPerson, Prisma } from '@/lib/prisma.lib';

export interface CreateContactPersonDto {
  firstName: string;
  lastName: string;
  type: string;
  email?: string;
  address?: string;
  phone: string;
  profileImageId?: number;
}

export interface UpdateContactPersonDto {
  firstName?: string;
  lastName?: string;
  type?: string;
  email?: string;
  address?: string;
  phone?: string;
  profileImageId?: number | null;
}

export type ContactPerson = PrismaContactPerson;

export type ContactPersonWithImage = Prisma.ContactPersonGetPayload<{
  include: { profileImage: true };
}>;
