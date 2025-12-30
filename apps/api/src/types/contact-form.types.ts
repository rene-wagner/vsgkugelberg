/**
 * Contact form submission DTO
 */
export interface ContactFormDto {
  contactPersonId: number;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  // Honeypot fields
  website?: string;
  timestamp: string;
}

/**
 * Contact form email options for EmailService
 */
export interface ContactFormEmailOptions {
  to: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

/**
 * Result of honeypot validation
 */
export interface HoneypotValidationResult {
  isSpam: boolean;
  reason?: 'honeypot_filled' | 'too_fast' | 'expired' | 'invalid_timestamp';
}
