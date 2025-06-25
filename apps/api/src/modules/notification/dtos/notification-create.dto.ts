import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { User } from '@/modules/user/models/user.entity';
import { Type } from 'class-transformer';
import { NotificationMetadataDto } from './notification-metadata.dto';

export class NotificationCreateDto {
  @IsNotEmpty()
  @IsUUID('4')
  userId: User['id'];

  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @Length(1, 1000)
  content: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationMetadataDto)
  metadata?: NotificationMetadataDto;
}
