import { IAddressEntity } from "./address.entity";
import { ICoreEntity } from "./core.entity";
import { IPaginatedQuery } from "./paginated.entity";

export enum UserRole {
  CLIENT = "client",
  TECHNICIAN = "technician",
  ADMIN = "admin",
}

export interface IUserEntity extends ICoreEntity {
  name: string;
  email: string;
  cpf: string;
  password?: string;
  role: UserRole;
  phone: string;
  verifiedAt: Date | null;
  verificationToken: string | null;
  address: IAddressEntity;
}

export interface IUserQuery extends IPaginatedQuery {
  /**
   * Search users by name.
   */
  name?: string;

  /**
   * Filter users by role.
   */
  role?: UserRole;
}

export type IUserPublicData = Pick<IUserEntity, "id" | "name" | "role">;
