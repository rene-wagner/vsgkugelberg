// MySQL to PostgreSQL Migration Tool
// This tool migrates data from a MySQL database to a PostgreSQL database
// Run with: pnpm --filter migrate-mysql-to-postgres migrate

import 'dotenv/config';
import mysql from 'mysql2/promise';
import pg from 'pg';
import slugify from 'slugify';

// Types
interface JoomlaCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface JoomlaPost {
  id: number;
  title: string;
  content: string | null;
  catid: number;
  hits: number;
  created: Date;
  modified: Date;
  oldPost: number;
  authorId: number;
  published: number;
}

type CategoryMap = Map<number, number>;

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// Configuration
const getDbConfig = (prefix: 'MYSQL' | 'POSTGRES'): DbConfig => {
  const defaultPort = prefix === 'MYSQL' ? 3306 : 5432;

  const config: DbConfig = {
    host: process.env[`${prefix}_HOST`] || '',
    port: parseInt(process.env[`${prefix}_PORT`] || String(defaultPort)),
    user: process.env[`${prefix}_USER`] || '',
    password: process.env[`${prefix}_PASSWORD`] || '',
    database: process.env[`${prefix}_DATABASE`] || '',
  };

  const missingVars = Object.entries(config)
    .filter(([key, value]) => key !== 'port' && !value)
    .map(([key]) => `${prefix}_${key.toUpperCase()}`);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return config;
};

// Database connections (single connections, not pools - this is a one-time script)
const createMySqlConnection = async (config: DbConfig): Promise<mysql.Connection> => {
  console.log(`Connecting to MySQL at ${config.host}:${config.port}...`);
  const connection = await mysql.createConnection(config);
  console.log('Connected to MySQL');
  return connection;
};

const createPostgresClient = async (config: DbConfig): Promise<pg.Client> => {
  console.log(`Connecting to PostgreSQL at ${config.host}:${config.port}...`);
  const client = new pg.Client(config);
  await client.connect();
  console.log('Connected to PostgreSQL');
  return client;
};

// Queries
const CATEGORY_QUERY = `
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
`;

const POST_QUERY = `
  SELECT
    id,
    title,
    introtext AS content,
    catid,
    hits,
    created,
    modified,
    1 AS oldPost,
    2 AS authorId,
    1 AS published
  FROM j3x_content
  WHERE catid = ?
    AND state = 1
    AND id NOT IN (26, 42, 123, 860, 869, 902, 903, 940, 1014, 1086, 1095)
  LIMIT 10000
`;

// Migration functions
const migrateCategories = async (
  mysqlConn: mysql.Connection,
  pgClient: pg.Client,
): Promise<CategoryMap> => {
  console.log('\n--- Migrating Categories ---');

  const [rows] = await mysqlConn.query(CATEGORY_QUERY);
  const categories = rows as JoomlaCategory[];
  console.log(`Found ${categories.length} categories`);

  const categoryMap: CategoryMap = new Map();

  for (const category of categories) {
    const parentId = category.parentId === 1
      ? null
      : category.parentId !== null
        ? categoryMap.get(category.parentId) ?? null
        : null;

    if (category.parentId !== null && category.parentId !== 1 && parentId === null) {
      console.warn(`  Warning: Parent not found for "${category.name}" (parent_id=${category.parentId})`);
    }

    const result = await pgClient.query(
      `INSERT INTO "Category" ("name", "slug", "description", "parentId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [category.name, category.slug, category.description, parentId, new Date(), new Date()],
    );

    const newId = result.rows[0].id;
    categoryMap.set(category.id, newId);
    console.log(`  ${category.name}: MySQL ${category.id} → Postgres ${newId}`);
  }

  console.log(`Migrated ${categoryMap.size} categories`);
  return categoryMap;
};

const migratePostsForCategory = async (
  mysqlConn: mysql.Connection,
  pgClient: pg.Client,
  category: JoomlaCategory,
): Promise<number> => {
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
    } else {
      console.log(`    Skipped duplicate: ${post.id} ${post.title}`);
    }
  }

  return migratedCount;
};

const migratePosts = async (
  mysqlConn: mysql.Connection,
  pgClient: pg.Client,
  categories: JoomlaCategory[],
  categoryMap: CategoryMap,
): Promise<number> => {
  console.log('\n--- Migrating Posts ---');

  let totalPosts = 0;

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const pgCategoryId = categoryMap.get(category.id);

    if (!pgCategoryId) {
      console.warn(`  Skipping "${category.name}" - no Postgres ID found`);
      continue;
    }

    const count = await migratePostsForCategory(mysqlConn, pgClient, category);
    totalPosts += count;

    if (count > 0) {
      console.log(`  [${i + 1}/${categories.length}] ${category.name}: ${count} posts`);
    }
  }

  console.log(`Migrated ${totalPosts} posts total`);
  return totalPosts;
};

// Main
const main = async (): Promise<void> => {
  let mysqlConn: mysql.Connection | null = null;
  let pgClient: pg.Client | null = null;

  try {
    console.log('=== MySQL to PostgreSQL Migration ===\n');

    // Connect to databases (single connections, not pools)
    mysqlConn = await createMySqlConnection(getDbConfig('MYSQL'));
    pgClient = await createPostgresClient(getDbConfig('POSTGRES'));

    // Fetch categories from MySQL
    const [categoryRows] = await mysqlConn.query(CATEGORY_QUERY);
    const categories = categoryRows as JoomlaCategory[];

    // Migrate
    const categoryMap = await migrateCategories(mysqlConn, pgClient);
    const totalPosts = await migratePosts(mysqlConn, pgClient, categories, categoryMap);

    // Summary
    console.log('\n=== Migration Complete ===');
    console.log(`Categories: ${categoryMap.size}`);
    console.log(`Posts: ${totalPosts}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (pgClient) {
      await pgClient.end();
      console.log('\nPostgreSQL connection closed');
    }
    if (mysqlConn) {
      await mysqlConn.end();
      console.log('MySQL connection closed');
    }
  }
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
