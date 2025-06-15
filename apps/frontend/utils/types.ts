import type { UserRole } from "@musat/core";

export type WithRole<T> = T & {
  role?: UserRole | UserRole[];
};

export default {};
