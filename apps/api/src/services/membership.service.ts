import { prisma, Prisma } from '@/lib/prisma.lib';
import { UpdateMembershipDto, MembershipContent } from '@/types/membership.types';

export class MembershipService {
  /**
   * Get the membership content.
   * There is only one record with ID 1.
   */
  async get(client: Prisma.TransactionClient | typeof prisma = prisma): Promise<MembershipContent> {
    const content = await client.membershipContent.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        heroHeadline: '',
        heroSubHeadline: '',
        introText: '',
        trialPeriodHeadline: '',
        trialPeriodText: '',
        processHeadline: '',
        processText: '',
        documentsHeadline: '',
        ctaHeadline: '',
        ctaDescription: '',
      },
      include: {
        departmentStats: { orderBy: { sort: 'asc' } },
        processSteps: { orderBy: { sort: 'asc' } },
        documents: { orderBy: { sort: 'asc' } },
      },
    });

    return {
      ...content,
      updatedAt: content.updatedAt.toISOString(),
      departmentStats: content.departmentStats.map((s) => ({
        departmentName: s.departmentName,
        totalCount: s.totalCount,
        maleCount: s.maleCount,
        femaleCount: s.femaleCount,
      })),
      processSteps: content.processSteps.map((s) => ({
        title: s.title,
        description: s.description,
      })),
      documents: content.documents.map((d) => ({
        title: d.title,
        url: d.url,
      })),
    } as MembershipContent;
  }

  /**
   * Update the membership content.
   * Uses a transaction to clear existing relations and recreate them.
   */
  async update(data: UpdateMembershipDto) {
    return prisma.$transaction(async (tx) => {
      // 1. Update scalar fields
      await tx.membershipContent.upsert({
        where: { id: 1 },
        update: {
          heroHeadline: data.heroHeadline,
          heroSubHeadline: data.heroSubHeadline,
          introText: data.introText,
          trialPeriodHeadline: data.trialPeriodHeadline,
          trialPeriodText: data.trialPeriodText,
          processHeadline: data.processHeadline,
          processText: data.processText,
          documentsHeadline: data.documentsHeadline,
          ctaHeadline: data.ctaHeadline,
          ctaDescription: data.ctaDescription,
        },
        create: {
          id: 1,
          heroHeadline: data.heroHeadline ?? '',
          heroSubHeadline: data.heroSubHeadline ?? '',
          introText: data.introText ?? '',
          trialPeriodHeadline: data.trialPeriodHeadline ?? '',
          trialPeriodText: data.trialPeriodText ?? '',
          processHeadline: data.processHeadline ?? '',
          processText: data.processText ?? '',
          documentsHeadline: data.documentsHeadline ?? '',
          ctaHeadline: data.ctaHeadline ?? '',
          ctaDescription: data.ctaDescription ?? '',
        },
      });

      // 2. Clear and recreate relations only if provided
      if (data.departmentStats) {
        await tx.membershipDepartmentStat.deleteMany({ where: { membershipContentId: 1 } });
        await tx.membershipDepartmentStat.createMany({
          data: data.departmentStats.map((s, i) => ({
            membershipContentId: 1,
            departmentName: s.departmentName,
            totalCount: s.totalCount,
            maleCount: s.maleCount,
            femaleCount: s.femaleCount,
            sort: i,
          })),
        });
      }

      if (data.processSteps) {
        await tx.membershipProcessStep.deleteMany({ where: { membershipContentId: 1 } });
        await tx.membershipProcessStep.createMany({
          data: data.processSteps.map((s, i) => ({
            membershipContentId: 1,
            title: s.title,
            description: s.description,
            sort: i,
          })),
        });
      }

      if (data.documents) {
        await tx.membershipDocument.deleteMany({ where: { membershipContentId: 1 } });
        await tx.membershipDocument.createMany({
          data: data.documents.map((d, i) => ({
            membershipContentId: 1,
            title: d.title,
            url: d.url,
            sort: i,
          })),
        });
      }

      return this.get(tx);
    });
  }
}
