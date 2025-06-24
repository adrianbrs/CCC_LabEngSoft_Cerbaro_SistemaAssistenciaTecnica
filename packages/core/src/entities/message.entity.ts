import { ICoreEntity } from "./core.entity";
import { ITicketEntity } from "./ticket.entity";
import { IUserEntity } from "./user.entity";

export interface IMessageEntity extends ICoreEntity {
  ticket: ITicketEntity;
  from: IUserEntity;
  content: string;
  read: boolean;
}
