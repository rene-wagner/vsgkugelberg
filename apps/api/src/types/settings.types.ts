import { ClubSettings as PrismaClubSettings } from '@/lib/prisma.lib';

export interface UpdateSettingsDto {
  foundingYear?: number | null;
  address?: string | null;
  memberCount?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export type ClubSettings = PrismaClubSettings;
