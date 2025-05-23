import { ProductDto } from '@/modules/product/dtos/product.dto';
import { UserDto } from '@/modules/user/dtos/user.dto';
import { TicketStatus } from '@musat/core';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class TicketCreateDto {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => UserDto)
    client: UserDto;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => ProductDto)
    product: ProductDto;

    @IsNotEmpty()
    status: TicketStatus;

    @IsOptional()
    description: string;

    @IsNotEmpty()
    serialNumber: string;

    @IsNotEmpty()
    createdAt: Date;
}
