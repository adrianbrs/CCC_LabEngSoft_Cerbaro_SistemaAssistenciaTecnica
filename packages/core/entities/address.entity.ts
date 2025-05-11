import { ICoreEntity } from "./core.entity";

export interface IAddressEntity extends ICoreEntity {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}
