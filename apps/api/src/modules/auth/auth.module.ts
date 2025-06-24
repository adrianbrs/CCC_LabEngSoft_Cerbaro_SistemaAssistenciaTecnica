import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './models/session.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SessionMiddleware } from './session.middleware';
import { ChatModule } from '../chat/chat.module';
import { AuthGateway } from './auth.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Session]), UserModule, ChatModule],
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    SessionMiddleware,
    AuthGateway,
  ],
  exports: [AuthService, SessionMiddleware],
})
export class AuthModule {}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    loginDate?: Date;
  }
}
