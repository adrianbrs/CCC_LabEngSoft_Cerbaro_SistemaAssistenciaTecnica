import { CoreEntity } from '@/shared/core.entity';
import { safeCompareStrings } from '@/shared/utils';
import { IUserEntity, UserRole } from '@musat/core';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { Address } from './address.entity';
import { Exclude } from 'class-transformer';
import { hash, compare } from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@/constants/env';

@Entity()
export class User extends CoreEntity implements IUserEntity {
  @Column({ type: 'varchar', length: 11, unique: true })
  cpf: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 60, select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  verificationToken: string | null;

  @Column({ type: 'varchar', length: 14, nullable: false })
  phone: string;

  @OneToOne(() => Address, { cascade: true, eager: true })
  @JoinColumn()
  address: Address;

  /**
   * Verifies the user's email address using the provided token.
   */
  static async verify(userId: string, token: string): Promise<User | null> {
    const user = await this.createQueryBuilder()
      .select('*')
      .where('id = :id', { id: userId })
      .getRawOne()
      .then((data: object) => User.create({ ...data }));

    if (user && user.verificationToken) {
      if (!safeCompareStrings(user.verificationToken, token)) {
        return null;
      }

      user.verifiedAt = new Date();
      user.verificationToken = null;
      await user.save();
      return User.create({
        ...user,
        password: undefined,
        verificationToken: undefined,
      });
    }
    return null;
  }

  /**
   * Finds a user by email and only returns the user if the password is correct.
   */
  static async findByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.createQueryBuilder('user')
      .select('*')
      .where('user.email = :email', { email })
      .getRawOne()
      .then((data: object | null) => (data ? User.create({ ...data }) : null));

    if (!user) {
      return null;
    }

    if (!(await this.comparePassword(password, user.password))) {
      return null;
    }

    return User.create({
      ...user,
      password: undefined,
      verificationToken: undefined,
    });
  }

  /**
   * Hash the password using bcrypt.
   */
  static async hashPassword(password: string | Buffer): Promise<string> {
    return hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Compare the provided password with the hashed password.
   */
  static async comparePassword(
    password: string | Buffer,
    hash: string,
  ): Promise<boolean> {
    return compare(password, hash);
  }
}
