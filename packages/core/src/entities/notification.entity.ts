import {IUserEntity} from './user.entity'
import {ITicketEntity} from './ticket.entity'
import { ICoreEntity } from "./core.entity";

export interface INotificationEntity extends ICoreEntity{
    user: IUserEntity;
    content: string;
    read: boolean;
}