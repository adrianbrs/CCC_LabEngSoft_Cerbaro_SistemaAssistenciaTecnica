import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { CsrfUpdate } from './csrf.decorator';
import { Config } from '@/constants/config';

@Injectable()
export class CsrfInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap(() => {
        const http = context.switchToHttp();
        const req = http.getRequest<Request>();
        const res = http.getResponse<Response>();
        const shouldUpdate = this.reflector.getAllAndOverride(CsrfUpdate, [
          context.getHandler(),
          context.getClass(),
        ]);

        if (shouldUpdate) {
          const csrfToken = req.csrfToken(true);
          res.header(Config.csrf.headerName, csrfToken);
        }
      }),
    );
  }
}
