import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Session,
} from '@nestjs/common';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserService } from '../user/user.service';
import type { Session as ISession, SessionData } from 'express-session';
import { Response } from 'express';
import { Config } from '@/constants/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  /**
   * Authenticates a user using the provided email and password and creates a session.
   */
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
  async logout(
    @Session() session: ISession,
    @Res({ passthrough: true }) res: Response,
  ) {
    return new Promise<void>((resolve, reject) => {
      const {
        cookie: { ...cookieOpts },
      } = session;

      session.destroy((err: Error) => {
        if (err) {
          return reject(err);
        }
        res.clearCookie(Config.cookies.session.name, { path: cookieOpts.path });
        res.clearCookie(Config.cookies.userId.name, { path: cookieOpts.path });
        resolve();
      });
    });
  }
}
