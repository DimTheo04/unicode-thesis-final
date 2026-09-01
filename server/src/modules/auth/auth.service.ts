import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { authRepository, AuthRepository } from './auth.repository.js';
import { SignupInput, LoginInput } from './auth.schema.js';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../../errors/AppError.js';
import { env } from '../../config/env.js';

export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  async signup(input: SignupInput) {
    const existingUsername = await this.repo.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictError('The username is already taken.');
    }

    const existingEmail = await this.repo.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError('The email address is already in use.');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.repo.createUser({
      fullName: input.fullName,
      username: input.username,
      email: input.email,
      dateOfBirth: new Date(input.dateOfBirth),
      passwordHash,
      role: Role.STUDENT, // Default role until Admin approves & assigns role
      isApproved: false,  // Approval required by Admin
    });

    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      message: 'Registration request submitted successfully. Your account is pending administrator approval.',
    };
  }

  async login(input: LoginInput) {
    const user = await this.repo.findByIdentifier(input.identifier);

    if (!user) {
      throw new UnauthorizedError('Invalid username/email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid username/email or password');
    }

    if (!user.isApproved) {
      throw new ForbiddenError(
        'Your account has not been approved by an administrator yet. Please wait for approval.'
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
    };
  }

  async updateProfile(userId: string, input: any) {
    const user = await this.repo.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');

    const updateData: any = {};
    if (input.fullName) updateData.fullName = input.fullName;

    if (input.newPassword) {
      const isPasswordValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Current password is incorrect.');
      }
      updateData.passwordHash = await bcrypt.hash(input.newPassword, 10);
    }

    const updatedUser = await this.repo.updateUser(userId, updateData);

    return {
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      isApproved: updatedUser.isApproved,
    };
  }
}

export const authService = new AuthService();
