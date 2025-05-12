import { PickType } from '@nestjs/swagger';
import { UserRegisterDto } from './user-register.dto';

export class UserDeactivateDto extends PickType(UserRegisterDto, [
  'password',
]) {}
