import { IsNotEmpty, Length } from 'class-validator';
import { User } from '@/modules/user/models/user.entity';

export class NotificationCreateDto{
    @IsNotEmpty()
    userId: User['id'];

    @Length(1,1000)
    content: string;
}