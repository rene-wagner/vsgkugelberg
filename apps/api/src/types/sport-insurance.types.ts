import { SportInsuranceContent as PrismaSportInsuranceContent } from '@/lib/prisma.lib';

export interface UpdateSportInsuranceDto {
  content: string;
}

export type SportInsuranceContent = PrismaSportInsuranceContent;
