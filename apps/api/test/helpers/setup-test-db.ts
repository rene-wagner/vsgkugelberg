import { PrismaService } from 'nestjs-prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Cleans the test database by dropping and recreating the schema
 */
export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  // Get all table names
  const tables = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  // Delete data from all tables (in reverse order to handle foreign keys)
  for (const { tablename } of tables) {
    if (tablename !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
      );
    }
  }
}

/**
 * Resets the test database completely (drops schema and re-runs migrations)
 */
export async function resetTestDatabase(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl?.includes('_test')) {
    throw new Error(
      'Safety check: DATABASE_URL must contain "_test" to prevent accidental production data deletion',
    );
  }

  // Run prisma migrate reset in test environment
  await execAsync('npx prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
}
