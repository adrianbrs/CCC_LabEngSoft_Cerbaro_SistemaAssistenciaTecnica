import { UserDto } from '@/modules/user/dtos/user.dto';
import { IsTechnician } from '@/shared/dto-validators';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class TechnicianAssignmentDto {
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UserDto)
  @IsTechnician({ each: true })
  technicians: UserDto[];

  @ValidateNested()
  @Type(() => UserDto)
  @IsOptional()
  @IsTechnician()
  lastAssignedTechnician: UserDto | null;
}
