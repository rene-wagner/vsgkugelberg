import type { DbConfig } from '../types';

export function getDbConfig(prefix: 'MYSQL' | 'POSTGRES'): DbConfig {
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
}

export function getMySQLConfig(): DbConfig {
  return getDbConfig('MYSQL');
}

export function getPostgresConfig(): DbConfig {
  return getDbConfig('POSTGRES');
}
