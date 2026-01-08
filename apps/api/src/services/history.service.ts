import { prisma } from '@/lib/prisma.lib';
import { UpdateHistoryDto } from '@/types/history.types';

export class HistoryService {
  /**
   * Get the history content.
   * There is only one record with ID 1.
   */
  async get() {
    return prisma.historyContent.findUnique({
      where: { id: 1 },
    });
  }

  /**
   * Update the history content.
   * Uses upsert to create it if it doesn't exist yet.
   */
  async update(data: UpdateHistoryDto) {
    return prisma.historyContent.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        heroHeadline: data.heroHeadline ?? '',
        heroSubHeadline: data.heroSubHeadline ?? '',
        foundingHeadline: data.foundingHeadline ?? '',
        foundingNarrative: data.foundingNarrative ?? [],
        foundingFactCardHeadline: data.foundingFactCardHeadline ?? '',
        foundingFacts: data.foundingFacts ?? [],
        foundingMilestonesHeadline: data.foundingMilestonesHeadline ?? '',
        foundingMilestones: data.foundingMilestones ?? [],
        developmentHeadline: data.developmentHeadline ?? '',
        developmentNarrative: data.developmentNarrative ?? [],
        developmentChartData: data.developmentChartData ?? {
          labels: [],
          datasets: [],
        },
        developmentChronicleGroups: data.developmentChronicleGroups ?? [],
        festivalsHeadline: data.festivalsHeadline ?? '',
        festivalsDescription: data.festivalsDescription ?? '',
        festivalsItems: data.festivalsItems ?? [],
        achievementsHeadline: data.achievementsHeadline ?? '',
        achievementsItems: data.achievementsItems ?? [],
        ctaHeadline: data.ctaHeadline ?? '',
        ctaDescription: data.ctaDescription ?? '',
      },
    });
  }
}
