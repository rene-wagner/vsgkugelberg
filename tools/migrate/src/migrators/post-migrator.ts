import ora from 'ora';
import slugify from 'slugify';
import type { Connection } from 'mysql2/promise';
import type { Client } from 'pg';
import { POST_QUERY } from '../config/constants';
import type { JoomlaCategory, JoomlaPost, CategoryMap } from '../types';
import { logger } from '../utils';

async function migratePostsForCategory(
  mysqlConn: Connection,
  pgClient: Client,
  category: JoomlaCategory,
): Promise<number> {
  const [rows] = await mysqlConn.query(POST_QUERY, [category.id]);
  const posts = rows as JoomlaPost[];

  if (posts.length === 0) {
    return 0;
  }

  let migratedCount = 0;

  for (const post of posts) {
    const slug = slugify(post.title, { lower: true, strict: true });

    const result = await pgClient.query(
      `INSERT INTO "Post" ("title", "slug", "content", "published", "hits", "oldPost", "authorId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT ("slug") DO NOTHING
       RETURNING id`,
      [
        post.title,
        slug,
        post.content,
        post.published === 1,
        post.hits,
        post.oldPost === 1,
        post.authorId,
        new Date(post.created),
        new Date(post.modified),
      ],
    );

    if (result.rows.length > 0) {
      migratedCount++;
    }
  }

  return migratedCount;
}

export async function migratePosts(
  mysqlConn: Connection,
  pgClient: Client,
  categoryMap: CategoryMap,
): Promise<number> {
  const spinner = ora('Migrating posts...').start();

  try {
    // Fetch categories again to get full list
    const [categoryRows] = await mysqlConn.query(`
      SELECT
        id,
        title as name,
        path as slug,
        description,
        NULLIF(parent_id, 1) as parentId,
        NOW() as createdAt,
        NOW() as updatedAt
      FROM j3x_categories
      WHERE extension = 'com_content'
        AND published = 1
      ORDER BY lft ASC
      LIMIT 300
    `);
    const categories = categoryRows as JoomlaCategory[];

    let totalPosts = 0;

    for (const category of categories) {
      const pgCategoryId = categoryMap.get(category.id);

      if (!pgCategoryId) {
        logger.warning(`Skipping "${category.name}" - no Postgres ID found`);
        continue;
      }

      const count = await migratePostsForCategory(mysqlConn, pgClient, category);
      totalPosts += count;
    }

    spinner.succeed(`Migrated ${totalPosts} posts`);
    return totalPosts;
  } catch (error) {
    spinner.fail('Failed to migrate posts');
    throw error;
  }
}
