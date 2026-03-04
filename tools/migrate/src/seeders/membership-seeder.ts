import ora from 'ora';
import type { Client } from 'pg';
import { loadMembershipSeedData } from '../utils';

export async function seedMembership(pgClient: Client): Promise<void> {
  const spinner = ora('Seeding membership content...').start();

  try {
    // Check if membership content already exists
    const checkResult = await pgClient.query('SELECT id FROM "MembershipContent" WHERE id = 1');
    if (checkResult.rows.length > 0) {
      spinner.info('Membership content already exists, skipping');
      return;
    }

    const membership = await loadMembershipSeedData();

    // 1. Create MembershipContent
    await pgClient.query(
      `INSERT INTO "MembershipContent" (
        "id", "heroHeadline", "heroSubHeadline", "introText",
        "trialPeriodHeadline", "trialPeriodText",
        "processHeadline", "processText",
        "documentsHeadline", "ctaHeadline", "ctaDescription", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
      )`,
      [
        1,
        membership.heroHeadline,
        membership.heroSubHeadline,
        membership.introText,
        membership.trialPeriodHeadline,
        membership.trialPeriodText,
        membership.processHeadline,
        membership.processText,
        membership.documentsHeadline,
        membership.ctaHeadline,
        membership.ctaDescription,
      ],
    );

    // 2. Seed department stats
    for (let i = 0; i < membership.departmentStats.length; i++) {
      const s = membership.departmentStats[i];
      await pgClient.query(
        `INSERT INTO "MembershipDepartmentStat"
          ("membershipContentId", "departmentName", "totalCount", "maleCount", "femaleCount", "sort")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [1, s.departmentName, s.totalCount, s.maleCount, s.femaleCount, i],
      );
    }

    // 3. Seed process steps
    for (let i = 0; i < membership.processSteps.length; i++) {
      const s = membership.processSteps[i];
      await pgClient.query(
        `INSERT INTO "MembershipProcessStep"
          ("membershipContentId", "title", "description", "sort")
         VALUES ($1, $2, $3, $4)`,
        [1, s.title, s.description, i],
      );
    }

    // 4. Seed documents
    for (let i = 0; i < membership.documents.length; i++) {
      const d = membership.documents[i];
      await pgClient.query(
        `INSERT INTO "MembershipDocument"
          ("membershipContentId", "title", "url", "sort")
         VALUES ($1, $2, $3, $4)`,
        [1, d.title, d.url, i],
      );
    }

    spinner.succeed('Membership content seeded successfully');
  } catch (error) {
    spinner.fail('Failed to seed membership content');
    throw error;
  }
}
