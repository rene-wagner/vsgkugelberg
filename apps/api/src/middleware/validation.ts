import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { BadRequestException } from '../errors/http-errors'

/**
 * Validation Middleware
 * Checks for validation errors from express-validator and throws BadRequestException
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
    }))
    
    throw new BadRequestException(
      JSON.stringify({
        message: 'Validation failed',
        errors: formattedErrors,
      }),
    )
  }
  
  next()
}
