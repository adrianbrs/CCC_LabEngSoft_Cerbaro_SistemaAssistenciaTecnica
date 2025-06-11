import { CoreEntity } from '@/shared/core.entity';
import { IUserEntity, UserRole } from '@musat/core';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { Address } from '../../address/models/address.entity';
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

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;


  async comparePassword(password: string | Buffer): Promise<boolean> {
    let hash = this.password;
    if (!hash) {
      hash = await User.findOneOrFail({
        where: { id: this.id },
        select: ['id', 'password'],
      }).then((user) => user.password);
    }
    return User.comparePassword(password, hash);
  }

  /**
   * Finds a user by email and only returns the user if the password is correct.
   */
  static async findByEmailAndPassword(
    email: string,
    password: string,
    includeDeleted = false,
  ): Promise<User | null> {
    let qb = this.createQueryBuilder('user');

    if (includeDeleted) {
      qb = qb.withDeleted();
    }

    const user = await qb
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
