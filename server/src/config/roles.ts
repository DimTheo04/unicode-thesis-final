import { Role } from '@prisma/client';

export enum Permission {
  MANAGE_USERS = 'manage_users',
  MANAGE_COURSES = 'manage_courses',
  MANAGE_ASSIGNMENTS = 'manage_assignments',
  SUBMIT_ASSIGNMENTS = 'submit_assignments',
  GRADE_SUBMISSIONS = 'grade_submissions',
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.MANAGE_COURSES,
  ],
  [Role.TEACHER]: [
    Permission.MANAGE_ASSIGNMENTS,
    Permission.GRADE_SUBMISSIONS,
  ],
  [Role.STUDENT]: [
    Permission.SUBMIT_ASSIGNMENTS,
  ],
};

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return RolePermissions[role]?.includes(permission) ?? false;
};
