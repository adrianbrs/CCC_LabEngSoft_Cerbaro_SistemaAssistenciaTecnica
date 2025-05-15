import { Module } from '@nestjs/common';
import { UniqueValidator } from './validators/unique-validator.service';

@Module({
  providers: [UniqueValidator],
  exports: [UniqueValidator],
})
export class SharedModule {}
