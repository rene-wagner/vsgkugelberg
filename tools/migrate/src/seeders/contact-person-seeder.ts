import ora from 'ora';
import type { Client } from 'pg';
import { loadContactPersonSeedData } from '../utils';
import { PLACEHOLDER_EMAIL_DOMAIN } from '../config/constants';

export async function seedContactPersons(pgClient: Client): Promise<number> {
  const spinner = ora('Seeding contact persons...').start();

  try {
    const contactPersons = await loadContactPersonSeedData();

    if (contactPersons.length === 0) {
      spinner.info('No contact persons found in JSON file');
      return 0;
    }

    let seededCount = 0;

    for (let i = 0; i < contactPersons.length; i++) {
      const person = contactPersons[i];

      // Generate placeholder email if empty
      const email = person.email || `missing-${i + 1}@${PLACEHOLDER_EMAIL_DOMAIN}`;

      const result = await pgClient.query(
        `INSERT INTO "ContactPerson" ("firstName", "lastName", "type", "email", "address", "phone", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [person.firstName, person.lastName, person.type, email, person.address, person.phone],
      );

      if (result.rows.length > 0) {
        seededCount++;
      }
    }

    spinner.succeed(`Seeded ${seededCount} contact persons`);
    return seededCount;
  } catch (error) {
    spinner.fail('Failed to seed contact persons');
    throw error;
  }
}
