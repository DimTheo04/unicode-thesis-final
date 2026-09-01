import { prisma } from '../../lib/prisma.js';
import { Role, User } from '@prisma/client';

export class AdminRepository {
  async findPendingUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    return prisma.user.findMany({
      where: {
        isApproved: false,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        role: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findTeachers(): Promise<Omit<User, 'passwordHash'>[]> {
    return prisma.user.findMany({
      where: {
        role: Role.TEACHER,
        isApproved: true,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        role: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async approveUser(userId: string, role: Role): Promise<Omit<User, 'passwordHash'>> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        isApproved: true,
        role: role,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        dateOfBirth: true,
        role: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async rejectUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const adminRepository = new AdminRepository();
