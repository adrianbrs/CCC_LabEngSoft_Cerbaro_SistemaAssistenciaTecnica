import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Session,
} from '@nestjs/common';
import { User } from './models/user.entity';
import { AccountVerificationError } from './errors/account-verification.error';
import { UserVerifyDto } from './dtos/user-verify.dto';
import { UserRegisterDto } from './dtos/user-register.dto';
import { UserService } from './user.service';
import { SessionData } from 'express-session';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves the currently authenticated user.
   */
  @Get('/me')
  async getMe(@Session() session: SessionData) {
    if (!session.userId) {
      return null;
    }
    return User.findOne({
      where: { id: session.userId },
      relations: ['address'],
    });
  }

  /**
   * Verifies a user's email address using the provided token.
   */
  @Post('/:userId/verify')
  @HttpCode(200)
  async verify(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Body() { token }: UserVerifyDto,
  ) {
    const user = await User.verify(userId, token);
    if (!user) {
      throw new AccountVerificationError();
    }
  }

  /**
   * Registers a new user with the provided information.
   */
  @Post('/register')
  @HttpCode(201)
  async register(@Body() userDto: UserRegisterDto) {
    return this.userService.register(userDto);
  }
}
