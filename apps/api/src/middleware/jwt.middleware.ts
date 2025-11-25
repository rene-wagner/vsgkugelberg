import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '@/config/jwt.config';
import { JwtPayload } from '@/services/auth.service';
import {
  HttpException,
  UnauthorizedException,
} from '@/errors/http-errors';

export const jwtMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    // Try to get token from cookie first, then Authorization header
    let token: string | undefined;

    // Check cookie
    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    // Check Authorization header (Bearer token)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    if (typeof decoded === 'string') {
      throw new UnauthorizedException('Invalid token');
    }

    const payload = decoded as unknown as JwtPayload;

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    (req as any).user = {
      id: payload.sub,
      username: payload.username,
    };

    next();
  } catch (error) {
    if (error instanceof HttpException) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedException('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedException('Token expired'));
    } else {
      next(error);
    }
  }
};
