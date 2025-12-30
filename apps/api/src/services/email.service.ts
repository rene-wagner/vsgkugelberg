import nodemailer from 'nodemailer';

/**
 * Email service interface for sending emails.
 * Implementations can use console logging (dev) or SMTP (production).
 */
export interface EmailService {
  sendPasswordResetEmail(email: string, resetUrl: string): Promise<void>;
}

/**
 * Console-based email service for development.
 * Logs email content to console instead of sending.
 */
class ConsoleEmailService implements EmailService {
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    console.log('\n========================================');
    console.log('PASSWORD RESET EMAIL (Development Mode)');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log('Subject: Passwort zuruecksetzen - VSG Kugelberg');
    console.log('----------------------------------------');
    console.log('Hallo,');
    console.log('');
    console.log(
      'Du hast eine Anfrage zum Zuruecksetzen deines Passworts gestellt.',
    );
    console.log(
      'Klicke auf den folgenden Link, um ein neues Passwort zu setzen:',
    );
    console.log('');
    console.log(`  ${resetUrl}`);
    console.log('');
    console.log('Dieser Link ist 60 Minuten gueltig.');
    console.log('');
    console.log(
      'Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.',
    );
    console.log('');
    console.log('Mit sportlichen Gruessen,');
    console.log('VSG Kugelberg');
    console.log('========================================\n');
  }
}

/**
 * SMTP-based email service for production.
 * Uses nodemailer with SMTP transport.
 * Supports both authenticated (production) and unauthenticated (MailHog) modes.
 */
class SmtpEmailService implements EmailService {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    this.fromAddress = process.env.SMTP_FROM || 'noreply@vsg-kugelberg.de';

    if (!host) {
      throw new Error('SMTP configuration incomplete. Required: SMTP_HOST');
    }

    // Build transport config - auth is optional for MailHog and similar local SMTP servers
    const transportConfig: nodemailer.TransportOptions = {
      host,
      port,
      secure: port === 465,
    };

    // Only add auth if both user and pass are provided
    if (user && pass) {
      transportConfig.auth = {
        user,
        pass,
      };
    }

    this.transporter = nodemailer.createTransport(transportConfig);
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const mailOptions = {
      from: this.fromAddress,
      to: email,
      subject: 'Passwort zuruecksetzen - VSG Kugelberg',
      text: `Hallo,

Du hast eine Anfrage zum Zuruecksetzen deines Passworts gestellt.
Klicke auf den folgenden Link, um ein neues Passwort zu setzen:

${resetUrl}

Dieser Link ist 60 Minuten gueltig.

Falls du diese Anfrage nicht gestellt hast, ignoriere diese E-Mail.

Mit sportlichen Gruessen,
VSG Kugelberg`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

/**
 * Factory function to create the appropriate email service based on environment.
 * Uses EMAIL_PROVIDER env var: 'console' (default) or 'smtp'.
 */
export function createEmailService(): EmailService {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  if (provider === 'smtp') {
    return new SmtpEmailService();
  }

  if (provider !== 'console') {
    console.warn(
      `Unknown EMAIL_PROVIDER "${provider}", falling back to console`,
    );
  }

  return new ConsoleEmailService();
}

// Export singleton instance
export const emailService = createEmailService();
