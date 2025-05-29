import { ProductDto } from "@/modules/product/dtos/product.dto";
import { UserDto } from "@/modules/user/dtos/user.dto";
import { IsTechnician } from "@/shared/dto-validators";
import { TicketStatus } from "@musat/core";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, ValidateNested } from "class-validator";

export class TicketDto{
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => UserDto)
    client: UserDto;

    @IsNotEmpty()
    @ValidateNested()
    @IsTechnician()
    @Type(() => UserDto)
    technician: UserDto;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() =>ProductDto)
    product: ProductDto;

    @IsNotEmpty()
    status: TicketStatus;

    @IsOptional()
    description: string;

    @IsNotEmpty()
    serialNumber: string;

    @IsOptional()
    createdAt: Date;
}