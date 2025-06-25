import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Authorize } from '../auth/auth.decorator';
import { User } from '@/modules/user/models/user.entity';
import { NotificationService } from './notification.service';
import { NotificationCreateDto} from './dtos/notification-create.dto'
import { LoggedUser } from '../auth/auth.decorator';

@Controller('notifications')
export class NotificationController{
    constructor(private readonly notificationService: NotificationService){}
    /**
     * Gets all notifications of the currently logged user
     */
    @Get('/me')
    async getMyNotifications(@LoggedUser() client: User){
        return this.notificationService.getMine(client);
    }

    @Get('/:id')
    async getOne(@Param('id') id: string){
        return this.notificationService.getOne(id);
    }

    @Post()
    async create(@Body() dto: NotificationCreateDto){
        return this.notificationService.create(dto);
    }

    @Delete('/:id')
    async delete(@Param('id') id: string){
        return this.notificationService.delete(id);
    }
}
