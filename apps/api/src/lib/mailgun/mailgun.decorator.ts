import { Inject, InjectionToken } from '@nestjs/common';
import { Interfaces } from 'mailgun.js/definitions';
import { MailgunModuleConfig } from './mailgun.interface';

export const MAILGUN_TOKEN = Symbol(
  'Mailgun',
) as InjectionToken<Interfaces.IMailgunClient>;

export const MAILGUN_MODULE_CONFIG = Symbol(
  'MailgunModuleConfig',
) as InjectionToken<MailgunModuleConfig>;

export const InjectMailgun = () => Inject(MAILGUN_TOKEN);
