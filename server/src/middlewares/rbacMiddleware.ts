import { Request, Response, NextFunction } from 'express';
import { Permission, hasPermission } from '../config/roles.js';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';

export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Assuming `req.user` is populated by authMiddleware
    if (!req.user || !req.user.role) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    if (!req.user.isApproved && req.user.role !== Role.ADMIN) {
      return next(new ForbiddenError('Your account has not been approved by an Administrator yet'));
    }

    if (!hasPermission(req.user.role, permission)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
};
