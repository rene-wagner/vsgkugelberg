import { StatutesContent as PrismaStatutesContent } from '@/lib/prisma.lib';

export interface UpdateStatutesDto {
  content: string;
}

export type StatutesContent = PrismaStatutesContent;
