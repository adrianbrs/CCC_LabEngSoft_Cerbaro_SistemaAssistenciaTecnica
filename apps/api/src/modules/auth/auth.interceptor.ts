import { Config } from '@/constants/config';
import { IS_PROD } from '@/constants/env';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const http = context.switchToHttp();
        const req = http.getRequest<Request>();
        const res = http.getResponse<Response>();

        if (req.session?.userId) {
          const { userId, cookie } = req.session;

          res.cookie(Config.cookies.userId.name, userId, {
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
        }
      }),
    );
  }
}
