import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { User } from './models/user.entity';
import { UserVerifyDto } from './dtos/user-verify.dto';
import { UserRegisterDto } from './dtos/user-register.dto';
import { UserService } from './user.service';
import { Authorize, LoggedUser, Public } from '../auth/auth.decorator';
import { UserUpdateDto } from './dtos/user-update.dto';
import { UserDeactivateDto } from './dtos/user-deactivate.dto';
import { UserRole } from '@musat/core';
import { UserInternalUpdateDto } from './dtos/user-internal-update.dto';
import { UserQueryDto } from './dtos/user-query.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Authorize(UserRole.ADMIN)
  async getAll(@Query() query: UserQueryDto) {
    return this.userService.getAll(query);
  }

  /**
   * Verifies a user's email address using the provided token.
   */
  @Public()
  @Post('/:userId/verify')
  @HttpCode(200)
  async verify(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body() { token }: UserVerifyDto,
  ) {
    await this.userService.verify(userId, token);
  }

  /**
   * Registers a new user with the provided information.
   */
  @Public()
  @Post('/register')
  @HttpCode(201)
  async register(@Body() userDto: UserRegisterDto) {
    return this.userService.register(userDto);
  }

  /**
   * Retrieves the currently authenticated user.
   */
  @Get('/me')
  getMe(@LoggedUser() user: User) {
    return user;
  }

  /**
   * Updates the currently authenticated user's information.
   */
  @Patch('/me')
  updateMe(@LoggedUser() user: User, @Body() userUpdateDto: UserUpdateDto) {
    return this.userService.update(user, userUpdateDto);
  }

  /**
   * Request account deactivation for the currently authenticated user.
   */
  @Post('/me/deactivate')
  deactivateMe(
    @LoggedUser() user: User,
    @Body() userDeactivateDto: UserDeactivateDto,
  ) {
    return this.userService.deactivate(user, userDeactivateDto);
  }

  /**
   * Allows admins to change a user's data
   */
  @Patch(':id')
  @Authorize(UserRole.ADMIN)
  updateOne(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updateDto: UserInternalUpdateDto,
  ) {
    return this.userService.internalUpdate(userId, updateDto);
  }

  @Get(':id')
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.getOne(id);
  }
}
