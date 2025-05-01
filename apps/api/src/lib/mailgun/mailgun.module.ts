import { DynamicModule, Module } from '@nestjs/common';
import Mailgun from 'mailgun.js';
import { MAILGUN_MODULE_CONFIG, MAILGUN_TOKEN } from './mailgun.decorator';
import { MailgunService } from './mailgun.service';
import { MailgunModuleConfig } from './mailgun.interface';

const mailgun = new Mailgun(FormData);

@Module({})
export class MailgunModule {
  static forRoot(config: MailgunModuleConfig): DynamicModule {
    return {
      module: MailgunModule,
      providers: [
        {
          provide: MAILGUN_MODULE_CONFIG,
          useValue: config,
        },
        {
          provide: MAILGUN_TOKEN,
          useFactory: ({ options }: MailgunModuleConfig) =>
            mailgun.client(options),
          inject: [MAILGUN_MODULE_CONFIG],
        },
        MailgunService,
      ],
      exports: [MAILGUN_TOKEN, MailgunService],
      global: true,
    };
  }
}
