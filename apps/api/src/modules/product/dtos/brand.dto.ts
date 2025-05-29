import { Length, IsEmail, IsNumberString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class BrandDto{
    @Length(2,100)
      name: string;
    
      @Length(3,255)
      @IsEmail()
      email: string;
    
      @Length(10,11)
      @IsNumberString()
      @ApiProperty({ example: '99999999999' })
      phone: string;
}