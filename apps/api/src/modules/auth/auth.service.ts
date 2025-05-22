import { Config } from '@/constants/config';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from '../user/models/user.entity';
import { UserService } from '../user/user.service';
import { IS_PROD } from '@/constants/env';
import { UserLoginDto } from './dtos/user-login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(
    req: Request,
    res: Response,
    { email, password }: UserLoginDto,
  ): Promise<User> {
    const { session } = req;
    const { cookie } = session;

    const user = await this.userService.login(email, password);
    session.userId = user.id;
    session.loginDate = new Date();

    res.cookie(Config.cookies.userId.name, user.id, {
      path: cookie.path,
      domain: cookie.domain,
      expires: cookie.expires ?? undefined,
      signed: cookie.signed,
      sameSite: cookie.sameSite,
      maxAge: cookie.maxAge,
      secure: IS_PROD,
      // This cookie must be accessible to the client-side code
      // so that it can be used for authentication in the frontend
      httpOnly: false,
    });

    return user;
  }

  /**
   * Logout the user by destroying the session and clearing cookies.
   */
  logout(req: Request, res: Response): Promise<void> {
    const { session } = req;
    const {
      cookie: { ...cookieOpts },
    } = session;

    return new Promise<void>((resolve, reject) => {
      session.regenerate((err: Error) => {
        if (err) {
          return reject(err);
        }
        res.clearCookie(Config.cookies.userId.name, { path: cookieOpts.path });
        resolve();
      });
    });
  }
}
