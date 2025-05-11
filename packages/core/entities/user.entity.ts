import { ICoreEntity } from "./core.entity";

export enum UserRole {
  CLIENT = "client",
  TECHNICIAN = "technician",
  ADMIN = "admin",
}

export interface IUserEntity extends ICoreEntity {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  verifiedAt: Date | null;
  verificationToken: string | null;
}
