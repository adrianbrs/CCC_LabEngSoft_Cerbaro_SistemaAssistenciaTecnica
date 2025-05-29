import { ICoreEntity } from "./core.entity";
import { IUserEntity } from "./user.entity";
import { IProductEntity } from "./product.entity";

export enum TicketStatus {
  OPEN = "open",
  ACCEPTED = "accepted",
  IN_PROGRESS = "in_progress",
  AWAITING_CLIENT = "awaiting_client",
  CANCELLED = "cancelled",
  RESOLVED = "resolved",
}

export interface ITicketEntity extends ICoreEntity {
  client: IUserEntity;
  technician: IUserEntity;
  product: IProductEntity;
  status: TicketStatus;
  description: string;
  serialNumber: string;
  closedAt?: Date;
}
