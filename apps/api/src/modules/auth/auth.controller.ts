import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  Session,
} from '@nestjs/common';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserService } from '../user/user.service';
import type { SessionData } from 'express-session';
import { Request, Response } from 'express';
import { CsrfUpdate } from '../csrf/csrf.decorator';
import { AuthService } from './auth.service';
import { Public } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Authenticates a user using the provided email and password and creates a session.
   */
  @CsrfUpdate()
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() { email, password }: UserLoginDto,
    @Session() session: SessionData,
  ) {
    const user = await this.userService.login(email, password);
    session.userId = user.id;
    session.loginDate = new Date();
    return user;
  }

  /**
   * Logs out the user by destroying the session.
   */
  @Delete('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req, res);
  }
}
