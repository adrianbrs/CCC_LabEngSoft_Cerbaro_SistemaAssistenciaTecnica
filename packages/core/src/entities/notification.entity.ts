import { ICoreEntity } from "./core.entity";
import { IUserEntity } from "./user.entity";

export interface INotificationEntity extends ICoreEntity{
    user: IUserEntity;
    content: string;
    read: boolean;
}