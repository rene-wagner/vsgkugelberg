import { prisma } from '@/lib/prisma.lib';
import { UpdateStatutesDto, StatutesContent } from '@/types/statutes.types';

export class StatutesService {
  /**
   * Get the statutes content.
   * There is only one record with ID 1.
   */
  async get(): Promise<StatutesContent | null> {
    return await prisma.statutesContent.findUnique({
      where: { id: 1 },
    });
  }

  /**
   * Update the statutes content.
   * Uses upsert to create if it doesn't exist.
   */
  async update(data: UpdateStatutesDto): Promise<StatutesContent> {
    return await prisma.statutesContent.upsert({
      where: { id: 1 },
      update: { content: data.content },
      create: { id: 1, content: data.content },
    });
  }
}
