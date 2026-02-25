import { prisma, Prisma } from '@/lib/prisma.lib';
import { UpdateHomepageContentDto, HomepageContent } from '@/types/homepage-content.types';

export class HomepageContentService {
  /**
   * Get the homepage content.
   * There is only one record with ID 1.
   */
  async get(baseUrl: string, client: Prisma.TransactionClient | typeof prisma = prisma): Promise<HomepageContent | null> {
    const content = await client.homepageContent.findUnique({
      where: { id: 1 },
      include: {
        stats: { orderBy: { sort: 'asc' } },
        heroLogo: true,
      },
    });

    if (!content) return null;

    return {
      id: content.id,
      heroTag: content.heroTag,
      heroLogoId: content.heroLogoId,
      heroLogo: content.heroLogo
        ? {
            id: content.heroLogo.id,
            filename: content.heroLogo.filename,
            originalName: content.heroLogo.originalName,
            path: `${baseUrl}/uploads/${content.heroLogo.filename}`,
            mimetype: content.heroLogo.mimetype,
          }
        : null,
      stats: content.stats.map((s) => ({
        label: s.label,
        value: s.value,
        sort: s.sort,
      })),
      departmentsHeadline: content.departmentsHeadline,
      departmentsDescription: content.departmentsDescription,
      departmentsSubtitle: content.departmentsSubtitle,
      postsHeadline: content.postsHeadline,
      postsDescription: content.postsDescription,
      postsSubtitle: content.postsSubtitle,
      postsCount: content.postsCount,
      ctaHeadline: content.ctaHeadline,
      ctaDescription: content.ctaDescription,
      updatedAt: content.updatedAt,
    };
  }

  /**
   * Update the homepage content.
   * Uses a transaction to clear existing stats and recreate them.
   */
  async update(data: UpdateHomepageContentDto, baseUrl: string) {
    return prisma.$transaction(async (tx) => {
      await tx.homepageContent.upsert({
        where: { id: 1 },
        update: {
          heroTag: data.heroTag,
          heroLogoId: data.heroLogoId,
          departmentsHeadline: data.departmentsHeadline,
          departmentsDescription: data.departmentsDescription,
          departmentsSubtitle: data.departmentsSubtitle,
          postsHeadline: data.postsHeadline,
          postsDescription: data.postsDescription,
          postsSubtitle: data.postsSubtitle,
          postsCount: data.postsCount,
          ctaHeadline: data.ctaHeadline,
          ctaDescription: data.ctaDescription,
        },
        create: {
          id: 1,
          heroTag: data.heroTag ?? '',
          heroLogoId: data.heroLogoId ?? null,
          departmentsHeadline: data.departmentsHeadline ?? '',
          departmentsDescription: data.departmentsDescription ?? '',
          departmentsSubtitle: data.departmentsSubtitle ?? '',
          postsHeadline: data.postsHeadline ?? '',
          postsDescription: data.postsDescription ?? '',
          postsSubtitle: data.postsSubtitle ?? '',
          postsCount: data.postsCount ?? 5,
          ctaHeadline: data.ctaHeadline ?? '',
          ctaDescription: data.ctaDescription ?? '',
        },
      });

      if (data.stats) {
        await tx.homepageStat.deleteMany({ where: { homepageContentId: 1 } });
        await tx.homepageStat.createMany({
          data: data.stats.map((s, i) => ({
            homepageContentId: 1,
            label: s.label,
            value: s.value,
            sort: s.sort ?? i,
          })),
        });
      }

      return this.get(baseUrl, tx);
    });
  }
}
