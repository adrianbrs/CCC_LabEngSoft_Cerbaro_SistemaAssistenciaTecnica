import { Ticket } from '@/modules/ticket/models/ticket.entity';
import { User } from '@/modules/user/models/user.entity';
import { CoreEntity } from '@/shared/core.entity';
import { IMessageEntity } from '@musat/core';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Message extends CoreEntity implements IMessageEntity {
  @ManyToOne(() => Ticket, { onDelete: 'CASCADE' })
  @JoinColumn()
  ticket: Ticket;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  from: User;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  read: boolean;
}
