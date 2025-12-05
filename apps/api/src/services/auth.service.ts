import jwt from 'jsonwebtoken';
import { PasswordService } from './password.service';
import { jwtConfig } from '@/config/jwt.config';
import { prisma } from '@/lib/prisma.lib';

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
}
