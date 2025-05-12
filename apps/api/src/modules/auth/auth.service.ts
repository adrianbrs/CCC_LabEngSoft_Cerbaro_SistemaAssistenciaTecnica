import { Config } from '@/constants/config';
import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  /**
   * Logout the user by destroying the session and clearing cookies.
   */
  logout(req: Request, res: Response): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const { session } = req;
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
