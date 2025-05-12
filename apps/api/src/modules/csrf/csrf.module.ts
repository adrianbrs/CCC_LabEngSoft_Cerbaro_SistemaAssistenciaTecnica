import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CsrfController } from './csrf.controller';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CsrfGuard } from './csrf.guard';
import { CsrfMiddleware } from './csrf.middleware';
import { CsrfInterceptor } from './csrf.interceptor';

@Module({
  controllers: [CsrfController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CsrfInterceptor,
    },
  ],
})
export class CsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}

declare module 'express-session' {
  interface SessionData {
    csrfToken?: string;
  }
}
