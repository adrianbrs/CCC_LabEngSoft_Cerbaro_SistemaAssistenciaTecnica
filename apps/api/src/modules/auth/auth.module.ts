import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './models/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), UserModule],
  controllers: [AuthController],
})
export class AuthModule {}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    loginDate?: Date;
  }
}
