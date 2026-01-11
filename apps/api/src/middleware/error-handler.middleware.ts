import { Request, Response, NextFunction } from 'express';
import { HttpException } from '@/errors/http-errors';
import { Prisma } from '@/lib/prisma.lib';

export const errorHandlerMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      error: err.name.replace('Exception', ''),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        const target = err.meta?.target as string[];
        const field = target?.[0] || 'field';
        return res.status(409).json({
          statusCode: 409,
          message: `A record with this ${field} already exists`,
          error: 'Conflict',
        });

      case 'P2025': // Record not found
        return res.status(404).json({
          statusCode: 404,
          message: 'Record not found',
          error: 'NotFound',
        });

      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          statusCode: 400,
          message: 'Foreign key constraint violation',
          error: 'BadRequest',
        });

      default:
        return res.status(400).json({
          statusCode: 400,
          message: 'Database operation failed',
          error: 'BadRequest',
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Invalid data provided',
      error: 'BadRequest',
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    statusCode: 500,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    error: 'InternalServerError',
  });
};

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    statusCode: 404,
    message: `Cannot ${req.method} ${req.path}`,
    error: 'NotFound',
  });
};
