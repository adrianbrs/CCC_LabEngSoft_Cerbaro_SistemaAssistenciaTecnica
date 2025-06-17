import{Length, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { UserDto } from "@/modules/user/dtos/user.dto";
import { User } from '@/modules/user/models/user.entity';

export class NotificationDto{
    @ValidateNested()
	@Type(()=>UserDto)
    user: User;

    @Length(1,1000)
    content: string;

    read: boolean;
}