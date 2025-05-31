import { CoreEntity } from "@/shared/core.entity";
import { User } from "@/modules/user/models/user.entity";
import { Ticket } from "@/modules/ticket/models/ticket.entity";
import { IReviewEntity } from "@musat/core";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";

@Entity()
export class Review extends CoreEntity implements IReviewEntity{
    @ManyToOne( ()=> User, {eager: true})
    @JoinColumn()
    client: User;

    @OneToOne( ()=>Ticket, {eager: true} )
    @JoinColumn()
    ticket: Ticket;

    @Column({type: 'int'})
    stars: number;

    @Column({ type: 'varchar', length: 255 })
    description: string;
}