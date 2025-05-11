import { MailgunClientOptions } from 'mailgun.js/definitions';

export interface MailgunModuleConfig {
  domain: string;
  from?: string;
  options: MailgunClientOptions;
}
