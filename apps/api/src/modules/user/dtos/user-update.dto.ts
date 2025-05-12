import { OmitType, PartialType } from '@nestjs/swagger';
import { UserRegisterDto } from './user-register.dto';
import { IsNotEmpty, ValidateIf } from 'class-validator';

export class UserUpdateDto extends PartialType(
  OmitType(UserRegisterDto, ['cpf'] as const),
) {
  @IsNotEmpty()
  // Only require current password if the user is updating their email or password
  @ValidateIf((dto: UserUpdateDto) => !!(dto.password || dto.email))
  confirmPassword?: string;
}
