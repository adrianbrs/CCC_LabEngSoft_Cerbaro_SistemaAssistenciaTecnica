import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './models/session.entity';
import { AuthInterceptor } from './auth.interceptor';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), UserModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
  ],
})
export class AuthModule {}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    loginDate?: Date;
  }
}
