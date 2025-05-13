import { IUserEntity, UserRole } from "./entities";

export type UserRoleInheritance = Record<UserRole, UserRole | null>;

/**
 * Maps a user role to the role from which it inherits permissions.
 *
 * For example, a user with the `admin` role has all permissions of the `technician` role:\
 * `admin` -> `technician`.
 *
 * The last role in the chain maps to `null`, indicating that it doesn't inherit permissions from any other role.
 */
export const UserRoleInheritance: UserRoleInheritance = {
  [UserRole.ADMIN]: UserRole.TECHNICIAN,
  [UserRole.TECHNICIAN]: UserRole.CLIENT,
  [UserRole.CLIENT]: null,
};

/**
 * Checks if a user has the required roles to access a resource.
 */
export const isAuthorized = (
  user: IUserEntity,
  roles: UserRole | UserRole[]
): boolean => {
  if (Array.isArray(roles) && !roles.length) {
    // No roles specified, allow access
    return true;
  }

  const roleSet = new Set(Array.isArray(roles) ? roles : [roles]);
  let role: UserRole | null = user.role;

  while (role) {
    if (roleSet.has(role)) {
      return true;
    }
    // Check if the role inherits from another role
    role = UserRoleInheritance[role];
  }

  return false;
};
