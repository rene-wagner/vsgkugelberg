import ora from 'ora';
import type { Client } from 'pg';
import { loadMembershipFeeSeedData } from '../utils';

export async function seedMembershipFee(pgClient: Client): Promise<void> {
  const spinner = ora('Seeding membership fee content...').start();

  try {
    // Check if membership fee already exists
    const checkResult = await pgClient.query('SELECT id FROM "MembershipFeeContent" WHERE id = 1');
    if (checkResult.rows.length > 0) {
      spinner.info('Membership fee content already exists, skipping');
      return;
    }

    const membershipFee = await loadMembershipFeeSeedData();

    // Create MembershipFeeContent
    await pgClient.query(
      `INSERT INTO "MembershipFeeContent" (
        "id", "content", "updatedAt"
      ) VALUES (
        $1, $2, NOW()
      )`,
      [1, membershipFee.content],
    );

    spinner.succeed('Membership fee content seeded successfully');
  } catch (error) {
    spinner.fail('Failed to seed membership fee content');
    throw error;
  }
}
