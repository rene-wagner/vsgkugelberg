import ora from 'ora';
import type { Client } from 'pg';
import { loadContactPersonSeedData, normalizeNameForMatch } from '../utils';
import { PLACEHOLDER_EMAIL_DOMAIN } from '../config/constants';
import type { MediaFileMap } from '../types';

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

/**
 * Link contact person profile images
 */
export async function linkContactPersonImages(
  pgClient: Client,
  mediaMap: MediaFileMap,
): Promise<number> {
  const spinner = ora('Linking contact person images...').start();

  try {
    let linkedCount = 0;

    // Get all contact persons
    const contactPersons = await pgClient.query(
      `SELECT id, "firstName", "lastName" FROM "ContactPerson"`,
    );

    for (const person of contactPersons.rows) {
      // Generate match key: normalize firstName + lastName
      const matchKey = normalizeNameForMatch(person.firstName + person.lastName);

      // Try to find matching image (.jpg or .jpeg)
      let mediaId: number | undefined;

      // Try with .jpg extension
      const jpgFilename = `${matchKey}.jpg`;
      if (mediaMap.has(jpgFilename)) {
        mediaId = mediaMap.get(jpgFilename);
      }

      // Try with .jpeg extension if .jpg not found
      if (!mediaId) {
        const jpegFilename = `${matchKey}.jpeg`;
        if (mediaMap.has(jpegFilename)) {
          mediaId = mediaMap.get(jpegFilename);
        }
      }

      if (mediaId) {
        // Update contact person with profile image
        await pgClient.query(
          `UPDATE "ContactPerson" SET "profileImageId" = $1, "updatedAt" = NOW() WHERE id = $2`,
          [mediaId, person.id],
        );
        linkedCount++;
      }
    }

    spinner.succeed(`Linked ${linkedCount} contact person images`);
    return linkedCount;
  } catch (error) {
    spinner.fail('Failed to link contact person images');
    throw error;
  }
}
