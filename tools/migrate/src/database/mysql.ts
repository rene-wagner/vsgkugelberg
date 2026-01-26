import mysql from 'mysql2/promise';
import ora from 'ora';
import { getMySQLConfig } from '../config/database';

export async function connectMySQL(): Promise<mysql.Connection> {
  const spinner = ora('Connecting to MySQL...').start();
  try {
    const config = getMySQLConfig();
    const connection = await mysql.createConnection(config);
    spinner.succeed(`Connected to MySQL at ${config.host}:${config.port}`);
    return connection;
  } catch (error) {
    spinner.fail('Failed to connect to MySQL');
    throw error;
  }
}
