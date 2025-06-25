import { ICoreEntity } from "./core.entity";
import { IPaginatedQuery } from "./paginated.entity";
import { ITicketEntity } from "./ticket.entity";
import { IUserEntity, IUserPublicResponse } from "./user.entity";

export interface IMessageEntity extends ICoreEntity {
  ticket: ITicketEntity;
  from: IUserEntity;
  content: string;
  read: boolean;
}

export interface IMessageResponse
  extends Omit<IMessageEntity, "ticket" | "from"> {
  ticketId: ITicketEntity["id"];
  from: IUserPublicResponse;
}

export interface IMessageQuery extends IPaginatedQuery {}
