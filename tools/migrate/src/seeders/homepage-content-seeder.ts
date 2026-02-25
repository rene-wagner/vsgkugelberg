import ora from 'ora';
import type { Client } from 'pg';
import { loadHomepageSeedData } from '../utils';
import type { MediaFileMap } from '../types';

export async function seedHomepage(pgClient: Client, mediaMap: MediaFileMap): Promise<void> {
  const spinner = ora('Seeding homepage content...').start();

  try {
    // Check if homepage already exists
    const checkResult = await pgClient.query('SELECT id FROM "HomepageContent" WHERE id = 1');
    if (checkResult.rows.length > 0) {
      spinner.info('Homepage content already exists, skipping');
      return;
    }

    const homepage = await loadHomepageSeedData();
    const logoMediaId = mediaMap.get('logo.svg') ?? null;

    // 1. Create HomepageContent
    await pgClient.query(
      `INSERT INTO "HomepageContent" (
        "id", "heroTag", "heroLogoId",
        "departmentsHeadline", "departmentsDescription", "departmentsSubtitle",
        "postsHeadline", "postsDescription", "postsSubtitle", "postsCount",
        "ctaHeadline", "ctaDescription", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()
      )`,
      [
        1,
        homepage.heroTag,
        logoMediaId,
        homepage.departmentsHeadline,
        homepage.departmentsDescription,
        homepage.departmentsSubtitle,
        homepage.postsHeadline,
        homepage.postsDescription,
        homepage.postsSubtitle,
        homepage.postsCount,
        homepage.ctaHeadline,
        homepage.ctaDescription,
      ],
    );

    // 2. Seed Homepage Stats
    for (let i = 0; i < homepage.stats.length; i++) {
      const stat = homepage.stats[i];
      await pgClient.query(
        `INSERT INTO "HomepageStat" ("homepageContentId", "label", "value", "sort", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [1, stat.label, stat.value, stat.sort],
      );
    }

    spinner.succeed('Seeded homepage content');
  } catch (error) {
    spinner.fail('Failed to seed homepage content');
    throw error;
  }
}
