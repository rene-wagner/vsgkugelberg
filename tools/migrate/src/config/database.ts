import type { DbConfig } from '../types';

export function getPostgresConfig(): DbConfig {
  const prefix = 'POSTGRES';
  const defaultPort = 5432;

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
