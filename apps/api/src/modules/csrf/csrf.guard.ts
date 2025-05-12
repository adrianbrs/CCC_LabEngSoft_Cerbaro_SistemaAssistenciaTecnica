import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { CsrfIgnore } from './csrf.decorator';
import { Request } from 'express';
import { Config } from '@/constants/config';
import { CsrfError } from './errors/csrf.error';

const IGNORED_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  isRequestValid(req: Request, ignore: boolean): boolean {
    if (
      ignore === true ||
      (IGNORED_METHODS.has(req.method) && ignore !== false)
    ) {
      return true;
    }

    const headerToken = req.headers[Config.csrf.headerName];
    const sessionToken = req.session.csrfToken;

    if (typeof headerToken === 'string' && headerToken === sessionToken) {
      return true;
    }

    return false;
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const ignore = this.reflector.getAllAndOverride(CsrfIgnore, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (this.isRequestValid(req, ignore)) {
      return true;
    }

    throw new CsrfError();
  }
}
