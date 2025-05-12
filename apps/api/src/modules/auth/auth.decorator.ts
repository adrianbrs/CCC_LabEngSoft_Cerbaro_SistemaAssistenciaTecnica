import { IUserEntity } from '@musat/core';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

/**
 * Enable/disable authentication for a specific route.
 */
export const Authenticate = Reflector.createDecorator<boolean>({
  key: 'auth:enabled',
  transform(value) {
    if (value === undefined) {
      return true;
    }
    return Boolean(value);
  },
});

/**
 * Makes a route public.
 */
export const Public = () => Authenticate(false);

/**
 * Makes a route private.
 */
export const Private = () => Authenticate(true);

/**
 * Get the authenticated user from the request.
 */
export const LoggedUser = createParamDecorator(
  (prop: keyof IUserEntity | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.auth?.user ?? null;

    if (!user) {
      return null;
    }

    return prop ? user[prop] : user;
  },
);
