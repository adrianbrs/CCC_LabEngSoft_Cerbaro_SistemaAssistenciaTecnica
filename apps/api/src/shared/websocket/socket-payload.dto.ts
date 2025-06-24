import { ICoreEventPayload } from '@musat/core';
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { SetOptional } from 'type-fest';

export abstract class SocketPayloadDto implements ICoreEventPayload {
  @IsNotEmpty()
  @IsNumber()
  timestamp: number = Date.now();

  static create<T extends SocketPayloadDto>(
    this: new () => T,
    payload: SetOptional<T, 'timestamp'>,
  ): T {
    return plainToInstance(this, payload, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
      enableCircularCheck: true,
      exposeDefaultValues: true,
    });
  }
}
