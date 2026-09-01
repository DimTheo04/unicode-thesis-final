import { Role } from '@prisma/client';
import { adminRepository, AdminRepository } from './admin.repository.js';
import { NotFoundError } from '../../errors/AppError.js';

export class AdminService {
  constructor(private repo: AdminRepository = adminRepository) {}

  async getPendingUsers() {
    return this.repo.findPendingUsers();
  }

  async getTeachers() {
    return this.repo.findTeachers();
  }

  async approveUser(userId: string, role: Role) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.repo.approveUser(userId, role);
    return {
      message: `User ${updatedUser.fullName} (${updatedUser.username}) was successfully approved as ${updatedUser.role}.`,
      user: updatedUser,
    };
  }

  async rejectUser(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.repo.rejectUser(userId);
    return {
      message: `The registration request for user ${user.fullName} (${user.username}) was rejected and removed.`,
    };
  }
}

export const adminService = new AdminService();
