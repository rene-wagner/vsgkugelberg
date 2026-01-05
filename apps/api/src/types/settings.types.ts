import { ClubSettings as PrismaClubSettings } from '@/lib/prisma.lib';

export interface UpdateSettingsDto {
  foundingDate?: string | null;
  address?: string | null;
  memberCount?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export type ClubSettings = PrismaClubSettings;
