import { Request, Response, NextFunction } from 'express';
import { Permission, hasPermission } from '../config/roles.js';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';

// role-based access control (RBAC) middleware for granular action checks
export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // assumes authenticate middleware has already run and popualted req.user
    if (!req.user || !req.user.role) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    // unapproved accounts should be blocked until approved by admin
    if (!req.user.isApproved && req.user.role !== Role.ADMIN) {
      return next(new ForbiddenError('Your account has not been approved by an Administrator yet'));
    }

    // verify if the user's role grants this specific action permission
    if (!hasPermission(req.user.role, permission)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
};
