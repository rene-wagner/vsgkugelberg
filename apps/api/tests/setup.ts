import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma, cleanupDatabase, disconnectDatabase } from './helpers';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
  override: true,
  quiet: true,
});

if (!process.env.DATABASE_URL?.includes('test')) {
  console.warn(
    '⚠️  Warning: DATABASE_URL does not contain "test" - you may be using your development database!',
  );
}

beforeAll(async () => {
  try {
    await prisma.$connect();
    await cleanupDatabase();
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error);
    throw error;
  }
});

afterEach(async () => {
  await cleanupDatabase();
});

afterAll(async () => {
  await cleanupDatabase();
  await disconnectDatabase();
});
