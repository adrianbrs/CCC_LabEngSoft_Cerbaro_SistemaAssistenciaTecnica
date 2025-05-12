import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

/**
 * Decorator to get/generate a CSRF token.
 */
export const CsrfToken = createParamDecorator(
  (overwrite: boolean, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.csrfToken(overwrite);
  },
);

/**
 * Decorator to ignore CSRF token validation.
 */
export const CsrfIgnore = Reflector.createDecorator<boolean>({
  key: 'csrfIgnore',
  transform(value) {
    if (value === undefined) {
      return true;
    }
    return Boolean(value);
  },
});

/**
 * Decorator to update the CSRF token with a new one after a successful request.
 *
 * This also sets the CSRF token in the response header.
 */
export const CsrfUpdate = Reflector.createDecorator({
  key: 'csrfUpdate',
  transform(value) {
    if (value === undefined) {
      return true;
    }
    return Boolean(value);
  },
});
