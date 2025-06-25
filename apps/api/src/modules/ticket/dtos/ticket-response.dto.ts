import { ProductPublicResponseDto } from '@/modules/product/dtos/product-public-response.dto';
import { UserPublicResponseDto } from '@/modules/user/dtos/user-public-response.dto';
import { EntityResponseDto } from '@/shared/entity-response.dto';
import { ITicketResponse, TicketStatus } from '@musat/core';
import { Expose, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class TicketResponseDto
  extends EntityResponseDto
  implements ITicketResponse
{
  @Expose()
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @Expose()
  @IsNotEmpty()
  description: string;

  @Expose()
  @IsNotEmpty()
  serialNumber: string;

  @Expose()
  @IsNotEmpty()
  ticketNumber: number;

  @Expose()
  @IsOptional()
  closedAt?: Date | null | undefined;

  @Expose()
  @ValidateNested()
  @Type(() => UserPublicResponseDto)
  client: UserPublicResponseDto;

  @Expose()
  @ValidateNested()
  @Type(() => UserPublicResponseDto)
  technician: UserPublicResponseDto;

  @Expose()
  @ValidateNested()
  @Type(() => ProductPublicResponseDto)
  product: ProductPublicResponseDto;
}
