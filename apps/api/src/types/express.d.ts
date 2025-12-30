import { UserPayload } from '@/services/auth.service';
import type { Request } from 'express';

declare global {
  namespace Express {
    /* eslint-disable-next-line @typescript-eslint/no-empty-object-type */
    interface User extends UserPayload {}
  }
}

// Extend Express Request to include user property with partial info
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      username: string;
      email?: string;
      createdAt?: Date;
      updatedAt?: Date;
    };
  }
}

/**
 * Typed Express Request with body type parameter
 * Use this for routes that need typed request bodies
 */
export type TypedRequest<T> = Request<
  Record<string, string>, // params
  unknown, // res body
  T, // req body
  Record<string, string> // query
>;
