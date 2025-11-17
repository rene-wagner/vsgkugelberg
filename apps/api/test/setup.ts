// Global test setup for E2E tests
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables quietly to avoid noisy console tips
config({ path: join(__dirname, '..', '.env.test'), quiet: true });

// Increase test timeout globally
jest.setTimeout(30000);
