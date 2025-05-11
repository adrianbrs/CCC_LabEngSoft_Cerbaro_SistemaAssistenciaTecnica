import { MailgunMessageData, MailgunService } from '@/lib/mailgun';
import { Injectable, Logger } from '@nestjs/common';
import { User } from './models/user.entity';
import { AccountAlreadyVerifiedError } from './errors/account-already-verified.error';
import { MissingVerificationTokenError } from './errors/missing-verification-token.error';
import { UserDto } from './dtos/user.dto';
import { Address } from './models/address.entity';
import { UserRole } from '@musat/core';
import { randomBytes } from 'node:crypto';
import { DataSource } from 'typeorm';

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

  async register(userDto: UserDto): Promise<User> {
    return this.ds.transaction(async (manager) => {
      const user = new User();
      const address = new Address();

      user.cpf = userDto.cpf;
      user.name = userDto.name;
      user.email = userDto.email;
      user.password = userDto.password;
      user.phone = userDto.phone;
      user.address = address;
      user.role = UserRole.CLIENT;

      user.verificationToken = Buffer.from(randomBytes(64)).toString('hex');

      address.street = userDto.address.street;
      address.number = userDto.address.number;
      address.neighborhood = userDto.address.neighborhood;
      address.complement = userDto.address.complement;
      address.city = userDto.address.city;
      address.state = userDto.address.state;
      address.zipCode = userDto.address.zipCode;

      await manager.save(user);
      await this.sendVerificationEmail(user);

      return user;
    });
  }
}
