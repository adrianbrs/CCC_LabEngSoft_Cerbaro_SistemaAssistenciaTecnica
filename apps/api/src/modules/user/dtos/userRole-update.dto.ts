import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { UserRegisterDto } from "./user-register.dto";
import { IsEnum } from "class-validator";
import { UserRole } from "@musat/core";

export class UserRoleUpdateDto {
    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;
}