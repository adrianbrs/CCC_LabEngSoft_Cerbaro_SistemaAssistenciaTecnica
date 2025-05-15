import { ICoreEntity } from "./core.entity";

export interface IAddressEntity extends ICoreEntity {
  street: string;
  city: string;
  number: string | null;
  neighborhood: string;
  complement: string | null;
  state: string;
  zipCode: string;
}
