import { Logger, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Ticket } from "./models/ticket.entity";
import { TicketUpdateDto } from "./dtos/ticket-update.dto";
import { TicketDto } from "./dtos/ticket.dto";
import { TechnicianAssignmentService } from "./technicianAssignment.service";
import { TicketCreateDto } from "./dtos/ticket-create.dto";
import { User } from "../user/models/user.entity";
import { Product } from "../product/models/product.entity";

export class TicketService {
    private readonly logger = new Logger(TicketService.name);

    constructor(private readonly ds: DataSource,
        private readonly technicianAssignmentService: TechnicianAssignmentService
    ) {
        this.logger.log('TicketService initialized');

    }

    /**
     * Function to create a ticket, assign a technician to it automatically
     * @param ticketDto 
     * @returns 
     */
    async create(ticketDto: TicketCreateDto): Promise<Ticket> {
        this.logger.log('Creating ticket');

        return await this.ds.transaction(async (manager) => {
            const {
                client: clientDto,
                product: productDto,
                ...ticketData
            } = ticketDto;

            const client = await manager.findOneOrFail(User, {
                where: { cpf: clientDto.cpf },
            });
           

            // 🔹 Busca produto
            const product = await manager.findOneOrFail(Product, {
                where: { model: productDto.model },
            });

            const technician = await this.technicianAssignmentService.assignTechnician();
            if (!technician) {
                throw new Error('No technician available');
            }

            const ticket = manager.create(Ticket, {
                ...ticketData,
                client,
                product,
                technician,
            });

            await manager.save(ticket);

            this.logger.log(`Ticket ${ticket.id} created and assigned to ${technician.name}`);
            return ticket;
        });
    }

/*
    async update(ticketId: Ticket['id'], updates: TicketUpdateDto): Promise<TicketDto> {
        this.logger.log(`Updating ticket ${ticketId}`);

        const ticket = await Ticket.findOneOrFail({
            where: {
                id: ticketId
            }
        });

        Ticket.merge(ticket, { ...updates });

        return ticket.save();
    }
*/
}