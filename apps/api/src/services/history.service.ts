import { prisma, Prisma } from '@/lib/prisma.lib';
import { UpdateHistoryDto, HistoryContent } from '@/types/history.types';

export class HistoryService {
  /**
   * Get the history content.
   * There is only one record with ID 1.
   */
  async get(client: Prisma.TransactionClient | typeof prisma = prisma): Promise<HistoryContent | null> {
    const content = await client.historyContent.findUnique({
      where: { id: 1 },
      include: {
        foundingFacts: { orderBy: { sort: 'asc' } },
        foundingMilestones: { orderBy: { sort: 'asc' } },
        developmentChartLabels: { orderBy: { sort: 'asc' } },
        developmentChartData: {
          include: {
            values: { orderBy: { sort: 'asc' } },
          },
          orderBy: { sort: 'asc' },
        },
        developmentChronicleGroups: {
          include: {
            entries: { orderBy: { sort: 'asc' } },
          },
          orderBy: { sort: 'asc' },
        },
        festivalsItems: { orderBy: { sort: 'asc' } },
        achievementsItems: { orderBy: { sort: 'asc' } },
      },
    });

    if (!content) return null;

    // Transform back to original JSON structure for the API
    return {
      ...content,
      foundingFacts: content.foundingFacts.map((f) => ({
        year: f.year,
        headline: f.headline,
        description: f.description,
      })),
      foundingMilestones: content.foundingMilestones.map((m) => ({
        year: m.year,
        headline: m.headline,
        description: m.description,
      })),
      developmentChartData: {
        labels: content.developmentChartLabels.map((l) => l.label),
        datasets: content.developmentChartData.map((d) => ({
          label: d.label,
          data: d.values.map((v) => v.value),
        })),
      },
      developmentChronicleGroups: content.developmentChronicleGroups.map((g) => ({
        id: g.id,
        headline: g.headline,
        content: g.entries.map((e) => ({
          year: e.year,
          description: e.description,
        })),
      })),
      festivalsItems: content.festivalsItems.map((i) => ({
        headline: i.headline,
        text: i.text,
      })),
      achievementsItems: content.achievementsItems.map((a) => ({
        year: a.year,
        headline: a.headline,
        description: a.description,
        category: a.category,
      })),
    } as unknown as HistoryContent;
  }

  /**
   * Update the history content.
   * Uses a transaction to clear existing relations and recreate them.
   */
  async update(data: UpdateHistoryDto) {
    return prisma.$transaction(async (tx) => {
      // 1. Update scalar fields
      await tx.historyContent.upsert({
        where: { id: 1 },
        update: {
          heroHeadline: data.heroHeadline,
          heroSubHeadline: data.heroSubHeadline,
          foundingHeadline: data.foundingHeadline,
          foundingDescription: data.foundingDescription,
          foundingFactCardHeadline: data.foundingFactCardHeadline,
          foundingMilestonesHeadline: data.foundingMilestonesHeadline,
          developmentHeadline: data.developmentHeadline,
          developmentDescription: data.developmentDescription,
          festivalsHeadline: data.festivalsHeadline,
          festivalsDescription: data.festivalsDescription,
          achievementsHeadline: data.achievementsHeadline,
          ctaHeadline: data.ctaHeadline,
          ctaDescription: data.ctaDescription,
        },
        create: {
          id: 1,
          heroHeadline: data.heroHeadline ?? '',
          heroSubHeadline: data.heroSubHeadline ?? '',
          foundingHeadline: data.foundingHeadline ?? '',
          foundingDescription: data.foundingDescription ?? '',
          foundingFactCardHeadline: data.foundingFactCardHeadline ?? '',
          foundingMilestonesHeadline: data.foundingMilestonesHeadline ?? '',
          developmentHeadline: data.developmentHeadline ?? '',
          developmentDescription: data.developmentDescription ?? '',
          festivalsHeadline: data.festivalsHeadline ?? '',
          festivalsDescription: data.festivalsDescription ?? '',
          achievementsHeadline: data.achievementsHeadline ?? '',
          ctaHeadline: data.ctaHeadline ?? '',
          ctaDescription: data.ctaDescription ?? '',
        },
      });

      // 2. Clear and Recreate relations only if provided in data
      if (data.foundingFacts) {
        await tx.historyFact.deleteMany({ where: { historyContentId: 1 } });
        await tx.historyFact.createMany({
          data: data.foundingFacts.map((f, i) => ({
            historyContentId: 1,
            year: f.year,
            headline: f.headline,
            description: f.description,
            sort: i,
          })),
        });
      }

      if (data.foundingMilestones) {
        await tx.historyMilestone.deleteMany({
          where: { historyContentId: 1 },
        });
        await tx.historyMilestone.createMany({
          data: data.foundingMilestones.map((m, i) => ({
            historyContentId: 1,
            year: m.year,
            headline: m.headline,
            description: m.description,
            sort: i,
          })),
        });
      }

      if (data.developmentChartData) {
        await tx.historyChartLabel.deleteMany({
          where: { historyContentId: 1 },
        });
        await tx.historyChartDataset.deleteMany({
          where: { historyContentId: 1 },
        });

        // Labels
        await tx.historyChartLabel.createMany({
          data: data.developmentChartData.labels.map((l, i) => ({
            historyContentId: 1,
            label: l,
            sort: i,
          })),
        });

        // Datasets and Values
        for (let i = 0; i < data.developmentChartData.datasets.length; i++) {
          const ds = data.developmentChartData.datasets[i];
          const dataset = await tx.historyChartDataset.create({
            data: {
              historyContentId: 1,
              label: ds.label,
              sort: i,
            },
          });

          await tx.historyChartValue.createMany({
            data: ds.data.map((v, j) => ({
              datasetId: dataset.id,
              value: v,
              sort: j,
            })),
          });
        }
      }

      if (data.developmentChronicleGroups) {
        await tx.historyChronicleGroup.deleteMany({
          where: { historyContentId: 1 },
        });
        for (let i = 0; i < data.developmentChronicleGroups.length; i++) {
          const g = data.developmentChronicleGroups[i];
          const group = await tx.historyChronicleGroup.create({
            data: {
              historyContentId: 1,
              headline: g.headline,
              sort: i,
            },
          });

          await tx.historyChronicleEntry.createMany({
            data: g.content.map((e, j) => ({
              groupId: group.id,
              year: e.year,
              description: e.description,
              sort: j,
            })),
          });
        }
      }

      if (data.festivalsItems) {
        await tx.historyFestivalItem.deleteMany({
          where: { historyContentId: 1 },
        });
        await tx.historyFestivalItem.createMany({
          data: data.festivalsItems.map((f, i) => ({
            historyContentId: 1,
            headline: f.headline,
            text: f.text,
            sort: i,
          })),
        });
      }

      if (data.achievementsItems) {
        await tx.historyAchievement.deleteMany({
          where: { historyContentId: 1 },
        });
        await tx.historyAchievement.createMany({
          data: data.achievementsItems.map((a, i) => ({
            historyContentId: 1,
            year: a.year,
            headline: a.headline,
            description: a.description,
            category: a.category,
            sort: i,
          })),
        });
      }

      return this.get(tx);
    });
  }
}
