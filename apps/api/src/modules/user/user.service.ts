import { MailgunMessageData, MailgunService } from '@/lib/mailgun';
import { Injectable, Logger } from '@nestjs/common';
import { User } from './models/user.entity';
import { AccountAlreadyVerifiedError } from './errors/account-already-verified.error';
import { MissingVerificationTokenError } from './errors/missing-verification-token.error';
import { UserRegisterDto } from './dtos/user-register.dto';
import { Address } from './models/address.entity';
import { UserRole } from '@musat/core';
import { DataSource } from 'typeorm';
import { generateHexToken } from '@/shared/utils';

const VERIFICATION_TOKEN_LENGTH = 16;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly mailgun: MailgunService,
    private readonly ds: DataSource,
  ) {}

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

  async register(userDto: UserRegisterDto): Promise<User> {
    this.logger.log('Registering new user');

    return this.ds.transaction(async (manager) => {
      const address = Address.create({
        ...userDto.address,
      });
      const user = User.create({
        ...userDto,
        address,
        role: UserRole.CLIENT,
        verificationToken: generateHexToken(VERIFICATION_TOKEN_LENGTH),
      });

      await manager.save(user);
      await this.sendVerificationEmail(user);

      this.logger.log(`User ${user.id} registered`);

      return user;
    });
  }
}
