import rateLimit, { type Options, MemoryStore } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import type { Request, Response, NextFunction } from 'express';
import { redisClient } from '@/config/redis.config';

/**
 * Rate limiting middleware factory using Redis store.
 * Falls back to memory store if Redis is unavailable.
 * In test mode, rate limits are disabled unless ENABLE_RATE_LIMIT_IN_TESTS is set.
 */

// Check if we're in test mode
const isTestMode =
  process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';
const enableRateLimitInTests =
  process.env.ENABLE_RATE_LIMIT_IN_TESTS === 'true';

// Store instances for testing - allows reset between tests
const stores: Map<string, MemoryStore> = new Map();

/**
 * Creates a rate limiter with the specified configuration.
 * Uses Redis store for distributed rate limiting across multiple instances.
 */
const createRateLimiter = (options: {
  windowMs: number;
  limit: number;
  keyPrefix: string;
}) => {
  const { windowMs, limit, keyPrefix } = options;

  // In test mode, return a pass-through middleware unless explicitly enabled
  if (isTestMode && !enableRateLimitInTests) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  // Calculate minutes for error message
  const windowMinutes = Math.ceil(windowMs / (60 * 1000));

  // Create a memory store for this limiter
  const memoryStore = new MemoryStore();
  stores.set(keyPrefix, memoryStore);

  const rateLimitOptions: Partial<Options> = {
    windowMs,
    limit,
    standardHeaders: 'draft-7', // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      message: `Zu viele Anfragen. Bitte versuchen Sie es in ${windowMinutes} Minuten erneut.`,
    },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        message: `Zu viele Anfragen. Bitte versuchen Sie es in ${windowMinutes} Minuten erneut.`,
      });
    },
    // Use default key generator (handles IPv6 properly)
    // Default uses req.ip which respects Express trust proxy settings
  };

  // Use Redis store if client is available, otherwise use memory store
  if (redisClient) {
    rateLimitOptions.store = new RedisStore({
      // @ts-expect-error - ioredis is compatible with rate-limit-redis
      sendCommand: (...args: string[]) => redisClient.call(...args),
      prefix: `rate-limit:${keyPrefix}:`,
    });
    // Allow requests if Redis store has an error
    rateLimitOptions.passOnStoreError = true;
  } else {
    rateLimitOptions.store = memoryStore;
  }

  return rateLimit(rateLimitOptions);
};

/**
 * Reset all rate limit stores. For testing purposes only.
 */
export const resetRateLimitStores = (): void => {
  stores.forEach((store: MemoryStore) => {
    // resetAll returns Promise<void> | void
    void Promise.resolve(store.resetAll());
  });
};

/**
 * Rate limiter for login endpoint.
 * 5 requests per 15 minutes to prevent brute force attacks.
 */
export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  keyPrefix: 'login',
});

/**
 * Rate limiter for forgot-password endpoint.
 * 3 requests per hour to prevent email bombing.
 */
export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  keyPrefix: 'forgot-password',
});

/**
 * Rate limiter for reset-password endpoint.
 * 5 requests per 15 minutes to prevent token enumeration.
 */
export const resetPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  keyPrefix: 'reset-password',
});

/**
 * Rate limiter for logout endpoint.
 * 10 requests per minute for standard protection.
 */
export const logoutLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  keyPrefix: 'logout',
});

/**
 * Rate limiter for contact form endpoint.
 * 5 requests per hour to prevent spam/abuse.
 */
const contactFormLimit = parseInt(
  process.env.CONTACT_FORM_RATE_LIMIT || '5',
  10,
);
export const contactFormLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: contactFormLimit,
  keyPrefix: 'contact-form',
});
