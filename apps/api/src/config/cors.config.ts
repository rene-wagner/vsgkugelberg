import type { CorsOptions } from 'cors';

const DEFAULT_DEV_ORIGIN = 'http://localhost:5173';

function parseOrigins(origins: string | undefined): string[] {
  if (!origins) return [];

  return origins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export function createCorsOptions(): CorsOptions {
  const options: CorsOptions = {
    credentials: true,
    origin: (origin, callback) => {
      // Non-browser or same-origin requests without an Origin header
      if (!origin) {
        return callback(null, false);
      }

      const nodeEnv = process.env.NODE_ENV || 'development';
      const configuredOrigins = parseOrigins(process.env.CORS_ORIGINS);

      let allowedOrigins = configuredOrigins;

      if (allowedOrigins.length === 0 && nodeEnv === 'development') {
        allowedOrigins = [DEFAULT_DEV_ORIGIN];
      }

      const hasAllowList = allowedOrigins.length > 0;

      if (hasAllowList && allowedOrigins.includes(origin)) {
        // Echo back the specific allowed origin (never "*")
        return callback(null, origin);
      }

      // Disallow all other origins (no CORS headers)
      return callback(null, false);
    },
    optionsSuccessStatus: 204,
  };

  return options;
}
