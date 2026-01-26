import pg from 'pg';
import ora from 'ora';
import { getPostgresConfig } from '../config/database';

export async function connectPostgres(): Promise<pg.Client> {
  const spinner = ora('Connecting to PostgreSQL...').start();
  try {
    const config = getPostgresConfig();
    const client = new pg.Client(config);
    await client.connect();
    spinner.succeed(`Connected to PostgreSQL at ${config.host}:${config.port}`);
    return client;
  } catch (error) {
    spinner.fail('Failed to connect to PostgreSQL');
    throw error;
  }
}
