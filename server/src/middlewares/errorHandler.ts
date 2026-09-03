import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { ZodError } from 'zod';
import multer from 'multer';
import { Prisma } from '@prisma/client';

// global error handler - intercepts thrown errors and normalises responses for the client
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // 1. Custom Application Errors (thrown intentionally in services / controllers)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
      },
    });
  }

  // 2. Prisma Database Errors - map orm error codes to friendly http statuses
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        // unique constraint voilation (eg duplicate username or course code)
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: `A record with the same value already exists (${target}).`,
          },
        });
      }
      case 'P2025': {
        // record not found in db
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'The requested record was not found in the database.',
          },
        });
      }
      case 'P2003': {
        // foreign key constraint fail (eg deleting a course that has assignments)
        return res.status(400).json({
          error: {
            code: 'FOREIGN_KEY_VIOLATION',
            message: 'Operation failed due to related records in the database.',
          },
        });
      }
      default: {
        return res.status(400).json({
          error: {
            code: `DATABASE_ERROR_${err.code}`,
            message: 'A database error occurred during the request.',
          },
        });
      }
    }
  }

  // 3. Zod Schema Validation Errors - format into field-specific messages for frontend forms
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Form validation failed.',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  // 4. Multer Upload Errors (eg file size limit exceeded)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: {
        code: 'UPLOAD_ERROR',
        message: `Upload error: ${err.message}`,
      },
    });
  }

  // 5. Fallback Unexpected Server Errors - log to console but dont leak stack trace to client
  console.error('Unhandled Server Error:', err);

  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred.',
    },
  });
}
