import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { authRepository, AuthRepository } from './auth.repository.js';
import { SignupInput, LoginInput } from './auth.schema.js';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../../errors/AppError.js';
import { env } from '../../config/env.js';

// service handling user signup, login, validation and profile updates
export class AuthService {
  constructor(private repo: AuthRepository = authRepository) {}

  async signup(input: SignupInput) {
    // verify username is not already taken
    const existingUsername = await this.repo.findByUsername(input.username);
    if (existingUsername) {
      throw new ConflictError('The username is already taken.');
    }

    // check if email address is allready registered
    const existingEmail = await this.repo.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictError('The email address is already in use.');
    }

    // salt and hash password with bcrypt (10 rounds is sufficent for security/perf balance)
    const passwordHash = await bcrypt.hash(input.password, 10);

    // new users default to student and require admin approval before logging in
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
    // identifier can be either username or email address
    const user = await this.repo.findByIdentifier(input.identifier);

    if (!user) {
      throw new UnauthorizedError('Invalid username/email or password');
    }

    // verify hashed password
    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid username/email or password');
    }

    // block login if admin has not approved this account yet
    if (!user.isApproved) {
      throw new ForbiddenError(
        'Your account has not been approved by an administrator yet. Please wait for approval.'
      );
    }

    // sign jwt payload - 7 days validity is convienient for testing
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
    // retrieve latest profile data for session refresh
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

    // if changing password, verify old password first for safety
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
