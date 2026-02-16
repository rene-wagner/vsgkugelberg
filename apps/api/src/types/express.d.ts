import type { Request } from 'express';
import type { ParsedQs } from 'qs';
import { UserPayload } from '@/services/auth.service';

/**
 * Extend Passport's Express.User interface.
 * Passport automatically adds `user?: User` to Express.Request.
 *
 * Uses Partial<UserPayload> to allow both:
 * - JWT middleware: Sets only {id, username} from token
 * - Passport local strategy: Sets full UserPayload from database
 *
 * Routes should check which fields are available based on their auth middleware.
 */
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends Partial<UserPayload> {}
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
  ParsedQs // query
>;
