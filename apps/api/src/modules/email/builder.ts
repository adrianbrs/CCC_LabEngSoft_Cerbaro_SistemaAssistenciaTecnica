import {
  MailgunMessageData,
  MailgunService,
  MessagesSendResult,
} from '@/lib/mailgun';
import { AbstractEmailTemplate } from './templates';
import { replaceMustacheVariables } from '@/shared/utils';

export type EmailRecipient =
  | string
  | {
      name?: string;
      email: string;
    };

function normalizeRecipient(
  recipient: EmailRecipient | EmailRecipient[],
): string[] {
  if (Array.isArray(recipient)) {
    return recipient.map((t) => normalizeRecipient(t)[0]);
  }
  if (typeof recipient === 'string') {
    return [recipient];
  }
  const str = recipient.name
    ? `${recipient.name} <${recipient.email}>`
    : recipient.email;
  return [str];
}

export class EmailBuilder<
  T extends AbstractEmailTemplate = AbstractEmailTemplate,
> {
  private readonly message = {} as MailgunMessageData;

  constructor(private readonly service: MailgunService) {}

  to(to: EmailRecipient | EmailRecipient[]): this {
    this.message.to = normalizeRecipient(to).concat(this.message.to ?? []);
    return this;
  }

  subject(subject: string): this {
    this.message.subject = subject;
    return this;
  }

  template(template: T): this {
    this.message.template = template.name;
    this.message['h:X-Mailgun-Variables'] = JSON.stringify(template.variables);
    return this;
  }

  html(html: string): this {
    this.message.html = html;
    return this;
  }

  text(text: string): this {
    this.message.text = text;
    return this;
  }

  cc(cc: EmailRecipient | EmailRecipient[]): this {
    this.message.cc = normalizeRecipient(cc).concat(this.message.cc ?? []);
    return this;
  }

  bcc(bcc: EmailRecipient | EmailRecipient[]): this {
    this.message.bcc = normalizeRecipient(bcc).concat(this.message.bcc ?? []);
    return this;
  }

  build(): MailgunMessageData {
    const data = { ...this.message };

    if (data.subject && typeof data['h:X-Mailgun-Variables'] === 'object') {
      data.subject = replaceMustacheVariables(
        data.subject,
        data['h:X-Mailgun-Variables'],
      );
    }

    return data;
  }

  send(): Promise<MessagesSendResult> {
    return this.service.send(this.build());
  }
}
