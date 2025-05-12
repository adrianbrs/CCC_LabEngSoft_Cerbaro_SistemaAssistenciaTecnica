import { Controller, Get } from '@nestjs/common';
import { CsrfIgnore, CsrfToken } from './csrf.decorator';

@Controller('csrf')
export class CsrfController {
  @CsrfIgnore()
  @Get()
  getCsrfToken(@CsrfToken() token: string) {
    return {
      csrfToken: token,
    };
  }
}
