import { Request, Response, NextFunction } from 'express';
import { adminService, AdminService } from './admin.service.js';

export class AdminController {
  constructor(private service: AdminService = adminService) {}

  getPendingUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pendingUsers = await this.service.getPendingUsers();
      return res.status(200).json({ data: pendingUsers });
    } catch (error) {
      return next(error);
    }
  };

  getTeachers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const teachers = await this.service.getTeachers();
      return res.status(200).json({ data: teachers });
    } catch (error) {
      return next(error);
    }
  };

  approveUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const { role } = req.body;
      const result = await this.service.approveUser(userId, role);
      return res.status(200).json({ data: result });
    } catch (error) {
      return next(error);
    }
  };

  rejectUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const result = await this.service.rejectUser(userId);
      return res.status(200).json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const adminController = new AdminController();
