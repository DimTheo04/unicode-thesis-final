import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { env } from '../config/env.js';

// middleware to verify json web tokens and attach the authenticated user to req.user
export interface JwtPayload {
  userId: string;
  username: string;
  role: Role;
  isApproved: boolean;
}

// extend express request typings so typescript knows req.user exists
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// verifies jwt bearer token sent by frontend client
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // header must follow standard format: "Bearer <jwt-token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  // extract token string after space
  const token = authHeader.split(' ')[1];

  try {
    // decode and verify token signature against server secret
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    return next();
  } catch {
    // expired or invalid signature triggers unauth error
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }
}

// route guard for role-based restrictions (eg only TEACHER or ADMIN)
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // check if user was succesfully authenticated first
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required'));
    }

    // pending accounts cannot access protected resources unless admin
    if (!req.user.isApproved && req.user.role !== Role.ADMIN) {
      return next(new ForbiddenError('Your account has not been approved by an Administrator yet'));
    }

    // verify user role is in the list of allowed roles for this endpoint
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    return next();
  };
}
