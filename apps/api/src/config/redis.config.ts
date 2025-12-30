import Redis from 'ioredis';

/**
 * Redis client configuration for rate limiting.
 * Uses REDIS_URL if available, otherwise falls back to individual settings.
 * Configured with maxRetriesPerRequest: null for rate-limit-redis compatibility.
 *
 * In test environment or when Redis is not configured, returns null to use
 * in-memory rate limiting instead.
 */

const getRedisConfig = (): Redis | null => {
  // Skip Redis if REDIS_URL is not explicitly configured
  // This allows graceful fallback to in-memory rate limiting
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    return null;
  }

  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
  const redisPassword = process.env.REDIS_PASSWORD;

  try {
    const client = redisUrl
      ? new Redis(redisUrl, {
          maxRetriesPerRequest: null, // Required for rate-limit-redis compatibility
          enableReadyCheck: false,
          lazyConnect: true,
          retryStrategy: (times) => {
            // Stop retrying after 3 attempts in non-production
            if (process.env.NODE_ENV !== 'production' && times > 3) {
              return null;
            }
            // Exponential backoff with max 2 seconds
            return Math.min(times * 100, 2000);
          },
        })
      : new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword || undefined,
          maxRetriesPerRequest: null, // Required for rate-limit-redis compatibility
          enableReadyCheck: false,
          lazyConnect: true,
          retryStrategy: (times) => {
            // Stop retrying after 3 attempts in non-production
            if (process.env.NODE_ENV !== 'production' && times > 3) {
              return null;
            }
            // Exponential backoff with max 2 seconds
            return Math.min(times * 100, 2000);
          },
        });

    client.on('connect', () => {
      console.log('Redis client connected');
    });

    client.on('error', (err) => {
      console.error('Redis client error:', err.message);
    });

    client.on('close', () => {
      console.log('Redis connection closed');
    });

    return client;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    return null;
  }
};

export const redisClient = getRedisConfig();
