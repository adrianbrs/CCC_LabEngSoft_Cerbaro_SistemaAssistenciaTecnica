import { IsNotEmpty } from 'class-validator';

export class UserDeactivateDto {
  @IsNotEmpty()
  currentPassword: string;
}
