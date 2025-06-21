import { TicketStatus } from '@musat/core';
import {
  IsEnum,
  IsOptional,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { PaginatedQueryDto } from '@/shared/pagination';
import { User } from '@/modules/user/models/user.entity';
import { DateRangeDto } from '@/shared/dtos';
import { Type } from 'class-transformer';
import { Product } from '@/modules/product/models/product.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TicketQueryDto extends PaginatedQueryDto {
  @IsUUID('4')
  @IsOptional()
  productId?: Product['id'];

  @Length(1, 500)
  @IsOptional()
  serialNumber?: string;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsUUID('4')
  @IsOptional()
  clientId?: User['id'];

  @IsUUID('4')
  @IsOptional()
  technicianId?: User['id'];

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional()
  @Type(() => DateRangeDto)
  closedAt?: DateRangeDto;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional()
  @Type(() => DateRangeDto)
  createdAt?: DateRangeDto;

  @IsOptional()
  @ValidateNested()
  @ApiPropertyOptional()
  @Type(() => DateRangeDto)
  updatedAt?: DateRangeDto;
}
