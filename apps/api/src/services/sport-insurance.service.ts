import { prisma } from '@/lib/prisma.lib';
import { UpdateSportInsuranceDto, SportInsuranceContent } from '@/types/sport-insurance.types';

export class SportInsuranceService {
  /**
   * Get the sport insurance content.
   * There is only one record with ID 1.
   */
  async get(): Promise<SportInsuranceContent | null> {
    return await prisma.sportInsuranceContent.findUnique({
      where: { id: 1 },
    });
  }

  /**
   * Update the sport insurance content.
   * Uses upsert to create if it doesn't exist.
   */
  async update(data: UpdateSportInsuranceDto): Promise<SportInsuranceContent> {
    return await prisma.sportInsuranceContent.upsert({
      where: { id: 1 },
      update: { content: data.content },
      create: { id: 1, content: data.content },
    });
  }
}
