import { TransientEntity } from '@/shared/transient.entity';
import { ICepInfoEntity } from '@musat/core';
import { Expose } from 'class-transformer';

/**
 * Entity that represents the information of a CEP (Postal Code) in Brazil.
 *
 * *Note: This entity is not persisted in the database, but is used to represent the information*
 */
export class CepInfo extends TransientEntity implements ICepInfoEntity {
  @Expose()
  cep: string;

  @Expose()
  city: string;

  @Expose()
  neighborhood: string;

  @Expose()
  state: string;

  @Expose()
  street: string;
}
