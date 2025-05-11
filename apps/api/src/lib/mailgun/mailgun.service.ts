import { Inject, Injectable } from '@nestjs/common';
import { Interfaces, MailgunMessageData } from 'mailgun.js/definitions';
import { InjectMailgun, MAILGUN_MODULE_CONFIG } from './mailgun.decorator';
import { MailgunModuleConfig } from './mailgun.interface';

@Injectable()
export class MailgunService {
  constructor(
    @Inject(MAILGUN_MODULE_CONFIG)
    private readonly _config: MailgunModuleConfig,
    @InjectMailgun() public readonly instance: Interfaces.IMailgunClient,
  ) {}

  send(data: MailgunMessageData) {
    return this.instance.messages.create(this._config.domain, {
      from: this._config.from,
      ...data,
    });
  }
}
