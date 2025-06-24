import { Module } from '@nestjs/common';
import { UniqueValidator } from './validators/unique-validator.service';
import { APP_FILTER } from '@nestjs/core';
import { TypeormExceptionFilter } from './filters/typeorm-exception.filter';
import { ApiWebSocketAdapter } from '../../shared/websocket/websocket.adapter';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [
    UniqueValidator,
    {
      provide: APP_FILTER,
      useClass: TypeormExceptionFilter,
    },
    ApiWebSocketAdapter,
  ],
  exports: [UniqueValidator, ApiWebSocketAdapter],
})
export class SharedModule {}
