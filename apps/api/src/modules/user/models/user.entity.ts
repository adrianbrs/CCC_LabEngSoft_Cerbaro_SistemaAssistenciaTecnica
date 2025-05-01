import { CoreEntity } from '@/shared/core.entity';
import { safeCompareStrings } from '@/shared/utils';
import { IUserEntity, UserRole } from '@musat/core';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends CoreEntity implements IUserEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 60 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENT,
  })
  role: UserRole;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationToken: string | null;

  /**
   * Verifies the user's email address using the provided token.
   */
  static async verify(userId: string, token: string): Promise<User | null> {
    const user = await this.findOne({ where: { id: userId } });
    if (user && user.verificationToken) {
      if (!safeCompareStrings(user.verificationToken, token)) {
        return null;
      }

      user.verifiedAt = new Date();
      user.verificationToken = null;
      await user.save();
      return user;
    }
    return null;
  }
}
