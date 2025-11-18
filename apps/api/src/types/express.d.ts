import { UserPayload } from '@/services/auth.service';

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
