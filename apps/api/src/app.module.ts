import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IS_DEV } from './constants/env';
import { MailgunModule } from './lib/mailgun';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { CsrfModule } from './modules/csrf/csrf.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AddressModule } from './modules/address/address.module';
import { SharedModule } from './modules/shared/shared.module';
import { ReviewModule } from './modules/review/review.module';
import { ChatModule } from './modules/chat/chat.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: IS_DEV,
      logging: IS_DEV,
      autoLoadEntities: true,
    }),
    MailgunModule.forRoot({
      domain: process.env.MAILGUN_DOMAIN,
      from: process.env.MAILGUN_FROM,
      options: {
        username: 'api',
        key: process.env.MAILGUN_KEY,
      },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    UserModule,
    ProductModule,
    TicketModule,
    MailgunModule,
    AuthModule,
    CsrfModule,
    AddressModule,
    ReviewModule,
    NotificationModule,
    SharedModule,
    ChatModule,
  ],
  providers: [
    // Global serializer interceptor
    // https://docs.nestjs.com/techniques/serialization
    // https://docs.nestjs.com/interceptors#binding-interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
