import ora from 'ora';
import slugify from 'slugify';
import type { Client } from 'pg';
import type { CategoryMap } from '../types';
import { loadCategoriesData, loadPostsData } from '../utils';
import { logger } from '../utils';

export async function migratePosts(
  pgClient: Client,
  categoryMap: CategoryMap,
): Promise<number> {
  const spinner = ora('Migrating posts...').start();

  try {
    // Load all posts from JSON
    const allPosts = await loadPostsData();
    
    // Load categories to map posts to categories
    const categories = await loadCategoriesData();

    let totalPosts = 0;

    for (const category of categories) {
      const pgCategoryId = categoryMap.get(category.id);

      if (!pgCategoryId) {
        logger.warning(`Skipping "${category.name}" - no Postgres ID found`);
        continue;
      }

      // Filter posts for this category (exclude posts with no catid)
      const posts = allPosts.filter(post => post.catid != null && post.catid === category.id);

      if (posts.length === 0) {
        continue;
      }

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
          const newPostId: number = result.rows[0].id;
          await pgClient.query(
            `INSERT INTO "_CategoryToPost" ("A", "B") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [pgCategoryId, newPostId],
          );
          totalPosts++;
        } else {
          logger.warning(`Skipped duplicate slug post: "${post.title}" (slug="${slug}")`);
        }
      }
    }

    const uncategorizedPosts = allPosts.filter(post => post.catid == null);
    for (const post of uncategorizedPosts) {
      logger.warning(`Skipped post with no category: "${post.title}"`);
    }

    spinner.succeed(`Migrated ${totalPosts} posts`);
    return totalPosts;
  } catch (error) {
    spinner.fail('Failed to migrate posts');
    throw error;
  }
}
