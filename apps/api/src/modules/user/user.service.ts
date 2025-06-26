import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './models/user.entity';
import { AccountAlreadyVerifiedError } from './errors/account-already-verified.error';
import { MissingVerificationTokenError } from './errors/missing-verification-token.error';
import { UserRegisterDto } from './dtos/user-register.dto';
import { Address } from '../address/models/address.entity';
import { isAuthorized, UserRole } from '@musat/core';
import { DataSource, ILike } from 'typeorm';
import { generateHexToken, safeCompareStrings } from '@/shared/utils';
import { FRONTEND_URL } from '@/constants/env';
import { Config } from '@/constants/config';
import { InvalidCredentialsError } from './errors/invalid-credentials.error';
import { AccountNotVerifiedError } from './errors/account-not-verified.error';
import { UserUpdateDto } from './dtos/user-update.dto';
import { UserDeactivateDto } from './dtos/user-deactivate.dto';
import { Messages } from '@/constants/messages';
import { AccountVerificationError } from './errors/account-verification.error';
import { UserInternalUpdateDto } from './dtos/user-internal-update.dto';
import { UserQueryDto } from './dtos/user-query.dto';
import { Paginated } from '@/shared/pagination';
import { CannotUpdateOwnRoleError } from './errors/cannot-update-own-role.error';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ExpiredPasswordResetToken } from './errors/expired-password-reset-token.error';
import { RequestPasswordResetDto } from './dtos/request-password-reset.dto';
import * as ms from 'ms';
import { EmailService } from '../email/email.service';
import { PasswordRecoveryEmail } from './email/password-recovery-email';
import { PasswordChangedEmail } from './email/password-changed-email';
import { AccountVerificationEmail } from './email/account-verification-email';
import { AccountReactivationEmail } from './email/account-reactivation-email';
import { AccountDeactivationEmail } from './email/account-deactivation-email';
import { AccountRoleChangedEmail } from './email/account-role-changed-email';

const VERIFICATION_TOKEN_LENGTH = 16;
const RESET_PASSWORD_TOKEN_LENGTH = 32;
const ROLE_NAME_MAP = new Map<UserRole, string>([
  [UserRole.CLIENT, 'Cliente'],
  [UserRole.TECHNICIAN, 'Técnico'],
  [UserRole.ADMIN, 'Administrator'],
]);

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly ds: DataSource,
    private readonly email: EmailService,
  ) {}

  getRoleName(role: UserRole): string {
    return ROLE_NAME_MAP.get(role) || 'Desconhecido';
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

    await this.email
      .to(user)
      .template(
        AccountVerificationEmail.create({
          name: user.name,
          verificationUrl: url.toString(),
        }),
      )
      .subject(Messages.user.email.accountVerificationSubject)
      .send();
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

        await this.email
          .to(user)
          .template(
            AccountReactivationEmail.create({
              name: user.name,
            }),
          )
          .subject(Messages.user.email.accountReactivationSubject)
          .send();
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

      if (password) {
        await this.email
          .to(user)
          .template(
            PasswordChangedEmail.create({
              name: user.name,
            }),
          )
          .send();
      }

      this.logger.log(`User ${user.id} updated`);

      return user;
    });
  }

  async updateByAdmin(
    admin: User,
    userId: User['id'],
    updates: UserInternalUpdateDto,
  ): Promise<User> {
    this.logger.log(`Internally updating user ${userId}`);

    // Ensure the admin has the right role
    if (!isAuthorized(admin, UserRole.ADMIN)) {
      throw new UnauthorizedException();
    }

    // Prevent admins from updating their own role
    // This is both a security measure and a UX consideration
    if (admin.id === userId) {
      this.logger.warn(`Admin ${admin.id} cannot update its own role`);
      throw new CannotUpdateOwnRoleError();
    }

    const user = await User.findOneOrFail({
      where: {
        id: userId,
      },
    });

    await this.ds.transaction(async (manager) => {
      User.merge(user, {
        ...updates,
      });

      await manager.save(user);
      await this.email
        .to(user)
        .template(
          AccountRoleChangedEmail.create({
            name: user.name,
            role: this.getRoleName(user.role),
          }),
        )
        .send();
    });

    this.logger.log(`Role for user ${userId} updated to ${user.role}`);

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
      await this.email
        .to(user)
        .template(
          AccountDeactivationEmail.create({
            name: user.name,
          }),
        )
        .subject(Messages.user.email.accountDeactivationSubject)
        .send();

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

  async getAll(query?: UserQueryDto): Promise<Paginated<User>> {
    this.logger.log('Fetching users with filters', query);

    const result = await User.findPaginated(
      {
        where: {
          ...(query?.name && {
            name: ILike(`%${query.name}%`),
          }),
          ...(query?.role && {
            role: query.role,
          }),
        },
        order: {
          createdAt: 'DESC',
        },
      },
      query,
    );

    this.logger.log(`Found ${result.totalItems} users`, query);

    return result;
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
    const user = await User.findOne({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      // Do not disclose if the email exists or not
      return;
    }

    user.resetPasswordToken = generateHexToken(RESET_PASSWORD_TOKEN_LENGTH);
    user.resetPasswordExpires = new Date(Date.now() + ms('2h'));

    await this.ds.transaction(async (manager) => {
      await manager.save(user);

      const url = new URL(Config.frontend.passwordResetPath, FRONTEND_URL);
      url.searchParams.set('user', user.id);
      url.searchParams.set('token', user.resetPasswordToken!);

      await this.email
        .to(user)
        .template(
          PasswordRecoveryEmail.create({
            name: user.name,
            resetUrl: url.toString(),
          }),
        )
        .send();

      this.logger.log(`Sent reset password email to user ${user.id}`);
    });
  }

  async resetPassword(
    userId: User['id'],
    dto: ResetPasswordDto,
  ): Promise<void> {
    const user = await User.findOneOrFail({
      where: {
        id: userId,
      },
    });

    if (
      !user.resetPasswordToken ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      this.logger.warn(
        `Invalid or expired reset password token for user ${user.id}`,
      );
      throw new ExpiredPasswordResetToken();
    }

    if (!safeCompareStrings(user.resetPasswordToken, dto.token)) {
      this.logger.warn(`Invalid reset password token for user ${user.id}`, {
        token: dto.token,
      });
      throw new ForbiddenException();
    }

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.password = await User.hashPassword(dto.password);

    await this.ds.transaction(async (manager) => {
      await manager.save(user);

      await this.email
        .to(user)
        .template(
          PasswordChangedEmail.create({
            name: user.name,
          }),
        )
        .send();
    });
  }
}
