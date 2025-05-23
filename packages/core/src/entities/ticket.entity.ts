import { ICoreEntity } from "./core.entity";
import { IUserEntity } from "./user.entity";
import { IProductEntity } from "./product.entity";

export enum TicketStatus{
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    IN_TESTING = 'in_testing',
    CLOSED = 'closed',
}

export interface ITicketEntity extends ICoreEntity{
    client: IUserEntity;
    technician: IUserEntity;
    product: IProductEntity;
    status: TicketStatus;
    description: string;
    serialNumber: string;
}