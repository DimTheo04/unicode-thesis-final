import { Request, Response, NextFunction } from 'express';
import { authService, AuthService } from './auth.service.js';
import { UnauthorizedError } from '../../errors/AppError.js';

export class AuthController {
  constructor(private service: AuthService = authService) {}

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.signup(req.body);
      return res.status(201).json({ data: result });
    } catch (error) {
      return next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.login(req.body);
      return res.status(200).json({ data: result });
    } catch (error) {
      return next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      const result = await this.service.getCurrentUser(req.user.userId);
      return res.status(200).json({ data: result });
    } catch (error) {
      return next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      const result = await this.service.updateProfile(req.user.userId, req.body);
      return res.status(200).json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const authController = new AuthController();
