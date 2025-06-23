import { Product } from '@/modules/product/models/product.entity';
import { User } from '@/modules/user/models/user.entity';
import { CoreEntity } from '@/shared/core.entity';
import { ITicketEntity, TicketStatus } from '@musat/core';
import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Ticket extends CoreEntity implements ITicketEntity {
  @Column({ type: 'varchar', length: 1000 })
  description: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  technician: User;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn()
  product: Product;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @Column({ type: 'varchar', length: 500 })
  serialNumber: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  client: User;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date | null;

  /**
   * Incremental ticket number to keep track of the latest inserted ticket,
   * as `createdAt` might not be unique due to concurrent ticket creation.
   *
   * This is mainly used to find the latest ticket when assigning a technician.
   */
  @Index({ unique: true })
  @Column()
  @Generated('increment')
  ticketNumber: number;
}
