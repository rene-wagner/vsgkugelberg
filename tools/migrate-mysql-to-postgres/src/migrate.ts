// MySQL to PostgreSQL Migration Tool
// This tool migrates data from a MySQL database to a PostgreSQL database
// Run with: pnpm --filter migrate-mysql-to-postgres migrate

import 'dotenv/config';
import mysql from 'mysql2/promise';
import pg from 'pg';
import slugify from 'slugify';

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
type PostMap = Map<number, number>;

interface MySqlRow {
  [key: string]: any;
}

interface PostgresRow {
  [key: string]: any;
}

interface MySqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const getMySqlConfig = (): MySqlConfig => {
  const config: MySqlConfig = {
    host: process.env.MYSQL_HOST || '',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
  };

  if (!config.host || !config.user || !config.password || !config.database) {
    throw new Error('Missing required MySQL environment variables');
  }

  return config;
};

const getPostgresConfig = (): PostgresConfig => {
  const config: PostgresConfig = {
    host: process.env.POSTGRES_HOST || '',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || '',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DATABASE || '',
  };

  if (!config.host || !config.user || !config.password || !config.database) {
    throw new Error('Missing required PostgreSQL environment variables');
  }

  return config;
};

const migrateCategories = async (
  mysqlConnection: mysql.Pool,
  postgresConnection: pg.Pool,
): Promise<CategoryMap> => {
  console.log('Migrating categories...');

  const categoryMap: CategoryMap = new Map();

  const categoryQuery = `
    SELECT
      id,
      title as name,
      path as slug,
      description,
      NULLIF(parent_id, 1) as parentId,
      NOW() as createdAt,
      NOW() as updatedAt
    FROM
      j3x_categories
    WHERE
      extension = 'com_content'
      AND published = 1
    ORDER BY
      lft ASC
    LIMIT 300
  `;

  const categoryResult = await mysqlConnection.query(categoryQuery);
  const categories = categoryResult[0] as unknown[] as JoomlaCategory[];

  console.log(`Found ${categories.length} categories to migrate`);

  for (const category of categories) {
    let parentId: number | null = null;

    if (category.parentId === 1) {
      parentId = null;
    } else if (category.parentId !== null) {
      parentId = categoryMap.get(category.parentId) || null;

      if (parentId === null && category.parentId !== null) {
        console.warn(
          `Warning: Category "${category.name}" (MySQL ID ${category.id}) has parent_id=${category.parentId} but parent not found in migration. Setting to root.`,
        );
      }
    }

    console.log('Foo Bar Baz', category);

    const result = await postgresConnection.query(
      `
      INSERT INTO "Category" ("name", "slug", "description", "parentId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        category.name,
        category.slug,
        category.description,
        parentId,
        new Date(category.createdAt),
        new Date(category.updatedAt),
      ],
    );

    console.log('Foo Bar Baz 2');

    const newId = result.rows[0].id;
    categoryMap.set(category.id, newId);

    console.log(
      `Migrated category: ${category.name} (MySQL ID ${category.id} → Postgres ID ${newId})`,
    );
  }

  console.log(`Migrated ${categoryMap.size} categories`);

  return categoryMap;
};

const migratePostsForCategory = async (
  mysqlConnection: mysql.Pool,
  postgresConnection: pg.Pool,
  joomlaCategory: JoomlaCategory,
  postgresCategoryId: number,
  categoryMap: CategoryMap,
): Promise<PostMap> => {
    const excludedPostIds = new Set([
      26,
      42,
      860,
      903,
      902,
      123,
      869,
      1086,
    ]);

  const postQuery = `
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
    LIMIT 10000
  `;

  console.log(joomlaCategory.id);
  const postResult = await mysqlConnection.query(postQuery, [joomlaCategory.id]);
  const posts = postResult[0] as unknown[] as JoomlaPost[];

  console.log(
    `Found ${posts.length} posts for category "${joomlaCategory.name}"`,
  );

    const postMap: PostMap = new Map();
  const batchSize = 100;

  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);

    const insertPromises = batch.map(async (post) => {
      const slug = slugify(post.title);

      const result = await postgresConnection.query(
        `
        INSERT INTO "Post" ("title", "slug", "content", "published", "hits", "oldPost", "authorId", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT ("slug") DO NOTHING
        RETURNING id
        `,
        [
          post.title,
          slug,
          post.content,
          post.published === 1,
          post.hits,
          post.oldPost === 1,
          post.authorId,
          new Date(post.created),
          new Date(post.modified)
        ],
      );

      if (result.rows.length > 0) {
        const newId = result.rows[0].id;
      postMap.set(post.id, newId);

      console.log(
        `  Migrated post: ${post.title} (MySQL ID ${post.id} → Postgres ID ${newId})`,
      );
      } else {
        console.log(`Skipped duplicate: ${post.title}`);
      }
    });

    await Promise.all(insertPromises);
  }

  console.log(`Migrated ${postMap.size} posts for category "${joomlaCategory.name}"`);

  return postMap;
};

const main = async (): Promise<void> => {
  let mysqlConnection: mysql.Pool | null = null;
  let postgresConnection: pg.Pool | null = null;

  try {
    console.log('Starting MySQL to PostgreSQL migration...');

    const mysqlConfig = getMySqlConfig();
    const postgresConfig = getPostgresConfig();

    console.log(`Connecting to MySQL database at ${mysqlConfig.host}:${mysqlConfig.port}`);
    mysqlConnection = mysql.createPool(mysqlConfig);
    await mysqlConnection.getConnection();
    console.log('Connected to MySQL database successfully');

    console.log(`Connecting to PostgreSQL database at ${postgresConfig.host}:${postgresConfig.port}`);
    postgresConnection = new pg.Pool({
      host: postgresConfig.host,
      port: postgresConfig.port,
      user: postgresConfig.user,
      password: postgresConfig.password,
      database: postgresConfig.database,
    });
    await postgresConnection.connect();
    console.log('Connected to PostgreSQL database successfully');

    const categoryQuery = `
      SELECT
        id,
        title as name,
        path as slug,
        description,
        NULLIF(parent_id, 1) as parentId,
        NOW() as createdAt,
        NOW() as updatedAt
      FROM
        j3x_categories
      WHERE
        extension = 'com_content'
        AND published = 1
      ORDER BY
        lft ASC
      LIMIT 300
    `;

    const categoryResult = await mysqlConnection.query(categoryQuery);
    const categories = categoryResult[0] as unknown[] as JoomlaCategory[];
    console.log(`Found ${categories.length} categories to migrate`);

    const categoryMap = await migrateCategories(
      mysqlConnection,
      postgresConnection,
    );

    let totalPostsMigrated = 0;

    for (let i = 0; i < categories.length; i++) {
      const joomlaCategory = categories[i];
      const postgresCategoryId = categoryMap.get(joomlaCategory.id);

      if (!postgresCategoryId) {
        console.warn(
          `Warning: Skipping category "${joomlaCategory.name}" - no Postgres ID found`,
        );
        continue;
      }

      console.log(
        `\n[${i + 1}/${categories.length}] Migrating posts for category: ${joomlaCategory.name}`,
      );

      const postMap = await migratePostsForCategory(
        mysqlConnection,
        postgresConnection,
        joomlaCategory,
        postgresCategoryId,
        categoryMap,
      );

      totalPostsMigrated += postMap.size;
    }

    console.log(`\n========== Migration Complete =========`);
    console.log(`Total categories migrated: ${categoryMap.size}`);
    console.log(`Total posts migrated: ${totalPostsMigrated}`);
    console.log(`=======================================`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (postgresConnection) {
      await postgresConnection.end();
      console.log('PostgreSQL connection closed');
    }
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('MySQL connection closed');
    }
  }
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
