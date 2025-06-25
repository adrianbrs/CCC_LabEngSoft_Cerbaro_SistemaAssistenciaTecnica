import { CoreEntity } from '@/shared/core.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { INotificationEntity, INotificationMetadata } from '@musat/core';
import { User } from '@/modules/user/models/user.entity';

@Entity()
export class Notification extends CoreEntity implements INotificationEntity {
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 1000 })
  content: string;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: INotificationMetadata | undefined;
}
