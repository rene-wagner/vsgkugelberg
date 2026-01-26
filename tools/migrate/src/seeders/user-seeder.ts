import ora from 'ora';
import type { Client } from 'pg';
import { loadUserSeedData } from '../utils';

export async function seedUsers(pgClient: Client): Promise<number> {
  const spinner = ora('Seeding users...').start();

  try {
    const users = await loadUserSeedData();
    let seededCount = 0;

    for (const user of users) {
      const result = await pgClient.query(
        `INSERT INTO "User" ("username", "email", "password", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT ("email") DO NOTHING
         RETURNING id`,
        [user.username, user.email, user.password],
      );

      if (result.rows.length > 0) {
        seededCount++;
      }
    }

    spinner.succeed(`Seeded ${seededCount} users`);
    return seededCount;
  } catch (error) {
    spinner.fail('Failed to seed users');
    throw error;
  }
}
