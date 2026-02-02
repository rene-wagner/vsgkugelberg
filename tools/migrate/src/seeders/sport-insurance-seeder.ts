import ora from 'ora';
import type { Client } from 'pg';
import { loadSportInsuranceSeedData } from '../utils';

export async function seedSportInsurance(pgClient: Client): Promise<void> {
  const spinner = ora('Seeding sport insurance content...').start();

  try {
    // Check if sport insurance already exists
    const checkResult = await pgClient.query('SELECT id FROM "SportInsuranceContent" WHERE id = 1');
    if (checkResult.rows.length > 0) {
      spinner.info('Sport insurance content already exists, skipping');
      return;
    }

    const sportInsurance = await loadSportInsuranceSeedData();

    // Create SportInsuranceContent
    await pgClient.query(
      `INSERT INTO "SportInsuranceContent" (
        "id", "content", "updatedAt"
      ) VALUES (
        $1, $2, NOW()
      )`,
      [1, sportInsurance.content],
    );

    spinner.succeed('Sport insurance content seeded successfully');
  } catch (error) {
    spinner.fail('Failed to seed sport insurance content');
    throw error;
  }
}
