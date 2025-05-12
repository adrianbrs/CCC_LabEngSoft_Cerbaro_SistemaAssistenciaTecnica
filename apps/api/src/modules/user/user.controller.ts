import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { User } from './models/user.entity';
import { AccountVerificationError } from './errors/account-verification.error';
import { UserVerifyDto } from './dtos/user-verify.dto';
import { UserRegisterDto } from './dtos/user-register.dto';
import { UserService } from './user.service';
import { LoggedUser, Public } from '../auth/auth.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves the currently authenticated user.
   */
  @Get('/me')
  getMe(@LoggedUser() user: User) {
    return user;
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
    const user = await User.verify(userId, token);
    if (!user) {
      throw new AccountVerificationError();
    }
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
}
