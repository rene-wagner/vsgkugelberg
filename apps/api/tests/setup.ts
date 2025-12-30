import { beforeAll, afterAll, afterEach } from 'vitest';
import { prisma, cleanupDatabase, disconnectDatabase } from './helpers';
import { clearEmails } from './helpers/mailhog';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(__dirname, '../.env.test'),
  override: true,
  quiet: true,
});

// Configure email service to use MailHog for tests
process.env.EMAIL_PROVIDER = 'smtp';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '1025';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';
process.env.SMTP_FROM = 'noreply@vsg-kugelberg.de';

if (!process.env.DATABASE_URL?.includes('test')) {
  console.warn(
    '⚠️  Warning: DATABASE_URL does not contain "test" - you may be using your development database!',
  );
}

beforeAll(async () => {
  try {
    await prisma.$connect();
    await cleanupDatabase();
    // Clear any leftover emails from previous test runs
    await clearEmails().catch(() => {
      // MailHog may not be running in all environments
      console.warn(
        '⚠️  Warning: Could not clear MailHog emails. Make sure MailHog is running for email tests.',
      );
    });
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
