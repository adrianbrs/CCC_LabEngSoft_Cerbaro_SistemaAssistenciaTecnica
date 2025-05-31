import { ICoreEntity } from "./core.entity";
import { IUserEntity } from "./user.entity";
import { ITicketEntity } from "./ticket.entity";

export interface IReviewEntity extends ICoreEntity{
    client: IUserEntity;
    ticket: ITicketEntity;
    stars: number;
    description: string;
}