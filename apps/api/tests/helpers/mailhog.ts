/**
 * MailHog test helper functions for email verification in integration tests.
 * Uses the MailHog REST API to retrieve and manage captured emails.
 */

/**
 * MailHog email address structure
 */
export interface MailHogAddress {
  Mailbox: string;
  Domain: string;
  Params: string;
}

/**
 * MailHog message content structure
 */
export interface MailHogContent {
  Headers: Record<string, string[]>;
  Body: string;
  Size: number;
  MIME: unknown;
}

/**
 * MailHog message structure
 */
export interface MailHogMessage {
  ID: string;
  From: MailHogAddress;
  To: MailHogAddress[];
  Content: MailHogContent;
  Created: string;
  MIME: unknown;
  Raw: {
    From: string;
    To: string[];
    Data: string;
    Helo: string;
  };
}

/**
 * MailHog API response structure for messages endpoint
 */
interface MailHogResponse {
  total: number;
  count: number;
  start: number;
  items: MailHogMessage[];
}

const MAILHOG_API_URL = process.env.MAILHOG_API_URL || 'http://localhost:8025';

/**
 * Fetch all emails from MailHog.
 * @returns Array of captured email messages
 * @throws Error if MailHog is not accessible
 */
export async function getEmails(): Promise<MailHogMessage[]> {
  try {
    const response = await fetch(`${MAILHOG_API_URL}/api/v2/messages`);
    if (!response.ok) {
      throw new Error(`MailHog API returned ${response.status}`);
    }
    const data = (await response.json()) as MailHogResponse;
    return data.items;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`MailHog is not accessible at ${MAILHOG_API_URL}. ` + 'Start it with: docker compose --profile test up -d mailhog');
    }
    throw error;
  }
}

/**
 * Fetch emails sent to a specific recipient address.
 * @param email - The recipient email address to filter by
 * @returns Array of emails sent to the specified address
 */
export async function getEmailsTo(email: string): Promise<MailHogMessage[]> {
  const emails = await getEmails();
  return emails.filter((msg) => msg.To.some((to) => `${to.Mailbox}@${to.Domain}` === email));
}

/**
 * Delete all emails from MailHog.
 * Useful for clearing the mailbox before each test.
 */
export async function clearEmails(): Promise<void> {
  try {
    const response = await fetch(`${MAILHOG_API_URL}/api/v1/messages`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`MailHog API returned ${response.status}`);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`MailHog is not accessible at ${MAILHOG_API_URL}. ` + 'Start it with: docker compose --profile test up -d mailhog');
    }
    throw error;
  }
}

/**
 * Get the most recently captured email.
 * @returns The latest email message, or null if no emails exist
 */
export async function getLatestEmail(): Promise<MailHogMessage | null> {
  const emails = await getEmails();
  return emails.length > 0 ? emails[0] : null;
}

/**
 * Get the subject line from a MailHog message.
 * @param message - The MailHog message
 * @returns The email subject, or empty string if not found
 */
export function getEmailSubject(message: MailHogMessage): string {
  const subjects = message.Content.Headers['Subject'];
  return subjects && subjects.length > 0 ? subjects[0] : '';
}

/**
 * Get the email body content from a MailHog message.
 * @param message - The MailHog message
 * @returns The email body content
 */
export function getEmailBody(message: MailHogMessage): string {
  return message.Content.Body;
}

/**
 * Get the recipient email address from a MailHog message.
 * @param message - The MailHog message
 * @returns The first recipient email address, or empty string if none
 */
export function getEmailRecipient(message: MailHogMessage): string {
  if (message.To.length === 0) return '';
  const to = message.To[0];
  return `${to.Mailbox}@${to.Domain}`;
}
