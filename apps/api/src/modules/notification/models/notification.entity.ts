import { CoreEntity } from '@/shared/core.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {INotificationEntity} from '@musat/core';
import { User } from '@/modules/user/models/user.entity';

export class Notification extends CoreEntity implements INotificationEntity{
    @Column()
    @ManyToOne(() => User, { eager: true })
    @JoinColumn()
    user: User;

    @Column({ type: 'varchar', length: 1000 })
    content: string;

    @Column({type: 'boolean', default: false})
    read: boolean;
}