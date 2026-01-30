import ora from 'ora';
import type { Client } from 'pg';
import { loadBoardContentSeedData } from '../utils';

export async function seedBoardContent(pgClient: Client): Promise<void> {
  const spinner = ora('Seeding board content...').start();

  try {
    // Check if board content already exists
    const checkResult = await pgClient.query('SELECT id FROM "BoardContent" WHERE id = 1');
    if (checkResult.rows.length > 0) {
      spinner.info('Board content already exists, skipping');
      return;
    }

    const boardContent = await loadBoardContentSeedData();

    // Create BoardContent
    await pgClient.query(
      `INSERT INTO "BoardContent" (
        "id", "headline", "description", "sectionHeadline", "sectionDescription",
        "note", "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), NOW()
      )`,
      [
        1,
        boardContent.headline,
        boardContent.description,
        boardContent.sectionHeadline,
        boardContent.sectionDescription,
        boardContent.note,
      ],
    );

    spinner.succeed('Board content seeded successfully');
  } catch (error) {
    spinner.fail('Failed to seed board content');
    throw error;
  }
}
