import { IsNotEmpty } from 'class-validator';

export class UserVerifyDto {
  @IsNotEmpty()
  token: string;
}
