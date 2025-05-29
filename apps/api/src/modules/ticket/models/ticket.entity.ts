import { Product } from '@/modules/product/models/product.entity';
import { User } from '@/modules/user/models/user.entity';
import { CoreEntity } from '@/shared/core.entity';
import { ITicketEntity, TicketStatus } from '@musat/core';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Ticket extends CoreEntity implements ITicketEntity {
  @Column({ type: 'varchar', length: 1000 })
  description: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  technician: User;

  @OneToOne(() => Product, { eager: true })
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

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  client: User;

  @Column({ type: 'timestamp', nullable: true })
  closedAt?: Date | undefined;
}
