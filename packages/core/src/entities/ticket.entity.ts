import { ICoreEntity } from "./core.entity";
import { IUserEntity } from "./user.entity";
import { IProductEntity } from "./product.entity";
import { IPaginatedQuery } from "./paginated.entity";
import { IDateRangeFilter } from "@/types";

export enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  AWAITING_CLIENT = "awaiting_client",
  CANCELLED = "cancelled",
  RESOLVED = "resolved",
}

export const CLOSED_TICKET_STATUSES = new Set([
  TicketStatus.RESOLVED,
  TicketStatus.CANCELLED,
]);

export const isTicketClosed = (
  ticket: Pick<ITicketEntity, "status">
): boolean => {
  return CLOSED_TICKET_STATUSES.has(ticket.status);
};

export interface ITicketEntity extends ICoreEntity {
  client: IUserEntity;
  technician: IUserEntity;
  product: IProductEntity;
  status: TicketStatus;
  description: string;
  serialNumber: string;
  ticketNumber: number;
  closedAt?: Date | null;
}

export interface ITicketQuery extends IPaginatedQuery {
  categoryId?: string;
  brandId?: string;
  productId?: IProductEntity["id"];
  serialNumber?: string;
  status?: TicketStatus;
  clientId?: IUserEntity["id"];
  technicianId?: IUserEntity["id"];
  closedAt?: IDateRangeFilter;
  createdAt?: IDateRangeFilter;
  updatedAt?: IDateRangeFilter;
}

export interface ITicketUserQuery
  extends Omit<ITicketQuery, "technicianId" | "clientId"> {}
