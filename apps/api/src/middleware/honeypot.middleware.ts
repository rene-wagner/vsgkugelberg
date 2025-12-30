import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { HoneypotValidationResult } from '@/types/contact-form.types';

// Configuration from environment with defaults
const HONEYPOT_SECRET =
  process.env.HONEYPOT_SECRET || 'default-honeypot-secret-change-in-production';
const MIN_SUBMISSION_TIME =
  parseInt(process.env.CONTACT_FORM_MIN_TIME || '3', 10) * 1000; // Convert to ms
const MAX_SUBMISSION_TIME =
  parseInt(process.env.CONTACT_FORM_MAX_TIME || '3600', 10) * 1000; // Convert to ms

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Generates a key from the secret (must be 32 bytes for AES-256)
 */
function getKey(): Buffer {
  return crypto.createHash('sha256').update(HONEYPOT_SECRET).digest();
}

/**
 * Encrypts a timestamp for use in the honeypot field
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Encrypted timestamp string (base64)
 */
export function encryptTimestamp(timestamp: number = Date.now()): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const data = timestamp.toString();
  let encrypted = cipher.update(data, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

/**
 * Decrypts a timestamp from the honeypot field
 * @param encryptedTimestamp - Encrypted timestamp string
 * @returns Decrypted timestamp in milliseconds, or null if invalid
 */
export function decryptTimestamp(encryptedTimestamp: string): number | null {
  try {
    const parts = encryptedTimestamp.split(':');
    if (parts.length !== 3) return null;

    const [ivBase64, authTagBase64, encryptedBase64] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    const encrypted = Buffer.from(encryptedBase64, 'base64');

    if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
      return null;
    }

    const key = getKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    const timestamp = parseInt(decrypted.toString('utf8'), 10);
    if (isNaN(timestamp)) return null;

    return timestamp;
  } catch {
    return null;
  }
}

/**
 * Validates honeypot fields from a contact form submission
 * @param website - The honeypot field (should be empty)
 * @param timestamp - The encrypted timestamp field
 * @returns Validation result indicating if the submission is spam
 */
export function validateHoneypot(
  website: string | undefined,
  timestamp: string | undefined,
): HoneypotValidationResult {
  // Check honeypot field - must be empty or undefined
  if (website && website.trim() !== '') {
    return { isSpam: true, reason: 'honeypot_filled' };
  }

  // Check timestamp field
  if (!timestamp) {
    return { isSpam: true, reason: 'invalid_timestamp' };
  }

  const formLoadTime = decryptTimestamp(timestamp);
  if (formLoadTime === null) {
    return { isSpam: true, reason: 'invalid_timestamp' };
  }

  const now = Date.now();
  const elapsed = now - formLoadTime;

  // Check if submission was too fast (likely a bot)
  if (elapsed < MIN_SUBMISSION_TIME) {
    return { isSpam: true, reason: 'too_fast' };
  }

  // Check if timestamp is too old (prevent replay attacks)
  if (elapsed > MAX_SUBMISSION_TIME) {
    return { isSpam: true, reason: 'expired' };
  }

  return { isSpam: false };
}

/**
 * Express middleware that validates honeypot fields.
 * If spam is detected, returns 200 OK silently (no email sent).
 * Sets req.honeypotResult for use in the route handler.
 */
export function honeypotMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const { website, timestamp } = req.body as {
    website?: string;
    timestamp?: string;
  };
  const result = validateHoneypot(website, timestamp);

  // Attach result to request for use in route handler
  (
    req as Request & { honeypotResult: HoneypotValidationResult }
  ).honeypotResult = result;

  next();
}

/**
 * Helper to check if request was marked as spam by honeypot middleware
 */
export function isSpamRequest(req: Request): boolean {
  return (
    (req as Request & { honeypotResult?: HoneypotValidationResult })
      .honeypotResult?.isSpam === true
  );
}
