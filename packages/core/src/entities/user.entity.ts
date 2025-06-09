import { IAddressEntity } from "./address.entity";
import { ICoreEntity } from "./core.entity";

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
