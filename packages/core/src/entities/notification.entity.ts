import { ICoreEntity } from "./core.entity";
import { IPaginatedQuery } from "./paginated.entity";
import { IUserEntity } from "./user.entity";

export interface INotificationMetadata {
  href?: string;
  target?: string;
}

export interface INotificationEntity extends ICoreEntity {
  user: IUserEntity;
  title: string;
  content: string;
  read: boolean;
  metadata?: INotificationMetadata;
}

export type INotificationResponse = Omit<INotificationEntity, "user">;

export interface INotificationQuery extends IPaginatedQuery {}
