import { Module } from '@nestjs/common';
import { UniqueValidator } from './validators/unique-validator.service';
import { APP_FILTER } from '@nestjs/core';
import { TypeormExceptionFilter } from './filters/typeorm-exception.filter';

@Module({
  providers: [
    UniqueValidator,
    {
      provide: APP_FILTER,
      useClass: TypeormExceptionFilter,
    },
  ],
  exports: [UniqueValidator],
})
export class SharedModule {}
