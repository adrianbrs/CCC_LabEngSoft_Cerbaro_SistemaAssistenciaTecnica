import { MailgunMessageData, MailgunService } from '@/lib/mailgun';
import { Injectable, Logger } from '@nestjs/common';
import { User } from './models/user.entity';
import { AccountAlreadyVerifiedError } from './errors/account-already-verified.error';
import { MissingVerificationTokenError } from './errors/missing-verification-token.error';
import { UserRegisterDto } from './dtos/user-register.dto';
import { Address } from '../address/models/address.entity';
import { UserRole } from '@musat/core';
import { DataSource } from 'typeorm';
import {
  generateHexToken,
  replaceMustacheVariables,
  safeCompareStrings,
} from '@/shared/utils';
import { FRONTEND_URL } from '@/constants/env';
import { Config } from '@/constants/config';
import { InvalidCredentialsError } from './errors/invalid-credentials.error';
import { AccountNotVerifiedError } from './errors/account-not-verified.error';
import { UserUpdateDto } from './dtos/user-update.dto';
import { UserDeactivateDto } from './dtos/user-deactivate.dto';
import { Messages } from '@/constants/messages';
import { AccountVerificationError } from './errors/account-verification.error';
import { UserRoleUpdateDto } from './dtos/userRole-update.dto';
import { ResetPasswordDto } from './dtos/reset-password-dto';
import { ExpiredResetToken } from './errors/expired-reset-token.error';
import { ForgotPasswordDto } from './dtos/forgot-password-dto';

