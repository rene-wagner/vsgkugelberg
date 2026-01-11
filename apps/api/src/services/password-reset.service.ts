import crypto from 'crypto';
import { prisma } from '@/lib/prisma.lib';

// Default expiry time in minutes, configurable via environment
const DEFAULT_EXPIRY_MINUTES = 60;

/**
 * Get the token expiry time in minutes from environment or default.
 */
function getExpiryMinutes(): number {
  const envValue = process.env.PASSWORD_RESET_EXPIRY_MINUTES;
  if (envValue) {
    const parsed = parseInt(envValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return DEFAULT_EXPIRY_MINUTES;
}

/**
 * Generate a cryptographically secure token.
 * Uses 32 bytes (256 bits) of randomness, output as 64-character hex string.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token using SHA-256.
 * Tokens are stored as hashes to protect them if the database is compromised.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a password reset token for a user.
 * Returns the plaintext token (to be sent via email).
 * The hashed token is stored in the database.
 */
export async function createResetToken(userId: number): Promise<string> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiryMinutes = getExpiryMinutes();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return token;
}

export interface TokenValidationResult {
  valid: boolean;
  userId?: number;
  tokenId?: number;
  error?: 'invalid' | 'expired' | 'used';
}

/**
 * Validate a password reset token.
 * Checks if the token exists, is not expired, and has not been used.
 */
export async function validateResetToken(token: string): Promise<TokenValidationResult> {
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: { tokenHash },
  });

  if (!resetToken) {
    return { valid: false, error: 'invalid' };
  }

  if (resetToken.usedAt) {
    return { valid: false, error: 'used' };
  }

  if (resetToken.expiresAt < new Date()) {
    return { valid: false, error: 'expired' };
  }

  return {
    valid: true,
    userId: resetToken.userId,
    tokenId: resetToken.id,
  };
}

/**
 * Mark a token as used by setting the usedAt timestamp.
 * This prevents token reuse while maintaining an audit trail.
 */
export async function consumeResetToken(tokenId: number): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { usedAt: new Date() },
  });
}

/**
 * Get the APP_URL for building reset links.
 * Falls back to localhost if not configured.
 */
export function getAppUrl(): string {
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    console.warn('APP_URL not set, using default http://localhost:5173');
    return 'http://localhost:5173';
  }
  return appUrl;
}

/**
 * Build the full reset URL to be sent in the email.
 */
export function buildResetUrl(token: string): string {
  const appUrl = getAppUrl();
  return `${appUrl}/reset-password?token=${token}`;
}
