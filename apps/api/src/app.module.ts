import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { TicketModule } from './modules/ticket/ticket.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IS_DEV } from './constants/env';
import { MailgunModule } from './lib/mailgun';

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
      domain: process.env.MAILGUN_DOMAIN!,
      from: process.env.MAILGUN_FROM!,
      options: {
        username: 'api',
        key: process.env.MAILGUN_KEY!,
      },
    }),
    UserModule,
    ProductModule,
    TicketModule,
    MailgunModule,
  ],
})
export class AppModule {}
