import { plainToInstance } from 'class-transformer';
import { Constructor } from 'type-fest';

export abstract class TransientEntity {
  static create<T extends Constructor<TransientEntity>>(
    this: T,
    data: Partial<InstanceType<T>>,
  ): InstanceType<T> {
    return plainToInstance(this, data, {
      excludeExtraneousValues: true,
      exposeDefaultValues: true,
    }) as InstanceType<T>;
  }
}
