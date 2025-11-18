import { UserPayload } from '../services/auth.service'

declare global {
  namespace Express {
    // This extends the User type used by Passport
    interface User extends UserPayload {}
  }
}

// Extend Express Request to include user property with partial info
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number
      username: string
      email?: string
      createdAt?: Date
      updatedAt?: Date
    }
  }
}
