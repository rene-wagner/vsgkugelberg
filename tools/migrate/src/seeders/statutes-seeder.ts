import ora from 'ora';
import type { Client } from 'pg';
import { loadStatutesSeedData } from '../utils';

export async function seedStatutes(pgClient: Client): Promise<void> {
  const spinner = ora('Seeding statutes content...').start();

  try {
    // Check if statutes already exists
    const checkResult = await pgClient.query('SELECT id FROM "StatutesContent" WHERE id = 1');
    if (checkResult.rows.length > 0) {
      spinner.info('Statutes content already exists, skipping');
      return;
    }

    const statutes = await loadStatutesSeedData();

    // Create StatutesContent
    await pgClient.query(
      `INSERT INTO "StatutesContent" (
        "id", "content", "updatedAt"
      ) VALUES (
        $1, $2, NOW()
      )`,
      [1, statutes.content],
    );

    spinner.succeed('Statutes content seeded successfully');
  } catch (error) {
    spinner.fail('Failed to seed statutes content');
    throw error;
  }
}
