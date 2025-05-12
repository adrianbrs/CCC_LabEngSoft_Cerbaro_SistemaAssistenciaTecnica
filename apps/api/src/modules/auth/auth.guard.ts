import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Authenticate } from './auth.decorator';
import { Request, Response } from 'express';
import { User } from '../user/models/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const isEnabled = this.reflector.getAllAndOverride(Authenticate, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isEnabled === false) {
      return true;
    }

    if (req.session?.userId) {
      let user = req.auth?.user ?? null;

      if (!user) {
        user = await User.findOne({
          where: {
            id: req.session.userId,
          },
        });

        if (user) {
          req.auth = {
            user,
          };
          return true;
        }

        this.logger.warn(`Invalid session for user: ${req.session.userId}`);
        await this.authService.logout(req, res);
      }
    }

    throw new UnauthorizedException();
  }
}
