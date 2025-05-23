import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { User } from "../user/models/user.entity";
import { TechnicianAssignment } from "./models/technicianAssignment.entity";
import { UserRole } from "@musat/core";

@Injectable()
export class TechnicianAssignmentService {
    private readonly logger = new Logger(TechnicianAssignmentService.name);

    constructor(private readonly ds: DataSource) {
        this.logger.log('TechnicianAssignmentService initialized');
    }

    async createAssignment(): Promise<TechnicianAssignment> {
        return this.ds.transaction(async (manager) => {
            const technicians = await manager.find(User, {
                where: { role: UserRole.TECHNICIAN },
            });

            if (technicians.length === 0) {
                throw new NotFoundException('No technicians available');
            }

            const assignment = manager.create(TechnicianAssignment, {
                technicians: technicians, 
                lastAssignedTechnician: null, 
            });


            await manager.save(assignment);

            return assignment;
        });
    }


    async assignTechnician(): Promise<User> {
        return this.ds.transaction(async (manager) => {
            const assignment = await manager.findOne(TechnicianAssignment, {
                relations: ['technicians', 'lastAssignedTechnician'],
            });

            if (!assignment) {
                throw new NotFoundException('Technician assignment not initialized');
            }

            const { technicians, lastAssignedTechnician } = assignment;

            if (!technicians || technicians.length === 0) {
                throw new NotFoundException('No technicians available');
            }

            let nextIndex = 0;

            if (lastAssignedTechnician) {
                const lastIndex = technicians.findIndex(
                    (t) => t.id === lastAssignedTechnician.id,
                );
                nextIndex = (lastIndex + 1) % technicians.length;
            }

            const nextTechnician = technicians[nextIndex];

            // Atualiza o lastAssigned
            assignment.lastAssignedTechnician = nextTechnician;
            await manager.save(assignment);

            this.logger.log(`Technician ${nextTechnician.id} assigned`);

            return nextTechnician;
        });
    }
}