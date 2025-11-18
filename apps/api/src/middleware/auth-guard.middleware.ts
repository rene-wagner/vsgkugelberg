import { Request, Response, NextFunction } from 'express'
import { UnauthorizedException } from '@/errors/http-errors'

export const authGuardMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedException('Authentication required'))
  }

  next()
}
