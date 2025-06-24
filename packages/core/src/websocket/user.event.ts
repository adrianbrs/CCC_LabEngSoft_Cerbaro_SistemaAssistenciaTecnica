import { IUserEntity } from "../entities";

export type IUserPublicEvent = Pick<IUserEntity, "id" | "name" | "role">;
