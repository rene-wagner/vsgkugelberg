import ora from 'ora';
import type { Client } from 'pg';
import type { JoomlaCategory, CategoryMap } from '../types';
import { loadCategoriesFromCSV } from '../database';
import { logger } from '../utils';

export async function migrateCategories(
  pgClient: Client,
): Promise<CategoryMap> {
  const spinner = ora('Migrating categories...').start();

  try {
    const categories = await loadCategoriesFromCSV();

    const categoryMap: CategoryMap = new Map();

    for (const category of categories) {
      const parentId =
        category.parentId === 1
          ? null
          : category.parentId !== null
            ? categoryMap.get(category.parentId) ?? null
            : null;

      if (category.parentId !== null && category.parentId !== 1 && parentId === null) {
        logger.warning(
          `Parent not found for "${category.name}" (parent_id=${category.parentId})`,
        );
      }

      const result = await pgClient.query(
        `INSERT INTO "Category" ("name", "slug", "description", "parentId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [category.name, category.slug, category.description, parentId, new Date(), new Date()],
      );

      const newId = result.rows[0].id;
      categoryMap.set(category.id, newId);
    }

    spinner.succeed(`Migrated ${categoryMap.size} categories`);
    return categoryMap;
  } catch (error) {
    spinner.fail('Failed to migrate categories');
    throw error;
  }
}
