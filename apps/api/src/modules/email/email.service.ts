import { MailgunService } from '@/lib/mailgun';
import { Injectable } from '@nestjs/common';
import { EmailBuilder, EmailRecipient } from './builder';

@Injectable()
export class EmailService {
  constructor(readonly adapter: MailgunService) {}

  create() {
    return new EmailBuilder(this.adapter);
  }

  to(recipient: EmailRecipient | EmailRecipient[]) {
    return this.create().to(recipient);
  }
}
