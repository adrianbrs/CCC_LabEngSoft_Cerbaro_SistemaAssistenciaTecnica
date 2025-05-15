import { ICoreEntity } from "./core.entity";


export interface IBrandEntity extends ICoreEntity {
  name: string;
  email: string;
  phone: string;
}