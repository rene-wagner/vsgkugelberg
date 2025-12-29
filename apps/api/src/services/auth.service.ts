import jwt from 'jsonwebtoken';
import { PasswordService } from './password.service';
import { jwtConfig } from '@/config/jwt.config';
import { prisma } from '@/lib/prisma.lib';
import { emailService } from './email.service';
import {
  createResetToken,
  validateResetToken,
  consumeResetToken,
  buildResetUrl,
} from './password-reset.service';

export interface JwtPayload {
  username: string;
  sub: number;
  iat?: number;
  exp?: number;
}

export interface UserPayload {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginResponse {
  access_token: string;
  user: UserPayload;
}

export class AuthService {
  constructor(private passwordService: PasswordService) {}

  async validateUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<UserPayload | null> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (user && (await this.passwordService.verify(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }

    return null;
  }

  login(user: UserPayload): LoginResponse {
    const payload = {
      username: user.username,
      sub: user.id,
    };

    const access_token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    } as jwt.SignOptions);

    return {
      access_token,
      user,
    };
  }

  verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, jwtConfig.secret);
    if (typeof decoded === 'string') {
      throw new Error('Invalid token');
    }
    return decoded as unknown as JwtPayload;
  }

  /**
   * Request a password reset for the given email.
   * Always returns success to prevent user enumeration.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return;
    }

    try {
      const token = await createResetToken(user.id);
      const resetUrl = buildResetUrl(token);
      await emailService.sendPasswordResetEmail(email, resetUrl);
    } catch (error) {
      // Log the error but don't expose it to the user
      console.error('Failed to send password reset email:', error);
    }
  }

  /**
   * Reset password result type
   */
  static readonly RESET_ERRORS = {
    INVALID: 'invalid',
    EXPIRED: 'expired',
    USED: 'used',
  } as const;

  /**
   * Reset a user's password using a valid reset token.
   * Returns success status and optional error type.
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    const validation = await validateResetToken(token);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Hash the new password and update the user
    const hashedPassword = await this.passwordService.hash(newPassword);

    await prisma.user.update({
      where: { id: validation.userId },
      data: { password: hashedPassword },
    });

    // Mark the token as used
    await consumeResetToken(validation.tokenId!);

    return { success: true };
  }
}
