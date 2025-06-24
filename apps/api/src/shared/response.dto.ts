import { plainToInstance } from 'class-transformer';

export class ResponseDto {
  static create<T extends ResponseDto>(
    this: new () => T,
    payload: Partial<T>,
  ): T {
    return plainToInstance(this, payload, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
      enableCircularCheck: true,
      exposeDefaultValues: true,
    });
  }
}
