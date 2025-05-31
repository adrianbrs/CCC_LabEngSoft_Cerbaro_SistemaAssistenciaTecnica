import { UserDto } from "@/modules/user/dtos/user.dto";
import { TicketDto } from "@/modules/ticket/dtos//ticket.dto";
import { IsInt, IsNotEmpty, Length, Max, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { User } from "@/modules/user/models/user.entity";
import { Ticket } from "@/modules/ticket/models/ticket.entity";

export class ReviewDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => UserDto)
    client: User;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => TicketDto)
    ticket: Ticket;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(5)
    stars: number;

    @Length(0, 255)
    description: string;

}