const VERIFICATION_TOKEN_LENGTH = 16;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly mailgun: MailgunService,
    private readonly ds: DataSource,
  ) { }

  async sendEmail(user: User, data: MailgunMessageData) {
    return this.mailgun.send({
      to: `${user.name} <${user.email}>`,
      ...data,
    });
  }

  async sendTemplateEmail(
    user: User,
    template: string,
    options: { subject?: string; data: object },
  ) {
    return this.sendEmail(user, {
      template,
      'h:X-Mailgun-Variables': JSON.stringify(options.data),
      ...(options.subject && {
        subject: replaceMustacheVariables(options.subject, options.data),
      }),
    });
  }

  async sendVerificationEmail(user: User) {
    if (user.verifiedAt) {
      throw new AccountAlreadyVerifiedError();
    }

    if (!user.verificationToken) {
      throw new MissingVerificationTokenError();
    }

    const url = new URL(Config.frontend.accountVerificationPath, FRONTEND_URL);
    url.searchParams.set('user', user.id);
    url.searchParams.set('token', user.verificationToken);

    return this.sendTemplateEmail(user, 'verify_email', {
      subject: Messages.user.email.accountVerificationSubject,
      data: {
        name: user.name,
        verification_url: url.toString(),
      },
    });
  }

  async verify(userId: string, token: string): Promise<User> {
    const user = await User.createQueryBuilder()
      .select('*')
      .where('id = :id', { id: userId })
      .getRawOne()
      .then((data: object) => User.create({ ...data }));

    if (user && user.verificationToken) {
      if (safeCompareStrings(user.verificationToken, token)) {
        if (!user.verifiedAt) {
          user.verifiedAt = new Date();
          await user.save();
        }

        return User.create({
          ...user,
          address: undefined,
          password: undefined,
          verificationToken: undefined,
        });
      }
    }

    throw new AccountVerificationError();
  }

  async register(userDto: UserRegisterDto): Promise<User> {
    this.logger.log('Registering new user');

    return this.ds.transaction(async (manager) => {
      const {
        address: addressData,
        password: rawPassword,
        ...userData
      } = userDto;

      // Hash user password
      const password = await User.hashPassword(rawPassword);

      const address = Address.create({ ...addressData });
      const user = User.create({
        ...userData,
        address,
        password,
        role: UserRole.CLIENT,
        verificationToken: generateHexToken(VERIFICATION_TOKEN_LENGTH),
      });

      await manager.save(user);
      await this.sendVerificationEmail(user);

      this.logger.log(`User ${user.id} registered`);

      return user;
    });
  }

  async login(email: string, password: string): Promise<User> {
    this.logger.log('User login attempt');

    const user = await User.findByEmailAndPassword(email, password, true);

    if (!user) {
      this.logger.warn('Invalid credentials');
      throw new InvalidCredentialsError();
    }

    if (!user.verifiedAt) {
      this.logger.log(`User ${user.id} is not verified`);
      throw new AccountNotVerifiedError();
    }

    if (user.deletedAt) {
      await this.ds.transaction(async (manager) => {
        this.logger.log(
          `Login attempt for deleted user ${user.id}, reactivating...`,
        );
        user.deletedAt = null;
        await manager.save(user);

        await this.sendTemplateEmail(user, 'account_reactivation_notice', {
          subject: Messages.user.email.accountReactivationSubject,
          data: {
            name: user.name,
          },
        });
      });
    }

    this.logger.log(`User ${user.id} logged in`);

    return user;
  }

  async update(user: User, updates: UserUpdateDto): Promise<User> {
    this.logger.log(`Updating user ${user.id}`);

    return this.ds.transaction(async (manager) => {
      const {
        address: addressData,
        password,
        currentPassword,
        ...userData
      } = updates;

      if (password) {
        if (
          !currentPassword ||
          !(await user.comparePassword(currentPassword))
        ) {
          this.logger.warn(
            `Invalid password confirmation during update of user ${user.id}`,
          );
          throw new InvalidCredentialsError();
        }
      }

      if (addressData) {
        Address.merge(user.address, { ...addressData });
      }

      User.merge(user, {
        ...userData,
        ...(password && {
          password: await User.hashPassword(password),
        }),
      });

      await manager.save(user);

      this.logger.log(`User ${user.id} updated`);

      return user;
    });
  }

  async updateRole(
    userId: User['id'],
    userRoleUpdateDto: UserRoleUpdateDto,
  ): Promise<User> {
    this.logger.log(`Updating role for user ${userId}`);

    const user = await User.findOneOrFail({
      where: {
        id: userId,
      },
    });

    user.role = userRoleUpdateDto.role;

    await user.save();

    this.logger.log(`Role for user ${userId} updated to ${user.role}`);

    this.sendTemplateEmail(user, 'role_changed', {
      subject: Messages.user.email.roleChangeSubject,
      data: {
        name: user.name,
      },
    });

    return user;
  }

  async deactivate(user: User, dto: UserDeactivateDto): Promise<void> {
    this.logger.log(`Deactivating user ${user.id}`);

    await this.ds.transaction(async (manager) => {
      if (!(await user.comparePassword(dto.currentPassword))) {
        this.logger.warn(
          `Invalid password confirmation during deactivation of user ${user.id}`,
        );
        throw new InvalidCredentialsError();
      }

      await manager.softRemove(user);
      await this.sendTemplateEmail(user, 'account_deactivation_notice', {
        subject: Messages.user.email.accountDeactivationSubject,
        data: {
          name: user.name,
        },
      });

      this.logger.log(`User ${user.id} deactivated`);
    });
  }

  async getOne(userId: User['id']): Promise<User> {
    return User.findOneOrFail({
      where: {
        id: userId,
      },
    });
  }

  async getTechnicians(): Promise<User[]> {
    return User.find({
      where: {
        role: UserRole.TECHNICIAN,
      },
    });
  }

  async getClients(): Promise<User[]> {
    return User.find({
      where: {
        role: UserRole.CLIENT,
      },
    });
  }
  async getAdmins(): Promise<User[]> {
    return User.find({
      where: {
        role: UserRole.ADMIN,
      },
    });
  }


  async forgotPwd(dto: ForgotPasswordDto) {
    const user = await User.findOneOrFail({
      where: {
        email: dto.email,
      },
    });

    const token = generateHexToken(32);
    this.logger.log("OLHA AQUI TCHE: " + token);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora;
    await user.save();

    const url = new URL(Config.frontend.passwordResetPath, FRONTEND_URL);
    url.searchParams.set('user', user.email);
    url.searchParams.set('token', user.resetPasswordToken);

    await this.sendTemplateEmail(user, 'forgot_password', {
      subject: Messages.user.email.passwordResetSubject,
      data: {
        name: user.name,
        reset_url: url.toString(),
      }
    });
    this.logger.log(`Sent reset password email to ${dto.email}`);
  }

  async resetPwd(dto: ResetPasswordDto): Promise<void> {
    const user = await User.findOneOrFail({
      where: {
        email: dto.email
      },
    });

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      this.logger.warn(`Invalid or expired reset password token for ${user.email}`);
      throw new ExpiredResetToken();
    }

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.password = await User.hashPassword(dto.newPassword);

    this.sendTemplateEmail(user, 'password changed',{
      subject: Messages.user.email.passwordChangedSubject,
      data:{
        name: user.name,
      }
    })

    await user.save();

  }
}
