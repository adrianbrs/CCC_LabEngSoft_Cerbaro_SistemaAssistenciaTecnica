import { User } from "@/modules/user/models/user.entity";
import { CoreEntity } from "@/shared/core.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";

@Entity()
export class TechnicianAssignment extends CoreEntity {
    @ManyToMany(() => User)
    @JoinTable()
    technicians: User[];

    @ManyToOne(() => User, { nullable: true })
    lastAssignedTechnician: User | null;
}
