import { MailgunMessageData, MailgunService } from '@/lib/mailgun';
import { Injectable } from '@nestjs/common';
import { User } from './models/user.entity';
import { AccountAlreadyVerifiedError } from './errors/account-already-verified.error';
import { MissingVerificationTokenError } from './errors/missing-verification-token.error';

@Injectable()
export class UserService {
  constructor(private readonly mailgun: MailgunService) {}

  async sendEmail(user: User, data: MailgunMessageData) {
    return this.mailgun.send({
      to: `${user.name} <${user.email}>`,
      ...data,
    });
  }

  async sendVerificationEmail(user: User) {
    if (user.verifiedAt) {
      throw new AccountAlreadyVerifiedError();
    }

    if (!user.verificationToken) {
      throw new MissingVerificationTokenError();
    }

    // FIXME: Get this URL from the frontend package
    const url = new URL('/users/verify', 'http://localhost:3001');
    url.searchParams.set('user', user.id);
    url.searchParams.set('token', user.verificationToken);

    return this.sendEmail(user, {
      template: 'verify_email',
      'h:X-Mailgun-Variables': JSON.stringify({
        name: user.name,
        verification_url: url.toString(),
      }),
    });
  }
}
