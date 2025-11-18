import { Request, Response, NextFunction } from 'express'
import { HttpException } from '../errors/http-errors'
import { Prisma } from '@prisma/client'

/**
 * Global Error Handler Middleware
 * Catches all errors and formats them into consistent HTTP responses
 * Mimics NestJS exception filter behavior
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // HttpException (NotFoundException, ConflictException, etc.)
  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      error: err.name.replace('Exception', ''),
    })
  }

  // Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        const target = err.meta?.target as string[]
        const field = target?.[0] || 'field'
        return res.status(409).json({
          statusCode: 409,
          message: `A record with this ${field} already exists`,
          error: 'Conflict',
        })

      case 'P2025': // Record not found
        return res.status(404).json({
          statusCode: 404,
          message: 'Record not found',
          error: 'NotFound',
        })

      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          statusCode: 400,
          message: 'Foreign key constraint violation',
          error: 'BadRequest',
        })

      default:
        return res.status(400).json({
          statusCode: 400,
          message: 'Database operation failed',
          error: 'BadRequest',
        })
    }
  }

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid data provided',
      error: 'BadRequest',
    })
  }

  // Default to 500 server error
  console.error('Unhandled error:', err)
  return res.status(500).json({
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    error: 'InternalServerError',
  })
}

/**
 * 404 Not Found Handler
 * Handles routes that don't exist
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(404).json({
    statusCode: 404,
    message: `Cannot ${req.method} ${req.path}`,
    error: 'NotFound',
  })
}
