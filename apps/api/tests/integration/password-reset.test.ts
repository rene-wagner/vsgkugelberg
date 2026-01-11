import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { createTestUserWithPassword, prisma } from '../helpers';
import { generateToken, hashToken } from '@/services/password-reset.service';
import { clearEmails, getEmailsTo, getEmailSubject, getEmailBody, getEmailRecipient } from '../helpers/mailhog';

describe('Password Reset API Integration Tests', () => {
  const testPassword = 'Password123';
  const newPassword = 'NewPassword456';
  const testEmail = 'reset_test@example.com';
  const testUsername = 'reset_testuser';

  // Clear MailHog before each test for isolation
  beforeEach(async () => {
    await clearEmails();
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return success message for valid email', async () => {
      await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const response = await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('E-Mail');
    });

    it('should return success message for non-existent email (prevent enumeration)', async () => {
      const response = await request(app).post('/api/auth/forgot-password').send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('E-Mail');
    });

    it('should create a token record for valid email', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      const token = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
      });

      expect(token).not.toBeNull();
      expect(token?.tokenHash).toBeDefined();
      expect(token?.expiresAt).toBeDefined();
      expect(token?.usedAt).toBeNull();
    });

    it('should not create a token for non-existent email', async () => {
      const countBefore = await prisma.passwordResetToken.count();

      await request(app).post('/api/auth/forgot-password').send({ email: 'nonexistent@example.com' });

      const countAfter = await prisma.passwordResetToken.count();
      expect(countAfter).toBe(countBefore);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app).post('/api/auth/forgot-password').send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app).post('/api/auth/forgot-password').send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for empty email', async () => {
      const response = await request(app).post('/api/auth/forgot-password').send({ email: '' });

      expect(response.status).toBe(400);
    });

    it('should allow multiple reset requests for same user', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      // First request
      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      // Second request
      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      const tokens = await prisma.passwordResetToken.findMany({
        where: { userId: user.id },
      });

      expect(tokens.length).toBe(2);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      // Create a valid token directly
      const token = generateToken();
      const tokenHash = hashToken(token);
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        },
      });

      const response = await request(app).post('/api/auth/reset-password').send({ token, password: newPassword });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('erfolgreich');

      // Verify the password was actually changed by trying to login
      const loginResponse = await request(app).post('/api/auth/login').send({
        username: testUsername,
        password: newPassword,
      });

      expect(loginResponse.status).toBe(200);
    });

    it('should mark token as used after successful reset', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const token = generateToken();
      const tokenHash = hashToken(token);
      const resetToken = await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      await request(app).post('/api/auth/reset-password').send({ token, password: newPassword });

      const updatedToken = await prisma.passwordResetToken.findUnique({
        where: { id: resetToken.id },
      });

      expect(updatedToken?.usedAt).not.toBeNull();
    });

    it('should return 400 for expired token', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const token = generateToken();
      const tokenHash = hashToken(token);
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() - 1000), // Already expired
        },
      });

      const response = await request(app).post('/api/auth/reset-password').send({ token, password: newPassword });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('abgelaufen');
    });

    it('should return 400 for already used token', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const token = generateToken();
      const tokenHash = hashToken(token);
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          usedAt: new Date(), // Already used
        },
      });

      const response = await request(app).post('/api/auth/reset-password').send({ token, password: newPassword });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('bereits verwendet');
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'a'.repeat(64), // Valid format but doesn't exist
          password: newPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Ungueltig');
    });

    it('should return 400 for missing token', async () => {
      const response = await request(app).post('/api/auth/reset-password').send({ password: newPassword });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'a'.repeat(64) });

      expect(response.status).toBe(400);
    });

    it('should return 400 for weak password (too short)', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const token = generateToken();
      const tokenHash = hashToken(token);
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const response = await request(app).post('/api/auth/reset-password').send({ token, password: 'short' });

      expect(response.status).toBe(400);
    });

    it('should return 400 for password without uppercase', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const token = generateToken();
      const tokenHash = hashToken(token);
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const response = await request(app).post('/api/auth/reset-password').send({ token, password: 'password123' }); // no uppercase

      expect(response.status).toBe(400);
    });

    it('should return 400 for password without lowercase', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const token = generateToken();
      const tokenHash = hashToken(token);
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const response = await request(app).post('/api/auth/reset-password').send({ token, password: 'PASSWORD123' }); // no lowercase

      expect(response.status).toBe(400);
    });

    it('should return 400 for password without number', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const token = generateToken();
      const tokenHash = hashToken(token);
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      const response = await request(app).post('/api/auth/reset-password').send({ token, password: 'PasswordNoNum' }); // no number

      expect(response.status).toBe(400);
    });

    it('should not consume token on password validation failure', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const token = generateToken();
      const tokenHash = hashToken(token);
      const resetToken = await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      // First attempt with weak password
      await request(app).post('/api/auth/reset-password').send({ token, password: 'weak' });

      // Token should still be usable
      const tokenAfterFailure = await prisma.passwordResetToken.findUnique({
        where: { id: resetToken.id },
      });
      expect(tokenAfterFailure?.usedAt).toBeNull();

      // Second attempt with valid password should work
      const response = await request(app).post('/api/auth/reset-password').send({ token, password: newPassword });

      expect(response.status).toBe(200);
    });

    it('should invalidate old password after reset', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      const token = generateToken();
      const tokenHash = hashToken(token);
      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      await request(app).post('/api/auth/reset-password').send({ token, password: newPassword });

      // Old password should no longer work
      const loginResponse = await request(app).post('/api/auth/login').send({
        username: testUsername,
        password: testPassword,
      });

      expect(loginResponse.status).toBe(401);
    });
  });

  describe('Password Reset Security', () => {
    it('should use different tokens for multiple reset requests', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      const tokens = await prisma.passwordResetToken.findMany({
        where: { userId: user.id },
      });

      expect(tokens.length).toBe(2);
      expect(tokens[0].tokenHash).not.toBe(tokens[1].tokenHash);
    });

    it('should store hashed token, not plaintext', async () => {
      const user = await createTestUserWithPassword(testUsername, testEmail, testPassword);

      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      const token = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
      });

      // Token hash should be 64 characters (SHA-256 hex)
      expect(token?.tokenHash).toHaveLength(64);
      // Should not contain @ (which would be in email, indicating plaintext)
      expect(token?.tokenHash).not.toContain('@');
    });
  });

  describe('Password Reset Email Verification (MailHog)', () => {
    it('should send password reset email to correct recipient', async () => {
      await createTestUserWithPassword(testUsername, testEmail, testPassword);

      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      // Verify email was captured by MailHog
      const emails = await getEmailsTo(testEmail);
      expect(emails).toHaveLength(1);
      expect(getEmailRecipient(emails[0])).toBe(testEmail);
    });

    it('should send email with correct subject line', async () => {
      await createTestUserWithPassword(testUsername, testEmail, testPassword);

      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      const emails = await getEmailsTo(testEmail);
      expect(emails).toHaveLength(1);
      expect(getEmailSubject(emails[0])).toBe('Passwort zuruecksetzen - VSG Kugelberg');
    });

    it('should include reset link with valid token in email body', async () => {
      await createTestUserWithPassword(testUsername, testEmail, testPassword);

      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      const emails = await getEmailsTo(testEmail);
      expect(emails).toHaveLength(1);

      const body = getEmailBody(emails[0]);

      // Should contain reset-password URL with token parameter
      // Note: MailHog uses quoted-printable encoding, so = becomes =3D
      expect(body).toContain('reset-password?token');

      // Decode quoted-printable: replace =3D with = and remove soft line breaks (=\r\n)
      const decodedBody = body.replace(/=\r?\n/g, '').replace(/=3D/g, '=');

      // Extract token from decoded body and verify it's a 64-char hex string
      const tokenMatch = decodedBody.match(/reset-password\?token=([a-f0-9]{64})/);
      expect(tokenMatch).not.toBeNull();
      expect(tokenMatch![1]).toHaveLength(64);
    });

    it('should not send email for non-existent user', async () => {
      await request(app).post('/api/auth/forgot-password').send({ email: 'nonexistent@example.com' });

      // No email should be captured
      const emails = await getEmailsTo('nonexistent@example.com');
      expect(emails).toHaveLength(0);
    });

    it('should send separate emails for multiple reset requests', async () => {
      await createTestUserWithPassword(testUsername, testEmail, testPassword);

      // First request
      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      // Second request
      await request(app).post('/api/auth/forgot-password').send({ email: testEmail });

      // Should have 2 emails
      const emails = await getEmailsTo(testEmail);
      expect(emails).toHaveLength(2);

      // Each email should have a different token
      // Decode quoted-printable: replace =3D with = and remove soft line breaks
      const tokens = emails.map((email) => {
        const body = getEmailBody(email);
        const decodedBody = body.replace(/=\r?\n/g, '').replace(/=3D/g, '=');
        const match = decodedBody.match(/reset-password\?token=([a-f0-9]{64})/);
        return match ? match[1] : null;
      });

      expect(tokens[0]).not.toBeNull();
      expect(tokens[1]).not.toBeNull();
      expect(tokens[0]).not.toBe(tokens[1]);
    });
  });
});
