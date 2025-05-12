import { Reflector } from '@nestjs/core';
import { CsrfInterceptor } from './csrf.interceptor';

describe('CsrfInterceptor', () => {
  it('should be defined', () => {
    expect(new CsrfInterceptor(new Reflector())).toBeDefined();
  });
});
