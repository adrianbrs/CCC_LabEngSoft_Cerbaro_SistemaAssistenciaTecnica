import { ICoreEntity } from "./core.entity";

export interface IAddressEntity extends ICoreEntity {
  street: string;
  city: string;
  number: string;
  neighborhood: string;
  complement: string | null;
  state: string;
  country: string;
  zipCode: string;
}
