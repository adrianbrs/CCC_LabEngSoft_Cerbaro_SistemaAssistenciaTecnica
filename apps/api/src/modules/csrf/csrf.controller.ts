import { Controller, Get } from '@nestjs/common';
import { CsrfIgnore, CsrfToken } from './csrf.decorator';
import { Public } from '../auth/auth.decorator';

@Controller('csrf')
export class CsrfController {
  @Get()
  @Public()
  @CsrfIgnore()
  getCsrfToken(@CsrfToken() token: string) {
    return {
      csrfToken: token,
    };
  }
}
